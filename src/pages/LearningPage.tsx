import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Course, Lesson, Track } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Play,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface LearningPageProps {
  initialTrackSlug?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const LearningPage: React.FC<LearningPageProps> = ({
  initialTrackSlug,
  onNavigate,
}) => {
  const {
    language,
    t,
    tracks,
    courses,
    enrollments,
    enrollInCourse,
    currentUser,
  } = useApp();

  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>(
    initialTrackSlug || 'all'
  );
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [prereqError, setPrereqError] = useState<string | null>(null);

  const filteredCourses = courses.filter((c) => {
    if (!c.published) return false;
    if (selectedTrackSlug === 'all') return true;
    return c.trackSlug === selectedTrackSlug;
  });

  const activeCourse = courses.find((c) => c.id === activeCourseId);
  const activeEnrollment = enrollments.find(
    (e) => e.userId === currentUser.id && e.courseId === activeCourseId
  );

  // Flatten lessons for sequencing
  const allLessons: Lesson[] = activeCourse
    ? activeCourse.modules.flatMap((m) => m.lessons)
    : [];

  const currentLesson =
    allLessons.find((l) => l.id === activeLessonId) || allLessons[0];

  const currentLessonIndex = allLessons.findIndex(
    (l) => l.id === currentLesson?.id
  );
  const hasNext = currentLessonIndex < allLessons.length - 1;
  const hasPrev = currentLessonIndex > 0;

  const handleEnroll = (courseId: string) => {
    setPrereqError(null);
    const success = enrollInCourse(courseId);
    if (!success) {
      const course = courses.find((c) => c.id === courseId);
      const prereqCourses = courses
        .filter((c) => course?.prerequisites.includes(c.id))
        .map((c) => (language === 'ar' ? c.titleAr : c.title))
        .join(', ');
      setPrereqError(`${t.learning.prerequisitesMissing} ${prereqCourses}`);
    }
  };

  // If viewing a specific course detail & lesson player
  if (activeCourse) {
    const isEnrolled = !!activeEnrollment;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => {
              setActiveCourseId(null);
              setActiveLessonId(null);
            }}
            className="hover:text-blue-700 transition-colors"
          >
            {t.learning.courses}
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900">
            {language === 'ar' ? activeCourse.titleAr : activeCourse.title}
          </span>
        </div>

        {/* Course Header Banner */}
        <div className="fluent-card rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <span className="uppercase">{activeCourse.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {activeCourse.durationHours} {t.common.hours}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 font-bold">
                +{activeCourse.xpReward} XP
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'ar' ? activeCourse.titleAr : activeCourse.title}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'ar'
                ? activeCourse.descriptionAr
                : activeCourse.description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2 w-full md:w-auto">
            {isEnrolled ? (
              <div className="text-start md:text-end w-full">
                <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between md:justify-end gap-2">
                  <span>{t.learning.progress}:</span>
                  <span className="font-mono font-bold text-blue-800">
                    {activeEnrollment.progressPercent}%
                  </span>
                </div>
                <div className="w-full md:w-48 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${activeEnrollment.progressPercent}%` }}
                  />
                </div>
                {activeEnrollment.completedAt && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.learning.completed}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 w-full md:w-auto">
                <button
                  onClick={() => handleEnroll(activeCourse.id)}
                  className="w-full md:w-auto px-6 py-2.5 text-xs font-bold text-white bg-[#0078D4] hover:bg-[#0078d4] rounded-lg transition-colors shadow-xs"
                >
                  {t.learning.enrollNow}
                </button>
                {prereqError && (
                  <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded flex items-center gap-1.5 max-w-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{prereqError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Grid: Player on Left, Modules Curriculum on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Stage: Player (if enrolled and lesson selected) */}
          <div className="lg:col-span-8">
            {isEnrolled && currentLesson ? (
              <VideoPlayer
                course={activeCourse}
                lesson={currentLesson}
                onNextLesson={() => {
                  if (hasNext) setActiveLessonId(allLessons[currentLessonIndex + 1].id);
                }}
                onPrevLesson={() => {
                  if (hasPrev) setActiveLessonId(allLessons[currentLessonIndex - 1].id);
                }}
                hasNext={hasNext}
                hasPrev={hasPrev}
              />
            ) : (
              <div className="fluent-card rounded-2xl p-10 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-700 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'ar' ? 'سجل في الدورة لبدء مشاهدة الدروس' : 'Enroll in course to unlock lectures'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {language === 'ar'
                    ? 'هذه الدورة معتمدة من نادي مايكروسوفت بجامعة الابتكار. سجل مجاناً لتتبع تقدمك، وأداء المهام، والحصول على شهادة معتمدة.'
                    : 'This course is accredited by MSC Innovation University. Enroll for free to access lectures, track progress, and earn credentials.'}
                </p>
                {!isEnrolled && (
                  <button
                    onClick={() => handleEnroll(activeCourse.id)}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#0078D4] hover:bg-[#0078d4] rounded-lg transition-colors shadow-xs"
                  >
                    {t.learning.enrollNow}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Modules & Lessons Outline */}
          <div className="lg:col-span-4 fluent-card rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>{t.learning.curriculum}</span>
            </h3>

            <div className="space-y-4">
              {activeCourse.modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    {language === 'ar' ? module.titleAr : module.title}
                  </div>

                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isCompleted =
                        activeEnrollment?.completedLessonIds.includes(
                          lesson.id
                        ) || false;
                      const isSelected = currentLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          disabled={!isEnrolled}
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full text-start p-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : isEnrolled ? (
                              <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className="line-clamp-1">
                              {language === 'ar'
                                ? lesson.titleAr
                                : lesson.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {lesson.durationMinutes}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Catalog View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          {t.learning.courseCatalog}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.learning.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          {t.learning.subtitle}
        </p>
      </div>

      {/* Track Filter Tabs (Functional segmented buttons) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setSelectedTrackSlug('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            selectedTrackSlug === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.common.all}
        </button>
        {tracks.map((track) => (
          <button
            key={track.slug}
            onClick={() => setSelectedTrackSlug(track.slug)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              selectedTrackSlug === track.slug
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? track.titleAr : track.title}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const enrollment = enrollments.find(
            (e) => e.userId === currentUser.id && e.courseId === course.id
          );
          const isEnrolled = !!enrollment;

          return (
            <div
              key={course.id}
              className="fluent-card rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 start-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {course.difficulty}
                </div>
                {isEnrolled && (
                  <div className="absolute bottom-3 end-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t.learning.enrolled}</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono tabular-nums">
                      {course.durationHours} {t.common.hours}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-600 font-bold font-mono">
                      +{course.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {language === 'ar' ? course.titleAr : course.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {language === 'ar' ? course.summaryAr : course.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {course.enrolledCount} {language === 'ar' ? 'طالب مسجل' : 'students'}
                  </div>

                  <button
                    onClick={() => {
                      setActiveCourseId(course.id);
                      setActiveLessonId(course.modules[0]?.lessons[0]?.id || null);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors"
                  >
                    <span>{isEnrolled ? t.learning.resumeLesson : t.common.details}</span>
                    <Arrow className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
