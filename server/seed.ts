import dotenv from 'dotenv';
import { db } from './db.js';

dotenv.config();

async function main() {
  db.normalizeUserRoles();
  const admin = await db.ensureSeedAdmin(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD);
  if (!admin) {
    throw new Error('Unable to create seed admin.');
  }

  if (!db.get().users.some((user) => user.email.toLowerCase() === 'ahmad.elsayed@innovation.edu.eg')) {
    db.get().users.push({
      id: 'usr_student_1',
      name: 'Ahmad El-Sayed',
      nameAr: 'أحمد السيد النجار',
      email: 'ahmad.elsayed@innovation.edu.eg',
      role: 'STUDENT',
      studentId: '20230142',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      xp: 1850,
      level: 4,
      badges: ['badge_first_step'],
      passwordHash: '',
      failedLoginCount: 0,
      lockedUntil: null,
      isActive: true
    });
  }

  if (!db.get().members.length) {
    db.get().members.push({
      id: 'member_seed_1',
      userId: admin.id,
      uniqueCode: 'MSC-000001',
      name: admin.name,
      nameAr: admin.nameAr,
      email: admin.email,
      phone: '+966500000000',
      avatarUrl: admin.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      faculty: 'Information Technology',
      facultyAr: 'تكنولوجيا المعلومات',
      status: 'ACTIVE',
      rankId: 'rank_president',
      joinedAt: new Date().toISOString()
    });
  }

  db.save();
  console.log(`Seed complete. Admin: ${admin.email}`);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
