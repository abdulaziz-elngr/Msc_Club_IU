import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Download,
  Search,
  FileCode,
  FolderArchive,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { language, t, resources, downloadResource } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const categories = ['all', 'AZURE', 'AI', 'WEB', 'SECURITY'];

  const filtered = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.titleAr.includes(searchQuery) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || res.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDownload = (resId: string, title: string) => {
    downloadResource(resId);
    setDownloadToast(
      language === 'ar' ? `بدء تحميل: ${title}` : `Downloading: ${title}`
    );
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'ZIP':
        return <FolderArchive className="w-5 h-5 text-amber-500" />;
      case 'CODE':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
          {language === 'ar' ? 'مكتبة المصادر والمراجع' : 'Knowledge & Resource Repository'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ar' ? 'ملفات ومراجع ودلائل المذاكرة' : 'Study Guides, Blueprints & Toolkits'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          {language === 'ar'
            ? 'ملخصات امتحانات مايكروسوفت، قوالب الأكواد البرمجية، وقوائم التحقق الأمنية الجاهزة للتحميل مجاناً.'
            : 'Download official certification cheat sheets, production architecture blueprints, and security checklists.'}
        </p>
      </motion.div>

      {/* Toast Alert */}
      {downloadToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg flex items-center gap-2 max-w-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? t.common.all : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common.search}
            className="w-full ps-9 pe-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  {getFileIcon(item.fileType)}
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item.fileType} · {item.fileSize}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'ar' ? item.titleAr : item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {language === 'ar' ? item.descriptionAr : item.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] font-mono">
                {item.downloadsCount} {language === 'ar' ? 'تحميل' : 'downloads'}
              </span>

              <button
                onClick={() =>
                  handleDownload(item.id, language === 'ar' ? item.titleAr : item.title)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.common.download}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
