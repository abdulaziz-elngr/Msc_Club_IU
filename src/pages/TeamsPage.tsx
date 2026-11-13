import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Team } from '../types';
import {
  Users,
  ShieldCheck,
  Code,
  Cloud,
  BrainCircuit,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface TeamsPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({ onNavigate }) => {
  const { language, t, teams, assignments, courses, tracks } = useApp();
  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const [activeTeamSlug, setActiveTeamSlug] = useState<string | null>(null);

  const activeTeam = teams.find((tm) => tm.slug === activeTeamSlug);
  const teamAssignments = activeTeam
    ? assignments.filter((a) => a.teamId === activeTeam.id)
    : [];
  const associatedTrack = activeTeam
    ? tracks.find((tr) => tr.slug === activeTeam.trackSlug)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
          {t.teams.title}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.teams.subtitle}
        </h1>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => setActiveTeamSlug(team.slug)}
            className="fluent-card rounded-2xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: team.color }}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {team.memberCount} {language === 'ar' ? 'عضو' : 'members'}
                  </span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'ar' ? team.nameAr : team.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {language === 'ar' ? team.descriptionAr : team.description}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  {t.teams.lead} <strong>{language === 'ar' ? team.leadNameAr : team.leadName}</strong>
                </span>
                <span className="text-blue-700 font-semibold">{t.teams.teamWorkspace}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end text-xs font-bold text-blue-700">
              <span className="flex items-center gap-1">
                {language === 'ar' ? 'استعراض مهام ومسار الفريق' : 'Explore Team Workspace'}
                <Arrow className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Team Workspace Modal View */}
      {activeTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
            <div
              className="text-white p-6 flex items-center justify-between"
              style={{ backgroundColor: activeTeam.color }}
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-white/80 font-semibold block">
                  {t.teams.teamWorkspace}
                </span>
                <h3 className="text-xl font-bold mt-0.5">
                  {language === 'ar' ? activeTeam.nameAr : activeTeam.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveTeamSlug(null)}
                className="text-white/80 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  About Chapter
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {language === 'ar' ? activeTeam.descriptionAr : activeTeam.description}
                </p>
              </div>

              {/* Associated Track */}
              {associatedTrack && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">
                      {t.teams.track}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 mt-0.5">
                      {language === 'ar' ? associatedTrack.titleAr : associatedTrack.title}
                    </h5>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTeamSlug(null);
                      onNavigate('learning', associatedTrack.slug);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
                  >
                    {language === 'ar' ? 'عرض المسار' : 'View Track'}
                  </button>
                </div>
              )}

              {/* Team Tasks */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t.teams.tasks} ({teamAssignments.length})
                </h4>
                {teamAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No tasks assigned to this team currently.</p>
                ) : (
                  <div className="space-y-2">
                    {teamAssignments.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">
                            {language === 'ar' ? task.titleAr : task.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {task.difficulty} · Deadline: {task.deadline.split('T')[0]}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          +{task.xpReward} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
