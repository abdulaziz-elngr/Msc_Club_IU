import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface DbUser {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: 'STUDENT' | 'TEAM_LEAD' | 'ADMIN';
  studentId: string;
  avatar: string;
  xp: number;
  level: number;
  teamId?: string;
  badges: string[];
  passwordHash?: string;
  failedLoginCount?: number;
  lockedUntil?: string | null;
  isActive?: boolean;
}

export interface DbTrack {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  coverImage: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  leadId: string;
  order: number;
}

export interface DbCourse {
  id: string;
  trackId: string;
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  durationHours: number;
  isPublished: boolean;
  order: number;
  prerequisiteCourseId?: string;
  xpReward: number;
}

export interface DbLesson {
  id: string;
  courseId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  youtubeId: string;
  durationSeconds: number;
  order: number;
  xpReward: number;
}

export interface DbEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progressPercent: number;
  completedLessonIds: string[];
  watchTimeSeconds: Record<string, number>;
}

export interface DbTask {
  id: string;
  trackId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  requirements: string[];
  requirementsAr: string[];
  deadline: string;
  xpReward: number;
  maxAttempts: number;
}

export interface DbSubmission {
  id: string;
  taskId: string;
  userId: string;
  githubUrl: string;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  attemptNumber: number;
  submittedAt: string;
  awardedXp: number;
}

export interface DbEvent {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  imageUrl?: string;
  location: string;
  locationAr: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registrationDeadline: string;
  registeredCount: number;
  waitlistCount: number;
  type: 'WORKSHOP' | 'BOOTCAMP' | 'HACKATHON' | 'SEMINAR' | 'TECHNICAL_SESSION';
  speaker: string;
  speakerAr: string;
  xpReward: number;
  secretCheckInKey: string;
  isPublished: boolean;
  isCancelled: boolean;
  eligibilityMinRankId?: string;
  eligibilityStatus?: 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'BANNED';
  cancelledAt?: string | null;
}

export interface DbRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: 'CONFIRMED' | 'WAITLIST' | 'ATTENDED' | 'CANCELLED';
  registeredAt: string;
  cancelledAt?: string | null;
  hmacPassToken: string;
  qrTokenHash?: string;
  qrTokenEncrypted?: string;
  attendedAt?: string;
}

export interface DbCertificate {
  id: string;
  verificationCode: string;
  userId: string;
  recipientName: string;
  recipientNameAr: string;
  title: string;
  titleAr: string;
  type: 'TRACK_COMPLETION' | 'EVENT_ATTENDANCE' | 'HACKATHON_HONOR';
  issuedAt: string;
  isValid: boolean;
  academicAdvisor: string;
  clubPresident: string;
}

export interface DbXpTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  reasonAr: string;
  referenceType: 'LESSON' | 'TASK' | 'EVENT' | 'PROJECT' | 'MANUAL';
  referenceId: string;
  createdAt: string;
}

export interface DbProject {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  studentName: string;
  studentNameAr: string;
  track: string;
  demoUrl?: string;
  githubUrl?: string;
  starsCount: number;
  technologies: string[];
  submittedAt: string;
}

export interface DbResource {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  downloadsCount: number;
}

export interface DbAuditLog {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ip: string;
  createdAt: string;
}

export interface DbEmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  attempts: number;
  error?: string;
  sentAt?: string;
  createdAt: string;
}

export interface DbRole {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
}

export interface DbRolePermission {
  roleId: string;
  permission: string;
}

export interface DbMemberRank {
  id: string;
  title: string;
  titleAr: string;
  sortOrder: number;
}

export interface DbMember {
  id: string;
  userId: string;
  uniqueCode: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  avatarUrl: string;
  faculty: string;
  facultyAr: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'BANNED';
  rankId?: string;
  joinedAt: string;
}

export interface DbData {
  users: DbUser[];
  tracks: DbTrack[];
  courses: DbCourse[];
  lessons: DbLesson[];
  enrollments: DbEnrollment[];
  tasks: DbTask[];
  submissions: DbSubmission[];
  events: DbEvent[];
  registrations: DbRegistration[];
  certificates: DbCertificate[];
  xpTransactions: DbXpTransaction[];
  projects: DbProject[];
  resources: DbResource[];
  auditLogs: DbAuditLog[];
  emailLogs: DbEmailLog[];
  roles: DbRole[];
  rolePermissions: DbRolePermission[];
  memberRanks: DbMemberRank[];
  members: DbMember[];
  schemaMigrations: string[];
  siteContent: Record<string, any>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function getHmacSecret(): string {
  const secret = process.env.HMAC_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('HMAC_SECRET must be configured in production.');
  }

  return crypto.randomBytes(32).toString('hex');
}

function generateHmacToken(userId: string, eventId: string): string {
  return crypto.createHmac('sha256', getHmacSecret()).update(`${userId}:${eventId}`).digest('hex').substring(0, 16).toUpperCase();
}

const initialSeedData: DbData = {
  users: [
    {
      id: 'usr_student_1',
      name: 'Ahmad El-Sayed',
      nameAr: 'أحمد السيد النجار',
      email: 'ahmad.elsayed@innovation.edu.eg',
      role: 'STUDENT',
      studentId: '20230142',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      xp: 1850,
      level: 4,
      teamId: 'team_ai',
      badges: ['badge_first_step', 'badge_cloud_explorer', 'badge_fast_coder']
    },
    {
      id: 'usr_lead_1',
      name: 'Mariam Al-Ghamdi',
      nameAr: 'مريم الغامدي',
      email: 'mariam.ghamdi@innovation.edu.eg',
      role: 'TEAM_LEAD',
      studentId: '20220089',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      xp: 4920,
      level: 8,
      teamId: 'team_ai',
      badges: ['badge_first_step', 'badge_cloud_explorer', 'badge_mentor', 'badge_hackathon_winner']
    },
    {
      id: 'usr_admin_1',
      name: 'Dr. Kareem Mansour',
      nameAr: 'د. كريم منصور',
      email: 'kareem.mansour@innovation.edu.eg',
      role: 'ADMIN',
      studentId: 'FACULTY_01',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      xp: 9800,
      level: 15,
      badges: ['badge_founder', 'badge_mentor']
    }
  ],
  tracks: [
    {
      id: 'track_cloud',
      slug: 'cloud-devops',
      title: 'Azure Cloud & DevOps Engineering',
      titleAr: 'الحوسبة السحابية وهندسة Azure DevOps',
      description: 'Master enterprise Microsoft Azure architecture, Docker containers, and CI/CD pipelines.',
      descriptionAr: 'إتقان بنية مايكروسوفت آزور السحابية، الحاويات، وأتمتة خطوط النشر المستمر.',
      icon: 'Cloud',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      level: 'ALL_LEVELS',
      leadId: 'usr_lead_1',
      order: 1
    },
    {
      id: 'track_ai',
      slug: 'applied-ai',
      title: 'Applied AI & Cognitive Computing',
      titleAr: 'الذكاء الاصطناعي والحوسبة الإدراكية',
      description: 'Build LLM apps with Azure OpenAI, Computer Vision, Semantic Kernel, and Vector DBs.',
      descriptionAr: 'بناء تطبيقات ذكية باستخدام نماذج اللغة الكبيرة Azure OpenAI، الرؤية الحاسوبية، والبحث الشعاعي.',
      icon: 'Brain',
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
      level: 'INTERMEDIATE',
      leadId: 'usr_lead_1',
      order: 2
    },
    {
      id: 'track_web',
      slug: 'fullstack-engineering',
      title: 'Modern Full-Stack Engineering',
      titleAr: 'هندسة الويب المتكامل والأنظمة السحابية',
      description: 'Develop high-performance web systems with modern React, TypeScript, and server components.',
      descriptionAr: 'تطوير نظم وبرمجيات ويب متكاملة، سريعة، وعالية الأداء بالاعتماد على React 19 و TypeScript.',
      icon: 'Code',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
      level: 'ALL_LEVELS',
      leadId: 'usr_lead_1',
      order: 3
    },
    {
      id: 'track_security',
      slug: 'cybersecurity',
      title: 'Cybersecurity & Cloud Defense',
      titleAr: 'الأمن السيبراني والدفاع السحابي',
      description: 'SOC operations, threat intelligence, and hardening cloud infrastructures against modern breaches.',
      descriptionAr: 'إدارة العمليات الأمنية SOC، صد الهجمات، وتأمين البنى التحتية السحابية.',
      icon: 'ShieldCheck',
      coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
      level: 'ADVANCED',
      leadId: 'usr_lead_1',
      order: 4
    }
  ],
  courses: [
    {
      id: 'crs_azure_fund',
      trackId: 'track_cloud',
      slug: 'azure-fundamentals-az900',
      title: 'Azure Fundamentals (AZ-900 Core)',
      titleAr: 'أساسيات الحوسبة السحابية مايكروسوفت آزور',
      description: 'Fundamental cloud concepts, core Azure services, security, privacy, compliance, and trust.',
      descriptionAr: 'المفاهيم السحابية الجوهرية، خدمات مايكروسوفت آزور الأساسية، ونماذج التكلفة والأمان.',
      durationHours: 8,
      isPublished: true,
      order: 1,
      xpReward: 300
    },
    {
      id: 'crs_azure_devops',
      trackId: 'track_cloud',
      slug: 'azure-devops-pipelines',
      title: 'Azure DevOps & Container Orchestration',
      titleAr: 'أتمتة النشر السحابي وحاويات دوكر مع Azure DevOps',
      description: 'Hands-on CI/CD pipelines, Docker containers, and Azure Kubernetes Service (AKS).',
      descriptionAr: 'بناء خطوط النشر الآلي المستمر وإدارة الحاويات باستخدام خدمة كوبرنيتيس السحابية.',
      durationHours: 12,
      isPublished: true,
      order: 2,
      prerequisiteCourseId: 'crs_azure_fund',
      xpReward: 500
    },
    {
      id: 'crs_ai_agents',
      trackId: 'track_ai',
      slug: 'azure-openai-agents',
      title: 'Building Intelligent Autonomous Agents with Azure OpenAI',
      titleAr: 'بناء الوكلاء الأذكياء وتطبيقات Azure OpenAI',
      description: 'Prompt engineering, Function Calling, RAG architecture, and agent orchestration.',
      descriptionAr: 'هندسة الأوامر الذكية، ربط النماذج بالدوال الخارجية، وبناء أنظمة RAG المتطورة.',
      durationHours: 10,
      isPublished: true,
      order: 1,
      xpReward: 450
    }
  ],
  lessons: [
    {
      id: 'lsn_az_1',
      courseId: 'crs_azure_fund',
      title: 'Cloud Computing Models & Core Architecture',
      titleAr: 'نماذج الحوسبة السحابية والبنية التحتية لـ Azure',
      description: 'Introduction to IaaS, PaaS, SaaS and Azure Global Infrastructure.',
      descriptionAr: 'شرح نماذج البنية التحتية والمناطق الجغرافية ومراكز البيانات لشبكة مايكروسوفت العالمية.',
      youtubeId: 'NKEFWyqJ5XA',
      durationSeconds: 960,
      order: 1,
      xpReward: 50
    },
    {
      id: 'lsn_az_2',
      courseId: 'crs_azure_fund',
      title: 'Azure Compute & Serverless Services',
      titleAr: 'خدمات المعالجة السحابية والأنظمة دون خادم',
      description: 'Virtual Machines, App Services, and Azure Functions.',
      descriptionAr: 'الآلات الافتراضية، خدمات استضافة التطبيقات و Azure Functions.',
      youtubeId: '3hLmDS179YE',
      durationSeconds: 1200,
      order: 2,
      xpReward: 75
    },
    {
      id: 'lsn_ai_1',
      courseId: 'crs_ai_agents',
      title: 'Foundations of Generative Models & System Prompts',
      titleAr: 'أسس النماذج التوليدية وهندسة الأوامر الاحترافية',
      description: 'System messages, temperature, few-shot prompting, and Azure OpenAI Studio.',
      descriptionAr: 'التحكم الدقيق في مخرجات النماذج وتصميم رسائل النظام عبر استوديو Azure OpenAI.',
      youtubeId: 'Hf8P3p7K4zE',
      durationSeconds: 1100,
      order: 1,
      xpReward: 80
    }
  ],
  enrollments: [
    {
      id: 'enr_1',
      userId: 'usr_student_1',
      courseId: 'crs_azure_fund',
      enrolledAt: '2026-11-01T10:00:00Z',
      progressPercent: 50,
      completedLessonIds: ['lsn_az_1'],
      watchTimeSeconds: {
        'lsn_az_1': 960,
        'lsn_az_2': 400
      }
    }
  ],
  tasks: [
    {
      id: 'tsk_1',
      trackId: 'track_cloud',
      title: 'Deploy a Multi-Tier Web App on Azure App Service',
      titleAr: 'نشر تطبيق ويب متعدد الطبقات على خدمة Azure App Service',
      description: 'Create an automated GitHub Actions workflow to build and deploy a Node.js API to Azure with custom domain and SSL.',
      descriptionAr: 'إنشاء خط عمل GitHub Actions مؤتمت لبناء ونشر واجهة برمجة تطبيقات Node.js على Azure مع ربط نطاق وشهادة أمان.',
      requirements: [
        'GitHub repository with proper README and .github/workflows/deploy.yml',
        'Live Azure deployment URL accessible via HTTPS',
        'Environment variables managed securely via Azure Key Vault or App Settings'
      ],
      requirementsAr: [
        'مستودع GitHub يحتوي على ملف توثيق README وملف خط العمل .github/workflows/deploy.yml',
        'رابط تشغيل حي على مايكروسوفت آزور يعمل ببروتوكول HTTPS',
        'إدارة المتغيرات البيئية بأمان عبر إعدادات التطبيق أو Azure Key Vault'
      ],
      deadline: '2026-11-25T23:59:59Z',
      xpReward: 250,
      maxAttempts: 3
    },
    {
      id: 'tsk_2',
      trackId: 'track_ai',
      title: 'Implement RAG Agent with Semantic Kernel & Azure OpenAI',
      titleAr: 'برمجة وكيل ذكي للبحث الموجه (RAG) باستخدام Semantic Kernel',
      description: 'Build a university knowledge-base question-answering assistant leveraging Azure OpenAI embeddings and vector search.',
      descriptionAr: 'بناء مساعد ذكي يجيب على أسئلة الطلاب من اللائحة الأكاديمية باستخدام المتجهات ونماذج التضمين السحابية.',
      requirements: [
        'Vector database integration (Qdrant, Chroma, or Azure AI Search)',
        'Hallucination prevention system prompt with citations',
        'Clean evaluation suite verifying retrieval accuracy'
      ],
      requirementsAr: [
        'دمج قاعدة بيانات شعاعية للبحث الدلالي',
        'رسالة نظام صارمة لمنع التخمين وحصر الإجابات بالمستندات المرفقة',
        'اختبارات دقة التحقق للتأكد من صحة النتائج'
      ],
      deadline: '2026-11-30T23:59:59Z',
      xpReward: 350,
      maxAttempts: 2
    }
  ],
  submissions: [
    {
      id: 'sub_1',
      taskId: 'tsk_1',
      userId: 'usr_student_1',
      githubUrl: 'https://github.com/ahmadsayed/azure-app-service-deployment',
      notes: 'Successfully deployed and verified SSL termination with zero-downtime deployment slots.',
      status: 'APPROVED',
      reviewerFeedback: 'عمل متقن جداً واستخدام ممتاز لـ Deployment Slots لحماية سير العمل أثناء النشر.',
      reviewedBy: 'usr_lead_1',
      reviewedAt: '2026-11-05T14:20:00Z',
      attemptNumber: 1,
      submittedAt: '2026-11-04T18:10:00Z',
      awardedXp: 250
    }
  ],
  events: [
    {
      id: 'evt_1',
      slug: 'azure-ai-bootcamp-2026',
      title: 'Azure AI Summit 2026: Building Autonomous Agents',
      titleAr: 'معسكر آزور للذكاء الاصطناعي 2026: بناء الوكلاء الأذكياء',
      description: 'Two-day intensive hands-on bootcamp at Innovation University Main Auditorium in collaboration with Microsoft engineering leads.',
      descriptionAr: 'معسكر تدريبي مكثف لمدة يومين في القاعة الكبرى بجامعة الابتكار بمشاركة مهندسي مايكروسوفت.',
      location: 'Innovation University Main Auditorium & Lab C',
      locationAr: 'القاعة الكبرى ومختبر الحاسوب C - جامعة الابتكار',
      startsAt: '2026-11-20T09:00:00Z',
      endsAt: '2026-11-21T17:00:00Z',
      capacity: 120,
      registrationDeadline: '2026-11-18T23:59:59Z',
      registeredCount: 114,
      waitlistCount: 12,
      type: 'BOOTCAMP',
      speaker: 'Eng. Tamer Hegazy (Microsoft MVP & Principal Architect)',
      speakerAr: 'م. تامر حجازي (خبير مايكروسوفت المعتمد)',
      xpReward: 300,
      secretCheckInKey: 'INNOVATION-SUMMIT-2026',
      isPublished: true,
      isCancelled: false,
      eligibilityMinRankId: 'rank_member',
      eligibilityStatus: 'ACTIVE'
    },
    {
      id: 'evt_2',
      slug: 'react19-server-components-workshop',
      title: 'Workshop: React 19 & Server Components in Production',
      titleAr: 'ورشة عمل: أسرار React 19 ومكونات الخادم في المشاريع الكبرى',
      description: 'Deep dive into streaming, Server Actions, modern performance benchmarks, and edge deployments.',
      descriptionAr: 'تعمق هندسي في ميزات البث والتعامل مع الخادم بأمان وأعلى مستويات السرعة.',
      location: 'Software Engineering Lab 4',
      locationAr: 'مختبر هندسة البرمجيات 4',
      startsAt: '2026-11-24T13:00:00Z',
      endsAt: '2026-11-24T16:00:00Z',
      capacity: 45,
      registrationDeadline: '2026-11-23T18:00:00Z',
      registeredCount: 45,
      waitlistCount: 8,
      type: 'WORKSHOP',
      speaker: 'Dr. Kareem Mansour',
      speakerAr: 'د. كريم منصور',
      xpReward: 150,
      secretCheckInKey: 'REACT19-LAB-2026',
      isPublished: true,
      isCancelled: false,
      eligibilityMinRankId: 'rank_member',
      eligibilityStatus: 'ACTIVE'
    }
  ],
  registrations: [
    {
      id: 'reg_1',
      eventId: 'evt_1',
      userId: 'usr_student_1',
      status: 'CONFIRMED',
      registeredAt: '2026-11-08T11:00:00Z',
      hmacPassToken: generateHmacToken('usr_student_1', 'evt_1')
    }
  ],
  certificates: [
    {
      id: 'cert_1',
      verificationCode: 'MSC-IU-2026-8841',
      userId: 'usr_student_1',
      recipientName: 'Ahmad El-Sayed',
      recipientNameAr: 'أحمد السيد النجار',
      title: 'Innovation University CTF & Cyber Defense Challenge',
      titleAr: 'بطولة جامعة الابتكار للأمن السيبراني والتقاط العلم (CTF)',
      type: 'EVENT_ATTENDANCE',
      issuedAt: '2026-10-16T12:00:00Z',
      isValid: true,
      academicAdvisor: 'Dr. Kareem Mansour',
      clubPresident: 'Mariam Al-Ghamdi'
    }
  ],
  xpTransactions: [
    {
      id: 'tx_1',
      userId: 'usr_student_1',
      amount: 50,
      reason: 'Completed Lesson: Cloud Computing Models',
      reasonAr: 'إتمام درس: نماذج الحوسبة السحابية والبنية التحتية',
      referenceType: 'LESSON',
      referenceId: 'lsn_az_1',
      createdAt: '2026-11-01T10:30:00Z'
    },
    {
      id: 'tx_2',
      userId: 'usr_student_1',
      amount: 250,
      reason: 'Approved Task: Deploy Multi-Tier Web App',
      reasonAr: 'اعتماد مهمة: نشر تطبيق ويب على Azure',
      referenceType: 'TASK',
      referenceId: 'tsk_1',
      createdAt: '2026-11-05T14:20:00Z'
    }
  ],
  projects: [
    {
      id: 'prj_1',
      title: 'Smart Campus AI Assistant',
      titleAr: 'المساعد الذكي للحرم الجامعي بجامعة الابتكار',
      description: 'A comprehensive campus navigation and academic advisory agent deployed with Azure OpenAI.',
      descriptionAr: 'منظومة إرشاد أكاديمي وملاحة ذكية في الحرم الجامعي مع ربط بنماذج الذكاء الاصطناعي.',
      studentName: 'Ahmad El-Sayed & Team',
      studentNameAr: 'أحمد السيد وفريق العمل',
      track: 'Applied AI',
      demoUrl: 'https://smartcampus.innovation.edu.eg',
      githubUrl: 'https://github.com/msc-iu/smart-campus-ai',
      starsCount: 42,
      technologies: ['React 19', 'Azure OpenAI', 'TypeScript', 'FastAPI'],
      submittedAt: '2026-11-02T10:00:00Z'
    }
  ],
  resources: [
    {
      id: 'res_1',
      title: 'Official Azure AZ-900 Study Guide (2026 Edition)',
      titleAr: 'دليل الدراسة المعتمد لاختبار مايكروسوفت آزور AZ-900',
      description: 'Comprehensive 85-page cheat-sheet and architecture breakdown compiled by Microsoft Ambassadors.',
      descriptionAr: 'ملخص شامل من 85 صفحة يغطي جميع محاور اختبار الشهادة المعتمدة مع أسئلة تدريبية.',
      category: 'Guides',
      fileType: 'PDF',
      fileSize: '4.8 MB',
      downloadUrl: '#',
      downloadsCount: 384
    },
    {
      id: 'res_2',
      title: 'GitHub Copilot Enterprise Prompt Engineering Template',
      titleAr: 'قالب هندسة الأوامر لـ GitHub Copilot في المشاريع الكبرى',
      description: 'Standardized prompts, workspace context rules, and security guidelines.',
      descriptionAr: 'مجموعة قوالب وإرشادات توجيه كود الذكاء الاصطناعي لحماية أمن الكود وسرعة الإنجاز.',
      category: 'Templates',
      fileType: 'ZIP',
      fileSize: '1.2 MB',
      downloadUrl: '#',
      downloadsCount: 295
    }
  ],
  auditLogs: [
    {
      id: 'log_1',
      userId: 'usr_admin_1',
      action: 'INIT_SYSTEM',
      targetType: 'SYSTEM',
      targetId: 'IU_MSC_2026',
      details: 'Initialized Microsoft Student Clubs database schemas and security parameters.',
      ip: '127.0.0.1',
      createdAt: '2026-11-01T00:00:00Z'
    }
  ],
  roles: [
    { id: 'role_super_admin', code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Full platform access', isSystem: true },
    { id: 'role_event_manager', code: 'EVENT_MANAGER', name: 'Event Manager', description: 'Manage events', isSystem: true },
    { id: 'role_member_manager', code: 'MEMBER_MANAGER', name: 'Member Manager', description: 'Manage members and ranks', isSystem: true },
    { id: 'role_content_manager', code: 'CONTENT_MANAGER', name: 'Content Manager', description: 'Manage CMS content', isSystem: true },
    { id: 'role_team_lead', code: 'TEAM_LEAD', name: 'Team Lead', description: 'Lead team operations', isSystem: true },
    { id: 'role_member', code: 'MEMBER', name: 'Member', description: 'Standard member access', isSystem: true }
  ],
  rolePermissions: [
    { roleId: 'role_super_admin', permission: 'members.manage' },
    { roleId: 'role_super_admin', permission: 'roles.manage' },
    { roleId: 'role_super_admin', permission: 'events.manage' },
    { roleId: 'role_super_admin', permission: 'events.view' },
    { roleId: 'role_super_admin', permission: 'attendance.manage' },
    { roleId: 'role_super_admin', permission: 'content.manage' },
    { roleId: 'role_member_manager', permission: 'members.manage' },
    { roleId: 'role_event_manager', permission: 'events.manage' },
    { roleId: 'role_event_manager', permission: 'events.view' },
    { roleId: 'role_content_manager', permission: 'content.manage' },
    { roleId: 'role_team_lead', permission: 'events.manage' },
    { roleId: 'role_team_lead', permission: 'events.view' },
    { roleId: 'role_team_lead', permission: 'attendance.manage' },
    { roleId: 'role_member', permission: 'events.view' }
  ],
  memberRanks: [
    { id: 'rank_president', title: 'President', titleAr: 'الرئيس', sortOrder: 1 },
    { id: 'rank_vp', title: 'Vice President', titleAr: 'نائب الرئيس', sortOrder: 2 },
    { id: 'rank_team_lead', title: 'Team Lead', titleAr: 'قائد الفريق', sortOrder: 3 },
    { id: 'rank_member', title: 'Member', titleAr: 'عضو', sortOrder: 4 }
  ],
  members: [
    { id: 'member_1', userId: 'usr_student_1', uniqueCode: 'MSC-000001', name: 'Ahmad El-Sayed', nameAr: 'أحمد السيد النجار', email: 'ahmad.elsayed@innovation.edu.eg', phone: '+966500000001', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', faculty: 'Computer Science & AI', facultyAr: 'حاسبات ومعلومات والذكاء الاصطناعي', status: 'ACTIVE', rankId: 'rank_member', joinedAt: '2026-11-01T00:00:00Z' }
  ],
  schemaMigrations: ['0001_init'],
  emailLogs: [],
  siteContent: {}
};

class Database {
  private data: DbData;

  constructor() {
    this.data = this.load();
  }

  private normalize(data: Partial<DbData>): DbData {
    const base = structuredClone(initialSeedData);
    const mergeById = <T extends { id: string }>(current: T[] | undefined, fallback: T[]): T[] => {
      const map = new Map<string, T>();
      [...fallback, ...(current ?? [])].forEach((item) => map.set(item.id, item));
      return [...map.values()];
    };
    const mergeRolePermissions = (current: DbRolePermission[] | undefined, fallback: DbRolePermission[]): DbRolePermission[] => {
      const map = new Map<string, DbRolePermission>();
      [...fallback, ...(current ?? [])].forEach((item) => map.set(`${item.roleId}:${item.permission}`, item));
      return [...map.values()];
    };
    return {
      ...base,
      ...data,
      users: data.users ?? base.users,
      tracks: data.tracks ?? base.tracks,
      courses: data.courses ?? base.courses,
      lessons: data.lessons ?? base.lessons,
      enrollments: data.enrollments ?? base.enrollments,
      tasks: data.tasks ?? base.tasks,
      submissions: data.submissions ?? base.submissions,
      events: data.events ?? base.events,
      registrations: data.registrations ?? base.registrations,
      certificates: data.certificates ?? base.certificates,
      xpTransactions: data.xpTransactions ?? base.xpTransactions,
      projects: data.projects ?? base.projects,
      resources: data.resources ?? base.resources,
      auditLogs: data.auditLogs ?? base.auditLogs,
      roles: mergeById(data.roles, base.roles),
      rolePermissions: mergeRolePermissions(data.rolePermissions, base.rolePermissions),
      memberRanks: mergeById(data.memberRanks, base.memberRanks),
      members: mergeById(data.members, base.members),
      schemaMigrations: Array.from(new Set([...(data.schemaMigrations ?? []), ...(base.schemaMigrations ?? [])])),
      emailLogs: data.emailLogs ?? base.emailLogs,
      siteContent: data.siteContent ?? base.siteContent,
    };
  }

  private load(): DbData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DbData>;
        return this.normalize(parsed);
      }
    } catch (err) {
      console.warn('Could not read existing db.json, using defaults', err);
    }
    this.save(initialSeedData);
    return this.normalize(initialSeedData);
  }

  public save(newData?: DbData): void {
    if (newData) {
      this.data = newData;
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to db.json:', err);
    }
  }

  public get(): DbData {
    return this.data;
  }

  public awardXp(userId: string, amount: number, reason: string, reasonAr: string, refType: 'LESSON' | 'TASK' | 'EVENT' | 'PROJECT' | 'MANUAL', refId: string): void {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return;

    user.xp += amount;
    user.level = Math.floor(user.xp / 500) + 1;

    const tx: DbXpTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      amount,
      reason,
      reasonAr,
      referenceType: refType,
      referenceId: refId,
      createdAt: new Date().toISOString()
    };

    this.data.xpTransactions.unshift(tx);
    this.logAudit(userId, 'AWARD_XP', 'USER', userId, `Awarded ${amount} XP for ${reason}`);
    this.save();
  }

  public logAudit(userId: string, action: string, targetType: string, targetId: string, details: string, ip: string = '127.0.0.1'): void {
    const log: DbAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      action,
      targetType,
      targetId,
      details,
      ip,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    this.save();
  }

  public normalizeUserRoles(): void {
    if (!this.data.roles?.length) {
      this.data.roles = initialSeedData.roles;
    }
    if (!this.data.rolePermissions?.length) {
      this.data.rolePermissions = initialSeedData.rolePermissions;
    }
    if (!this.data.memberRanks?.length) {
      this.data.memberRanks = initialSeedData.memberRanks;
    }
    if (!this.data.members?.length) {
      this.data.members = initialSeedData.members;
    }
    this.save();
  }

  public async ensureSeedAdmin(email?: string, password?: string): Promise<DbUser | null> {
    const targetEmail = (email || process.env.SEED_ADMIN_EMAIL || 'admin@innovation.edu.eg').toLowerCase();
    const targetPassword = password || process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    let user = this.data.users.find(u => u.email.toLowerCase() === targetEmail);
    if (!user) {
      user = {
        id: `usr_admin_seed_${Date.now()}`,
        name: 'Platform Administrator',
        nameAr: 'مدير المنصة',
        email: targetEmail,
        role: 'ADMIN',
        studentId: 'ADMIN-001',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        xp: 0,
        level: 1,
        badges: ['badge_founder'],
        passwordHash: '',
        failedLoginCount: 0,
        lockedUntil: null,
        isActive: true,
      };
      this.data.users.unshift(user);
    }

    user.passwordHash = await bcrypt.hash(targetPassword, 12);
    user.isActive = true;
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    this.save();
    return user;
  }
}

export { initialSeedData };
export const db = new Database();
