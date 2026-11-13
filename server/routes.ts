import express, { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { db, DbUser, DbCourse, DbSubmission, DbRegistration, DbCertificate } from './db.js';

export const apiRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const AUTH_COOKIE = 'msc_session';

const loginRateLimitMax = Number(process.env.LOGIN_RATE_LIMIT_MAX ?? (process.env.NODE_ENV === 'test' ? 200 : 100));
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.isFinite(loginRateLimitMax) ? loginRateLimitMax : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const memberSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  faculty: z.string().min(2),
  facultyAr: z.string().min(2),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALUMNI', 'BANNED']).default('ACTIVE'),
  rankId: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

const eventSchema = z.object({
  title: z.string().min(2),
  titleAr: z.string().min(2),
  description: z.string().min(10),
  descriptionAr: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(2),
  locationAr: z.string().min(2),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  capacity: z.number().int().positive().max(5000),
  registrationDeadline: z.string().min(1),
  type: z.enum(['WORKSHOP', 'BOOTCAMP', 'HACKATHON', 'SEMINAR', 'TECHNICAL_SESSION']).default('WORKSHOP'),
  speaker: z.string().default(''),
  speakerAr: z.string().default(''),
  xpReward: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(false),
  isCancelled: z.boolean().default(false),
  eligibilityMinRankId: z.string().optional(),
  eligibilityStatus: z.enum(['ACTIVE', 'INACTIVE', 'ALUMNI', 'BANNED']).optional()
});

let currentActingUserId = 'usr_student_1';
const eventRegistrationLocks = new Map<string, Promise<void>>();

async function withEventRegistrationLock<T>(eventId: string, operation: () => Promise<T>): Promise<T> {
  const previous = eventRegistrationLocks.get(eventId) ?? Promise.resolve();
  let release!: () => void;
  const lock = new Promise<void>((resolve) => {
    release = resolve;
  });
  const queued = previous.then(() => lock);

  eventRegistrationLocks.set(eventId, queued);
  await previous;

  try {
    return await operation();
  } finally {
    release();
    if (eventRegistrationLocks.get(eventId) === queued) {
      eventRegistrationLocks.delete(eventId);
    }
  }
}

function refreshEventCounts(event: any): void {
  const regs = db.get().registrations.filter((r) => r.eventId === event.id && r.status !== 'CANCELLED');
  event.registeredCount = regs.filter((r) => r.status === 'CONFIRMED' || r.status === 'ATTENDED').length;
  event.waitlistCount = regs.filter((r) => r.status === 'WAITLIST').length;
}

function getMemberForUser(userId: string) {
  return db.get().members.find((member) => member.userId === userId);
}

function evaluateEventEligibility(user: DbUser, event: any): { eligible: boolean; reason?: string } {
  const member = getMemberForUser(user.id);
  if (!member) {
    return { eligible: false, reason: 'Member profile is required to register for events.' };
  }

  if (event.eligibilityStatus && member.status !== event.eligibilityStatus) {
    return { eligible: false, reason: 'Your member status does not meet the event eligibility requirement.' };
  }

  if (event.eligibilityMinRankId) {
    const requiredRank = db.get().memberRanks.find((rank) => rank.id === event.eligibilityMinRankId);
    const currentRank = db.get().memberRanks.find((rank) => rank.id === member.rankId);
    if (requiredRank && currentRank && currentRank.sortOrder > requiredRank.sortOrder) {
      return { eligible: false, reason: 'Your rank is below the minimum allowed for this event.' };
    }
  }

  return { eligible: true };
}

function getCurrentUser(): DbUser {
  const user = db.get().users.find(u => u.id === currentActingUserId);
  return user || db.get().users[0];
}

function getAuthUser(req: Request): DbUser | null {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.split(';').map(v => v.trim()).find(v => v.startsWith(`${AUTH_COOKIE}=`));
  const token = match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const finalToken = token || headerToken;

  if (!finalToken) return null;
  try {
    const payload = jwt.verify(finalToken, JWT_SECRET) as { sub: string };
    return db.get().users.find(u => u.id === payload.sub) || null;
  } catch {
    return null;
  }
}

function generateHmacToken(userId: string, eventId: string): string {
  const secret = process.env.HMAC_SECRET;

  if (secret) {
    return crypto.createHmac('sha256', secret).update(`${userId}:${eventId}`).digest('hex').substring(0, 16).toUpperCase();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('HMAC_SECRET must be configured in production.');
  }

  return crypto.createHmac('sha256', crypto.randomBytes(32).toString('hex')).update(`${userId}:${eventId}`).digest('hex').substring(0, 16).toUpperCase();
}

function userRoleCode(user: DbUser): string {
  const normalized = user.role?.toUpperCase();
  if (normalized === 'ADMIN') return 'SUPER_ADMIN';
  if (normalized === 'TEAM_LEAD') return 'TEAM_LEAD';
  if (normalized === 'MEMBER_MANAGER') return 'MEMBER_MANAGER';
  if (normalized === 'EVENT_MANAGER') return 'EVENT_MANAGER';
  if (normalized === 'CONTENT_MANAGER') return 'CONTENT_MANAGER';
  return 'MEMBER';
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const roleCode = userRoleCode(user);
    const roleRecord = db.get().roles.find((role) => role.code === roleCode) ??
      db.get().roles.find((role) => role.code === 'SUPER_ADMIN' && user.role === 'ADMIN');
    const rolePermissions = db.get().rolePermissions.filter((p) => p.roleId === roleRecord?.id);

    if (user.role === 'ADMIN' || rolePermissions.some((p) => p.permission === permission)) {
      currentActingUserId = user.id;
      return next();
    }

    return res.status(403).json({ error: 'Permission denied' });
  };
}

// 1. Health
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    university: 'Innovation University',
    club: 'Microsoft Student Clubs',
    timestamp: new Date().toISOString(),
    version: '2026.1.0'
  });
});

// 2. Auth & Identity
apiRouter.post('/auth/login', loginRateLimiter, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Valid email and password are required.' });
  }

  const { email, password } = parsed.data;
  const user = db.get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil).getTime() : null;
  if (lockedUntil && lockedUntil > Date.now()) {
    return res.status(423).json({ error: 'Account locked. Please try again later.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    user.failedLoginCount = (user.failedLoginCount || 0) + 1;
    if (user.failedLoginCount >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      user.failedLoginCount = 5;
    }
    db.save();
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  user.failedLoginCount = 0;
  user.lockedUntil = null;
  db.save();

  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ success: true, user: { ...user, passwordHash: undefined } });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.json({ success: true });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req) || getCurrentUser();
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  res.json({ user: { ...user, passwordHash: undefined } });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  res.status(403).json({
    error: 'Role switching is disabled. Authenticate and authorize server-side instead.'
  });
});

apiRouter.get('/auth/users', requirePermission('members.manage'), (req: Request, res: Response) => {
  res.json({ users: db.get().users });
});

apiRouter.get('/members', requirePermission('members.manage'), (req: Request, res: Response) => {
  const { search = '', page = '1', pageSize = '10' } = req.query as Record<string, string>;
  const q = search.toLowerCase();
  const limit = Math.max(1, Number(pageSize) || 10);
  const pageIndex = Math.max(1, Number(page) || 1);

  const members = db.get().members.filter(m => {
    if (!q) return true;
    return [m.name, m.nameAr, m.email, m.faculty, m.facultyAr, m.uniqueCode].join(' ').toLowerCase().includes(q);
  });

  const total = members.length;
  const slice = members.slice((pageIndex - 1) * limit, pageIndex * limit);
  res.json({ members: slice, total, page: pageIndex, pageSize: limit });
});

apiRouter.post('/members', requirePermission('members.manage'), (req: Request, res: Response) => {
  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid member payload' });

  const { name, nameAr, email, phone, faculty, facultyAr, status, rankId, avatarUrl } = parsed.data;
  const existing = db.get().members.find(m => m.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Member already exists' });

  const nextCode = `MSC-${String((db.get().members.length + 1) || 1).padStart(6, '0')}`;
  const userId = `usr_${Date.now()}`;
  const member = {
    id: `member_${Date.now()}`,
    userId,
    uniqueCode: nextCode,
    name,
    nameAr,
    email,
    phone,
    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    faculty,
    facultyAr,
    status,
    rankId: rankId || db.get().memberRanks[0]?.id,
    joinedAt: new Date().toISOString()
  };

  const user = {
    id: userId,
    name,
    nameAr,
    email,
    role: 'STUDENT',
    studentId: nextCode.replace('MSC-', 'STU-'),
    avatar: member.avatarUrl,
    xp: 0,
    level: 1,
    badges: [],
    passwordHash: '',
    failedLoginCount: 0,
    lockedUntil: null,
    isActive: true
  };

  db.get().members.unshift(member);
  db.get().users.unshift(user as any);
  db.logAudit(userId, 'CREATE_MEMBER', 'MEMBER', member.id, `Created member ${name}`);
  db.save();
  res.status(201).json({ member, user });
});

apiRouter.put('/members/:id', requirePermission('members.manage'), (req: Request, res: Response) => {
  const parsed = memberSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid member update payload' });
  const member = db.get().members.find(m => m.id === req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  Object.assign(member, parsed.data);
  db.save();
  res.json({ member });
});

apiRouter.delete('/members/:id', requirePermission('members.manage'), (req: Request, res: Response) => {
  const target = db.get().members.findIndex(m => m.id === req.params.id);
  if (target === -1) return res.status(404).json({ error: 'Member not found' });
  const [member] = db.get().members.splice(target, 1);
  db.get().users = db.get().users.filter(u => u.id !== member.userId);
  db.save();
  res.json({ success: true, deletedId: req.params.id });
});

apiRouter.get('/ranks', requirePermission('members.manage'), (req: Request, res: Response) => {
  res.json({ ranks: db.get().memberRanks });
});

apiRouter.post('/ranks', requirePermission('members.manage'), (req: Request, res: Response) => {
  const { title, titleAr } = req.body as { title?: string; titleAr?: string };
  if (!title || !titleAr) return res.status(400).json({ error: 'Title and Arabic title are required' });

  const rank = {
    id: `rank_${Date.now()}`,
    title,
    titleAr,
    sortOrder: db.get().memberRanks.length + 1
  };
  db.get().memberRanks.push(rank);
  db.save();
  res.status(201).json({ rank });
});

apiRouter.put('/ranks/:id', requirePermission('members.manage'), (req: Request, res: Response) => {
  const rank = db.get().memberRanks.find(r => r.id === req.params.id);
  if (!rank) return res.status(404).json({ error: 'Rank not found' });
  const { title, titleAr } = req.body as { title?: string; titleAr?: string };
  if (title) rank.title = title;
  if (titleAr) rank.titleAr = titleAr;
  db.save();
  res.json({ rank });
});

apiRouter.delete('/ranks/:id', requirePermission('members.manage'), (req: Request, res: Response) => {
  const idx = db.get().memberRanks.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Rank not found' });
  db.get().memberRanks.splice(idx, 1);
  db.save();
  res.json({ success: true, deletedId: req.params.id });
});

// 3. Stats & Overview
apiRouter.get('/stats', (req: Request, res: Response) => {
  const data = db.get();
  res.json({
    stats: {
      activeStudents: 540 + data.users.length,
      workshopsCount: 48 + data.events.length,
      learningHours: 12800,
      verifiedCertificates: 340 + data.certificates.length,
      publishedCourses: data.courses.filter(c => c.isPublished).length,
      activeProjects: data.projects.length
    }
  });
});

// 4. Tracks & Courses
apiRouter.get('/tracks', (req: Request, res: Response) => {
  res.json({ tracks: db.get().tracks.sort((a, b) => a.order - b.order) });
});

apiRouter.get('/courses', (req: Request, res: Response) => {
  const { trackId } = req.query;
  let courses = db.get().courses;
  if (trackId) {
    courses = courses.filter(c => c.trackId === trackId);
  }
  courses.sort((a, b) => a.order - b.order);

  const lessons = db.get().lessons;
  const coursesWithLessons = courses.map(course => ({
    ...course,
    lessons: lessons.filter(l => l.courseId === course.id).sort((a, b) => a.order - b.order)
  }));

  res.json({ courses: coursesWithLessons });
});

apiRouter.post('/courses/reorder', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only administrators can reorder course curriculum' });
  }

  const { courseId, direction } = req.body;
  const courses = db.get().courses;
  const index = courses.findIndex(c => c.id === courseId);
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const targetIndex = direction === 'UP' ? index - 1 : index + 1;
  if (targetIndex >= 0 && targetIndex < courses.length) {
    const tempOrder = courses[index].order;
    courses[index].order = courses[targetIndex].order;
    courses[targetIndex].order = tempOrder;
    db.save();
    db.logAudit(user.id, 'REORDER_COURSE', 'COURSE', courseId, `Reordered course ${courseId} ${direction}`);
    return res.json({ success: true, courses });
  }

  res.json({ success: false, message: 'Boundary reached' });
});

apiRouter.patch('/courses/:id/publish', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const course = db.get().courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  course.isPublished = !course.isPublished;
  db.save();
  db.logAudit(user.id, 'TOGGLE_PUBLISH_COURSE', 'COURSE', course.id, `Set isPublished to ${course.isPublished}`);
  res.json({ success: true, course });
});

// 5. Enrollments, Video Heartbeats & Progress
apiRouter.get('/progress', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const enrollments = db.get().enrollments.filter(e => e.userId === user.id);
  res.json({ enrollments });
});

apiRouter.post('/progress/heartbeat', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const { courseId, lessonId, watchedSeconds } = req.body;

  if (!courseId || !lessonId || watchedSeconds === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const lesson = db.get().lessons.find(l => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  let enrollment = db.get().enrollments.find(e => e.userId === user.id && e.courseId === courseId);
  if (!enrollment) {
    enrollment = {
      id: `enr_${Date.now()}`,
      userId: user.id,
      courseId,
      enrolledAt: new Date().toISOString(),
      progressPercent: 0,
      completedLessonIds: [],
      watchTimeSeconds: {}
    };
    db.get().enrollments.push(enrollment);
  }

  enrollment.watchTimeSeconds[lessonId] = watchedSeconds;

  // Check 80% completion rule
  const isCompleted = watchedSeconds >= lesson.durationSeconds * 0.8;
  let newlyCompleted = false;

  if (isCompleted && !enrollment.completedLessonIds.includes(lessonId)) {
    enrollment.completedLessonIds.push(lessonId);
    newlyCompleted = true;
    db.awardXp(
      user.id,
      lesson.xpReward,
      `Completed Lesson: ${lesson.title}`,
      `إتمام درس: ${lesson.titleAr}`,
      'LESSON',
      lesson.id
    );
  }

  const courseLessons = db.get().lessons.filter(l => l.courseId === courseId);
  if (courseLessons.length > 0) {
    enrollment.progressPercent = Math.round((enrollment.completedLessonIds.length / courseLessons.length) * 100);
    if (enrollment.progressPercent === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date().toISOString();
      // Auto issue certificate
      const course = db.get().courses.find(c => c.id === courseId);
      if (course) {
        const certCode = `MSC-IU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const newCert: DbCertificate = {
          id: `cert_${Date.now()}`,
          verificationCode: certCode,
          userId: user.id,
          recipientName: user.name,
          recipientNameAr: user.nameAr,
          title: course.title,
          titleAr: course.titleAr,
          type: 'TRACK_COMPLETION',
          issuedAt: new Date().toISOString(),
          isValid: true,
          academicAdvisor: 'Dr. Kareem Mansour',
          clubPresident: 'Mariam Al-Ghamdi'
        };
        db.get().certificates.push(newCert);
        db.awardXp(user.id, course.xpReward, `Course Mastery: ${course.title}`, `إتقان مقرر: ${course.titleAr}`, 'LESSON', course.id);
      }
    }
  }

  db.save();
  res.json({
    success: true,
    enrollment,
    newlyCompleted,
    awardedXp: newlyCompleted ? lesson.xpReward : 0
  });
});

// 6. Tasks & Submissions
apiRouter.get('/tasks', (req: Request, res: Response) => {
  const tasks = db.get().tasks;
  const submissions = db.get().submissions;
  res.json({ tasks, submissions });
});

apiRouter.post('/tasks/:id/submit', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const taskId = req.params.id;
  const { githubUrl, notes } = req.body;

  if (!githubUrl || !githubUrl.includes('github.com')) {
    return res.status(400).json({ error: 'Valid GitHub repository link is required' });
  }

  const task = db.get().tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const existingSubmissions = db.get().submissions.filter(s => s.taskId === taskId && s.userId === user.id);
  if (existingSubmissions.length >= task.maxAttempts) {
    return res.status(400).json({ error: `Maximum attempts (${task.maxAttempts}) reached` });
  }

  const submission: DbSubmission = {
    id: `sub_${Date.now()}`,
    taskId,
    userId: user.id,
    githubUrl,
    notes: notes || '',
    status: 'PENDING',
    attemptNumber: existingSubmissions.length + 1,
    submittedAt: new Date().toISOString(),
    awardedXp: 0
  };

  db.get().submissions.push(submission);
  db.logAudit(user.id, 'SUBMIT_TASK', 'TASK', taskId, `Submitted attempt #${submission.attemptNumber}`);
  db.save();

  res.json({ success: true, submission });
});

apiRouter.post('/submissions/:id/review', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'TEAM_LEAD' && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only Team Leads and Admins can review submissions' });
  }

  const { status, reviewerFeedback } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
  }

  const submission = db.get().submissions.find(s => s.id === req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  submission.status = status;
  submission.reviewerFeedback = reviewerFeedback || (status === 'APPROVED' ? 'ممتاز، تم اعتماد المهمة بنجاح.' : 'يرجى مراجعة الملاحظات وإعادة التسليم.');
  submission.reviewedBy = user.id;
  submission.reviewedAt = new Date().toISOString();

  if (status === 'APPROVED' && submission.awardedXp === 0) {
    const task = db.get().tasks.find(t => t.id === submission.taskId);
    const xpReward = task ? task.xpReward : 250;
    submission.awardedXp = xpReward;
    db.awardXp(
      submission.userId,
      xpReward,
      `Task Approved: ${task?.title || 'Assignment'}`,
      `اعتماد تكليف: ${task?.titleAr || 'مهمة عملية'}`,
      'TASK',
      submission.taskId
    );
  }

  db.logAudit(user.id, 'REVIEW_SUBMISSION', 'SUBMISSION', submission.id, `Reviewed status=${status}`);
  db.save();

  res.json({ success: true, submission });
});

// 7. Events, Registrations & QR Passes
apiRouter.get('/events', (req: Request, res: Response) => {
  const includeHidden = String(req.query.includeAll || '').toLowerCase() === 'true';
  const events = db.get().events.filter((event) => {
    if (includeHidden) return true;
    return event.isPublished && !event.isCancelled;
  });
  const user = getAuthUser(req) || getCurrentUser();
  const registrations = user ? db.get().registrations.filter((r) => r.userId === user.id && r.status !== 'CANCELLED') : [];
  return res.json({ events, registrations });
});

apiRouter.get('/admin/events', requirePermission('events.manage'), (req: Request, res: Response) => {
  const events = [...db.get().events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  return res.json({ events });
});

apiRouter.post('/events', requirePermission('events.manage'), (req: Request, res: Response) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid event payload' });
  }

  const payload = parsed.data;
  const event = {
    id: `evt_${Date.now()}`,
    slug: payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4),
    title: payload.title,
    titleAr: payload.titleAr,
    description: payload.description,
    descriptionAr: payload.descriptionAr,
    imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    location: payload.location,
    locationAr: payload.locationAr,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    capacity: payload.capacity,
    registrationDeadline: payload.registrationDeadline,
    registeredCount: 0,
    waitlistCount: 0,
    type: payload.type,
    speaker: payload.speaker,
    speakerAr: payload.speakerAr,
    xpReward: payload.xpReward,
    secretCheckInKey: `MSC-${Date.now().toString(36).toUpperCase()}`,
    isPublished: payload.isPublished,
    isCancelled: false,
    eligibilityMinRankId: payload.eligibilityMinRankId,
    eligibilityStatus: payload.eligibilityStatus,
    cancelledAt: null
  };

  db.get().events.unshift(event);
  db.logAudit(getCurrentUser().id, 'CREATE_EVENT', 'EVENT', event.id, `Created event ${event.title}`);
  db.save();
  return res.status(201).json({ event, success: true });
});

apiRouter.put('/events/:id', requirePermission('events.manage'), (req: Request, res: Response) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid event update payload' });
  }

  const event = db.get().events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const next = { ...event, ...parsed.data } as any;
  if (!next.slug) next.slug = event.slug;
  Object.assign(event, next);
  db.logAudit(getCurrentUser().id, 'UPDATE_EVENT', 'EVENT', event.id, `Updated event ${event.title}`);
  db.save();
  return res.json({ event, success: true });
});

apiRouter.patch('/events/:id/publish', requirePermission('events.manage'), (req: Request, res: Response) => {
  const event = db.get().events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  event.isPublished = !event.isPublished;
  db.logAudit(getCurrentUser().id, 'PUBLISH_EVENT', 'EVENT', event.id, `Set published=${event.isPublished}`);
  db.save();
  return res.json({ event, success: true });
});

apiRouter.patch('/events/:id/cancel', requirePermission('events.manage'), (req: Request, res: Response) => {
  const event = db.get().events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  event.isCancelled = !event.isCancelled;
  event.cancelledAt = event.isCancelled ? new Date().toISOString() : null;

  db.get().registrations
    .filter((r) => r.eventId === event.id && r.status === 'CONFIRMED')
    .forEach((r) => {
      r.status = 'CANCELLED';
      r.cancelledAt = new Date().toISOString();
    });

  const waitlisted = db.get().registrations
    .filter((r) => r.eventId === event.id && r.status === 'WAITLIST')
    .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());

  if (!event.isCancelled && waitlisted.length > 0 && event.capacity > 0) {
    const next = waitlisted[0];
    next.status = 'CONFIRMED';
    next.cancelledAt = null;
  }

  refreshEventCounts(event);
  db.logAudit(getCurrentUser().id, 'CANCEL_EVENT', 'EVENT', event.id, `Cancelled=${event.isCancelled}`);
  db.save();
  return res.json({ event, success: true });
});

apiRouter.delete('/events/:id', requirePermission('events.manage'), (req: Request, res: Response) => {
  const eventIndex = db.get().events.findIndex((item) => item.id === req.params.id);
  if (eventIndex === -1) return res.status(404).json({ error: 'Event not found' });

  const [event] = db.get().events.splice(eventIndex, 1);
  db.get().registrations = db.get().registrations.filter((r) => r.eventId !== event.id);
  db.logAudit(getCurrentUser().id, 'DELETE_EVENT', 'EVENT', event.id, `Deleted event ${event.title}`);
  db.save();
  return res.json({ success: true, event });
});

apiRouter.get('/events/:id/participants', requirePermission('events.manage'), (req: Request, res: Response) => {
  const event = db.get().events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const q = String(req.query.search || '').toLowerCase();
  const status = String(req.query.status || '').toUpperCase();

  const entries = db.get().registrations
    .filter((r) => r.eventId === event.id && r.status !== 'CANCELLED')
    .map((reg) => {
      const user = db.get().users.find((u) => u.id === reg.userId);
      const member = getMemberForUser(reg.userId);
      return {
        ...reg,
        user,
        member,
        eventTitle: event.title
      };
    })
    .filter((entry) => {
      if (!q) return true;
      const haystack = [entry.user?.name, entry.user?.email, entry.member?.uniqueCode, entry.member?.faculty].join(' ').toLowerCase();
      return haystack.includes(q);
    })
    .filter((entry) => (!status ? true : entry.status === status));

  return res.json({ eventId: event.id, total: entries.length, participants: entries });
});

apiRouter.post('/events/:id/participants', requirePermission('events.manage'), async (req: Request, res: Response) => {
  const eventId = req.params.id;

  await withEventRegistrationLock(eventId, async () => {
    const event = db.get().events.find((item) => item.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const userId = String(req.body.userId || req.body.memberId || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!userId && !email) {
      return res.status(400).json({ error: 'userId or email is required' });
    }

    const user = db.get().users.find((candidate) => candidate.id === userId || candidate.email.toLowerCase() === email);
    if (!user) {
      return res.status(404).json({ error: 'Member user not found' });
    }

    const existing = db.get().registrations.find((r) => r.eventId === event.id && r.userId === user.id && r.status !== 'CANCELLED');
    if (existing) {
      return res.status(409).json({ error: 'This member is already registered for the event' });
    }

    const registration: DbRegistration = {
      id: `reg_manual_${Date.now()}`,
      eventId: event.id,
      userId: user.id,
      status: 'CONFIRMED',
      registeredAt: new Date().toISOString(),
      cancelledAt: null,
      hmacPassToken: generateHmacToken(user.id, event.id)
    };

    db.get().registrations.push(registration);
    refreshEventCounts(event);
    db.logAudit(getCurrentUser().id, 'MANUAL_EVENT_REGISTRATION', 'REGISTRATION', registration.id, `Added ${user.email} to ${event.title}`);
    db.save();
    return res.status(201).json({ success: true, registration });
  });
});

apiRouter.delete('/events/:id/participants/:registrationId', requirePermission('events.manage'), (req: Request, res: Response) => {
  const event = db.get().events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const registration = db.get().registrations.find((r) => r.id === req.params.registrationId && r.eventId === event.id);
  if (!registration) return res.status(404).json({ error: 'Participant registration not found' });

  registration.status = 'CANCELLED';
  registration.cancelledAt = new Date().toISOString();
  refreshEventCounts(event);
  db.logAudit(getCurrentUser().id, 'REMOVE_PARTICIPANT', 'REGISTRATION', registration.id, `Removed participant from ${event.title}`);
  db.save();
  return res.json({ success: true, registration });
});

apiRouter.get('/events/:id/participants/export.csv', requirePermission('events.manage'), (req: Request, res: Response) => {
  const event = db.get().events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const rows = db.get().registrations
    .filter((r) => r.eventId === event.id && r.status !== 'CANCELLED')
    .map((r) => {
      const user = db.get().users.find((u) => u.id === r.userId);
      const member = getMemberForUser(r.userId);
      return [r.id, user?.email || '', user?.name || '', member?.uniqueCode || '', r.status].join(',');
    });

  const csv = ['id,email,name,member_code,status', ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  return res.send(csv);
});

apiRouter.get('/events/my-registrations', requirePermission('events.view'), (req: Request, res: Response) => {
  const user = getAuthUser(req) || getCurrentUser();
  const entries = db.get().registrations
    .filter((r) => r.userId === user.id && r.status !== 'CANCELLED')
    .map((r) => {
      const event = db.get().events.find((item) => item.id === r.eventId);
      return { registration: r, event };
    })
    .filter((entry) => entry.event !== undefined);

  return res.json({ registrations: entries });
});

apiRouter.post('/events/:id/register', requirePermission('events.view'), async (req: Request, res: Response) => {
  const user = getAuthUser(req) || getCurrentUser();
  const eventId = req.params.id;

  await withEventRegistrationLock(eventId, async () => {
    const event = db.get().events.find((item) => item.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.isCancelled) {
      return res.status(400).json({ error: 'This event has been cancelled.' });
    }

    if (!event.isPublished) {
      return res.status(400).json({ error: 'This event is not published yet.' });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ error: 'Registration has closed for this event.' });
    }

    const eligibility = evaluateEventEligibility(user, event);
    if (!eligibility.eligible) {
      return res.status(403).json({ error: eligibility.reason || 'You are not eligible for this event.' });
    }

    const existing = db.get().registrations.find((r) => r.eventId === eventId && r.userId === user.id && r.status !== 'CANCELLED');
    if (existing) {
      return res.status(409).json({ success: false, error: 'You already registered for this event.', registration: existing });
    }

    const activeConfirmed = db.get().registrations.filter((r) => r.eventId === eventId && (r.status === 'CONFIRMED' || r.status === 'ATTENDED')).length;
    const isFull = activeConfirmed >= event.capacity;
    const status: DbRegistration['status'] = isFull ? 'WAITLIST' : 'CONFIRMED';

    const registration: DbRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      eventId,
      userId: user.id,
      status,
      registeredAt: new Date().toISOString(),
      cancelledAt: null,
      hmacPassToken: generateHmacToken(user.id, eventId)
    };

    db.get().registrations.push(registration);
    refreshEventCounts(event);
    db.logAudit(user.id, 'REGISTER_EVENT', 'EVENT', eventId, `Status: ${registration.status}`);
    db.save();

    return res.status(isFull ? 202 : 201).json({
      success: true,
      registration,
      code: isFull ? 'EVENT_FULL' : undefined,
      message: isFull ? 'Event is full. You were added to the waitlist.' : 'Registration confirmed.'
    });
  });
});

apiRouter.delete('/events/:id/register', requirePermission('events.view'), async (req: Request, res: Response) => {
  const user = getAuthUser(req) || getCurrentUser();
  const eventId = req.params.id;

  await withEventRegistrationLock(eventId, async () => {
    const event = db.get().events.find((item) => item.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const registration = db.get().registrations.find((r) => r.eventId === event.id && r.userId === user.id && r.status !== 'CANCELLED');
    if (!registration) return res.status(404).json({ error: 'Registration not found' });

    registration.status = 'CANCELLED';
    registration.cancelledAt = new Date().toISOString();
    refreshEventCounts(event);

    const nextWaitlisted = db.get().registrations
      .filter((r) => r.eventId === event.id && r.status === 'WAITLIST')
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime())[0];

    if (nextWaitlisted && !event.isCancelled && event.registeredCount < event.capacity) {
      nextWaitlisted.status = 'CONFIRMED';
      nextWaitlisted.cancelledAt = null;
      refreshEventCounts(event);
    }

    db.logAudit(user.id, 'CANCEL_EVENT_REGISTRATION', 'REGISTRATION', registration.id, `Cancelled registration for ${event.title}`);
    db.save();
    return res.json({ success: true, registration, event });
  });
});

apiRouter.post('/events/checkin', requirePermission('events.manage'), (req: Request, res: Response) => {
  const user = getAuthUser(req) || getCurrentUser();
  const { hmacToken, eventId, attendeeStudentId } = req.body;

  let registration = db.get().registrations.find((r) => r.hmacPassToken === hmacToken && r.eventId === eventId);
  if (!registration && attendeeStudentId) {
    const attendeeUser = db.get().users.find((u) => u.studentId === attendeeStudentId);
    if (attendeeUser) {
      registration = db.get().registrations.find((r) => r.userId === attendeeUser.id && r.eventId === eventId);
    }
  }

  if (!registration) {
    return res.status(404).json({ error: 'Valid registration pass not found' });
  }

  if (registration.status === 'ATTENDED') {
    return res.json({ success: true, alreadyAttended: true, message: 'Attendee already checked in' });
  }

  registration.status = 'ATTENDED';
  registration.attendedAt = new Date().toISOString();

  const event = db.get().events.find((item) => item.id === registration.eventId);
  const xpReward = event ? event.xpReward : 200;

  db.awardXp(
    registration.userId,
    xpReward,
    `Attended: ${event?.title || 'Workshop'}`,
    `حضور فعالية: ${event?.titleAr || 'ورشة عمل'}`,
    'EVENT',
    registration.eventId
  );

  db.logAudit(user.id, 'CHECKIN_ATTENDEE', 'REGISTRATION', registration.id, `Checked in user ${registration.userId}`);
  db.save();

  return res.json({ success: true, registration, awardedXp: xpReward });
});

// 8. Certificates & Public Verification
apiRouter.get('/certificates', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const certs = db.get().certificates.filter(c => c.userId === user.id);
  res.json({ certificates: certs });
});

apiRouter.get('/certificates/verify/:code', (req: Request, res: Response) => {
  const code = req.params.code.trim().toUpperCase();
  const cert = db.get().certificates.find(c => c.verificationCode.toUpperCase() === code);
  if (!cert) {
    return res.status(404).json({ isValid: false, message: 'Invalid or unknown credential code' });
  }

  res.json({
    isValid: cert.isValid,
    certificate: cert,
    issuer: {
      organization: 'Microsoft Student Clubs',
      institution: 'Innovation University',
      accreditation: 'Microsoft Learn Student Ambassadors Program'
    }
  });
});

apiRouter.post('/certificates/issue', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only administrators can issue official credentials' });
  }

  const { recipientName, recipientNameAr, title, titleAr, type, studentId } = req.body;
  const targetUser = db.get().users.find(u => u.studentId === studentId) || user;

  const newCert: DbCertificate = {
    id: `cert_${Date.now()}`,
    verificationCode: `MSC-IU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: targetUser.id,
    recipientName: recipientName || targetUser.name,
    recipientNameAr: recipientNameAr || targetUser.nameAr,
    title,
    titleAr,
    type: type || 'EVENT_ATTENDANCE',
    issuedAt: new Date().toISOString(),
    isValid: true,
    academicAdvisor: 'Dr. Kareem Mansour',
    clubPresident: 'Mariam Al-Ghamdi'
  };

  db.get().certificates.push(newCert);
  db.logAudit(user.id, 'ISSUE_CERTIFICATE', 'CERTIFICATE', newCert.id, `Issued code ${newCert.verificationCode}`);
  db.save();

  res.json({ success: true, certificate: newCert });
});

// 9. Leaderboard & XP
apiRouter.get('/leaderboard', (req: Request, res: Response) => {
  const rankedUsers = [...db.get().users]
    .sort((a, b) => b.xp - a.xp)
    .map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.name,
      nameAr: u.nameAr,
      avatar: u.avatar,
      xp: u.xp,
      level: u.level,
      role: u.role,
      badgesCount: u.badges.length
    }));

  res.json({ leaderboard: rankedUsers });
});

apiRouter.get('/xp/history', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const txs = db.get().xpTransactions.filter(t => t.userId === user.id);
  res.json({ transactions: txs });
});

// 10. Student Projects Showcase
apiRouter.get('/projects', (req: Request, res: Response) => {
  res.json({ projects: db.get().projects });
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const { title, titleAr, description, descriptionAr, track, demoUrl, githubUrl, technologies } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const project = {
    id: `prj_${Date.now()}`,
    title,
    titleAr: titleAr || title,
    description,
    descriptionAr: descriptionAr || description,
    studentName: user.name,
    studentNameAr: user.nameAr,
    track: track || 'Applied AI',
    demoUrl: demoUrl || '',
    githubUrl: githubUrl || '',
    starsCount: 1,
    technologies: Array.isArray(technologies) ? technologies : ['Azure', 'React 19'],
    submittedAt: new Date().toISOString()
  };

  db.get().projects.unshift(project);
  db.awardXp(user.id, 300, `Published Student Project: ${title}`, `نشر مشروع طلابي متميز: ${titleAr || title}`, 'PROJECT', project.id);
  db.logAudit(user.id, 'SUBMIT_PROJECT', 'PROJECT', project.id, `Published project ${title}`);
  db.save();

  res.json({ success: true, project });
});

// 11. Resources with Live Download Counter
apiRouter.get('/resources', (req: Request, res: Response) => {
  res.json({ resources: db.get().resources });
});

apiRouter.post('/resources/:id/download', (req: Request, res: Response) => {
  const resource = db.get().resources.find(r => r.id === req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  resource.downloadsCount += 1;
  db.save();
  res.json({ success: true, downloadsCount: resource.downloadsCount });
});

// 12. Membership Application
apiRouter.post('/applications', (req: Request, res: Response) => {
  const { name, email, studentId, track, motivation } = req.body;
  if (!name || !email || !studentId) {
    return res.status(400).json({ error: 'Name, email, and student ID are required' });
  }

  const applicationCode = `APP-IU-${Math.floor(100000 + Math.random() * 900000)}`;
  db.logAudit('GUEST', 'SUBMIT_APPLICATION', 'APPLICATION', applicationCode, `Applied by ${name} (${studentId})`);

  res.json({
    success: true,
    applicationCode,
    status: 'UNDER_REVIEW',
    message: 'Application received successfully'
  });
});

apiRouter.get('/applications/:code', (req: Request, res: Response) => {
  res.json({
    applicationCode: req.params.code,
    status: 'UNDER_REVIEW',
    estimatedDecisionDate: '2026-11-20',
    notes: 'طلبك قيد المراجعة حالياً من قبل لجنة القبول والتسجيل بفرع جامعة الابتكار.'
  });
});

// 13. Audit Logs & CSV Export
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({ logs: db.get().auditLogs });
});

apiRouter.get('/export/csv', (req: Request, res: Response) => {
  const user = getCurrentUser();
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { type } = req.query;
  let csv = '';

  if (type === 'students') {
    csv = 'ID,Name,Email,StudentId,Role,XP,Level\n';
    db.get().users.forEach(u => {
      csv += `"${u.id}","${u.name}","${u.email}","${u.studentId}","${u.role}",${u.xp},${u.level}\n`;
    });
  } else if (type === 'events') {
    csv = 'ID,Title,Type,Registered,Capacity,Speaker\n';
    db.get().events.forEach(e => {
      csv += `"${e.id}","${e.title}","${e.type}",${e.registeredCount},${e.capacity},"${e.speaker}"\n`;
    });
  } else {
    csv = 'ID,User,Action,Target,Details,Date\n';
    db.get().auditLogs.forEach(l => {
      csv += `"${l.id}","${l.userId}","${l.action}","${l.targetType}:${l.targetId}","${l.details}","${l.createdAt}"\n`;
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=msc-iu-${type || 'export'}.csv`);
  res.send(csv);
});
