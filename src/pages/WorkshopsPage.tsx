import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { WorkshopItem } from '../types';
import {
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react';

export const WorkshopsPage: React.FC = () => {
  const { language, t, workshops, registerForWorkshop } = useApp();

  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRegister = (wsId: string) => {
    const res = registerForWorkshop(wsId);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
          {language === 'ar' ? 'المعسكرات والورش التخصصية' : 'Specialized Workshops & Masterclasses'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ar' ? 'ورش العمل التطبيقية متعددة الجلسات' : 'Hands-on Technical Workshops'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          {language === 'ar'
            ? 'ورش برمجية مكثفة تمتد لعدة جلسات عملية تشمل مشاريع تطبيقية وتسجيل حضور رقمي، ومؤهلة للحصول على شهادات إتمام معتمدة.'
            : 'Multi-session deep-dive masterclasses covering real-world architecture, live coding, and official certificate eligibility.'}
        </p>
      </motion.div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg flex items-center gap-2 max-w-md animate-fade-in">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {workshops.map((ws, idx) => {
          const isFull = ws.registeredCount >= ws.capacity;

          return (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 uppercase tracking-wider">
                    {ws.level}
                  </span>
                  {ws.certificateEligible && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Award className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'مؤهل لشهادة رسمية' : 'Certificate Eligible'}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {language === 'ar' ? ws.titleAr : ws.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'ar' ? ws.descriptionAr : ws.description}
                </p>

                {/* Instructor */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 space-y-0.5">
                  <div className="font-semibold">
                    Instructor: {language === 'ar' ? ws.instructorAr : ws.instructor}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === 'ar' ? ws.instructorRoleAr : ws.instructorRole}
                  </div>
                </div>

                {/* Schedule & Duration preview */}
                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ws.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {language === 'ar' ? 'المتطلبات:' : 'Prerequisites:'}{' '}
                      {language === 'ar' ? ws.prerequisitesAr : ws.prerequisites}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Capacity */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {ws.registeredCount}/{ws.capacity} {language === 'ar' ? 'مسجل' : 'registered'}
                    </span>
                  </span>
                  <button
                    onClick={() => setSelectedWorkshop(ws)}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    {language === 'ar' ? 'عرض جدول الجلسات' : 'View Schedule'}
                  </button>
                </div>

                <button
                  disabled={isFull}
                  onClick={() => handleRegister(ws.id)}
                  className={`w-full py-2.5 text-xs font-bold rounded-lg transition-colors shadow-xs ${
                    isFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-[#0078d4] hover:bg-[#106ebe] text-white'
                  }`}
                >
                  {isFull
                    ? (language === 'ar' ? 'اكتملت المقاعد' : 'Fully Booked')
                    : (language === 'ar' ? 'سجل في الورشة الآن' : 'Register for Workshop')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Workshop Schedule Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#123F6E] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-200">
                  {language === 'ar' ? 'جدول جلسات الورشة' : 'Workshop Sessions Schedule'}
                </span>
                <h3 className="text-base font-bold">
                  {language === 'ar' ? selectedWorkshop.titleAr : selectedWorkshop.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWorkshop(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {selectedWorkshop.schedule.map((session) => (
                  <div
                    key={session.sessionNumber}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>
                        Session {session.sessionNumber}:{' '}
                        {language === 'ar' ? session.titleAr : session.title}
                      </span>
                      <span className="font-mono text-blue-700">{session.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{session.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedWorkshop(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
