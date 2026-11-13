/**
 * Microsoft Student Clubs Platform (Innovation University)
 * Core Data Models & TypeScript Definitions
 */

export type Role = 'STUDENT' | 'TEAM_LEAD' | 'ADMIN';

export type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export type EventCategory =
  | 'WORKSHOP'
  | 'BOOTCAMP'
  | 'TECHNICAL_SESSION'
  | 'HACKATHON';

export type RegistrationStatus =
  | 'CONFIRMED'
  | 'WAITLISTED'
  | 'CHECKED_IN'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: Role;
  studentId: string;
  faculty: string;
  facultyAr: string;
  avatarUrl: string;
  teamId?: string;
  xp: number;
  level: number;
  joinedAt: string;
  profileVisibility: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
  leaderboardVisible: boolean;
  notifyEmail: boolean;
  notifyApp: boolean;
  sessionVersion: number;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  leadId: string;
  leadName: string;
  leadNameAr: string;
  memberCount: number;
  trackSlug: string;
  description: string;
  descriptionAr: string;
  iconName: string;
  color: string;
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  description: string;
  descriptionAr: string;
  iconName: string;
  color: string;
  courseCount: number;
  totalHours: number;
  level: 'ALL_LEVELS' | 'INTERMEDIATE' | 'ADVANCED';
  image: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  titleAr: string;
  videoId: string; // YouTube Video ID only
  durationMinutes: number;
  requiredMinutes: number;
  notes: string;
  notesAr: string;
  resources: { title: string; titleAr: string; url: string }[];
  order: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  titleAr: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  trackSlug: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  description: string;
  descriptionAr: string;
  thumbnail: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  durationHours: number;
  xpReward: number;
  completionThreshold: number; // percentage required
  sequential: boolean;
  certificateEnabled: boolean;
  published: boolean;
  prerequisites: string[]; // array of course IDs
  modules: CourseModule[];
  enrolledCount: number;
  completedCount: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  completedLessonIds: string[];
  enrolledAt: string;
  completedAt?: string;
  lastLessonId?: string;
  heartbeats: Record<string, number>; // lessonId -> watched seconds
}

export interface TaskSubmission {
  id: string;
  taskAssignmentId: string;
  attemptNumber: number;
  submittedAt: string;
  notes: string;
  githubUrl?: string;
  fileUrl?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  reviewerFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  status: TaskStatus;
  attempts: number;
  submissions: TaskSubmission[];
  xpAwarded: boolean;
  assignedAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  teamId?: string; // undefined = club-wide
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  deadline: string;
  resources: { title: string; url: string }[];
  maxAttempts: number;
  status: 'OPEN' | 'CLOSED';
  createdById: string;
  createdAt: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  category: EventCategory;
  startsAt: string;
  endsAt: string;
  location: string;
  locationAr: string;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  certificateEnabled: boolean;
  isOnline: boolean;
  speaker: string;
  speakerAr: string;
  speakerRole: string;
  speakerRoleAr: string;
  xpReward: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  passToken: string;
  registeredAt: string;
  checkedInAt?: string;
}

export interface CertificateSignature {
  roleEn: string;
  roleAr: string;
  name: string;
  signatureImage?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  headingEn: string;
  headingAr: string;
  bodyEn: string;
  bodyAr: string;
  accentColor: string;
  signatures: CertificateSignature[];
  enabled: boolean;
}

export interface Certificate {
  id: string;
  code: string;
  recipientId: string;
  recipientName: string;
  recipientNameAr: string;
  recipientStudentId: string;
  title: string;
  titleAr: string;
  type: 'COURSE' | 'EVENT' | 'HONORARY';
  referenceId: string;
  issuer: string;
  issuedAt: string;
  valid: boolean;
  revocationReason?: string;
  templateId: string;
  accentColor?: string;
}

export interface Badge {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  iconName: string;
  category: 'LEARNING' | 'EVENTS' | 'TASKS' | 'COMMUNITY';
  xpRequirement: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  reasonAr: string;
  category: 'LEARNING' | 'TASKS' | 'ATTENDANCE' | 'BONUS';
  createdAt: string;
  idempotencyKey: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | 'TASK_ASSIGNED'
    | 'TASK_FEEDBACK'
    | 'EVENT_REMINDER'
    | 'LEVEL_UNLOCKED'
    | 'CERTIFICATE_ISSUED'
    | 'SYSTEM';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface MemberApplication {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  faculty: string;
  academicYear: string;
  trackInterest: string;
  motivation: string;
  portfolioUrl?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  submittedAt: string;
  applicationCode: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: 'GENERAL' | 'SPONSORSHIP' | 'PARTNERSHIP' | 'EVENT_QUERY';
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  coverImage: string;
  technologies: string[];
  teamMembers: string[];
  githubUrl?: string;
  demoUrl?: string;
  status: 'PUBLISHED' | 'UNDER_REVIEW';
  featured: boolean;
  submittedBy: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: 'AZURE' | 'AI' | 'WEB' | 'SECURITY' | 'CAREER';
  fileType: 'PDF' | 'ZIP' | 'CODE' | 'SLIDES';
  fileSize: string;
  downloadUrl: string;
  downloadsCount: number;
}

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  content: string;
  contentAr: string;
  coverImage: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  category: string;
  publishedAt: string;
  readTimeMinutes: number;
}

export interface AchievementItem {
  id: string;
  year: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: 'HACKATHON' | 'AWARD' | 'PARTNERSHIP' | 'CERTIFICATION';
  rankOrBadge?: string;
}

export interface WorkshopItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructor: string;
  instructorAr: string;
  instructorRole: string;
  instructorRoleAr: string;
  duration: string;
  sessionsCount: number;
  capacity: number;
  registeredCount: number;
  certificateEligible: boolean;
  schedule: { sessionNumber: number; title: string; titleAr: string; date: string; time: string }[];
  prerequisites: string;
  prerequisitesAr: string;
}
export interface Testimonial {
  id: string;
  authorName: string;
  authorNameAr: string;
  role: string;
  roleAr: string;
  avatarUrl: string;
  quote: string;
  quoteAr: string;
  faculty: string;
  facultyAr: string;
  approved: boolean;
}
