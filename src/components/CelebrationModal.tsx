import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Trophy, X, ArrowUpRight } from 'lucide-react';

export const CelebrationModal: React.FC = () => {
  const { celebrationData, dismissCelebration, language, t } = useApp();

  if (!celebrationData || !celebrationData.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-amber-300 relative text-center p-8 space-y-5 animate-scale-up">
        <button
          onClick={dismissCelebration}
          className="absolute top-4 end-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy Visual with Pulse */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <Trophy className="w-10 h-10 text-amber-900 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{celebrationData.xp} XP</span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">
            {celebrationData.title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            {celebrationData.subtitle}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={dismissCelebration}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-lg transition-colors shadow-sm"
          >
            {language === 'ar' ? 'متابعة الإنجاز والتعلم' : 'Continue Learning'}
          </button>
        </div>
      </div>
    </div>
  );
};
