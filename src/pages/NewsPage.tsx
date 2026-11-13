import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ArticleItem } from '../types';
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  Share2,
  X,
  BookOpen,
} from 'lucide-react';

export const NewsPage: React.FC = () => {
  const { language, t, articles } = useApp();
  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
          {language === 'ar' ? 'الأخبار والمدونة الهندسية' : 'News & Engineering Blog'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ar' ? 'مقالات وأخبار أندية مايكروسوفت' : 'Technical Insights & Club Announcements'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          {language === 'ar'
            ? 'مشاركات هندسية متخصصة يكتبها قادة وطلاب النادي توثق تجاربهم في الذكاء الاصطناعي، السحابة، والهاكاثونات.'
            : 'Engineering writeups and retrospectives authored by student leads documenting architecture, cloud innovations, and hackathon victories.'}
        </p>
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.1 }}
            onClick={() => setActiveArticle(article)}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="h-48 w-full overflow-hidden bg-slate-100">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-blue-700 uppercase">{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{article.publishedAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTimeMinutes} min read</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-700 transition-colors">
                  {language === 'ar' ? article.titleAr : article.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {language === 'ar' ? article.summaryAr : article.summary}
                </p>
              </div>

              {/* Author & Read More */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={article.authorAvatar}
                    alt={article.author}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-slate-900">{article.author}</div>
                    <div className="text-[10px] text-slate-400">{article.authorRole}</div>
                  </div>
                </div>

                <span className="text-blue-700 font-bold flex items-center gap-1">
                  {language === 'ar' ? 'اقرأ المقال' : 'Read Article'}
                  <Arrow className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#123F6E] text-white p-5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {language === 'ar' ? activeArticle.titleAr : activeArticle.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono">
                  <span>{activeArticle.publishedAt}</span>
                  <span>·</span>
                  <span>{activeArticle.readTimeMinutes} min read</span>
                  <span>·</span>
                  <span>By {activeArticle.author}</span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden h-52 w-full bg-slate-100">
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3">
                <p className="font-semibold text-slate-900 text-sm">
                  {language === 'ar' ? activeArticle.summaryAr : activeArticle.summary}
                </p>
                <p>
                  {language === 'ar' ? activeArticle.contentAr : activeArticle.content}
                </p>
                <p className="text-slate-500">
                  {language === 'ar'
                    ? 'في هذا التقرير، نؤكد أن دمج النماذج السحابية مع بنية تحتية مستقرة يمنح الطلاب ميزة تنافسية استثنائية تؤهلهم لسوق العمل العالمي.'
                    : 'In this technical walkthrough, our student engineering leads demonstrate how combining Azure AI with resilient infrastructure enables rapid prototyping and production scale.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
