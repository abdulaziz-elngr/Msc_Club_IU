import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  Mail,
  Send,
  User,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Search,
} from 'lucide-react';

export const JoinPage: React.FC = () => {
  const { language, t, submitApplication, memberApplications, tracks } = useApp();

  const [activeTab, setActiveTab] = useState<'apply' | 'status'>('apply');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [faculty, setFaculty] = useState('Computers & AI');
  const [academicYear, setAcademicYear] = useState('2nd Year');
  const [trackInterest, setTrackInterest] = useState('azure-cloud-devops');
  const [motivation, setMotivation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  // Status Search
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const code = submitApplication({
      fullName,
      email,
      studentId,
      faculty,
      academicYear,
      trackInterest,
      motivation,
      portfolioUrl,
    });

    setSubmittedCode(code);
  };

  const handleLookup = () => {
    if (!lookupCode.trim()) return;
    const found = memberApplications.find(
      (a) => a.applicationCode.trim().toUpperCase() === lookupCode.trim().toUpperCase()
    );
    setLookupResult(found || 'NOT_FOUND');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          {t.join.title}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.brand.tagline}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {t.join.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('apply')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'apply'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.join.submitApplication}
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'status'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.join.trackStatus}
        </button>
      </div>

      {/* TAB 1: APPLICATION FORM */}
      {activeTab === 'apply' && (
        <div>
          {submittedCode ? (
            <div className="bg-white border border-emerald-300 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t.join.appSuccessTitle}</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">{t.join.appSuccessDesc}</p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                <span className="text-lg font-mono font-bold text-blue-800 tracking-wider">
                  {submittedCode}
                </span>
              </div>
              <div>
                <button
                  onClick={() => {
                    setSubmittedCode(null);
                    setFullName('');
                    setEmail('');
                    setMotivation('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 hover:underline"
                >
                  {language === 'ar' ? 'تقديم طلب جديد' : 'Submit another application'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.join.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mostafa Ali"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.join.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@innovation.edu.eg"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.join.studentId}
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="20240000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.join.faculty}
                  </label>
                  <input
                    type="text"
                    required
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.join.academicYear}
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="1st Year">1st Year (السنة الأولى)</option>
                    <option value="2nd Year">2nd Year (السنة الثانية)</option>
                    <option value="3rd Year">3rd Year (السنة الثالثة)</option>
                    <option value="4th Year">4th Year (السنة الرابعة)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.join.trackInterest}
                </label>
                <select
                  value={trackInterest}
                  onChange={(e) => setTrackInterest(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  {tracks.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {language === 'ar' ? t.titleAr : t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.join.motivation}
                </label>
                <textarea
                  rows={4}
                  required
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder={language === 'ar' ? 'ما هي تطلعاتك والمهارات التي تسعى لتطويرها؟' : 'What drives you and what skills do you seek to master?'}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.join.portfolio}
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-lg transition-colors shadow-xs"
                >
                  {t.join.submitApplication}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: LOOKUP STATUS */}
      {activeTab === 'status' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 max-w-lg mx-auto">
          <label className="block text-xs font-bold text-slate-700">
            {language === 'ar' ? 'أدخل رقم الطلب المسجل' : 'Enter Application Code'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="MSC-APP-..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase"
            />
            <button
              onClick={handleLookup}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0b3a6b] hover:bg-[#0078d4] rounded-lg transition-colors"
            >
              {language === 'ar' ? 'استعلام' : 'Track'}
            </button>
          </div>

          {lookupResult && lookupResult !== 'NOT_FOUND' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-900">{lookupResult.fullName}</div>
              <div className="text-slate-600">Track: {lookupResult.trackInterest}</div>
              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <span className="font-semibold text-slate-500">Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {lookupResult.status}
                </span>
              </div>
            </div>
          )}

          {lookupResult === 'NOT_FOUND' && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs">
              {language === 'ar' ? 'لم يتم العثور على طلب بهذا الرقم.' : 'No application found with this reference code.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { language, t, submitContactMessage } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'GENERAL' | 'SPONSORSHIP' | 'PARTNERSHIP' | 'EVENT_QUERY'>('GENERAL');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    submitContactMessage({
      name,
      email,
      subject,
      category,
      message,
    });

    setSent(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          {t.nav.contact}
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ar' ? 'تواصل مع إدارة أندية مايكروسوفت' : 'Contact Microsoft Student Clubs'}
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'ar' ? 'جامعة الابتكار — مقر مجمع الابتكار التكنولوجي' : 'Innovation University — Tech Innovation Complex'}
        </p>
      </div>

      {sent ? (
        <div className="bg-white border border-emerald-300 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {language === 'ar' ? 'تم استلام رسالتك بنجاح!' : 'Message Received Successfully!'}
          </h3>
          <p className="text-xs text-slate-600">
            {language === 'ar' ? 'سيتواصل معك فريق النادي في أقرب وقت عبر البريد الإلكتروني.' : 'Our leadership team will reply to your registered email shortly.'}
          </p>
          <button
            onClick={() => {
              setSent(false);
              setMessage('');
              setSubject('');
            }}
            className="text-xs text-blue-700 font-bold hover:underline"
          >
            {language === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            >
              <option value="GENERAL">General Inquiries (استفسار عام)</option>
              <option value="SPONSORSHIP">Sponsorship (رعاية ودعم)</option>
              <option value="PARTNERSHIP">Academic Partnership (شراكة أكاديمية)</option>
              <option value="EVENT_QUERY">Event Support (دعم الفعاليات)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-lg transition-colors shadow-xs"
          >
            {t.common.submit}
          </button>
        </form>
      )}
    </div>
  );
};
