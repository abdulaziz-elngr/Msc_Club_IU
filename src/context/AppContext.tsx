/**
 * Microsoft Student Clubs Platform (Innovation University)
 * Global Application Context & State Management Engine
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Role,
  Team,
  Track,
  Course,
  Enrollment,
  Assignment,
  TaskAssignment,
  Event,
  EventRegistration,
  Certificate,
  CertificateTemplate,
  Badge,
  XpTransaction,
  NotificationItem,
  MemberApplication,
  ContactMessage,
  Testimonial,
  Project,
  ResourceItem,
  ArticleItem,
  AchievementItem,
  WorkshopItem,
} from '../types';
import { Language, translations } from '../lib/i18n';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  t: typeof translations.ar;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUser: User;
  users: User[];
  teams: Team[];
  tracks: Track[];
  courses: Course[];
  enrollments: Enrollment[];
  assignments: Assignment[];
  taskAssignments: TaskAssignment[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  certificates: Certificate[];
  certificateTemplates: CertificateTemplate[];
  badges: Badge[];
  xpTransactions: XpTransaction[];
  notifications: NotificationItem[];
  memberApplications: MemberApplication[];
  contactMessages: ContactMessage[];
  testimonials: Testimonial[];
  projects: Project[];
  workshops: WorkshopItem[];
  achievements: AchievementItem[];
  resources: ResourceItem[];
  articles: ArticleItem[];

  // Project, Workshop & Resource Actions
  submitProject: (p: Omit<Project, 'id' | 'status' | 'submittedBy'>) => void;
  registerForWorkshop: (workshopId: string) => { success: boolean; message: string };
  downloadResource: (resourceId: string) => void;

  // Learning Actions
  enrollInCourse: (courseId: string) => boolean;
  recordLessonHeartbeat: (courseId: string, lessonId: string, secondsWatched: number) => void;
  completeLesson: (courseId: string, lessonId: string) => { success: boolean; code: string; xpAwarded?: number };
  reorderLessons: (courseId: string, moduleId: string, lessonId: string, direction: 'up' | 'down') => void;
  toggleCoursePublish: (courseId: string) => void;
  addCourse: (courseData: Partial<Course>) => void;

  // Task Actions
  submitTask: (taskAssignmentId: string, notes: string, githubUrl?: string) => boolean;
  reviewTask: (taskAssignmentId: string, status: 'APPROVED' | 'REJECTED', feedback: string) => boolean;
  createAssignment: (data: Partial<Assignment>) => void;

  // Event Actions
  registerForEvent: (eventId: string) => { success: boolean; status: 'CONFIRMED' | 'WAITLISTED'; message: string };
  checkInAttendee: (passToken: string) => { success: boolean; message: string; attendeeName?: string };

  // Certificate Actions
  verifyCertificate: (code: string) => { found: boolean; certificate?: Certificate; template?: CertificateTemplate };
  issueCertificate: (recipientId: string, title: string, titleAr: string, type: 'COURSE' | 'EVENT' | 'HONORARY', refId: string) => Certificate;
  revokeCertificate: (code: string, reason: string) => boolean;

  // Gamification & XP
  awardXp: (userId: string, amount: number, reason: string, reasonAr: string, category: 'LEARNING' | 'TASKS' | 'ATTENDANCE' | 'BONUS') => void;
  celebrationData: { show: boolean; title: string; subtitle: string; xp: number } | null;
  dismissCelebration: () => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateUserPreferences: (prefs: { notifyEmail?: boolean; notifyApp?: boolean; profileVisibility?: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'; leaderboardVisible?: boolean }) => void;

  // Public Actions
  submitApplication: (appData: Omit<MemberApplication, 'id' | 'status' | 'submittedAt' | 'applicationCode'>) => string;
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

// Initial Seed Users
const SEED_USERS: User[] = [
  {
    id: 'user-ahmad',
    name: 'Ahmad El-Sayed',
    nameAr: 'أحمد السيد النجار',
    email: 'ahmad.elsayed@innovation.edu.eg',
    role: 'STUDENT',
    studentId: '20230142',
    faculty: 'Computer Science & AI',
    facultyAr: 'حاسبات ومعلومات والذكاء الاصطناعي',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teamId: 'web-dev',
    xp: 1850,
    level: 4,
    joinedAt: '2025-09-15',
    profileVisibility: 'PUBLIC',
    leaderboardVisible: true,
    notifyEmail: true,
    notifyApp: true,
    sessionVersion: 1,
  },
  {
    id: 'user-mariam',
    name: 'Mariam Al-Ghamdi',
    nameAr: 'مريم الغامدي',
    email: 'mariam.lead@innovation.edu.eg',
    role: 'TEAM_LEAD',
    studentId: '20220911',
    faculty: 'Computer Engineering',
    facultyAr: 'هندسة الحاسبات والبرمجيات',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    teamId: 'ai-data',
    xp: 4920,
    level: 8,
    joinedAt: '2024-10-01',
    profileVisibility: 'PUBLIC',
    leaderboardVisible: true,
    notifyEmail: true,
    notifyApp: true,
    sessionVersion: 1,
  },
  {
    id: 'user-kareem',
    name: 'Dr. Kareem Mansour',
    nameAr: 'د. كريم منصور',
    email: 'kareem.mansour@innovation.edu.eg',
    role: 'ADMIN',
    studentId: 'FACULTY-081',
    faculty: 'Dean of Information Technology',
    facultyAr: 'عمادة تكنولوجيا المعلومات والابتكار',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    xp: 9800,
    level: 15,
    joinedAt: '2024-01-10',
    profileVisibility: 'PUBLIC',
    leaderboardVisible: true,
    notifyEmail: true,
    notifyApp: true,
    sessionVersion: 1,
  },
  {
    id: 'user-nour',
    name: 'Nour El-Din Tarek',
    nameAr: 'نور الدين طارق',
    email: 'nour.tarek@innovation.edu.eg',
    role: 'STUDENT',
    studentId: '20230877',
    faculty: 'Computer Science',
    facultyAr: 'علوم الحاسب',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    teamId: 'azure-cloud',
    xp: 2420,
    level: 5,
    joinedAt: '2025-08-20',
    profileVisibility: 'PUBLIC',
    leaderboardVisible: true,
    notifyEmail: true,
    notifyApp: true,
    sessionVersion: 1,
  },
  {
    id: 'user-sarah',
    name: 'Sarah Ibrahim',
    nameAr: 'سارة إبراهيم',
    email: 'sarah.ibrahim@innovation.edu.eg',
    role: 'STUDENT',
    studentId: '20240112',
    faculty: 'Cybersecurity & Networks',
    facultyAr: 'الأمن السيبراني وشبكات الحاسب',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    teamId: 'cyber-sec',
    xp: 3100,
    level: 6,
    joinedAt: '2025-07-11',
    profileVisibility: 'PUBLIC',
    leaderboardVisible: true,
    notifyEmail: true,
    notifyApp: true,
    sessionVersion: 1,
  },
];

// Seed Teams
const SEED_TEAMS: Team[] = [
  {
    id: 'ai-data',
    slug: 'ai-data',
    name: 'AI & Data Science Chapter',
    nameAr: 'لجنة الذكاء الاصطناعي وعلوم البيانات',
    leadId: 'user-mariam',
    leadName: 'Mariam Al-Ghamdi',
    leadNameAr: 'مريم الغامدي',
    memberCount: 42,
    trackSlug: 'ai-machine-learning',
    description: 'Empowering students to build neural networks, train transformers, and leverage Azure AI Services.',
    descriptionAr: 'تمكين طلاب جامعة الابتكار من بناء وتدريب النماذج الذكية وحلول الذكاء الاصطناعي باستخدام خدمات Azure AI.',
    iconName: 'BrainCircuit',
    color: '#0078D4',
  },
  {
    id: 'azure-cloud',
    slug: 'azure-cloud',
    name: 'Azure Cloud & DevOps Chapter',
    nameAr: 'لجنة الحوسبة السحابية وAzure DevOps',
    leadId: 'user-nour',
    leadName: 'Nour El-Din Tarek',
    leadNameAr: 'نور الدين طارق',
    memberCount: 38,
    trackSlug: 'azure-cloud-devops',
    description: 'Specializing in cloud infrastructure, container orchestration with AKS, and serverless engineering.',
    descriptionAr: 'تخصص البنية التحتية السحابية، الحاويات AKS، وهندسة الأنظمة عالية التوافر بدون خوادم.',
    iconName: 'Cloud',
    color: '#1B6AC4',
  },
  {
    id: 'web-dev',
    slug: 'web-dev',
    name: 'Modern Web & Systems Chapter',
    nameAr: 'لجنة هندسة الويب وتطوير النظم الحديثة',
    leadId: 'user-ahmad',
    leadName: 'Ahmad El-Sayed',
    leadNameAr: 'أحمد السيد',
    memberCount: 56,
    trackSlug: 'web-engineering',
    description: 'Designing production-grade React, Next.js, and TypeScript architectures for university and beyond.',
    descriptionAr: 'بناء وتطوير تطبيقات الويب الحديثة باستخدام أحدث ممارسات React 19 و TypeScript والأنظمة السحابية.',
    iconName: 'Code',
    color: '#123F6E',
  },
  {
    id: 'cyber-sec',
    slug: 'cyber-sec',
    name: 'Cybersecurity & Defense Chapter',
    nameAr: 'لجنة الأمن السيبراني والدفاع الرقمي',
    leadId: 'user-sarah',
    leadName: 'Sarah Ibrahim',
    leadNameAr: 'سارة إبراهيم',
    memberCount: 29,
    trackSlug: 'cybersecurity',
    description: 'Threat hunting, vulnerability research, defensive automation, and Microsoft Sentinel integrations.',
    descriptionAr: 'أبحاث الثغرات، الدفاع السيبراني، ومحاكاة الاختراق وتحليل الحوادث عبر Microsoft Sentinel.',
    iconName: 'ShieldAlert',
    color: '#0A1B30',
  },
];

// Seed Tracks
const SEED_TRACKS: Track[] = [
  {
    id: 'track-azure',
    slug: 'azure-cloud-devops',
    title: 'Azure Cloud & DevOps Engineering',
    titleAr: 'الحوسبة السحابية وهندسة Azure DevOps',
    summary: 'Master enterprise Microsoft Azure, Kubernetes, and CI/CD automation.',
    summaryAr: 'إتقان بنية مايكروسوفت آزور السحابية، الحاويات، وأتمتة خطوط النشر المستمر.',
    description: 'Designed for university students seeking industry-recognized cloud architecture skills.',
    descriptionAr: 'مسار تدريبي متقدم يؤهل طلاب الجامعة لشهادات مايكروسوفت المعتمدة في هندسة السحابة.',
    iconName: 'Cloud',
    color: '#0078D4',
    courseCount: 3,
    totalHours: 32,
    level: 'ALL_LEVELS',
    image: '/src/assets/images/msc_track_ai_cloud_1794505304144.jpg',
  },
  {
    id: 'track-ai',
    slug: 'ai-machine-learning',
    title: 'Applied AI & Cognitive Computing',
    titleAr: 'الذكاء الاصطناعي والحوسبة الإدراكية',
    summary: 'Build intelligent applications with Azure OpenAI, Vision, and Vector Search.',
    summaryAr: 'بناء تطبيقات ذكية باستخدام نماذج اللغة الكبيرة Azure OpenAI، الرؤية الحاسوبية، والبحث الشعاعي.',
    description: 'From deep neural networks to production agentic architectures.',
    descriptionAr: 'من أساسيات النماذج العصبية إلى بناء وكلاء أذكياء وتطبيقات إنتاجية متكاملة.',
    iconName: 'BrainCircuit',
    color: '#1B6AC4',
    courseCount: 2,
    totalHours: 28,
    level: 'INTERMEDIATE',
    image: '/src/assets/images/msc_track_ai_cloud_1794505304144.jpg',
  },
  {
    id: 'track-web',
    slug: 'web-engineering',
    title: 'Modern Full-Stack Engineering',
    titleAr: 'هندسة الويب المتكامل والأنظمة السحابية',
    summary: 'Develop robust, accessible, and fast web systems using React 19 and Node.',
    summaryAr: 'تطوير نظم وبرمجيات ويب متكاملة، سريعة، وعالية الأداء بالاعتماد على React 19 و TypeScript.',
    description: 'Production standards, security compliance, and performant state management.',
    descriptionAr: 'معايير البرمجة الاحترافية، الأمان والحماية، وإدارة الحالة المتقدمة.',
    iconName: 'Code',
    color: '#123F6E',
    courseCount: 3,
    totalHours: 36,
    level: 'ALL_LEVELS',
    image: '/src/assets/images/msc_track_dev_cyber_1794505303748.jpg',
  },
  {
    id: 'track-cyber',
    slug: 'cybersecurity',
    title: 'Cybersecurity & Cloud Defense',
    titleAr: 'الأمن السيبراني والدفاع السحابي',
    summary: 'Security Operations, threat hunting, and defensive engineering.',
    summaryAr: 'إدارة العمليات الأمنية SOC، صد الهجمات، وتأمين البنى التحتية السحابية.',
    description: 'Hands-on labs in digital forensics, cryptanalysis, and access governance.',
    descriptionAr: 'تطبيقات عملية في التحليل الجنائي الرقمي، تحليل التهديدات، وحوكمة الهويات.',
    iconName: 'ShieldAlert',
    color: '#0A1B30',
    courseCount: 2,
    totalHours: 24,
    level: 'ADVANCED',
    image: '/src/assets/images/msc_track_dev_cyber_1794505303748.jpg',
  },
];

// Seed Courses
const SEED_COURSES: Course[] = [
  {
    id: 'course-azure-foundations',
    slug: 'azure-cloud-foundations',
    trackSlug: 'azure-cloud-devops',
    title: 'Microsoft Azure Cloud Foundations (AZ-900 Prep)',
    titleAr: 'أساسيات الحوسبة السحابية مع مايكروسوفت آزور',
    summary: 'A comprehensive deep-dive into Azure core services, security, compliance, and pricing.',
    summaryAr: 'رحلة تدريبية شاملة تغطي خدمات آزور الأساسية، الحوسبة، التخزين، والأمان السحابي.',
    description: 'This official student club course prepares you directly for the Microsoft AZ-900 certification exam with hands-on portal labs.',
    descriptionAr: 'دورة رسمية تؤهلك لاختبار مايكروسوفت AZ-900 مع معامل تطبيقية حقيقية على بوابة Azure.',
    thumbnail: '/src/assets/images/msc_track_ai_cloud_1794505304144.jpg',
    difficulty: 'BEGINNER',
    durationHours: 10,
    xpReward: 350,
    completionThreshold: 80,
    sequential: true,
    certificateEnabled: true,
    published: true,
    prerequisites: [],
    enrolledCount: 128,
    completedCount: 64,
    modules: [
      {
        id: 'mod-1',
        courseId: 'course-azure-foundations',
        title: 'Module 1: Cloud Concepts & Azure Architecture',
        titleAr: 'الوحدة 1: مفاهيم السحابة وبنية آزور التحتية',
        order: 1,
        lessons: [
          {
            id: 'les-1',
            moduleId: 'mod-1',
            title: 'Introduction to Cloud Computing & Regions',
            titleAr: 'مقدمة في الحوسبة السحابية ومناطق آزور الجغرافية',
            videoId: 'NKEFW2W2U14', // High-quality official YouTube Azure video
            durationMinutes: 12,
            requiredMinutes: 10,
            notes: 'Covers IaaS vs PaaS vs SaaS, high availability, fault tolerance, and Azure Regions paired architectures.',
            notesAr: 'شرح الفرق بين IaaS و PaaS و SaaS، والتوافرية العالية، والمناطق الجغرافية لمراكز بيانات مايكروسوفت.',
            resources: [
              { title: 'Azure Architecture Diagram', titleAr: 'مخطط بنية آزور المعمارية', url: 'https://learn.microsoft.com/azure/architecture/' },
              { title: 'Lecture Presentation Slides', titleAr: 'العرض التقديمي للمحاضرة', url: '#' },
            ],
            order: 1,
          },
          {
            id: 'les-2',
            moduleId: 'mod-1',
            title: 'Azure Compute: VMs, App Services & Functions',
            titleAr: 'خدمات الحوسبة: الأجهزة الافتراضية والتطبيقات بدون خوادم',
            videoId: 'tQvJb7B7p3Y',
            durationMinutes: 18,
            requiredMinutes: 14,
            notes: 'Virtual machines scaling, Azure App Service deployment tiers, and event-driven Azure Functions.',
            notesAr: 'كيفية إنشاء الأجهزة الافتراضية، خدمات استضافة التطبيقات App Services، والدوال اللحظية Serverless.',
            resources: [
              { title: 'CLI Cheat Sheet', titleAr: 'دليل أوامر Azure CLI', url: 'https://learn.microsoft.com/cli/azure/' },
            ],
            order: 2,
          },
        ],
      },
      {
        id: 'mod-2',
        courseId: 'course-azure-foundations',
        title: 'Module 2: Storage, Security & Identity (Entra ID)',
        titleAr: 'الوحدة 2: التخزين السحابي والأمان وإدارة الهويات (Entra ID)',
        order: 2,
        lessons: [
          {
            id: 'les-3',
            moduleId: 'mod-2',
            title: 'Blob Storage, Files & Cosmos DB',
            titleAr: 'تخزين الكائنات Blob Storage وقواعد بيانات Cosmos DB',
            videoId: 'NKEFW2W2U14',
            durationMinutes: 15,
            requiredMinutes: 12,
            notes: 'Object storage tiers (Hot, Cool, Archive), redundancy options (LRS, GRS), and globally distributed Cosmos DB.',
            notesAr: 'فئات التخزين السحابي وطرق التكرار الجغرافي لحماية البيانات وقواعد بيانات Cosmos DB العالمية.',
            resources: [
              { title: 'Storage Pricing Guide', titleAr: 'دليل تسعير التخزين', url: '#' },
            ],
            order: 1,
          },
          {
            id: 'les-4',
            moduleId: 'mod-2',
            title: 'Microsoft Entra ID (Azure AD) & Role-Based Access Control',
            titleAr: 'إدارة الهويات عبر Microsoft Entra ID وصلاحيات RBAC',
            videoId: 'tQvJb7B7p3Y',
            durationMinutes: 20,
            requiredMinutes: 16,
            notes: 'Tenant administration, Zero Trust security model, Multi-Factor Authentication, and custom RBAC roles.',
            notesAr: 'نموذج انعدام الثقة Zero Trust، المصادقة الثنائية MFA، وتعيين الأدوار والصلاحيات للمستخدمين.',
            resources: [
              { title: 'Zero Trust Whitepaper', titleAr: 'ورقة عمل نموذج انعدام الثقة', url: '#' },
            ],
            order: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'course-azure-ai-agents',
    slug: 'azure-ai-agents-llms',
    trackSlug: 'ai-machine-learning',
    title: 'Generative AI with Azure OpenAI & Semantic Kernel',
    titleAr: 'الذكاء الاصطناعي التوليدي عبر Azure OpenAI و Semantic Kernel',
    summary: 'Build agentic workflows, RAG applications, and vector search systems with Microsoft tech.',
    summaryAr: 'بناء وكلاء أذكياء وتطبيقات RAG مدعومة بالبحث الشعاعي ونماذج GPT-4o على بنية Azure.',
    description: 'Requires completion of Azure Cloud Foundations. Learn how to connect LLMs to enterprise databases with security guards.',
    descriptionAr: 'يتطلب إتمام دورة أساسيات السحابة. تعلم ربط النماذج الذكية بقواعد البيانات مع حواجز الأمان والحماية.',
    thumbnail: '/src/assets/images/msc_track_ai_cloud_1794505304144.jpg',
    difficulty: 'INTERMEDIATE',
    durationHours: 14,
    xpReward: 500,
    completionThreshold: 80,
    sequential: true,
    certificateEnabled: true,
    published: true,
    prerequisites: ['course-azure-foundations'],
    enrolledCount: 84,
    completedCount: 29,
    modules: [
      {
        id: 'mod-ai-1',
        courseId: 'course-azure-ai-agents',
        title: 'Module 1: Prompt Engineering & Embeddings',
        titleAr: 'الوحدة 1: هندسة الأوامر والتضمينات الشعاعية',
        order: 1,
        lessons: [
          {
            id: 'les-ai-1',
            moduleId: 'mod-ai-1',
            title: 'Azure OpenAI Studio & System Prompts',
            titleAr: 'استوديو Azure OpenAI وصياغة الأوامر النظامية',
            videoId: 'NKEFW2W2U14',
            durationMinutes: 16,
            requiredMinutes: 13,
            notes: 'Model deployments, temperature, top_p, and grounding constraints.',
            notesAr: 'نشر النماذج وضبط معاملات التوليد وتثبيت الإجابات وفق مصادر موثوقة.',
            resources: [{ title: 'Prompt Catalog', titleAr: 'كتالوج الأوامر الاحترافية', url: '#' }],
            order: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'course-fullstack-react19',
    slug: 'modern-react-typescript',
    trackSlug: 'web-engineering',
    title: 'Production Web Engineering with React 19 & TypeScript',
    titleAr: 'هندسة الويب المتطورة باستخدام React 19 و TypeScript',
    summary: 'Component architecture, strict typing, responsive design, and state persistence.',
    summaryAr: 'بناء واجهات برمجية متطورة وسريعة الاستجابة بأعلى معايير جودة الكود والأداء.',
    description: 'A hands-on coding course taught by Innovation University club leads.',
    descriptionAr: 'دورة برمجية عملية يقودها مهندسو النادي لبناء تطبيقات حقيقية تلبي متطلبات سوق العمل.',
    thumbnail: '/src/assets/images/msc_track_dev_cyber_1794505303748.jpg',
    difficulty: 'ALL_LEVELS' as any,
    durationHours: 12,
    xpReward: 400,
    completionThreshold: 80,
    sequential: false,
    certificateEnabled: true,
    published: true,
    prerequisites: [],
    enrolledCount: 164,
    completedCount: 82,
    modules: [
      {
        id: 'mod-web-1',
        courseId: 'course-fullstack-react19',
        title: 'Module 1: React 19 Core & Hooks',
        titleAr: 'الوحدة 1: ميزات React 19 والخطافات الحديثة',
        order: 1,
        lessons: [
          {
            id: 'les-web-1',
            moduleId: 'mod-web-1',
            title: 'Modern Architecture & Context System',
            titleAr: 'بنية التطبيقات الحديثة ونظام السياق Context',
            videoId: 'NKEFW2W2U14',
            durationMinutes: 14,
            requiredMinutes: 11,
            notes: 'Decoupling state, optimizing renders, and accessible UI patterns.',
            notesAr: 'فصل منطق الحالة وتحسين سرعة التصيير ومعايير سهولة الوصول.',
            resources: [{ title: 'GitHub Starter Kit', titleAr: 'قالب المشروع المبدئي', url: '#' }],
            order: 1,
          },
        ],
      },
    ],
  },
];

// Initial Enrollment for Ahmad
const SEED_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-ahmad-azure',
    userId: 'user-ahmad',
    courseId: 'course-azure-foundations',
    progressPercent: 50,
    completedLessonIds: ['les-1', 'les-2'],
    enrolledAt: '2026-02-01',
    lastLessonId: 'les-3',
    heartbeats: {
      'les-1': 720,
      'les-2': 1080,
      'les-3': 420,
    },
  },
];

// Seed Assignments / Tasks
const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'task-1',
    title: 'Deploy a Resilient Serverless Container on Azure Container Apps',
    titleAr: 'نشر تطبيق حاويات بدون خوادم على Azure Container Apps',
    description: 'Package an Express/React microservice into a Docker container, push to Azure Container Registry (ACR), and deploy to Azure Container Apps with zero-scale enabled.',
    descriptionAr: 'تغليف خدمة برمجية داخل حاوية Docker، ورفعها إلى Azure Container Registry، ونشرها مع تفعيل التوسع التلقائي للصفر.',
    teamId: 'azure-cloud',
    difficulty: 'MEDIUM',
    xpReward: 250,
    deadline: '2026-11-25T23:59:00',
    resources: [
      { title: 'Azure Container Apps Quickstart', url: 'https://learn.microsoft.com/azure/container-apps/' },
      { title: 'Docker Starter Dockerfile', url: '#' },
    ],
    maxAttempts: 3,
    status: 'OPEN',
    createdById: 'user-mariam',
    createdAt: '2026-11-01',
  },
  {
    id: 'task-2',
    title: 'Build a Multi-Tenant RAG Pipeline using Azure AI Search',
    titleAr: 'تطوير خط أنابيب RAG متكامل بالاعتماد على Azure AI Search',
    description: 'Implement vector embeddings generation, chunking strategies, and hybrid vector+keyword queries with user-level security filters.',
    descriptionAr: 'تطبيق توليد التضمينات الشعاعية، واستراتيجيات تقطيع النصوص، وتصفية المستندات بحسب صلاحيات المستخدم.',
    teamId: 'ai-data',
    difficulty: 'HARD',
    xpReward: 350,
    deadline: '2026-11-28T23:59:00',
    resources: [
      { title: 'Azure AI Search Samples', url: '#' },
    ],
    maxAttempts: 3,
    status: 'OPEN',
    createdById: 'user-mariam',
    createdAt: '2026-11-03',
  },
  {
    id: 'task-3',
    title: 'Implement Nonce CSP & Secure Authentication DAL in React 19',
    titleAr: 'تطبيق سياسة حماية المحتوى CSP وطبقة البيانات الآمنة DAL',
    description: 'Build a secure data access layer that enforces authorization checks, prevents IDOR vulnerabilities, and eliminates XSS risks.',
    descriptionAr: 'بناء طبقة وصول آمنة للبيانات تمنع ثغرات انتحال الصلاحيات IDOR وهجمات XSS وتطبق سياسات الرؤوس الآمنة.',
    teamId: 'web-dev',
    difficulty: 'MEDIUM',
    xpReward: 200,
    deadline: '2026-11-30T23:59:00',
    resources: [{ title: 'OWASP Security Guide', url: '#' }],
    maxAttempts: 2,
    status: 'OPEN',
    createdById: 'user-kareem',
    createdAt: '2026-11-05',
  },
];

// Seed Task Assignments
const SEED_TASK_ASSIGNMENTS: TaskAssignment[] = [
  {
    id: 'ta-ahmad-task1',
    taskId: 'task-1',
    userId: 'user-ahmad',
    status: 'APPROVED',
    attempts: 1,
    xpAwarded: true,
    assignedAt: '2026-11-02',
    updatedAt: '2026-11-06',
    submissions: [
      {
        id: 'sub-1',
        taskAssignmentId: 'ta-ahmad-task1',
        attemptNumber: 1,
        submittedAt: '2026-11-05',
        notes: 'Container image pushed to ACR with automated GitHub Actions workflow. Verified scale-to-zero in test environment.',
        githubUrl: 'https://github.com/innovation-msc/azure-container-sample',
        status: 'APPROVED',
        reviewerFeedback: 'Excellent architecture! Clean Dockerfile with multi-stage build and non-root execution. 250 XP awarded!',
        reviewedBy: 'Mariam Al-Ghamdi',
        reviewedAt: '2026-11-06',
      },
    ],
  },
  {
    id: 'ta-ahmad-task2',
    taskId: 'task-2',
    userId: 'user-ahmad',
    status: 'UNDER_REVIEW',
    attempts: 1,
    xpAwarded: false,
    assignedAt: '2026-11-04',
    updatedAt: '2026-11-10',
    submissions: [
      {
        id: 'sub-2',
        taskAssignmentId: 'ta-ahmad-task2',
        attemptNumber: 1,
        submittedAt: '2026-11-10',
        notes: 'Integrated Azure OpenAI text-embedding-3-small and Azure AI Search with Semantic re-ranking.',
        githubUrl: 'https://github.com/innovation-msc/rag-search-eval',
        status: 'SUBMITTED',
      },
    ],
  },
  {
    id: 'ta-ahmad-task3',
    taskId: 'task-3',
    userId: 'user-ahmad',
    status: 'IN_PROGRESS',
    attempts: 0,
    xpAwarded: false,
    assignedAt: '2026-11-06',
    updatedAt: '2026-11-06',
    submissions: [],
  },
];

// Seed Events
const SEED_EVENTS: Event[] = [
  {
    id: 'event-azure-bootcamp',
    slug: 'azure-ai-bootcamp-2026',
    title: 'Azure AI & Cloud Bootcamp 2026: Agentic Workflows',
    titleAr: 'معسكر آزور للذكاء الاصطناعي 2026: بناء الوكلاء الأذكياء',
    summary: 'A 2-day intensive in-person hackathon & bootcamp at Innovation University Main Auditorium.',
    summaryAr: 'معسكر تدريبي مكثف لمدة يومين في القاعة الكبرى بجامعة الابتكار بمشاركة مهندسي مايكروسوفت.',
    category: 'BOOTCAMP',
    startsAt: '2026-11-20T10:00:00',
    endsAt: '2026-11-21T18:00:00',
    location: 'Innovation University - Campus Hall 3',
    locationAr: 'جامعة الابتكار - مجمع الابتكار التكنولوجي - قاعة 3',
    capacity: 120,
    registeredCount: 114,
    waitlistCount: 8,
    certificateEnabled: true,
    isOnline: false,
    speaker: 'Eng. Tamer Hegazi',
    speakerAr: 'م. تامر حجازي',
    speakerRole: 'Principal Cloud Solution Architect, Microsoft',
    speakerRoleAr: 'كبير مهندسي الحلول السحابية في مايكروسوفت',
    xpReward: 300,
  },
  {
    id: 'event-react-workshop',
    slug: 'react-19-server-components',
    title: 'React 19 Server Components & Production Architecture',
    titleAr: 'ورشة عمل: أسرار React 19 ومكونات الخادم في المشاريع الكبرى',
    summary: 'Deep-dive into streaming SSR, Server Actions security, and compiler optimizations.',
    summaryAr: 'تعمق هندسي في ميزات البث والتعامل مع الخادم بأمان وأعلى مستويات السرعة.',
    category: 'WORKSHOP',
    startsAt: '2026-11-24T16:00:00',
    endsAt: '2026-11-24T19:30:00',
    location: 'Microsoft Teams & Tech Lab B',
    locationAr: 'بث مباشر عبر Microsoft Teams ومختبر البرمجيات B',
    capacity: 80,
    registeredCount: 80,
    waitlistCount: 16,
    certificateEnabled: true,
    isOnline: true,
    speaker: 'Dr. Kareem Mansour',
    speakerAr: 'د. كريم منصور',
    speakerRole: 'Club Faculty Lead & Tech Fellow',
    speakerRoleAr: 'المشرف الأكاديمي وخبير التقنية بجامعة الابتكار',
    xpReward: 150,
  },
  {
    id: 'event-cyber-hackathon',
    slug: 'cyber-ctf-championship',
    title: 'Innovation University CTF & Cyber Defense Challenge',
    titleAr: 'بطولة جامعة الابتكار للأمن السيبراني والتقاط العلم (CTF)',
    summary: '12-hour continuous offensive & defensive cybersecurity competition.',
    summaryAr: 'مسابقة سيبرانية حماسية لمدة 12 ساعة متواصلة في تحليل الثغرات والتشفير وحماية الخوادم.',
    category: 'HACKATHON',
    startsAt: '2026-10-15T09:00:00',
    endsAt: '2026-10-15T21:00:00',
    location: 'Auditorium Central Lab',
    locationAr: 'المدرج المركزي - معمل أبحاث الأمن السيبراني',
    capacity: 150,
    registeredCount: 150,
    waitlistCount: 0,
    certificateEnabled: true,
    isOnline: false,
    speaker: 'Sarah Ibrahim & Team',
    speakerAr: 'سارة إبراهيم وفريق العمل',
    speakerRole: 'Security Lead, MSC',
    speakerRoleAr: 'قائدة لجنة الأمن السيبراني بالنادي',
    xpReward: 400,
  },
];

// Seed Registrations
const SEED_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-ahmad-bootcamp',
    eventId: 'event-azure-bootcamp',
    userId: 'user-ahmad',
    status: 'CONFIRMED',
    passToken: 'HMAC_MSC_BOOTCAMP_2026_AHMAD_99182',
    registeredAt: '2026-11-05',
  },
  {
    id: 'reg-ahmad-hackathon',
    eventId: 'event-cyber-hackathon',
    userId: 'user-ahmad',
    status: 'CHECKED_IN',
    passToken: 'HMAC_MSC_CTF_2026_AHMAD_11209',
    registeredAt: '2026-10-10',
    checkedInAt: '2026-10-15T09:12:00',
  },
];

// Seed Certificate Templates
const SEED_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'tmpl-official',
    name: 'Official Microsoft Student Clubs Credential',
    headingEn: 'CERTIFICATE OF ACHIEVEMENT',
    headingAr: 'شهادة إنجاز واعتماد رسمي',
    bodyEn: 'This certifies that the candidate has successfully satisfied all academic and practical requirements established by Microsoft Student Clubs at Innovation University.',
    bodyAr: 'تشهد أندية مايكروسوفت الطلابية في جامعة الابتكار بأن الطالب/ـة قد أتم بنجاح كافة المتطلبات الأكاديمية والتطبيقية المقررة.',
    accentColor: '#1B6AC4',
    enabled: true,
    signatures: [
      {
        roleEn: 'MSC Faculty Advisor',
        roleAr: 'المشرف العام على النادي',
        name: 'Dr. Kareem Mansour',
      },
      {
        roleEn: 'Club President',
        roleAr: 'رئيس نادي مايكروسوفت الطلابي',
        name: 'Mariam Al-Ghamdi',
      },
    ],
  },
];

// Seed Certificates
const SEED_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    code: 'MSC-IU-2026-8841',
    recipientId: 'user-ahmad',
    recipientName: 'Ahmad El-Sayed',
    recipientNameAr: 'أحمد السيد النجار',
    recipientStudentId: '20230142',
    title: 'Innovation University CTF & Cyber Defense Challenge',
    titleAr: 'بطولة جامعة الابتكار للأمن السيبراني والتقاط العلم (CTF)',
    type: 'EVENT',
    referenceId: 'event-cyber-hackathon',
    issuer: 'Microsoft Student Clubs - Innovation University',
    issuedAt: '2026-10-16',
    valid: true,
    templateId: 'tmpl-official',
    accentColor: '#123F6E',
  },
  {
    id: 'cert-2',
    code: 'MSC-IU-2026-9210',
    recipientId: 'user-mariam',
    recipientName: 'Mariam Al-Ghamdi',
    recipientNameAr: 'مريم الغامدي',
    recipientStudentId: '20220911',
    title: 'Microsoft Azure Cloud Foundations (AZ-900 Prep)',
    titleAr: 'أساسيات الحوسبة السحابية مع مايكروسوفت آزور',
    type: 'COURSE',
    referenceId: 'course-azure-foundations',
    issuer: 'Microsoft Student Clubs - Innovation University',
    issuedAt: '2026-09-20',
    valid: true,
    templateId: 'tmpl-official',
    accentColor: '#0078D4',
  },
  {
    id: 'cert-3-revoked',
    code: 'MSC-IU-2025-REV-04',
    recipientId: 'user-revoked-sample',
    recipientName: 'Tariq Al-Mansoor',
    recipientNameAr: 'طارق المنصور',
    recipientStudentId: '20210099',
    title: 'Advanced Azure DevOps Pipelines',
    titleAr: 'هندسة خطوط النشر المتقدمة Azure DevOps',
    type: 'COURSE',
    referenceId: 'course-azure-devops-adv',
    issuer: 'Microsoft Student Clubs - Innovation University',
    issuedAt: '2025-11-10',
    valid: false,
    revocationReason: 'Revoked by Dean of Faculty: Academic integrity violation on task submission.',
    templateId: 'tmpl-official',
    accentColor: '#DC2626',
  },
];

// Seed Badges
const SEED_BADGES: Badge[] = [
  {
    id: 'badge-1',
    slug: 'first-step',
    title: 'Campus Pioneer',
    titleAr: 'رائد الحرم الجامعي',
    description: 'Joined Microsoft Student Clubs at Innovation University.',
    descriptionAr: 'الانضمام رسمياً لعضوية أندية مايكروسوفت الطلابية بجامعة الابتكار.',
    iconName: 'Award',
    category: 'COMMUNITY',
    xpRequirement: 100,
    rarity: 'COMMON',
  },
  {
    id: 'badge-2',
    slug: 'cloud-explorer',
    title: 'Cloud Explorer',
    titleAr: 'مستكشف السحابة',
    description: 'Enrolled and mastered initial cloud architecture concepts.',
    descriptionAr: 'التسجيل في مسار الحوسبة السحابية وإنجاز الوحدات التأسيسية.',
    iconName: 'Cloud',
    category: 'LEARNING',
    xpRequirement: 500,
    rarity: 'RARE',
  },
  {
    id: 'badge-3',
    slug: 'code-artisan',
    title: 'Code Artisan',
    titleAr: 'حرفي الأكواد البرمجية',
    description: 'Successfully submitted hands-on coding tasks verified by leads.',
    descriptionAr: 'تسليم حلول برمجية عملية معتمدة من قادة الفرق.',
    iconName: 'Code',
    category: 'TASKS',
    xpRequirement: 1000,
    rarity: 'EPIC',
  },
  {
    id: 'badge-4',
    slug: 'master-builder',
    title: 'Master Innovator',
    titleAr: 'المبتكر الخبير',
    description: 'Accumulated over 1500 XP through exceptional community impact.',
    descriptionAr: 'تجاوز حاجز 1500 نقطة خبرة عبر المشاركة الفعالة والتعلم المستمر.',
    iconName: 'Sparkles',
    category: 'COMMUNITY',
    xpRequirement: 1500,
    rarity: 'LEGENDARY',
  },
];

// Seed XP Transactions
const SEED_TRANSACTIONS: XpTransaction[] = [
  {
    id: 'xp-1',
    userId: 'user-ahmad',
    amount: 100,
    reason: 'Welcome bonus for joining Innovation University MSC',
    reasonAr: 'مكافأة ترحيبية للانضمام لنادي مايكروسوفت الطلابي',
    category: 'BONUS',
    createdAt: '2025-09-15T12:00:00',
    idempotencyKey: 'xp:welcome:user-ahmad',
  },
  {
    id: 'xp-2',
    userId: 'user-ahmad',
    amount: 400,
    reason: 'Participation in Innovation University CTF Challenge',
    reasonAr: 'المشاركة الفعالة في بطولة الأمن السيبراني والتقاط العلم',
    category: 'ATTENDANCE',
    createdAt: '2026-10-15T21:00:00',
    idempotencyKey: 'xp:event:event-cyber-hackathon:user-ahmad',
  },
  {
    id: 'xp-3',
    userId: 'user-ahmad',
    amount: 250,
    reason: 'Task Approved: Deploy a Resilient Serverless Container',
    reasonAr: 'اعتماد تسليم مهمة: نشر حاويات بدون خوادم على Azure',
    category: 'TASKS',
    createdAt: '2026-11-06T15:30:00',
    idempotencyKey: 'xp:task:ta-ahmad-task1',
  },
  {
    id: 'xp-4',
    userId: 'user-ahmad',
    amount: 1100,
    reason: 'Completing Modules 1 & 2 in Azure Cloud Foundations',
    reasonAr: 'إكمال وحدات تدريبية متقدمة في مسار أساسيات آزور',
    category: 'LEARNING',
    createdAt: '2026-11-08T18:00:00',
    idempotencyKey: 'xp:learning:mod1-2:user-ahmad',
  },
];

// Seed Notifications
const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-ahmad',
    type: 'TASK_FEEDBACK',
    title: 'Task Approved: Serverless Container',
    titleAr: 'تم اعتماد المهمة بنجاح: نشر حاويات بدون خوادم',
    message: 'Mariam Al-Ghamdi approved your task submission and awarded +250 XP.',
    messageAr: 'قامت مريم الغامدي باعتماد حل المهمة وإضافة 250 نقطة خبرة لرصيدك.',
    read: false,
    link: '/dashboard/tasks',
    createdAt: '2026-11-06T15:30:00',
  },
  {
    id: 'notif-2',
    userId: 'user-ahmad',
    type: 'EVENT_REMINDER',
    title: 'Reminder: Azure AI Bootcamp 2026',
    titleAr: 'تذكير: معسكر آزور للذكاء الاصطناعي 2026',
    message: 'Your seat is confirmed! Please have your QR Pass ready at the campus entrance.',
    messageAr: 'مقعدك مؤكد! يرجى إبراز تصريح الدخول QR Pass عند بوابة القاعة 3.',
    read: false,
    link: '/events',
    createdAt: '2026-11-11T09:00:00',
  },
  {
    id: 'notif-3',
    userId: 'user-ahmad',
    type: 'LEVEL_UNLOCKED',
    title: 'Level Up! You reached Level 4',
    titleAr: 'ترقية! لقد وصلت إلى المستوى 4 في نادي مايكروسوفت',
    message: 'You have earned the Master Innovator badge and unlocked advanced tasks.',
    messageAr: 'حصلت على وسام المبتكر الخبير وتم فتح إمكانية المشاركة في المهام المتقدمة.',
    read: true,
    link: '/dashboard/points',
    createdAt: '2026-11-08T18:05:00',
  },
];

// Seed Testimonials
const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    authorName: 'Youssef El-Husseiny',
    authorNameAr: 'يوسف الحسيني',
    role: 'Cloud Architect Intern at Microsoft',
    roleAr: 'متدرب مهندس سحابة في مايكروسوفت مصر',
    faculty: 'Computer Engineering, Class of 2026',
    facultyAr: 'هندسة الحاسبات - دفعة 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    quote: 'Joining Microsoft Student Clubs at Innovation University accelerated my career. The hands-on tasks and verified certificates gave me the competitive edge to land my internship at Microsoft.',
    quoteAr: 'الانضمام لنادي مايكروسوفت في جامعة الابتكار نقل مسيرتي نقلة نوعية. التطبيقات العملية والشهادات المعتمدة منحتني الأفضلية للقبول كمتدرب في مايكروسوفت.',
    approved: true,
  },
  {
    id: 't-2',
    authorName: 'Dina Mansour',
    authorNameAr: 'دينا منصور',
    role: 'AI Researcher & Hackathon Finalist',
    roleAr: 'باحثة ذكاء اصطناعي وفائزة بهاكاثون الجامعة',
    faculty: 'Faculty of AI & Data Science',
    facultyAr: 'كلية الذكاء الاصطناعي وعلوم البيانات',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    quote: 'The peer learning environment, team workspaces, and transparent XP system make mastering complex topics like Azure OpenAI genuinely exciting.',
    quoteAr: 'بيئة التعلم الجماعي ومساحات عمل الفرق ونظام نقاط الخبرة تجعل إتقان المواضيع المعقدة مثل نماذج Azure OpenAI تجربة ممتعة ومحفزة.',
    approved: true,
  },
];

// Seed Projects
const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'AzureCampus AI Academic Advisor',
    titleAr: 'المساعد الأكاديمي الذكي لجامعة الابتكار',
    description: 'An autonomous student advising system utilizing Azure OpenAI GPT-4o, semantic vector search over faculty curriculum bylaws, and real-time exam schedules.',
    descriptionAr: 'نظام إرشاد أكاديمي ذكي مدعوم بنماذج Azure OpenAI والبحث الشعاعي يجيب عن استفسارات لوائح الكليات ومواعيد المحاضرات والاختبارات.',
    coverImage: '/src/assets/images/msc_track_ai_cloud_1794505304144.jpg',
    technologies: ['React 19', 'TypeScript', 'Azure OpenAI', 'Azure AI Search', 'Cosmos DB'],
    teamMembers: ['Ahmad El-Sayed', 'Nour El-Din Tarek', 'Mariam Al-Ghamdi'],
    githubUrl: 'https://github.com/innovation-msc/azure-campus-ai',
    demoUrl: 'https://campus-ai.innovation.edu.eg',
    status: 'PUBLISHED',
    featured: true,
    submittedBy: 'user-ahmad',
  },
  {
    id: 'proj-2',
    title: 'CloudGuard Sentinel Threat Forensics',
    titleAr: 'نظام التحليل الجنائي ورصد التهديدات السحابية',
    description: 'Real-time telemetry analysis pipeline connecting campus network logs to Microsoft Sentinel, automating incident response through serverless Azure Functions.',
    descriptionAr: 'منظومة رصد أمني متقدمة تربط سجلات شبكة الجامعة بمنصة Microsoft Sentinel مع أتمتة الاستجابة للهجمات عبر دوال آزور السحابية.',
    coverImage: '/src/assets/images/msc_track_dev_cyber_1794505303748.jpg',
    technologies: ['Python', 'Azure Sentinel', 'KQL', 'Docker', 'FastAPI'],
    teamMembers: ['Sarah Ibrahim', 'Khaled Mostafa'],
    githubUrl: 'https://github.com/innovation-msc/cloudguard-sentinel',
    status: 'PUBLISHED',
    featured: true,
    submittedBy: 'user-sarah',
  },
  {
    id: 'proj-3',
    title: 'SkillSync Student Credential Wallet',
    titleAr: 'محفظة المهارات والشهادات المعتمدة للطلاب',
    description: 'Cryptographically verifiable student credential wallet integrated with QR pass authentication and verified XP tracking.',
    descriptionAr: 'محفظة رقمية للشهادات والمهارات الجامعية المعتمدة مع خاصية التحقق الفوري عبر الباركود المشفر وتتبع نقاط الخبرة.',
    coverImage: '/src/assets/images/msc_hero_community_1794505303540.jpg',
    technologies: ['Next.js', 'Tailwind CSS', 'PostgreSQL', 'Prisma', 'Auth.js'],
    teamMembers: ['Ahmad El-Sayed', 'Dina Mansour'],
    githubUrl: 'https://github.com/innovation-msc/skillsync-wallet',
    demoUrl: 'https://skillsync.innovation.edu.eg',
    status: 'PUBLISHED',
    featured: false,
    submittedBy: 'user-ahmad',
  },
];

// Seed Workshops
const SEED_WORKSHOPS: WorkshopItem[] = [
  {
    id: 'ws-aks-mastery',
    title: 'Mastering Azure Kubernetes Service (AKS) in Practice',
    titleAr: 'معسكر التطبيق العملي لهندسة الحاويات و Kubernetes على Azure',
    description: 'A 3-session masterclass on containerization, zero-downtime rolling deployments, ingress controllers, and GitOps pipelines.',
    descriptionAr: 'ورشة عمل تطبيقية مكثفة من 3 جلسات تغطي نشر الحاويات، استراتيجيات التحديث بدون توقف، وإدارة البنية التحتية البرمجية عبر GitOps.',
    level: 'INTERMEDIATE',
    instructor: 'Eng. Tamer Hegazi',
    instructorAr: 'م. تامر حجازي',
    instructorRole: 'Principal Cloud Architect, Microsoft',
    instructorRoleAr: 'كبير مهندسي السحابة في مايكروسوفت',
    duration: '3 Sessions (9 Hours Total)',
    sessionsCount: 3,
    capacity: 60,
    registeredCount: 52,
    certificateEligible: true,
    prerequisites: 'Basic Docker knowledge & Azure Foundations course',
    prerequisitesAr: 'معرفة أساسية بحاويات Docker وإتمام دورة أساسيات آزور',
    schedule: [
      { sessionNumber: 1, title: 'AKS Cluster Architecture & Pods', titleAr: 'بنية عنقود AKS وهندسة الحاويات', date: '2026-11-26', time: '17:00 - 20:00' },
      { sessionNumber: 2, title: 'Ingress, TLS & Microservices Routing', titleAr: 'بوابات التوجيه وتشفير شهادات الأمان TLS', date: '2026-11-28', time: '17:00 - 20:00' },
      { sessionNumber: 3, title: 'CI/CD Automation with GitHub Actions & AKS', titleAr: 'أتمتة النشر المستمر مع GitHub Actions', date: '2026-11-30', time: '17:00 - 20:00' },
    ],
  },
  {
    id: 'ws-rag-semantic',
    title: 'Building Enterprise RAG with Semantic Kernel & GPT-4o',
    titleAr: 'بناء تطبيقات الذكاء الاصطناعي المؤسسية مع Semantic Kernel',
    description: 'Step-by-step implementation of Retrieval-Augmented Generation, vector embeddings, chunking strategies, and safety guardrails.',
    descriptionAr: 'تطبيق عملي خطوة بخطوة لبناء نظم التوليد المعزز بالاسترجاع RAG، التضمينات الشعاعية، وحواجز أمان النماذج اللغوية.',
    level: 'ADVANCED',
    instructor: 'Mariam Al-Ghamdi',
    instructorAr: 'مريم الغامدي',
    instructorRole: 'AI Chapter Lead & Microsoft Student Ambassador',
    instructorRoleAr: 'قائدة مسار الذكاء الاصطناعي وسفيرة مايكروسوفت للطلبة',
    duration: '2 Sessions (6 Hours Total)',
    sessionsCount: 2,
    capacity: 75,
    registeredCount: 75,
    certificateEligible: true,
    prerequisites: 'Python proficiency & basic knowledge of LLM prompts',
    prerequisitesAr: 'إجادة لغة Python ومبادئ التعامل مع النماذج اللغوية',
    schedule: [
      { sessionNumber: 1, title: 'Vector Stores, Embeddings & Chunking', titleAr: 'قواعد البيانات الشعاعية والتضمينات الذكية', date: '2026-12-04', time: '18:00 - 21:00' },
      { sessionNumber: 2, title: 'Agentic Workflows & Tool Calling', titleAr: 'الوكلاء الأذكياء واستدعاء الأدوات الخارجية', date: '2026-12-06', time: '18:00 - 21:00' },
    ],
  },
];

// Seed Achievements
const SEED_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach-1',
    year: '2026',
    title: '1st Place — Microsoft Imagine Cup National Championship',
    titleAr: 'المركز الأول — التصفيات الوطنية لبطولة Microsoft Imagine Cup 2026',
    description: 'Innovation University Microsoft Student Club team won 1st place nationwide for developing an AI-driven agricultural sustainability monitor on Azure.',
    descriptionAr: 'حصد فريق نادي مايكروسوفت بجامعة الابتكار المركز الأول على مستوى الجمهورية بفضل ابتكار نظام استدامة بيئية ذكي مدعوم بحوسبة Azure.',
    category: 'HACKATHON',
    rankOrBadge: '🏆 Gold Champion',
  },
  {
    id: 'ach-2',
    year: '2025',
    title: 'Best Technical Architecture — Cairo Inter-Varsity Hackathon',
    titleAr: 'جائزة أفضل بنية برمجية — هاكاثون الجامعات المصرية للتقنية',
    description: 'Recognized for designing a zero-downtime real-time medical triage dispatch system with distributed database failover.',
    descriptionAr: 'تكريم الفريق الجامعي لأفضل بنية معمارية سحابية لتطبيق إدارة الطوارئ الطبية عالي التوافر.',
    category: 'AWARD',
    rankOrBadge: '🎖️ Best Architecture',
  },
  {
    id: 'ach-3',
    year: '2025',
    title: 'Gold Tier Microsoft Learn Student Ambassadors Recognition',
    titleAr: 'درع التميز الذهبي من مجتمع سفراء مايكروسوفت للطلبة',
    description: 'Innovation University chapter elevated to Gold Tier for mentoring 1,200+ students and organizing 40+ accredited workshops.',
    descriptionAr: 'ترقية فرع جامعة الابتكار للمستوى الذهبي بعد تدريب أكثر من 1200 طالب وتنظيم أكثر من 40 ورشة معتمدة.',
    category: 'PARTNERSHIP',
    rankOrBadge: '🌟 Gold Tier Chapter',
  },
];

// Seed Resources
const SEED_RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'Azure Fundamentals (AZ-900) Complete Revision Guide',
    titleAr: 'دليل المراجعة الشامل لاختبار مايكروسوفت AZ-900',
    description: 'Comprehensive 85-page official cheat sheet covering all cloud concepts, security, compliance, and core services.',
    descriptionAr: 'دليل ملخص في 85 صفحة يغطي مفاهيم السحابة الأساسية، الأمان، والامتثال ومراكز بيانات مايكروسوفت.',
    category: 'AZURE',
    fileType: 'PDF',
    fileSize: '4.8 MB',
    downloadUrl: '#',
    downloadsCount: 1420,
  },
  {
    id: 'res-2',
    title: 'Production React 19 & Next.js Architecture Starter Kit',
    titleAr: 'قالب البنية الهندسية المتكاملة لـ React 19 و Next.js',
    description: 'Clean starter boilerplate with strict TypeScript, Tailwind v4, safe DAL, Nonce CSP, and test suite.',
    descriptionAr: 'قالب برمجي احترافي جاهز للإنتاج يتضمن ضبط الأمان، CSP، وطبقة البيانات الآمنة DAL واختبارات الجودة.',
    category: 'WEB',
    fileType: 'ZIP',
    fileSize: '12.4 MB',
    downloadUrl: '#',
    downloadsCount: 890,
  },
  {
    id: 'res-3',
    title: 'Zero Trust Security & Microsoft Entra ID Implementation Checklist',
    titleAr: 'قائمة التحقق العملية لتطبيق نموذج انعدام الثقة Zero Trust',
    description: 'Security engineers checklist for identity verification, least privilege access, and conditional access policies.',
    descriptionAr: 'قائمة تدقيق هندسية متخصصة لتطبيق حوكمة الهويات والمصادقة متعددة العوامل وصلاحيات الوصول الأدنى.',
    category: 'SECURITY',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    downloadUrl: '#',
    downloadsCount: 610,
  },
];

// Seed Articles
const SEED_ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    slug: 'building-campus-ai-rag',
    title: 'How We Built a Production Campus Intelligence Agent with Azure OpenAI',
    titleAr: 'كيف قمنا ببناء وكيل الذكاء الاصطناعي الأكاديمي لجامعة الابتكار',
    summary: 'A technical engineering retrospective on implementing vector indexing, chunking trade-offs, and token cost optimization.',
    summaryAr: 'مقال هندسي تفصيلي يستعرض تحديات تقطيع البيانات، البحث الشعاعي الهجين، وتخفيض تكلفة استهلاك النماذج اللغوية.',
    content: 'Full technical breakdown of building enterprise RAG on Microsoft Azure for higher education...',
    contentAr: 'تقرير تقني متكامل حول كيفية بناء وتأمين نظم الذكاء الاصطناعي بالجامعات...',
    coverImage: '/src/assets/images/msc_track_ai_cloud_1794505304144.jpg',
    author: 'Ahmad El-Sayed & Mariam Al-Ghamdi',
    authorRole: 'Tech Leads, Microsoft Student Clubs',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'Artificial Intelligence',
    publishedAt: '2026-11-08',
    readTimeMinutes: 6,
  },
  {
    id: 'art-2',
    slug: 'why-zero-trust-matters',
    title: 'Why Perimeter Security is Obsolete: The Zero-Trust Paradigm',
    titleAr: 'لماذا انتهى عصر أمان المحيط التقليدي؟ فلسفة انعدام الثقة Zero Trust',
    summary: 'Understanding modern identity attack vectors and how Microsoft Entra ID enforces dynamic security perimeters.',
    summaryAr: 'استعراض أحدث أساليب الهجمات السيبرانية على الهويات وكيفية تأمين المنظومات السحابية بحواجز ذكية.',
    content: 'An analysis of modern enterprise security architectures...',
    contentAr: 'دراسة تحليلية لأحدث معماريات الحماية المؤسسية...',
    coverImage: '/src/assets/images/msc_track_dev_cyber_1794505303748.jpg',
    author: 'Sarah Ibrahim',
    authorRole: 'Cybersecurity Chapter Lead',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    category: 'Cybersecurity',
    publishedAt: '2026-10-24',
    readTimeMinutes: 5,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('msc_lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const saved = localStorage.getItem('msc_role');
    return (saved === 'STUDENT' || saved === 'TEAM_LEAD' || saved === 'ADMIN') ? (saved as Role) : 'STUDENT';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('msc_users');
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('msc_courses');
    return saved ? JSON.parse(saved) : SEED_COURSES;
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem('msc_enrollments');
    return saved ? JSON.parse(saved) : SEED_ENROLLMENTS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('msc_assignments');
    return saved ? JSON.parse(saved) : SEED_ASSIGNMENTS;
  });

  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>(() => {
    const saved = localStorage.getItem('msc_task_assignments');
    return saved ? JSON.parse(saved) : SEED_TASK_ASSIGNMENTS;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('msc_events');
    return saved ? JSON.parse(saved) : SEED_EVENTS;
  });

  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(() => {
    const saved = localStorage.getItem('msc_event_registrations');
    return saved ? JSON.parse(saved) : SEED_REGISTRATIONS;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('msc_certificates');
    return saved ? JSON.parse(saved) : SEED_CERTIFICATES;
  });

  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>(() => {
    const saved = localStorage.getItem('msc_xp_ledger');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('msc_notifications');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [memberApplications, setMemberApplications] = useState<MemberApplication[]>(() => {
    const saved = localStorage.getItem('msc_member_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem('msc_contact_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('msc_projects');
    return saved ? JSON.parse(saved) : SEED_PROJECTS;
  });

  const [workshops, setWorkshops] = useState<WorkshopItem[]>(() => {
    const saved = localStorage.getItem('msc_workshops');
    return saved ? JSON.parse(saved) : SEED_WORKSHOPS;
  });

  const [achievements, setAchievements] = useState<AchievementItem[]>(() => {
    const saved = localStorage.getItem('msc_achievements');
    return saved ? JSON.parse(saved) : SEED_ACHIEVEMENTS;
  });

  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const saved = localStorage.getItem('msc_resources');
    return saved ? JSON.parse(saved) : SEED_RESOURCES;
  });

  const [articles, setArticles] = useState<ArticleItem[]>(() => {
    const saved = localStorage.getItem('msc_articles');
    return saved ? JSON.parse(saved) : SEED_ARTICLES;
  });

  const [celebrationData, setCelebrationData] = useState<{
    show: boolean;
    title: string;
    subtitle: string;
    xp: number;
  } | null>(null);

  // Sync language with document attributes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('msc_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('msc_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const toggleTheme = () => setTheme((p) => (p === 'dark' ? 'light' : 'dark'));
  useEffect(() => {
    localStorage.setItem('msc_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('msc_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('msc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('msc_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('msc_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem('msc_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('msc_task_assignments', JSON.stringify(taskAssignments));
  }, [taskAssignments]);

  useEffect(() => {
    localStorage.setItem('msc_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('msc_event_registrations', JSON.stringify(eventRegistrations));
  }, [eventRegistrations]);

  useEffect(() => {
    localStorage.setItem('msc_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('msc_xp_ledger', JSON.stringify(xpTransactions));
  }, [xpTransactions]);

  useEffect(() => {
    localStorage.setItem('msc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('msc_member_applications', JSON.stringify(memberApplications));
  }, [memberApplications]);

  useEffect(() => {
    localStorage.setItem('msc_contact_messages', JSON.stringify(contactMessages));
  }, [contactMessages]);

  // Active current user matching the current role
  const currentUser = users.find((u) => u.role === currentRole) || users[0];

  const t = translations[language];

  // Helper to trigger confetti celebration
  const triggerCelebration = (title: string, xpAmount: number) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0078D4', '#1B6AC4', '#599FE4', '#F59E0B'],
    });

    setCelebrationData({
      show: true,
      title: language === 'ar' ? 'إنجاز جديد وترقية مستحقة!' : 'New Milestone & XP Unlocked!',
      subtitle: title,
      xp: xpAmount,
    });
  };

  const dismissCelebration = () => setCelebrationData(null);

  // Award XP with transactional append to ledger and level calculation
  const awardXp = (
    userId: string,
    amount: number,
    reason: string,
    reasonAr: string,
    category: 'LEARNING' | 'TASKS' | 'ATTENDANCE' | 'BONUS'
  ) => {
    const idempotencyKey = `xp:${Date.now()}:${Math.random().toString(36).substring(7)}`;

    setXpTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        userId,
        amount,
        reason,
        reasonAr,
        category,
        createdAt: new Date().toISOString(),
        idempotencyKey,
      },
      ...prev,
    ]);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newXp = u.xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;
        const leveledUp = newLevel > u.level;

        if (leveledUp && u.id === currentUser.id) {
          triggerCelebration(
            language === 'ar'
              ? `تهانينا! لقد وصلت إلى المستوى ${newLevel} برصيد ${newXp} نقطة`
              : `Congratulations! You leveled up to Level ${newLevel} with ${newXp} XP`,
            amount
          );
        }

        return {
          ...u,
          xp: newXp,
          level: newLevel,
        };
      })
    );
  };

  // Learning Hub Functions
  const enrollInCourse = (courseId: string): boolean => {
    const existing = enrollments.find((e) => e.userId === currentUser.id && e.courseId === courseId);
    if (existing) return true;

    // Check prerequisites
    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;

    if (course.prerequisites && course.prerequisites.length > 0) {
      const userCompletedCourses = enrollments
        .filter((e) => e.userId === currentUser.id && e.completedAt)
        .map((e) => e.courseId);

      const missing = course.prerequisites.filter((p) => !userCompletedCourses.includes(p));
      if (missing.length > 0) {
        return false;
      }
    }

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      userId: currentUser.id,
      courseId,
      progressPercent: 0,
      completedLessonIds: [],
      enrolledAt: new Date().toISOString().split('T')[0],
      heartbeats: {},
      lastLessonId: course.modules[0]?.lessons[0]?.id,
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c))
    );
    return true;
  };

  const recordLessonHeartbeat = (courseId: string, lessonId: string, secondsWatched: number) => {
    setEnrollments((prev) =>
      prev.map((enr) => {
        if (enr.userId === currentUser.id && enr.courseId === courseId) {
          const currentSeconds = enr.heartbeats[lessonId] || 0;
          return {
            ...enr,
            lastLessonId: lessonId,
            heartbeats: {
              ...enr.heartbeats,
              [lessonId]: Math.max(currentSeconds, secondsWatched),
            },
          };
        }
        return enr;
      })
    );
  };

  const completeLesson = (
    courseId: string,
    lessonId: string
  ): { success: boolean; code: string; xpAwarded?: number } => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { success: false, code: 'COURSE_NOT_FOUND' };

    const enrollment = enrollments.find(
      (e) => e.userId === currentUser.id && e.courseId === courseId
    );
    if (!enrollment) return { success: false, code: 'NOT_ENROLLED' };

    // Find lesson to check required time
    let targetLesson: any = null;
    let totalLessonsCount = 0;
    for (const m of course.modules) {
      for (const l of m.lessons) {
        totalLessonsCount++;
        if (l.id === lessonId) targetLesson = l;
      }
    }

    if (!targetLesson) return { success: false, code: 'LESSON_NOT_FOUND' };

    const watchedSeconds = enrollment.heartbeats[lessonId] || 0;
    const requiredSeconds = targetLesson.requiredMinutes * 60;

    // Strict time validation check
    if (watchedSeconds < requiredSeconds * 0.8 && !enrollment.completedLessonIds.includes(lessonId)) {
      return { success: false, code: 'NOT_ENOUGH_TIME' };
    }

    const alreadyCompleted = enrollment.completedLessonIds.includes(lessonId);
    const updatedCompletedIds = alreadyCompleted
      ? enrollment.completedLessonIds
      : [...enrollment.completedLessonIds, lessonId];

    const newProgressPercent = Math.min(
      100,
      Math.round((updatedCompletedIds.length / totalLessonsCount) * 100)
    );

    const isCourseJustCompleted =
      newProgressPercent >= course.completionThreshold && !enrollment.completedAt;

    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === enrollment.id) {
          return {
            ...e,
            completedLessonIds: updatedCompletedIds,
            progressPercent: newProgressPercent,
            completedAt: isCourseJustCompleted ? new Date().toISOString() : e.completedAt,
          };
        }
        return e;
      })
    );

    if (isCourseJustCompleted) {
      // Award Course XP
      awardXp(
        currentUser.id,
        course.xpReward,
        `Completed course: ${course.title}`,
        `إتمام الدورة بنجاح: ${course.titleAr}`,
        'LEARNING'
      );

      // Issue Certificate if enabled
      if (course.certificateEnabled) {
        issueCertificate(
          currentUser.id,
          course.title,
          course.titleAr,
          'COURSE',
          course.id
        );
      }

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, completedCount: c.completedCount + 1 } : c
        )
      );

      return { success: true, code: 'COURSE_COMPLETED', xpAwarded: course.xpReward };
    }

    return { success: true, code: 'LESSON_COMPLETED' };
  };

  const reorderLessons = (
    courseId: string,
    moduleId: string,
    lessonId: string,
    direction: 'up' | 'down'
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const newModules = c.modules.map((m) => {
          if (m.id !== moduleId) return m;
          const idx = m.lessons.findIndex((l) => l.id === lessonId);
          if (idx === -1) return m;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= m.lessons.length) return m;

          const updatedLessons = [...m.lessons];
          const temp = updatedLessons[idx];
          updatedLessons[idx] = updatedLessons[targetIdx];
          updatedLessons[targetIdx] = temp;

          // update order fields
          updatedLessons.forEach((l, i) => (l.order = i + 1));
          return { ...m, lessons: updatedLessons };
        });
        return { ...c, modules: newModules };
      })
    );
  };

  const toggleCoursePublish = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          // validate course has at least 1 lesson before publishing
          const totalLessons = c.modules.reduce((sum, m) => sum + m.lessons.length, 0);
          if (!c.published && totalLessons === 0) {
            return c;
          }
          return { ...c, published: !c.published };
        }
        return c;
      })
    );
  };

  const addCourse = (courseData: Partial<Course>) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      slug: courseData.slug || `course-${Date.now()}`,
      trackSlug: courseData.trackSlug || 'azure-cloud-devops',
      title: courseData.title || 'New Course',
      titleAr: courseData.titleAr || 'دورة تدريبية جديدة',
      summary: courseData.summary || '',
      summaryAr: courseData.summaryAr || '',
      description: courseData.description || '',
      descriptionAr: courseData.descriptionAr || '',
      thumbnail: courseData.thumbnail || '/src/assets/images/msc_track_ai_cloud_1794505304144.jpg',
      difficulty: courseData.difficulty || 'BEGINNER',
      durationHours: courseData.durationHours || 8,
      xpReward: courseData.xpReward || 300,
      completionThreshold: 80,
      sequential: true,
      certificateEnabled: true,
      published: false,
      prerequisites: courseData.prerequisites || [],
      modules: courseData.modules || [],
      enrolledCount: 0,
      completedCount: 0,
    };

    setCourses((prev) => [newCourse, ...prev]);
  };

  // Task Submissions & Review Engine
  const submitTask = (
    taskAssignmentId: string,
    notes: string,
    githubUrl?: string
  ): boolean => {
    setTaskAssignments((prev) =>
      prev.map((ta) => {
        if (ta.id !== taskAssignmentId) return ta;
        const newAttemptNumber = ta.attempts + 1;
        const newSubmission: any = {
          id: `sub-${Date.now()}`,
          taskAssignmentId,
          attemptNumber: newAttemptNumber,
          submittedAt: new Date().toISOString(),
          notes,
          githubUrl,
          status: 'SUBMITTED',
        };

        return {
          ...ta,
          status: 'UNDER_REVIEW',
          attempts: newAttemptNumber,
          updatedAt: new Date().toISOString(),
          submissions: [newSubmission, ...ta.submissions],
        };
      })
    );

    // Notify reviewer / team leads
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: 'user-mariam',
        type: 'TASK_ASSIGNED',
        title: 'New Task Submission to Review',
        titleAr: 'تسليم جديد لمهمة بانتظار المراجعة والتقييم',
        message: `${currentUser.name} submitted solution for review.`,
        messageAr: `قام ${currentUser.nameAr} بتسليم حل المهمة للمراجعة.`,
        read: false,
        link: '/admin/tasks',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return true;
  };

  const reviewTask = (
    taskAssignmentId: string,
    status: 'APPROVED' | 'REJECTED',
    feedback: string
  ): boolean => {
    const targetTA = taskAssignments.find((ta) => ta.id === taskAssignmentId);
    if (!targetTA) return false;

    const task = assignments.find((a) => a.id === targetTA.taskId);
    if (!task) return false;

    const shouldAwardXp = status === 'APPROVED' && !targetTA.xpAwarded;

    setTaskAssignments((prev) =>
      prev.map((ta) => {
        if (ta.id !== taskAssignmentId) return ta;
        const updatedSubmissions = ta.submissions.map((sub, i) => {
          if (i === 0) {
            return {
              ...sub,
              status,
              reviewerFeedback: feedback,
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString(),
            };
          }
          return sub;
        });

        return {
          ...ta,
          status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
          xpAwarded: shouldAwardXp ? true : ta.xpAwarded,
          updatedAt: new Date().toISOString(),
          submissions: updatedSubmissions,
        };
      })
    );

    if (shouldAwardXp) {
      awardXp(
        targetTA.userId,
        task.xpReward,
        `Task Approved: ${task.title}`,
        `اعتماد مهمة: ${task.titleAr}`,
        'TASKS'
      );
    }

    // Notify member of feedback
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: targetTA.userId,
        type: 'TASK_FEEDBACK',
        title: status === 'APPROVED' ? 'Task Approved!' : 'Task Needs Revisions',
        titleAr: status === 'APPROVED' ? 'تم اعتماد المهمة بنجاح!' : 'المهمة تحتاج إلى تعديل',
        message: `${currentUser.name}: ${feedback}`,
        messageAr: `${currentUser.nameAr}: ${feedback}`,
        read: false,
        link: '/dashboard/tasks',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return true;
  };

  const createAssignment = (data: Partial<Assignment>) => {
    const newAssignment: Assignment = {
      id: `task-${Date.now()}`,
      title: data.title || 'New Task',
      titleAr: data.titleAr || 'مهمة جديدة',
      description: data.description || '',
      descriptionAr: data.descriptionAr || '',
      teamId: data.teamId,
      difficulty: data.difficulty || 'MEDIUM',
      xpReward: data.xpReward || 200,
      deadline: data.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
      resources: data.resources || [],
      maxAttempts: data.maxAttempts || 3,
      status: 'OPEN',
      createdById: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // Automatically create TaskAssignment for Ahmad
    setTaskAssignments((prev) => [
      {
        id: `ta-ahmad-${newAssignment.id}`,
        taskId: newAssignment.id,
        userId: 'user-ahmad',
        status: 'NOT_STARTED',
        attempts: 0,
        submissions: [],
        xpAwarded: false,
        assignedAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);
  };

  // Event Registration & Scanner Engine
  const registerForEvent = (
    eventId: string
  ): { success: boolean; status: 'CONFIRMED' | 'WAITLISTED'; message: string } => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, status: 'WAITLISTED', message: 'Event not found' };

    const existing = eventRegistrations.find(
      (r) => r.eventId === eventId && r.userId === currentUser.id
    );
    if (existing) {
      return {
        success: true,
        status: existing.status as any,
        message: language === 'ar' ? 'أنت مسجل بالفعل في هذه الفعالية' : 'Already registered',
      };
    }

    const isFull = event.registeredCount >= event.capacity;
    const assignedStatus: any = isFull ? 'WAITLISTED' : 'CONFIRMED';
    const passToken = `HMAC_MSC_${event.category}_${Date.now()}_${currentUser.studentId}`;

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId,
      userId: currentUser.id,
      status: assignedStatus,
      passToken,
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setEventRegistrations((prev) => [newReg, ...prev]);

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            registeredCount: isFull ? e.registeredCount : e.registeredCount + 1,
            waitlistCount: isFull ? e.waitlistCount + 1 : e.waitlistCount,
          };
        }
        return e;
      })
    );

    return {
      success: true,
      status: assignedStatus,
      message: isFull
        ? (language === 'ar' ? 'تمت إضافتك إلى قائمة الانتظار' : 'Added to waitlist')
        : (language === 'ar' ? 'تم تأكيد حجز مقعدك بنجاح!' : 'Seat confirmed successfully!'),
    };
  };

  const checkInAttendee = (
    passToken: string
  ): { success: boolean; message: string; attendeeName?: string } => {
    const reg = eventRegistrations.find((r) => r.passToken === passToken);
    if (!reg) {
      return {
        success: false,
        message: language === 'ar' ? 'رمز التصريح غير صالح' : 'Invalid pass code',
      };
    }

    if (reg.status === 'CHECKED_IN') {
      return {
        success: false,
        message: language === 'ar' ? 'تم تسجيل حضور هذا الرمز مسبقاً' : 'Attendee already checked in',
      };
    }

    const attendee = users.find((u) => u.id === reg.userId);
    const event = events.find((e) => e.id === reg.eventId);

    setEventRegistrations((prev) =>
      prev.map((r) =>
        r.id === reg.id ? { ...r, status: 'CHECKED_IN', checkedInAt: new Date().toISOString() } : r
      )
    );

    // Award Event attendance XP
    if (attendee && event) {
      awardXp(
        attendee.id,
        event.xpReward,
        `Attendance Verified: ${event.title}`,
        `تأكيد حضور فعالية: ${event.titleAr}`,
        'ATTENDANCE'
      );
    }

    return {
      success: true,
      message: language === 'ar' ? 'تم تأكيد الحضور ومنح النقاط بنجاح!' : 'Check-in verified and XP awarded!',
      attendeeName: language === 'ar' ? attendee?.nameAr : attendee?.name,
    };
  };

  // Certificate Verification & Issuance Engine
  const verifyCertificate = (
    code: string
  ): { found: boolean; certificate?: Certificate; template?: CertificateTemplate } => {
    const cert = certificates.find((c) => c.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!cert) return { found: false };

    const template = SEED_TEMPLATES.find((t) => t.id === cert.templateId) || SEED_TEMPLATES[0];
    return { found: true, certificate: cert, template };
  };

  const issueCertificate = (
    recipientId: string,
    title: string,
    titleAr: string,
    type: 'COURSE' | 'EVENT' | 'HONORARY',
    refId: string
  ): Certificate => {
    const recipient = users.find((u) => u.id === recipientId) || currentUser;
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const code = `MSC-IU-${year}-${randomDigits}`;

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      code,
      recipientId,
      recipientName: recipient.name,
      recipientNameAr: recipient.nameAr,
      recipientStudentId: recipient.studentId,
      title,
      titleAr,
      type,
      referenceId: refId,
      issuer: 'Microsoft Student Clubs - Innovation University',
      issuedAt: new Date().toISOString().split('T')[0],
      valid: true,
      templateId: 'tmpl-official',
      accentColor: '#1B6AC4',
    };

    setCertificates((prev) => [newCert, ...prev]);

    // Send notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: recipientId,
        type: 'CERTIFICATE_ISSUED',
        title: 'New Verified Certificate Issued!',
        titleAr: 'تم إصدار شهادة معتمدة جديدة لك!',
        message: `Official certificate issued for "${title}". Code: ${code}`,
        messageAr: `تم إصدار شهادة إنجاز رسمية موثقة برمز: ${code}`,
        read: false,
        link: '/dashboard/certificates',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newCert;
  };

  const revokeCertificate = (code: string, reason: string): boolean => {
    let found = false;
    setCertificates((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          found = true;
          return {
            ...c,
            valid: false,
            revocationReason: reason,
          };
        }
        return c;
      })
    );
    return found;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  const updateUserPreferences = (prefs: {
    notifyEmail?: boolean;
    notifyApp?: boolean;
    profileVisibility?: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
    leaderboardVisible?: boolean;
  }) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...prefs } : u))
    );
  };

  const submitApplication = (
    appData: Omit<MemberApplication, 'id' | 'status' | 'submittedAt' | 'applicationCode'>
  ): string => {
    const code = `MSC-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApp: MemberApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      applicationCode: code,
    };

    setMemberApplications((prev) => [newApp, ...prev]);
    return code;
  };

  const submitContactMessage = (
    msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
  ): boolean => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'UNREAD',
      createdAt: new Date().toISOString(),
    };
    setContactMessages((prev) => [newMsg, ...prev]);
    return true;
  };

  const submitProject = (p: Omit<Project, 'id' | 'status' | 'submittedBy'>) => {
    const newProj: Project = {
      ...p,
      id: `proj-${Date.now()}`,
      status: 'PUBLISHED',
      submittedBy: currentUser.id,
    };
    setProjects((prev) => [newProj, ...prev]);
    awardXp(
      currentUser.id,
      300,
      `Project Published: ${p.title}`,
      `نشر مشروع تطبيقي: ${p.titleAr}`,
      'BONUS'
    );
  };

  const registerForWorkshop = (workshopId: string): { success: boolean; message: string } => {
    const ws = workshops.find((w) => w.id === workshopId);
    if (!ws) return { success: false, message: 'Workshop not found' };

    if (ws.registeredCount >= ws.capacity) {
      return {
        success: false,
        message: language === 'ar' ? 'اكتملت المقاعد المتاحة لهذه الورشة' : 'Workshop reached full capacity',
      };
    }

    setWorkshops((prev) =>
      prev.map((w) => (w.id === workshopId ? { ...w, registeredCount: w.registeredCount + 1 } : w))
    );

    return {
      success: true,
      message: language === 'ar' ? 'تم تأكيد تسجيلك في الورشة التطبيقية بنجاح!' : 'Successfully registered for workshop!',
    };
  };

  const downloadResource = (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, downloadsCount: r.downloadsCount + 1 } : r))
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
        currentRole,
        setCurrentRole,
        currentUser,
        users,
        teams: SEED_TEAMS,
        tracks: SEED_TRACKS,
        courses,
        enrollments,
        assignments,
        taskAssignments,
        events,
        eventRegistrations,
        certificates,
        certificateTemplates: SEED_TEMPLATES,
        badges: SEED_BADGES,
        xpTransactions,
        notifications,
        memberApplications,
        contactMessages,
        testimonials: SEED_TESTIMONIALS,
        projects,
        workshops,
        achievements,
        resources,
        articles,
        submitProject,
        registerForWorkshop,
        downloadResource,
        enrollInCourse,
        recordLessonHeartbeat,
        completeLesson,
        reorderLessons,
        toggleCoursePublish,
        addCourse,
        submitTask,
        reviewTask,
        createAssignment,
        registerForEvent,
        checkInAttendee,
        verifyCertificate,
        issueCertificate,
        revokeCertificate,
        awardXp,
        celebrationData,
        dismissCelebration,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserPreferences,
        submitApplication,
        submitContactMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
