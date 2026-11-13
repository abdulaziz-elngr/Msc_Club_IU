import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Trophy, Award, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { language, t, achievements } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 max-w-2xl mx-auto"
      >
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
          {language === 'ar' ? 'سجل البطولات والإنجازات' : 'Honor Roll & Championships'}
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ar' ? 'إنجازات طلاب جامعة الابتكار' : 'Student Achievements & Awards'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {language === 'ar'
            ? 'سجل مشرف من الجوائز الوطنية والمراكز الأولى في منافسات مايكروسوفت وهاكاثونات البرمجة والذكاء الاصطناعي.'
            : 'A verified timeline of national championships, Imagine Cup milestones, and community honors earned by our students.'}
        </p>
      </motion.div>

      {/* Chronological Timeline */}
      <div className="relative border-s-2 border-blue-200 ms-4 sm:ms-8 ps-6 sm:ps-8 space-y-8">
        {achievements.map((ach, idx) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.1 }}
            className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-3"
          >
            {/* Timeline Node Badge */}
            <div className="absolute -start-[35px] sm:-start-[43px] top-6 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#123F6E] border-4 border-white text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                  {ach.year}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {ach.category}
                </span>
              </div>
              {ach.rankOrBadge && (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                  {ach.rankOrBadge}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {language === 'ar' ? ach.titleAr : ach.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'ar' ? ach.descriptionAr : ach.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
