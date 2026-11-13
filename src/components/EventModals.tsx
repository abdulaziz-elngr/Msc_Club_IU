import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Event, EventRegistration } from '../types';
import { useApp } from '../context/AppContext';
import { X, QrCode, CheckCircle2, AlertCircle, Camera, Calendar, MapPin, UserCheck } from 'lucide-react';

interface QrPassModalProps {
  event: Event;
  registration: EventRegistration;
  onClose: () => void;
}

export const QrPassModal: React.FC<QrPassModalProps> = ({ event, registration, onClose }) => {
  const { language, t, currentUser } = useApp();
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(
      registration.passToken,
      {
        width: 220,
        margin: 1,
        color: {
          dark: '#0A1B30',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (!err && url) setQrUrl(url);
      }
    );
  }, [registration.passToken]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#123F6E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-300" />
            <h3 className="text-sm font-bold">
              {language === 'ar' ? 'تصريح الحضور الإلكتروني' : 'Official Event Pass'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pass Body */}
        <div className="p-6 text-center space-y-4">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              {event.category}
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">
              {language === 'ar' ? event.titleAr : event.title}
            </h4>
          </div>

          {/* Dynamic QR Code */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg inline-block shadow-inner">
            {qrUrl ? (
              <img src={qrUrl} alt="Event QR Pass" className="w-48 h-48 mx-auto" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Generating secure pass...
              </div>
            )}
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              {registration.passToken}
            </div>
          </div>

          {/* Attendee Details */}
          <div className="bg-blue-50/50 rounded-lg p-3 text-start space-y-1.5 text-xs text-slate-700 border border-blue-100">
            <div className="flex justify-between">
              <span className="text-slate-500">{t.certificates.recipientName}:</span>
              <span className="font-semibold">{language === 'ar' ? currentUser.nameAr : currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.certificates.recipientId}:</span>
              <span className="font-mono">{currentUser.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.common.status}:</span>
              <span className="font-bold text-emerald-700">
                {registration.status === 'CHECKED_IN'
                  ? (language === 'ar' ? 'تم تأكيد الحضور' : 'Checked In')
                  : (language === 'ar' ? 'مقعد مؤكد' : 'Confirmed')}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            {language === 'ar'
              ? 'يرجى إبراز هذا الرمز عند بوابة القاعة للدخول السريع.'
              : 'Show this digital pass at the entrance scanner for rapid check-in.'}
          </div>
        </div>
      </div>
    </div>
  );
};

interface QrScannerModalProps {
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose }) => {
  const { language, t, checkInAttendee, eventRegistrations, events, users } = useApp();
  const [tokenInput, setTokenInput] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; attendeeName?: string } | null>(null);

  const handleVerify = (tokenToTest: string) => {
    if (!tokenToTest.trim()) return;
    const res = checkInAttendee(tokenToTest.trim());
    setResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">
              {language === 'ar' ? 'مسح تصاريح الحضور (المنظمون)' : 'Attendee Pass Scanner (Staff)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            {language === 'ar'
              ? 'أدخل رمز تصريح الحضور أو اختر من التصاريح المسجلة للاختبار والتحقق الفوري:'
              : 'Scan or paste the attendee HMAC pass token for instant check-in verification:'}
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="HMAC_MSC_..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={() => handleVerify(tokenInput)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors"
            >
              {language === 'ar' ? 'تحقق' : 'Verify'}
            </button>
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2.5 ${
                result.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <div>
                <div className="font-bold">{result.message}</div>
                {result.attendeeName && (
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    {language === 'ar' ? `المشترك: ${result.attendeeName}` : `Attendee: ${result.attendeeName}`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Test Passes Shortcut for Ease of Testing */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {language === 'ar' ? 'تصاريح مسجلة للاختبار السريع:' : 'Registered Passes for Quick Testing:'}
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {eventRegistrations.slice(0, 4).map((reg) => {
                const ev = events.find((e) => e.id === reg.eventId);
                const user = users.find((u) => u.id === reg.userId);
                return (
                  <div
                    key={reg.id}
                    onClick={() => {
                      setTokenInput(reg.passToken);
                      handleVerify(reg.passToken);
                    }}
                    className="p-2 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {language === 'ar' ? user?.nameAr : user?.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs font-mono">
                        {reg.passToken}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        reg.status === 'CHECKED_IN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
