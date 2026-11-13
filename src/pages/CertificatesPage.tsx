import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate } from '../types';
import { CertificateViewer } from '../components/CertificateViewer';
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Ban,
  FileCheck,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface CertificatesPageProps {
  initialCode?: string;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({ initialCode }) => {
  const {
    language,
    t,
    currentRole,
    currentUser,
    users,
    certificates,
    certificateTemplates,
    verifyCertificate,
    issueCertificate,
    revokeCertificate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my_certs' | 'verify' | 'admin_manage'>(
    initialCode ? 'verify' : 'my_certs'
  );

  // Verification Search State
  const [verifyCodeInput, setVerifyCodeInput] = useState(initialCode || '');
  const [verificationResult, setVerificationResult] = useState<{
    searched: boolean;
    found: boolean;
    certificate?: Certificate;
  }>({ searched: false, found: false });

  // Selected Certificate for Viewer
  const myCertificates = certificates.filter(
    (c) => c.recipientId === currentUser.id && c.valid
  );
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(
    myCertificates[0] || certificates[0] || null
  );

  // Admin Modals
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueRecipientId, setIssueRecipientId] = useState('user-ahmad');
  const [issueTitleEn, setIssueTitleEn] = useState('');
  const [issueTitleAr, setIssueTitleAr] = useState('');
  const [issueType, setIssueType] = useState<'COURSE' | 'EVENT' | 'HONORARY'>('COURSE');

  const [revokeModalCert, setRevokeModalCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const handleVerify = (codeToTest: string) => {
    if (!codeToTest.trim()) return;
    const res = verifyCertificate(codeToTest.trim());
    setVerificationResult({
      searched: true,
      found: res.found,
      certificate: res.certificate,
    });
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitleEn.trim()) return;
    const cert = issueCertificate(
      issueRecipientId,
      issueTitleEn,
      issueTitleAr || issueTitleEn,
      issueType,
      `manual-${Date.now()}`
    );
    setSelectedCert(cert);
    setIssueModalOpen(false);
    setIssueTitleEn('');
    setIssueTitleAr('');
  };

  const handleRevokeSubmit = () => {
    if (!revokeModalCert || !revokeReason.trim()) return;
    revokeCertificate(revokeModalCert.code, revokeReason);
    setRevokeModalCert(null);
    setRevokeReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
            {t.certificates.title}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.certificates.subtitle}
          </h1>
        </div>

        {currentRole === 'ADMIN' && (
          <button
            onClick={() => setIssueModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0b3a6b] hover:bg-[#0078d4] rounded-lg transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.certificates.issueManual}</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my_certs')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'my_certs'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.certificates.myCertificates} ({myCertificates.length})
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'verify'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t.certificates.verifyTitle}</span>
        </button>
        {currentRole === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('admin_manage')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'admin_manage'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'ar' ? 'سجل كافة الشهادات والاعتمادات' : 'All Credentials Registry'}
          </button>
        )}
      </div>

      {/* TAB 1: MY CERTIFICATES & VIEWER */}
      {activeTab === 'my_certs' && (
        <div className="space-y-6">
          {myCertificates.length === 0 ? (
            <div className="fluent-card rounded-2xl p-10 text-center text-slate-500 text-xs">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <span>{language === 'ar' ? 'لم تحصل على شهادات معتمدة بعد. أتمم مساراً تعليمياً لتوليد شهادتك.' : 'No certificates earned yet. Complete a course to earn official credentials.'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Thumbnails Sidebar */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'الشهادات المكتسبة' : 'Earned Credentials'}
                </span>
                {myCertificates.map((cert) => {
                  const isSelected = selectedCert?.id === cert.id;
                  return (
                    <div
                      key={cert.id}
                      onClick={() => setSelectedCert(cert)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-blue-800">
                          {cert.code}
                        </span>
                        <span className="text-slate-500">{cert.issuedAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {language === 'ar' ? cert.titleAr : cert.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                        {cert.type} CREDENTIAL
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Vector / Canvas Certificate Viewer */}
              <div className="lg:col-span-8">
                {selectedCert ? (
                  <CertificateViewer
                    certificate={selectedCert}
                    template={certificateTemplates[0]}
                    onVerifyClick={(code) => {
                      setVerifyCodeInput(code);
                      handleVerify(code);
                      setActiveTab('verify');
                    }}
                  />
                ) : (
                  <div className="fluent-card rounded-2xl p-10 text-center text-slate-500 text-xs">
                    Select a certificate to view.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLIC VERIFICATION PORTAL */}
      {activeTab === 'verify' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="fluent-card rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {t.certificates.verifyTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.certificates.verifySubtitle}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={verifyCodeInput}
                onChange={(e) => setVerifyCodeInput(e.target.value)}
                placeholder={t.certificates.codePlaceholder}
                className="flex-1 px-4 py-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
              />
              <button
                onClick={() => handleVerify(verifyCodeInput)}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-lg transition-colors shadow-xs shrink-0"
              >
                {t.certificates.verifyButton}
              </button>
            </div>

            {/* Quick Demonstration Shortcuts */}
            <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
              <span>{language === 'ar' ? 'رموز للاختبار السريع:' : 'Demo codes:'}</span>
              <button
                onClick={() => {
                  setVerifyCodeInput('MSC-IU-2026-8841');
                  handleVerify('MSC-IU-2026-8841');
                }}
                className="underline hover:text-blue-700 font-mono"
              >
                MSC-IU-2026-8841 (Valid)
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setVerifyCodeInput('MSC-IU-2025-REV-04');
                  handleVerify('MSC-IU-2025-REV-04');
                }}
                className="underline hover:text-red-700 font-mono"
              >
                MSC-IU-2025-REV-04 (Revoked)
              </button>
            </div>
          </div>

          {/* Verification Result Card */}
          {verificationResult.searched && (
            <div>
              {verificationResult.found && verificationResult.certificate ? (
                <div
                  className={`bg-white border rounded-xl p-6 shadow-sm space-y-4 ${
                    verificationResult.certificate.valid
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-red-300 bg-red-50/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {verificationResult.certificate.valid ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    )}
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          verificationResult.certificate.valid
                            ? 'text-emerald-900'
                            : 'text-red-900'
                        }`}
                      >
                        {verificationResult.certificate.valid
                          ? t.certificates.verifiedValid
                          : t.certificates.verifiedRevoked}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-500">
                        {verificationResult.certificate.code}
                      </div>
                    </div>
                  </div>

                  {/* Sanitized Public Data (No private email or phone leaked per spec) */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400 block">{t.certificates.recipientName}</span>
                      <span className="font-bold text-slate-900">
                        {language === 'ar'
                          ? verificationResult.certificate.recipientNameAr
                          : verificationResult.certificate.recipientName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t.certificates.issueDate}</span>
                      <span className="font-mono text-slate-700">
                        {verificationResult.certificate.issuedAt}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">{language === 'ar' ? 'البرنامج المعتمد' : 'Accredited Credential'}</span>
                      <span className="font-bold text-blue-900">
                        {language === 'ar'
                          ? verificationResult.certificate.titleAr
                          : verificationResult.certificate.title}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">{t.certificates.issuer}</span>
                      <span className="text-slate-600">{t.certificates.issuerName}</span>
                    </div>

                    {!verificationResult.certificate.valid && (
                      <div className="col-span-2 p-2.5 bg-red-50 border border-red-200 rounded text-red-900 text-xs">
                        <strong>{t.certificates.revocationReason}</strong>{' '}
                        {verificationResult.certificate.revocationReason}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="fluent-card rounded-2xl p-8 text-center text-xs space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <div className="font-bold text-slate-900">{t.certificates.verifiedNotFound}</div>
                  <div className="text-slate-500">
                    {language === 'ar'
                      ? 'تأكد من كتابة الرمز التسلسلي بشكل دقيق.'
                      : 'Please check the spelling of your credential code and try again.'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADMIN REGISTRY & REVOCATION (For Admins) */}
      {activeTab === 'admin_manage' && currentRole === 'ADMIN' && (
        <div className="fluent-card rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'ar' ? 'سجل الاعتمادات والشهادات الصادرة' : 'Issued Credentials Registry'}
            </h3>
            <span className="text-xs text-slate-500">
              {certificates.length} {language === 'ar' ? 'شهادة مسجلة' : 'records'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 text-start">Code</th>
                  <th className="py-2.5 px-4 text-start">Recipient</th>
                  <th className="py-2.5 px-4 text-start">Title</th>
                  <th className="py-2.5 px-4 text-start">Date</th>
                  <th className="py-2.5 px-4 text-start">Status</th>
                  <th className="py-2.5 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-800">
                      {cert.code}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {language === 'ar' ? cert.recipientNameAr : cert.recipientName}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                      {language === 'ar' ? cert.titleAr : cert.title}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {cert.issuedAt}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          cert.valid
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {cert.valid ? 'VALID' : 'REVOKED'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-end">
                      {cert.valid && (
                        <button
                          onClick={() => setRevokeModalCert(cert)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          {t.certificates.revokeCertificate}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUE CERTIFICATE MODAL */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">{t.certificates.issueManual}</h3>
              <button
                onClick={() => setIssueModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Member / العضو المستحق
                </label>
                <select
                  value={issueRecipientId}
                  onChange={(e) => setIssueRecipientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.studentId}) — {language === 'ar' ? u.nameAr : u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certificate Title (EN)
                </label>
                <input
                  type="text"
                  required
                  value={issueTitleEn}
                  onChange={(e) => setIssueTitleEn(e.target.value)}
                  placeholder="e.g. Azure AI Hackathon Winner"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان الشهادة بالعربية
                </label>
                <input
                  type="text"
                  required
                  value={issueTitleAr}
                  onChange={(e) => setIssueTitleAr(e.target.value)}
                  placeholder="مثال: الفائز الأول في هاكاثون الذكاء الاصطناعي"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type / نوع الاعتماد
                </label>
                <select
                  value={issueType}
                  onChange={(e: any) => setIssueType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="COURSE">COURSE (مسار تدريبي)</option>
                  <option value="EVENT">EVENT (فعالية / هاكاثون)</option>
                  <option value="HONORARY">HONORARY (شهادة شرفية)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors"
                >
                  {language === 'ar' ? 'إصدار واعتماد الشهادة' : 'Issue Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOCATION MODAL */}
      {revokeModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-red-700 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">{t.certificates.revokeCertificate}</h3>
              <button
                onClick={() => setRevokeModalCert(null)}
                className="text-red-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600">
                Are you sure you want to revoke credential{' '}
                <span className="font-mono font-bold text-slate-900">
                  {revokeModalCert.code}
                </span>{' '}
                belonging to {revokeModalCert.recipientName}?
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.certificates.mandatoryReason}
                </label>
                <textarea
                  rows={3}
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Integrity violation in final milestone submission..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalCert(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  disabled={!revokeReason.trim()}
                  onClick={handleRevokeSubmit}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {t.certificates.revokeCertificate}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
