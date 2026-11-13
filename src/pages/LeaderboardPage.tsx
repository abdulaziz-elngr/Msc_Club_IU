import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const {
    language,
    t,
    users,
    badges,
    xpTransactions,
    currentUser,
  } = useApp();

  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>('all');

  const visibleStudents = [...users]
    .filter((u) => u.leaderboardVisible)
    .sort((a, b) => b.xp - a.xp);

  const myRank = visibleStudents.findIndex((u) => u.id === currentUser.id) + 1;

  const filteredTransactions = xpTransactions.filter((tx) => {
    if (ledgerCategoryFilter === 'all') return true;
    return tx.category === ledgerCategoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
            {t.gamification.title}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.gamification.leaderboard}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-1">
            {t.gamification.subtitle}
          </p>
        </div>

        {/* My Rank Pill */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            #{myRank || '-'}
          </div>
          <div>
            <div className="text-[11px] text-blue-700 font-semibold">{t.gamification.myRank}</div>
            <div className="text-sm font-bold text-slate-900">
              {currentUser.xp} XP · {t.common.level} {currentUser.level}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Leaderboard Standings on Left, Badges on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Standings Table */}
        <div className="lg:col-span-8 fluent-card rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {language === 'ar' ? 'الترتيب العام للطلاب' : 'Overall Student Standings'}
            </h3>
            <span className="text-xs text-slate-400">
              {visibleStudents.length} {language === 'ar' ? 'عضو مصنف' : 'ranked members'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-start">Rank</th>
                  <th className="py-3 px-4 text-start">Student</th>
                  <th className="py-3 px-4 text-start">Faculty</th>
                  <th className="py-3 px-4 text-start">Level</th>
                  <th className="py-3 px-4 text-end">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleStudents.map((student, idx) => {
                  const isCurrent = student.id === currentUser.id;
                  const rankNum = idx + 1;
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-blue-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            rankNum === 1
                              ? 'bg-amber-400 text-amber-950'
                              : rankNum === 2
                              ? 'bg-slate-300 text-slate-800'
                              : rankNum === 3
                              ? 'bg-amber-700/30 text-amber-900'
                              : 'text-slate-600'
                          }`}
                        >
                          {rankNum}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">
                              {language === 'ar' ? student.nameAr : student.name}
                              {isCurrent && (
                                <span className="text-[10px] text-blue-700 font-semibold ms-1">
                                  ({language === 'ar' ? 'أنت' : 'You'})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {student.studentId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {language === 'ar' ? student.facultyAr : student.faculty}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-bold text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded">
                          Lvl {student.level}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-end font-mono font-bold text-blue-900">
                        {student.xp} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Badges & Honors Showcase */}
        <div className="lg:col-span-4 space-y-6">
          <div className="fluent-card rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-blue-700" />
              <span>{t.gamification.badgesEarned}</span>
            </h3>

            <div className="space-y-3">
              {badges.map((badge) => {
                const unlocked = currentUser.xp >= badge.xpRequirement;
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                      unlocked
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        unlocked
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Trophy className="w-4 h-4" />
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">
                          {language === 'ar' ? badge.titleAr : badge.title}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-amber-800">
                          {badge.xpRequirement} XP
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {language === 'ar' ? badge.descriptionAr : badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Transactional XP Ledger Audit Trail */}
      <div className="fluent-card rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>{t.gamification.ledgerTitle}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'سجل غير قابل للتعديل يوثق كل معاملة ونقاط الخبرة المكتسبة مع مفاتيح المطابقة التكرارية'
                : 'Append-only transactional ledger recording all XP grants with idempotency keys'}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setLedgerCategoryFilter('all')}
              className={`px-2.5 py-1 rounded ${
                ledgerCategoryFilter === 'all'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.common.all}
            </button>
            <button
              onClick={() => setLedgerCategoryFilter('LEARNING')}
              className={`px-2.5 py-1 rounded ${
                ledgerCategoryFilter === 'LEARNING'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.gamification.categoryLearning}
            </button>
            <button
              onClick={() => setLedgerCategoryFilter('TASKS')}
              className={`px-2.5 py-1 rounded ${
                ledgerCategoryFilter === 'TASKS'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.gamification.categoryTasks}
            </button>
            <button
              onClick={() => setLedgerCategoryFilter('ATTENDANCE')}
              className={`px-2.5 py-1 rounded ${
                ledgerCategoryFilter === 'ATTENDANCE'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.gamification.categoryAttendance}
            </button>
          </div>
        </div>

        {/* Ledger Rows */}
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">
                  {language === 'ar' ? tx.reasonAr : tx.reason}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  KEY: {tx.idempotencyKey} · {tx.createdAt.replace('T', ' ').substring(0, 19)}
                </div>
              </div>

              <div className="text-end font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                +{tx.amount} XP
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
