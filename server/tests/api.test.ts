import fs from 'fs';
import path from 'path';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { db, initialSeedData } from '../db.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.HMAC_SECRET = process.env.HMAC_SECRET || 'test-hmac-secret';
process.env.APP_URL = process.env.APP_URL || 'http://localhost:3000';
process.env.SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@innovation.edu.eg';
process.env.SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

const { app } = await import('../../server.js');

async function login(email: string, password: string) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  const cookie = res.headers['set-cookie']?.[0]?.split(';')[0] ?? '';
  return { res, cookie };
}

async function createMemberUser(email: string, password: string, name = 'Event User') {
  const id = `usr_event_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const memberId = `member_event_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const member = {
    id: memberId,
    userId: id,
    uniqueCode: `MSC-${Math.random().toString().slice(2, 8).padStart(6, '0')}`,
    name,
    nameAr: `عضو ${name}`,
    email,
    phone: '+966500000000',
    avatarUrl: 'https://example.com/avatar.png',
    faculty: 'Computer Science',
    facultyAr: 'علوم الحاسب',
    status: 'ACTIVE' as const,
    rankId: db.get().memberRanks[0]?.id,
    joinedAt: new Date().toISOString()
  };

  db.get().users.push({
    id,
    name,
    nameAr: member.nameAr,
    email,
    role: 'STUDENT',
    studentId: `STU-${Date.now()}`,
    avatar: 'https://example.com/avatar.png',
    xp: 0,
    level: 1,
    badges: [],
    passwordHash: await bcrypt.hash(password, 12),
    failedLoginCount: 0,
    lockedUntil: null,
    isActive: true
  });

  db.get().members.push(member);
  db.save();
  return { user: db.get().users.find((u) => u.id === id)!, password, member, login: await login(email, password) };
}

async function createEvent(overrides: Record<string, any> = {}) {
  db.save(structuredClone(initialSeedData));
  await db.ensureSeedAdmin(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD);
  const adminLogin = await login(process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
  const payload = {
    title: `Event ${Date.now()}`,
    titleAr: `فعالية ${Date.now()}`,
    description: 'Hands-on event for MSC members.',
    descriptionAr: 'فعالية عملية لأعضاء نادي طلاب مايكروسوفت.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    location: 'Innovation Hub',
    locationAr: 'مركز الابتكار',
    startsAt: '2030-12-12T10:00:00.000Z',
    endsAt: '2030-12-12T12:00:00.000Z',
    capacity: 10,
    registrationDeadline: '2030-12-10T00:00:00.000Z',
    type: 'WORKSHOP',
    speaker: 'Speaker',
    speakerAr: 'متحدث',
    xpReward: 150,
    isPublished: true,
    isCancelled: false,
    eligibilityStatus: 'ACTIVE',
    eligibilityMinRankId: db.get().memberRanks[0]?.id,
    ...overrides
  };

  const res = await request(app)
    .post('/api/events')
    .set('Cookie', adminLogin.cookie)
    .send(payload);

  expect(res.status).toBe(201);
  return { event: res.body.event, adminLogin };
}

beforeAll(async () => {
  db.save(structuredClone(initialSeedData));
  await db.ensureSeedAdmin(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD);
});

beforeEach(async () => {
  db.save(structuredClone(initialSeedData));
  await db.ensureSeedAdmin(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD);
});

describe('API auth and permission checks', () => {
  it('logs in successfully with valid credentials', async () => {
    const { res, cookie } = await login(process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);

    expect(res.status).toBe(200);
    expect(cookie).toContain('msc_session=');
    expect(res.body.user.email).toBe(process.env.SEED_ADMIN_EMAIL);
  });

  it('rejects wrong password', async () => {
    const { res } = await login(process.env.SEED_ADMIN_EMAIL!, 'WrongPassword!');
    expect(res.status).toBe(401);
  });

  it('locks an account after repeated failures', async () => {
    const email = `locktest-${Date.now()}@innovation.edu.eg`;
    const password = 'StrongPass!123';
    const created = await db.ensureSeedAdmin(email, password);
    expect(created).not.toBeNull();

    for (let i = 0; i < 5; i += 1) {
      const { res } = await login(email, 'bad-password');
      if (i < 4) {
        expect(res.status).toBe(401);
      }
    }

    const { res } = await login(email, password);
    expect(res.status).toBe(423);
  }, 20000);

  it('creates, edits, and deletes a member', async () => {
    const adminLogin = await login(process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
    expect(adminLogin.res.status).toBe(200);

    const unique = Date.now();
    const memberPayload = {
      name: `Test Member ${unique}`,
      nameAr: `عضو تجريبي ${unique}`,
      email: `member${unique}@innovation.edu.eg`,
      phone: '+966500000123',
      faculty: 'Computer Science',
      facultyAr: 'علوم حاسب',
      status: 'ACTIVE',
      avatarUrl: 'https://example.com/avatar.png'
    };

    const createRes = await request(app)
      .post('/api/members')
      .set('Cookie', adminLogin.cookie)
      .send(memberPayload);

    expect(createRes.status).toBe(201);
    const memberId = createRes.body.member.id;

    const editRes = await request(app)
      .put(`/api/members/${memberId}`)
      .set('Cookie', adminLogin.cookie)
      .send({ faculty: 'Data Science', rankId: db.get().memberRanks[0].id });

    expect(editRes.status).toBe(200);
    expect(editRes.body.member.faculty).toBe('Data Science');

    const deleteRes = await request(app)
      .delete(`/api/members/${memberId}`)
      .set('Cookie', adminLogin.cookie);

    expect(deleteRes.status).toBe(200);
  });

  it('assigns a rank to a member and rejects missing permission', async () => {
    const adminLogin = await login(process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
    const unique = Date.now();
    const memberRes = await request(app)
      .post('/api/members')
      .set('Cookie', adminLogin.cookie)
      .send({
        name: `Rank Member ${unique}`,
        nameAr: `عضو رتب ${unique}`,
        email: `rankmember${unique}@innovation.edu.eg`,
        phone: '+966500001111',
        faculty: 'Engineering',
        facultyAr: 'هندسة',
        status: 'ACTIVE'
      });

    const memberId = memberRes.body.member.id;
    const rankId = db.get().memberRanks[1].id;
    const updateRes = await request(app)
      .put(`/api/members/${memberId}`)
      .set('Cookie', adminLogin.cookie)
      .send({ rankId });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.member.rankId).toBe(rankId);

    const studentEmail = `student_${Date.now()}@innovation.edu.eg`;
    const studentPassword = 'StrongStudent!234';
    db.get().users.push({
      id: `usr_student_test_${Date.now()}`,
      name: 'Test Student',
      nameAr: 'طالب تجريبي',
      email: studentEmail,
      role: 'STUDENT',
      studentId: 'STU-403',
      avatar: 'https://example.com/student.png',
      xp: 0,
      level: 1,
      badges: [],
      passwordHash: await bcrypt.hash(studentPassword, 12),
      failedLoginCount: 0,
      lockedUntil: null,
      isActive: true
    });
    db.save();

    const studentLogin = await login(studentEmail, studentPassword);
    const forbidden = await request(app)
      .get('/api/members')
      .set('Cookie', studentLogin.cookie);

    expect(forbidden.status).toBe(403);
  });
});

describe('Phase 3 events and registrations', () => {
  it('creates, publishes, and cancels an event', async () => {
    const { event } = await createEvent({ title: `Phase3 Event ${Date.now()}`, isPublished: false });
    expect(event.isPublished).toBe(false);

    const adminLogin = await login(process.env.SEED_ADMIN_EMAIL!, process.env.SEED_ADMIN_PASSWORD!);
    const publishRes = await request(app)
      .patch(`/api/events/${event.id}/publish`)
      .set('Cookie', adminLogin.cookie);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.event.isPublished).toBe(true);

    const cancelRes = await request(app)
      .patch(`/api/events/${event.id}/cancel`)
      .set('Cookie', adminLogin.cookie);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.event.isCancelled).toBe(true);
  }, 20000);

  it('blocks duplicate registration and rejects ineligible members', async () => {
    const { event } = await createEvent({ capacity: 2, title: `DupCheck ${Date.now()}`, eligibilityStatus: 'ACTIVE' });
    const user1 = await createMemberUser(`dup_${Date.now()}_1@innovation.edu.eg`, 'StrongPass!123', 'Member A');
    const user2 = await createMemberUser(`dup_${Date.now()}_2@innovation.edu.eg`, 'StrongPass!123', 'Member B');

    const first = await request(app)
      .post(`/api/events/${event.id}/register`)
      .set('Cookie', user1.login.cookie);
    expect(first.status).toBe(201);

    const duplicate = await request(app)
      .post(`/api/events/${event.id}/register`)
      .set('Cookie', user1.login.cookie);
    expect(duplicate.status).toBe(409);

    const memberRecord = db.get().members.find((m) => m.userId === user2.user.id)!;
    memberRecord.status = 'INACTIVE';
    db.save();

    const ineligible = await request(app)
      .post(`/api/events/${event.id}/register`)
      .set('Cookie', user2.login.cookie);
    expect(ineligible.status).toBe(403);
  }, 20000);

  it('enforces capacity with 50 concurrent registrations and exact 10 confirmed', async () => {
    const { event } = await createEvent({ capacity: 10, title: `Capacity ${Date.now()}` });
    const users: Array<{ login: { cookie: string } }> = [];

    for (let i = 0; i < 50; i += 1) {
      users.push(await createMemberUser(`cap_${Date.now()}_${i}@innovation.edu.eg`, 'StrongPass!123', `User ${i}`));
    }

    const responses = await Promise.all(
      users.map(({ login }) => request(app).post(`/api/events/${event.id}/register`).set('Cookie', login.cookie))
    );

    const confirmed = responses.filter((res) => res.body.registration?.status === 'CONFIRMED').length;
    const waitlist = responses.filter((res) => res.body.registration?.status === 'WAITLIST').length;

    expect(confirmed).toBe(10);
    expect(waitlist).toBe(40);
  }, 60000);

  it('promotes the next waitlisted member when a registration is cancelled', async () => {
    const { event } = await createEvent({ capacity: 1, title: `Waitlist ${Date.now()}` });
    const first = await createMemberUser(`wait_1_${Date.now()}@innovation.edu.eg`, 'StrongPass!123', 'First');
    const second = await createMemberUser(`wait_2_${Date.now()}@innovation.edu.eg`, 'StrongPass!123', 'Second');

    await request(app).post(`/api/events/${event.id}/register`).set('Cookie', first.login.cookie);
    const secondRes = await request(app).post(`/api/events/${event.id}/register`).set('Cookie', second.login.cookie);
    expect(secondRes.body.registration.status).toBe('WAITLIST');

    const cancelRes = await request(app).delete(`/api/events/${event.id}/register`).set('Cookie', first.login.cookie);
    expect(cancelRes.status).toBe(200);

    const refreshed = await request(app).get('/api/events/my-registrations').set('Cookie', second.login.cookie);
    const promoted = refreshed.body.registrations.some((item: any) => item.registration.eventId === event.id && item.registration.status === 'CONFIRMED');
    expect(promoted).toBe(true);
  }, 20000);

  it('rejects registrations after the deadline and without permission', async () => {
    const { event } = await createEvent({
      title: `Deadline ${Date.now()}`,
      registrationDeadline: '2000-01-01T00:00:00.000Z',
      isPublished: true
    });
    const user = await createMemberUser(`dead_${Date.now()}@innovation.edu.eg`, 'StrongPass!123', 'Late User');
    const deadlineRes = await request(app).post(`/api/events/${event.id}/register`).set('Cookie', user.login.cookie);
    expect(deadlineRes.status).toBe(400);

    const studentLogin = await createMemberUser(`perms_${Date.now()}@innovation.edu.eg`, 'StrongPass!123', 'Perm User');
    const forbidden = await request(app)
      .get('/api/admin/events')
      .set('Cookie', studentLogin.login.cookie);
    expect(forbidden.status).toBe(403);
  }, 20000);

  it('persists event data after a simulated restart', async () => {
    const eventTitle = `Persist ${Date.now()}`;
    const { event } = await createEvent({ title: eventTitle, isPublished: true });
    db.save();
    const onDisk = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'db.json'), 'utf8'));
    expect(onDisk.events.some((item: any) => item.id === event.id && item.title === eventTitle)).toBe(true);
  }, 20000);
});

