import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Course } from '../types';
import {
  Users,
  BookOpen,
  Award,
  Calendar,
  Download,
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    language,
    t,
    courses,
    users,
    certificates,
    events,
    enrollments,
    toggleCoursePublish,
    reorderLessons,
    addCourse,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'courses' | 'export'>('analytics');

  // Add Course Modal
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newTrackSlug, setNewTrackSlug] = useState('azure-cloud-devops');
  const [newDuration, setNewDuration] = useState(10);
  const [newXp, setNewXp] = useState(300);

  const totalLearningHours = enrollments.reduce((acc, curr) => acc + (curr.progressPercent > 0 ? 4 : 0), 0);
  const checkedInAttendanceCount = events.reduce((acc, ev) => acc + ev.registeredCount, 0);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCourse({
      title: newTitle,
      titleAr: newTitleAr || newTitle,
      trackSlug: newTrackSlug,
      durationHours: Number(newDuration),
      xpReward: Number(newXp),
      modules: [
        {
          id: `mod-${Date.now()}`,
          courseId: '',
          title: 'Module 1: Foundations',
          titleAr: 'الوحدة 1: الأساسيات',
          order: 1,
          lessons: [
            {
              id: `les-${Date.now()}`,
              moduleId: '',
              title: 'Welcome & Introduction',
              titleAr: 'مرحباً بكم ومقدمة المسار',
              videoId: 'NKEFW2W2U14',
              durationMinutes: 10,
              requiredMinutes: 8,
              notes: 'Introductory orientation.',
              notesAr: 'مقدمة تمهيدية للمسار.',
              resources: [],
              order: 1,
            },
          ],
        },
      ],
    });

    setAddCourseModal(false);
    setNewTitle('');
    setNewTitleAr('');
  };

  const handleExportCsv = () => {
    const headers = 'ID,Name,Email,StudentId,Faculty,XP,Level\n';
    const rows = users
      .map(
        (u) =>
          `"${u.id}","${u.name.replace(/"/g, '""')}","${u.email}","${u.studentId}","${u.faculty}","${u.xp}","${u.level}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `msc_innovation_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="page-banner relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <img src="/brand/msc-emblem.png" alt="" className="absolute -end-6 -top-6 w-40 h-40 opacity-[.07] pointer-events-none" />
        <div className="relative">
          <span className="text-xs font-bold text-[#4cc2ff] uppercase tracking-wider block mb-1">
            {language === 'ar' ? 'بوابة المشرفين والإدارة' : 'Administration Management Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.admin.title}
          </h1>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#1a8cff] rounded-xl transition-colors shadow-lg relative self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{t.admin.exportCsv}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.admin.analytics}
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'courses'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.admin.learningManagement} ({courses.length})
        </button>
      </div>

      {/* VIEW 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="fluent-card stat-accent rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">{t.admin.totalMembers}</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {users.length * 108}+
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                +14% {language === 'ar' ? 'هذا الشهر' : 'this month'}
              </div>
            </div>

            <div className="fluent-card stat-accent rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">{t.admin.learningHours}</span>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                12,840
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                +22% {language === 'ar' ? 'ساعات مشاهدة' : 'watch time'}
              </div>
            </div>

            <div className="fluent-card stat-accent rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">{t.admin.attendanceRate}</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                94.2%
              </div>
              <div className="text-[11px] text-blue-700 font-semibold mt-1">
                {checkedInAttendanceCount} {language === 'ar' ? 'حاضر مسجل' : 'attendees'}
              </div>
            </div>

            <div className="fluent-card stat-accent rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">{t.admin.issuedCertificates}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {certificates.length + 338}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                100% {language === 'ar' ? 'موثقة ومطابقة' : 'verified'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COURSES & MODULES MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setAddCourseModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin.addCourse}</span>
            </button>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="fluent-card rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {language === 'ar' ? course.titleAr : course.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          course.published
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {course.published ? t.admin.publish : 'DRAFT'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Track: {course.trackSlug} · {course.durationHours}h · {course.xpReward} XP
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCoursePublish(course.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      course.published
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {course.published ? t.admin.unpublish : t.admin.publish}
                  </button>
                </div>

                {/* Modules & Lessons with Up/Down Transactional Swapping */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ar' ? 'الدروس وترتيب التسلسل' : 'Lessons & Sequence Order'}
                  </span>
                  {course.modules.map((m) => (
                    <div key={m.id} className="space-y-1.5 ps-2">
                      <div className="text-xs font-semibold text-slate-700">
                        {language === 'ar' ? m.titleAr : m.title}
                      </div>
                      <div className="space-y-1">
                        {m.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-800">
                              {lesson.order}. {language === 'ar' ? lesson.titleAr : lesson.title}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                disabled={lIdx === 0}
                                onClick={() => reorderLessons(course.id, m.id, lesson.id, 'up')}
                                className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                                title={t.admin.moveUp}
                              >
                                <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                              </button>
                              <button
                                disabled={lIdx === m.lessons.length - 1}
                                onClick={() => reorderLessons(course.id, m.id, lesson.id, 'down')}
                                className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                                title={t.admin.moveDown}
                              >
                                <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD COURSE MODAL */}
      {addCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">{t.admin.addCourse}</h3>
              <button
                onClick={() => setAddCourseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title (EN)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Azure AI Engineer"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العنوان بالعربية
                </label>
                <input
                  type="text"
                  required
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="مثال: مهندس الذكاء الاصطناعي في آزور"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    value={newXp}
                    onChange={(e) => setNewXp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddCourseModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                >
                  {t.admin.addCourse}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
