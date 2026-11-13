import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lesson, Course } from '../types';
import { Play, CheckCircle2, Clock, AlertCircle, FileText, ExternalLink, Lock } from 'lucide-react';

interface VideoPlayerProps {
  course: Course;
  lesson: Lesson;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  course,
  lesson,
  onNextLesson,
  onPrevLesson,
  hasNext,
  hasPrev,
}) => {
  const { language, t, enrollments, recordLessonHeartbeat, completeLesson, currentUser } = useApp();

  const enrollment = enrollments.find(
    (e) => e.userId === currentUser.id && e.courseId === course.id
  );

  const isCompleted = enrollment?.completedLessonIds.includes(lesson.id) || false;
  const watchedSeconds = enrollment?.heartbeats[lesson.id] || 0;
  const requiredSeconds = lesson.requiredMinutes * 60;

  // Local simulated playback tracker
  const [isPlaying, setIsPlaying] = useState(false);
  const [localSeconds, setLocalSeconds] = useState(watchedSeconds);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync with enrollment changes
  useEffect(() => {
    setLocalSeconds(enrollment?.heartbeats[lesson.id] || 0);
    setStatusMessage(null);
  }, [lesson.id, enrollment]);

  // Periodic heartbeat timer while playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setLocalSeconds((prev) => {
          const nextSec = prev + 1;
          // Send heartbeat every 5 seconds to state engine
          if (nextSec % 5 === 0) {
            recordLessonHeartbeat(course.id, lesson.id, nextSec);
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, course.id, lesson.id, recordLessonHeartbeat]);

  const progressPercent = Math.min(
    100,
    Math.round((localSeconds / requiredSeconds) * 100)
  );
  const canMarkComplete = progressPercent >= 80 || isCompleted;

  const handleMarkComplete = () => {
    // commit current watch time first
    recordLessonHeartbeat(course.id, lesson.id, localSeconds);
    const result = completeLesson(course.id, lesson.id);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text:
          result.code === 'COURSE_COMPLETED'
            ? t.learning.congratsCourseComplete
            : language === 'ar'
            ? 'تم تأكيد إكمال الدرس بنجاح!'
            : 'Lesson marked as completed!',
      });
      if (hasNext && onNextLesson) {
        setTimeout(() => onNextLesson(), 1200);
      }
    } else {
      setStatusMessage({
        type: 'error',
        text:
          result.code === 'NOT_ENOUGH_TIME'
            ? t.learning.minimumTimeNotice
            : language === 'ar'
            ? 'حدث خطأ في التحقق من إكمال الدرس'
            : 'Unable to mark lesson complete',
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Container (Strict YouTube-nocookie iframe per CSP specifications) */}
      <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${lesson.videoId}?rel=0&modestbranding=1`}
          title={language === 'ar' ? lesson.titleAr : lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
          onLoad={() => setIsPlaying(true)}
        />
      </div>

      {/* Heartbeat & Progress Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{t.learning.timeSpent}</span>
              <span className="font-mono tabular-nums text-blue-800 font-bold">
                {formatTime(localSeconds)}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500">{t.learning.requiredTime}</span>
              <span className="font-mono tabular-nums text-slate-600">
                {lesson.requiredMinutes} {t.common.minutes}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-64 bg-slate-100 rounded-full h-2 overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPercent >= 80 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>{progressPercent}% {language === 'ar' ? 'مكتمل من وقت المحاضرة' : 'watched'}</span>
              <span>{t.learning.minimumTimeNotice}</span>
            </div>
          </div>

          {/* Action Buttons: Mark Complete & Navigation */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {hasPrev && (
              <button
                onClick={onPrevLesson}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                {t.common.prev}
              </button>
            )}

            <button
              onClick={handleMarkComplete}
              disabled={!canMarkComplete}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors shadow-xs ${
                isCompleted
                  ? 'bg-emerald-600 text-white cursor-default'
                  : canMarkComplete
                  ? 'bg-[#0078d4] hover:bg-[#106ebe] text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isCompleted ? t.learning.completed : t.learning.markComplete}
              </span>
            </button>

            {hasNext && (
              <button
                onClick={onNextLesson}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                {t.common.next}
              </button>
            )}
          </div>
        </div>

        {/* Feedback Message Banner */}
        {statusMessage && (
          <div
            className={`mt-3 p-2.5 rounded-md text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Lesson Notes & Takeaways */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-700" />
          <span>{t.learning.lessonNotes}</span>
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          {language === 'ar' ? lesson.notesAr : lesson.notes}
        </p>

        {/* Lesson Resources */}
        {lesson.resources && lesson.resources.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-800 mb-2">
              {t.learning.resources}
            </h4>
            <div className="flex flex-wrap gap-2">
              {lesson.resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{language === 'ar' ? res.titleAr : res.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Official YouTube Notice as requested in spec */}
        <div className="pt-2 text-[11px] text-slate-400">
          {t.learning.youtubeNotice}
        </div>
      </div>
    </div>
  );
};
