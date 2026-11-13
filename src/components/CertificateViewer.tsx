import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Certificate, CertificateTemplate } from '../types';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { ShieldCheck, Download, Printer, Copy, Check, ExternalLink } from 'lucide-react';

interface CertificateViewerProps {
  certificate: Certificate;
  template?: CertificateTemplate;
  onVerifyClick?: (code: string) => void;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  certificate,
  template,
  onVerifyClick,
}) => {
  const { language, t } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const certContainerRef = useRef<HTMLDivElement>(null);

  const verificationUrl = `${window.location.origin}#verify-${certificate.code}`;

  useEffect(() => {
    QRCode.toDataURL(
      verificationUrl,
      {
        width: 140,
        margin: 1,
        color: {
          dark: '#123F6E',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [verificationUrl, certificate.code]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{certificate.code}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">{certificate.issuedAt}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.common.copied : t.common.copy}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.certificates.printCert}</span>
          </button>

          {onVerifyClick && (
            <button
              onClick={() => onVerifyClick(certificate.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t.certificates.verifyButton}</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Certificate Visual Document (Printable / Vector) */}
      <div
        ref={certContainerRef}
        id="certificate-print-area"
        className="relative bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border-8 border-double border-[#123F6E] overflow-hidden"
        style={{ minHeight: '580px' }}
      >
        {/* Subtle Watermark Seal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <div className="grid grid-cols-2 gap-4 w-96 h-96">
            <span className="bg-[#123F6E] rounded-xl" />
            <span className="bg-[#0078d4] rounded-xl" />
            <span className="bg-[#599FE4] rounded-xl" />
            <span className="bg-[#0078D4] rounded-xl" />
          </div>
        </div>

        {/* Certificate Inner Frame Border */}
        <div className="border border-[#1B6AC4]/40 p-6 sm:p-8 h-full flex flex-col justify-between relative z-10">
          {/* Header Zone: Official Logo & University Branding */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <Logo size="lg" textColor="text-[#123F6E]" subtitleColor="text-blue-700 font-semibold" />

            {/* Official Verification Seal & Badge */}
            <div className="text-end">
              <span className="text-[11px] font-mono tracking-wider font-bold text-slate-500 uppercase">
                CREDENTIAL ID
              </span>
              <div className="text-xs font-mono font-bold text-[#123F6E]">
                {certificate.code}
              </div>
            </div>
          </div>

          {/* Body Zone: Recipient and Achievement */}
          <div className="text-center my-8 space-y-4">
            <p className="text-xs uppercase tracking-widest text-[#1B6AC4] font-bold">
              {template?.headingEn || 'CERTIFICATE OF ACHIEVEMENT'}
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">
              {template?.headingAr || 'شهادة إنجاز واعتماد رسمي'}
            </h2>

            <p className="text-xs text-slate-500">
              {language === 'ar' ? 'تشهد أندية مايكروسوفت الطلابية بأن الطالب:' : 'This is proudly presented to:'}
            </p>

            {/* Recipient Name in Display Typography */}
            <div className="py-2 border-b-2 border-slate-300 max-w-md mx-auto">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#123F6E]">
                {certificate.recipientNameAr}
              </div>
              <div className="text-sm font-medium text-slate-600 mt-1">
                {certificate.recipientName}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {t.certificates.recipientId}: {certificate.recipientStudentId}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
              {template?.bodyAr || 'قد أتم بنجاح كافة متطلبات البرنامج التدريبي والتطبيقات العملية المقررة بتفوق:'}
            </p>

            {/* Course / Event Title */}
            <div className="text-base sm:text-lg font-bold text-slate-900 max-w-lg mx-auto bg-blue-50/60 py-2 px-4 rounded-md border border-blue-100">
              {certificate.titleAr}
              <div className="text-xs font-medium text-slate-600 mt-0.5">
                {certificate.title}
              </div>
            </div>
          </div>

          {/* Footer Zone: QR Code & Authorized Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 items-end gap-4">
            {/* Signature 1 */}
            <div className="text-center">
              <div className="font-serif italic text-base text-slate-800 font-bold mb-1">
                Dr. Kareem Mansour
              </div>
              <div className="h-0.5 w-32 bg-slate-300 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-slate-700">
                د. كريم منصور
              </div>
              <div className="text-[10px] text-slate-500">
                المشرف الأكاديمي · عمادة تكنولوجيا المعلومات
              </div>
            </div>

            {/* Central QR Code for Instant Verification */}
            <div className="flex flex-col items-center justify-center text-center">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Certificate Verification QR Code"
                  className="w-20 h-20 border border-slate-200 p-1 rounded-sm bg-white shadow-xs"
                />
              )}
              <span className="text-[9px] font-mono text-slate-400 mt-1">
                Scan to Verify Authenticity
              </span>
            </div>

            {/* Signature 2 */}
            <div className="text-center">
              <div className="font-serif italic text-base text-slate-800 font-bold mb-1">
                Mariam Al-Ghamdi
              </div>
              <div className="h-0.5 w-32 bg-slate-300 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-slate-700">
                مريم الغامدي
              </div>
              <div className="text-[10px] text-slate-500">
                رئيس نادي مايكروسوفت الطلابي
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
