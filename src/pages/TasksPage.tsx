import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment, TaskAssignment, TaskStatus } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCode,
  Github,
  Plus,
  Send,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  X,
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (view: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const {
    language,
    t,
    currentRole,
    currentUser,
    assignments,
    taskAssignments,
    submitTask,
    reviewTask,
    createAssignment,
    teams,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my_tasks' | 'review_queue'>('my_tasks');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<string>('all');

  // Submit Modal State
  const [submitModalData, setSubmitModalData] = useState<{
    taskAssignment: TaskAssignment;
    task: Assignment;
  } | null>(null);
  const [githubUrlInput, setGithubUrlInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Review Modal State (For Leads / Admin)
  const [reviewModalData, setReviewModalData] = useState<{
    taskAssignment: TaskAssignment;
    task: Assignment;
  } | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Create Task Modal State (For Leads / Admin)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTitleAr, setNewTaskTitleAr] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDescAr, setNewTaskDescAr] = useState('');
  const [newTaskTeamId, setNewTaskTeamId] = useState('web-dev');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [newTaskXp, setNewTaskXp] = useState(250);

  // Filter tasks for current user
  const myTaskAssignments = taskAssignments.filter(
    (ta) => ta.userId === currentUser.id
  );

  // Review queue for team leads & admins
  const reviewQueue = taskAssignments.filter(
    (ta) => ta.status === 'UNDER_REVIEW'
  );

  const handleOpenSubmit = (ta: TaskAssignment, task: Assignment) => {
    setSubmitModalData({ taskAssignment: ta, task });
    setGithubUrlInput('');
    setNotesInput('');
  };

  const handleSubmitWork = () => {
    if (!submitModalData) return;
    submitTask(
      submitModalData.taskAssignment.id,
      notesInput,
      githubUrlInput
    );
    setSubmitModalData(null);
  };

  const handleReview = (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewModalData) return;
    reviewTask(
      reviewModalData.taskAssignment.id,
      status,
      feedbackInput || (status === 'APPROVED' ? 'Approved, great work!' : 'Please make revisions and resubmit.')
    );
    setReviewModalData(null);
    setFeedbackInput('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createAssignment({
      title: newTaskTitle,
      titleAr: newTaskTitleAr || newTaskTitle,
      description: newTaskDesc,
      descriptionAr: newTaskDescAr || newTaskDesc,
      teamId: newTaskTeamId,
      difficulty: newTaskDifficulty,
      xpReward: Number(newTaskXp),
    });

    setCreateModalOpen(false);
    setNewTaskTitle('');
    setNewTaskTitleAr('');
    setNewTaskDesc('');
    setNewTaskDescAr('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
            {t.tasks.title}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.tasks.subtitle}
          </h1>
        </div>

        {(currentRole === 'TEAM_LEAD' || currentRole === 'ADMIN') && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0b3a6b] hover:bg-[#0078d4] rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.tasks.createTask}</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher for Leads / Admins */}
      {(currentRole === 'TEAM_LEAD' || currentRole === 'ADMIN') && (
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'my_tasks'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.tasks.myTasks}
          </button>
          <button
            onClick={() => setActiveTab('review_queue')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'review_queue'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t.tasks.reviewQueue}</span>
            {reviewQueue.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {reviewQueue.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* VIEW 1: MY TASKS */}
      {activeTab === 'my_tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTaskAssignments.map((ta) => {
              const task = assignments.find((a) => a.id === ta.taskId);
              if (!task) return null;

              const latestSub = ta.submissions[0];
              const isApproved = ta.status === 'APPROVED';
              const isUnderReview = ta.status === 'UNDER_REVIEW';
              const isRejected = ta.status === 'REJECTED';

              return (
                <div
                  key={ta.id}
                  className="fluent-card rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500 uppercase">
                        {task.difficulty}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700'
                            : isUnderReview
                            ? 'bg-blue-50 text-blue-700'
                            : isRejected
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.tasks.statusLabels[ta.status]}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {language === 'ar' ? task.titleAr : task.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {language === 'ar' ? task.descriptionAr : task.description}
                      </p>
                    </div>

                    {/* Reviewer Feedback Box (if exists) */}
                    {latestSub?.reviewerFeedback && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t.tasks.reviewerFeedback}</span>
                          {latestSub.reviewedBy && (
                            <span className="text-[10px] text-amber-800">({latestSub.reviewedBy})</span>
                          )}
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {latestSub.reviewerFeedback}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{t.tasks.attempts} {ta.attempts}/{task.maxAttempts}</span>
                      <span className="font-bold text-amber-600 font-mono">+{task.xpReward} XP</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-400">
                        {t.tasks.taskDeadline}: {task.deadline.split('T')[0]}
                      </div>

                      {isApproved ? (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.tasks.statusLabels.APPROVED}</span>
                        </div>
                      ) : isUnderReview ? (
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.tasks.statusLabels.UNDER_REVIEW}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenSubmit(ta, task)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors"
                        >
                          {isRejected ? t.tasks.resubmitWork : t.tasks.submitWork}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: REVIEW QUEUE (For Leads & Admins) */}
      {activeTab === 'review_queue' && (
        <div className="space-y-4">
          {reviewQueue.length === 0 ? (
            <div className="fluent-card rounded-2xl p-10 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <span>{language === 'ar' ? 'لا توجد مهام بانتظار المراجعة حالياً' : 'All submissions have been reviewed!'}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewQueue.map((ta) => {
                const task = assignments.find((a) => a.id === ta.taskId);
                const latestSub = ta.submissions[0];
                return (
                  <div
                    key={ta.id}
                    className="fluent-card rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-blue-700 uppercase">{task?.difficulty}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">
                          {t.tasks.attempts} {ta.attempts}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-bold text-amber-600">+{task?.xpReward} XP</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {language === 'ar' ? task?.titleAr : task?.title}
                      </h3>

                      {latestSub?.githubUrl && (
                        <a
                          href={latestSub.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:underline"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>{latestSub.githubUrl}</span>
                        </a>
                      )}

                      {latestSub?.notes && (
                        <p className="text-xs text-slate-600 italic">
                          "{latestSub.notes}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReviewModalData({ taskAssignment: ta, task: task! });
                          setFeedbackInput('');
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors"
                      >
                        {language === 'ar' ? 'تقييم الحل ومراجعة الكود' : 'Review & Grade'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {submitModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#123F6E] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {t.tasks.submitWork} — {language === 'ar' ? submitModalData.task.titleAr : submitModalData.task.title}
              </h3>
              <button
                onClick={() => setSubmitModalData(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.tasks.githubUrl}
                </label>
                <input
                  type="url"
                  value={githubUrlInput}
                  onChange={(e) => setGithubUrlInput(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.tasks.submissionNotes}
                </label>
                <textarea
                  rows={4}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder={language === 'ar' ? 'اشرح البنية الهندسية للحل وما تم إنجازه...' : 'Describe architectural choices and implementation details...'}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalData(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitWork}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors"
                >
                  {t.common.submit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW & FEEDBACK MODAL (For Leads & Admins) */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {language === 'ar' ? 'مراجعة وتقييم الحل' : 'Review & Grade Solution'}
              </h3>
              <button
                onClick={() => setReviewModalData(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs text-slate-500">{t.tasks.title}</div>
                <div className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? reviewModalData.task.titleAr : reviewModalData.task.title}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.tasks.reviewerFeedback} (ملاحظات التقييم)
                </label>
                <textarea
                  rows={4}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب ملاحظاتك التوجيهية للطالب...' : 'Provide clear, constructive feedback on code structure...'}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleReview('REJECTED')}
                  className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                >
                  {t.tasks.reject}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalData(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview('APPROVED')}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
                  >
                    {t.tasks.approve} (+{reviewModalData.task.xpReward} XP)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TASK MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">{t.tasks.createTask}</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Build Azure Functions Trigger"
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
                    value={newTaskTitleAr}
                    onChange={(e) => setNewTaskTitleAr(e.target.value)}
                    placeholder="مثال: بناء دالة لحظية في Azure"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / تفاصيل المهمة
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.tasks.difficulty}
                  </label>
                  <select
                    value={newTaskDifficulty}
                    onChange={(e: any) => setNewTaskDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    value={newTaskXp}
                    onChange={(e) => setNewTaskXp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Team Chapter
                  </label>
                  <select
                    value={newTaskTeamId}
                    onChange={(e) => setNewTaskTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {language === 'ar' ? team.nameAr : team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                >
                  {t.tasks.createTask}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
