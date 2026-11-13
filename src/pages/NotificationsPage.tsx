import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const {
    language,
    t,
    notifications,
    currentUser,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const myNotifications = notifications.filter((n) => n.userId === currentUser.id);
  const filtered = myNotifications.filter((n) => (filter === 'unread' ? !n.read : true));

  const getIcon = (type: string) => {
    switch (type) {
      case 'LEVEL_UNLOCKED':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'CERTIFICATE_ISSUED':
        return <Award className="w-4 h-4 text-blue-600" />;
      case 'EVENT_REMINDER':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'TASK_FEEDBACK':
      case 'TASK_ASSIGNED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            {t.notifications.title}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ar' ? 'التنبيهات والإشعارات الفورية' : 'Recent Notifications & Alerts'}
          </h1>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
        >
          {t.notifications.markAllRead}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {t.common.all} ({myNotifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            filter === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {language === 'ar' ? 'غير المقروءة' : 'Unread'} (
          {myNotifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="fluent-card rounded-2xl p-10 text-center text-slate-400 text-xs">
            {t.notifications.noUnread}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                item.read
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50/60 border-blue-300 shadow-xs'
              }`}
            >
              <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-xs shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? item.titleAr : item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.createdAt.split('T')[0]}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'ar' ? item.messageAr : item.message}
                </p>

                {item.link && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(item.id);
                      onNavigate(item.link!.replace('/dashboard/', '').replace('/', ''));
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline pt-1"
                  >
                    <span>{t.common.details}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
