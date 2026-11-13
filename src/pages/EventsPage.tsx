import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Event, EventCategory } from '../types';
import { QrPassModal, QrScannerModal } from '../components/EventModals';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  QrCode,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const {
    language,
    t,
    currentRole,
    currentUser,
    events,
    eventRegistrations,
    registerForEvent,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePassEventId, setActivePassEventId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: t.common.all },
    { key: 'WORKSHOP', label: t.events.categories.WORKSHOP },
    { key: 'BOOTCAMP', label: t.events.categories.BOOTCAMP },
    { key: 'TECHNICAL_SESSION', label: t.events.categories.TECHNICAL_SESSION },
    { key: 'HACKATHON', label: t.events.categories.HACKATHON },
  ];

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'all') return true;
    return ev.category === selectedCategory;
  });

  const handleRegister = (eventId: string) => {
    const res = registerForEvent(eventId);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activePassReg = eventRegistrations.find(
    (r) => r.eventId === activePassEventId && r.userId === currentUser.id
  );
  const activePassEvent = events.find((e) => e.id === activePassEventId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            {t.events.title}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.events.subtitle}
          </h1>
        </div>

        {/* Scanner Trigger for Organizers / Leads */}
        {(currentRole === 'TEAM_LEAD' || currentRole === 'ADMIN') && (
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0b3a6b] hover:bg-[#0078d4] rounded-lg transition-colors shadow-xs self-start sm:self-auto"
          >
            <Camera className="w-4 h-4 text-blue-400" />
            <span>{t.events.scanCheckIn}</span>
          </button>
        )}
      </div>

      {/* Category Segmented Controls */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              selectedCategory === cat.key
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg flex items-center gap-2 max-w-md animate-fade-in">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const reg = eventRegistrations.find(
            (r) => r.eventId === event.id && r.userId === currentUser.id
          );
          const isRegistered = !!reg;
          const isFull = event.registeredCount >= event.capacity;
          const isCheckedIn = reg?.status === 'CHECKED_IN';

          return (
            <div
              key={event.id}
              className="fluent-card rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 uppercase">
                    {t.events.categories[event.category]}
                  </span>
                  <span className="font-bold text-amber-600 font-mono">
                    +{event.xpReward} XP
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'ar' ? event.titleAr : event.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {language === 'ar' ? event.summaryAr : event.summary}
                  </p>
                </div>

                {/* Speaker info */}
                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="font-semibold">
                    {t.events.speaker} {language === 'ar' ? event.speakerAr : event.speaker}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === 'ar' ? event.speakerRoleAr : event.speakerRole}
                  </div>
                </div>

                {/* Date & Location Details */}
                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono tabular-nums">
                      {event.startsAt.replace('T', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      {language === 'ar' ? event.locationAr : event.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Seat Capacity & Registration Button */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {event.registeredCount}/{event.capacity} {language === 'ar' ? 'مقعد' : 'seats'}
                    </span>
                  </div>
                  {event.waitlistCount > 0 && (
                    <span className="text-amber-700 text-[11px]">
                      {event.waitlistCount} {language === 'ar' ? 'في الانتظار' : 'on waitlist'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  {isCheckedIn ? (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تم تأكيد حضورك' : 'Checked In'}</span>
                    </div>
                  ) : isRegistered ? (
                    <button
                      onClick={() => setActivePassEventId(event.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#123F6E] hover:bg-[#0A1B30] rounded-md transition-colors shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t.events.viewQrPass}</span>
                    </button>
                  ) : isFull ? (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="w-full py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
                    >
                      {t.events.joinWaitlist}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="w-full py-2 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors shadow-xs"
                    >
                      {t.events.register}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Pass Modal */}
      {activePassEvent && activePassReg && (
        <QrPassModal
          event={activePassEvent}
          registration={activePassReg}
          onClose={() => setActivePassEventId(null)}
        />
      )}

      {/* QR Scanner Modal for organizers */}
      {scannerOpen && (
        <QrScannerModal onClose={() => setScannerOpen(false)} />
      )}
    </div>
  );
};
