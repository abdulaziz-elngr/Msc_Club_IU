import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Bell,
  Settings,
  ArrowRight,
  ArrowLeft,
  User,
  Shield,
  Layers,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    language,
    t,
    currentUser,
    enrollments,
    courses,
    taskAssignments,
    assignments,
    certificates,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    updateUserPreferences,
  } = useApp();

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const [activeSection, setActiveSection] = useState<'overview' | 'learning' | 'tasks' | 'settings'>('overview');

  const myEnrollments = enrollments.filter((e) => e.userId === currentUser.id);
  const myTasks = taskAssignments.filter((ta) => ta.userId === currentUser.id);
  const myCertificates = certificates.filter(
    (c) => c.recipientId === currentUser.id && c.valid
  );

  const nextLevelXp = currentUser.level * 500;
  const currentLevelBaseXp = (currentUser.level - 1) * 500;
  const levelProgress = Math.min(
    100,
    Math.round(((currentUser.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Profile Card Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                {language === 'ar' ? currentUser.nameAr : currentUser.name}
              </h1>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {currentUser.role}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {currentUser.studentId} · {language === 'ar' ? currentUser.facultyAr : currentUser.faculty}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {currentUser.email}
            </div>
          </div>
        </div>

        {/* Level & XP Gauge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full md:w-72 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-blue-800 font-bold">
              {t.common.level} {currentUser.level}
            </span>
            <span className="font-mono text-slate-600">
              {currentUser.xp} / {nextLevelXp} XP
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-[#0078d4] to-[#4cc2ff] h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="text-[10px] text-slate-400 text-end">
            {nextLevelXp - currentUser.xp} {language === 'ar' ? 'نقطة للترقية التالية' : 'XP to next level'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSection('overview')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeSection === 'overview'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'ar' ? 'نظرة عامة' : 'Overview'}
        </button>
        <button
          onClick={() => setActiveSection('learning')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeSection === 'learning'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.learning.enrolledCourses} ({myEnrollments.length})
        </button>
        <button
          onClick={() => setActiveSection('tasks')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeSection === 'tasks'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.tasks.myTasks} ({myTasks.length})
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeSection === 'settings'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'ar' ? 'إعدادات الحساب والخصوصية' : 'Profile Settings'}
        </button>
      </div>

      {/* SECTION 1: OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="fluent-card rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-400 font-semibold">{t.learning.courses}</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {myEnrollments.length}
              </div>
            </div>
            <div className="fluent-card rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-400 font-semibold">{t.tasks.myTasks}</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {myTasks.length}
              </div>
            </div>
            <div className="fluent-card rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-400 font-semibold">{t.certificates.myCertificates}</div>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
                {myCertificates.length}
              </div>
            </div>
            <div className="fluent-card rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-400 font-semibold">{t.common.points}</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {currentUser.xp} XP
              </div>
            </div>
          </div>

          {/* Enrolled Courses Progress Grid */}
          <div className="fluent-card rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {t.learning.enrolledCourses}
              </h3>
              <button
                onClick={() => onNavigate('learning')}
                className="text-xs text-blue-700 font-semibold hover:underline"
              >
                {t.learning.courseCatalog}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEnrollments.map((enr) => {
                const course = courses.find((c) => c.id === enr.courseId);
                if (!course) return null;
                return (
                  <div
                    key={enr.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {language === 'ar' ? course.titleAr : course.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>{t.learning.progress}: {enr.progressPercent}%</span>
                        <span className="font-mono">{course.durationHours}h</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1.5">
                        <div
                          className="bg-blue-600 h-full"
                          style={{ width: `${enr.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => onNavigate('learning')}
                        className="px-3 py-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
                      >
                        {t.learning.resumeLesson}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LEARNING */}
      {activeSection === 'learning' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myEnrollments.map((enr) => {
              const course = courses.find((c) => c.id === enr.courseId);
              if (!course) return null;
              return (
                <div
                  key={enr.id}
                  className="fluent-card rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? course.titleAr : course.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? course.summaryAr : course.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span>{enr.completedLessonIds.length} lessons completed</span>
                    <button
                      onClick={() => onNavigate('learning')}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      {t.learning.resumeLesson} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: TASKS */}
      {activeSection === 'tasks' && (
        <div className="space-y-3">
          {myTasks.map((ta) => {
            const task = assignments.find((a) => a.id === ta.taskId);
            return (
              <div
                key={ta.id}
                className="fluent-card rounded-2xl p-4 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {language === 'ar' ? task?.titleAr : task?.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {task?.difficulty} · Attempts: {ta.attempts}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-600 font-mono">
                    +{task?.xpReward} XP
                  </span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                    {t.tasks.statusLabels[ta.status]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 4: SETTINGS & PRIVACY */}
      {activeSection === 'settings' && (
        <div className="fluent-card rounded-2xl p-6 shadow-xs max-w-xl space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            {language === 'ar' ? 'إعدادات الخصوصية والإشعارات' : 'Privacy & Notification Controls'}
          </h3>

          <div className="space-y-4 text-xs">
            {/* Profile Visibility */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'ظهور الملف الشخصي' : 'Profile Visibility'}
              </label>
              <select
                value={currentUser.profileVisibility}
                onChange={(e: any) =>
                  updateUserPreferences({ profileVisibility: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="PUBLIC">PUBLIC (مرئي للعامة والزوار)</option>
                <option value="MEMBERS_ONLY">MEMBERS ONLY (أعضاء النادي فقط)</option>
                <option value="PRIVATE">PRIVATE (خاص ومخفي)</option>
              </select>
            </div>

            {/* Leaderboard Visibility Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-bold text-slate-800">
                  {language === 'ar' ? 'الظهور في لوحة الشرف (XP)' : 'Show in Leaderboard'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {language === 'ar' ? 'إظهار اسمك ونقاطك لزملائك' : 'Display your name and rank to peers'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentUser.leaderboardVisible}
                onChange={(e) =>
                  updateUserPreferences({ leaderboardVisible: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-bold text-slate-800">{t.notifications.emailNotify}</div>
                <div className="text-[11px] text-slate-500">
                  {language === 'ar' ? 'إرسال تذكيرات الفعاليات والتكليفات' : 'Send event reminders and task updates'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentUser.notifyEmail}
                onChange={(e) =>
                  updateUserPreferences({ notifyEmail: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            {/* In-App Notifications */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-bold text-slate-800">{t.notifications.appNotify}</div>
                <div className="text-[11px] text-slate-500">
                  {language === 'ar' ? 'إشعارات داخل المنصة فورية' : 'Real-time badge and review alerts'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentUser.notifyApp}
                onChange={(e) =>
                  updateUserPreferences({ notifyApp: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
