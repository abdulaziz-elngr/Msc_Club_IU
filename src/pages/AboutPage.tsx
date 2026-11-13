import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import {
  Target,
  Compass,
  Heart,
  Award,
  Users,
  Code,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { language, t, users } = useApp();

  const coreValues = [
    {
      titleEn: 'Engineering Rigor & Quality',
      titleAr: 'الانضباط الهندسي وجودة الكود',
      descEn: 'We adhere to enterprise-grade code standards, security-first patterns, and architectural excellence.',
      descAr: 'نلتزم بأعلى معايير جودة الكود البرمجي، ممارسات الأمان السيبراني، والبنى الهندسية المعيارية.',
      icon: Code,
    },
    {
      titleEn: 'Collaborative Growth',
      titleAr: 'النمو الجماعي وتبادل المعرفة',
      descEn: 'Empowering peers across all academic years through hands-on mentorship and active peer review.',
      descAr: 'تمكين طلاب جميع الفرق الدراسية من خلال التوجيه العملي المباشر ومراجعات الأكواد المشتركة.',
      icon: Users,
    },
    {
      titleEn: 'Real-World Impact',
      titleAr: 'الأثر الواقعي وحل مشكلات المجتمع',
      descEn: 'Building practical solutions that address real campus and community challenges.',
      descAr: 'ابتكار برمجيات وحلول ذكية تعالج تحديات واقعية بالحرم الجامعي وسوق العمل التكنولوجي.',
      icon: Sparkles,
    },
  ];

  const boardMembers = [
    {
      nameEn: 'Dr. Kareem Mansour',
      nameAr: 'د. كريم منصور',
      roleEn: 'Faculty Advisor & Tech Fellow',
      roleAr: 'المشرف الأكاديمي وخبير التقنية',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bioEn: 'Dean of IT and Innovation University faculty liaison with Microsoft.',
      bioAr: 'عميد تكنولوجيا المعلومات وممثل جامعة الابتكار مع مايكروسوفت.',
    },
    {
      nameEn: 'Mariam Al-Ghamdi',
      nameAr: 'مريم الغامدي',
      roleEn: 'Club President & AI Chapter Lead',
      roleAr: 'رئيس النادي وقائدة مسار الذكاء الاصطناعي',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      bioEn: 'Senior CS student, Microsoft Learn Student Ambassador Gold Tier.',
      bioAr: 'طالبة هندسة حاسبات وسفيرة مايكروسوفت للطلبة بالمستوى الذهبي.',
    },
    {
      nameEn: 'Ahmad El-Sayed',
      nameAr: 'أحمد السيد النجار',
      roleEn: 'Vice President & Web Systems Lead',
      roleAr: 'نائب رئيس النادي ومسؤول نظم الويب',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bioEn: 'Lead architect of the unified student platform and hackathon champion.',
      bioAr: 'مهندس البنية البرمجية لمنصة النادي وفائز ببطولات برمجية جامعية.',
    },
    {
      nameEn: 'Sarah Ibrahim',
      nameAr: 'سارة إبراهيم',
      roleEn: 'Cybersecurity & Defense Lead',
      roleAr: 'مسؤولة الأمن السيبراني والدفاع الرقمي',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      bioEn: 'CTF lead researcher, focusing on cloud security and threat hunting.',
      bioAr: 'باحثة أمن سيبراني متخصصة في حماية البنى السحابية وتحليل الهجمات.',
    },
  ];

  return (
    <div className="space-y-16 py-12">
      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs text-center max-w-4xl mx-auto space-y-6"
        >
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ar' ? (
              <>
                عن <span className="text-[#1B6AC4]">أندية مايكروسوفت الطلابية</span> بجامعة الابتكار
              </>
            ) : (
              <>
                About <span className="text-[#1B6AC4]">Microsoft Student Clubs</span> at Innovation University
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {language === 'ar'
              ? 'مجتمع تقني أكاديمي رائد تأسس في جامعة الابتكار لربط الطلاب بأحدث تكنولوجيات مايكروسوفت العالمية، وتقديم التدريب العملي المتقدم في الحوسبة السحابية Azure، الذكاء الاصطناعي، والأمن السيبراني، ومنح الشهادات المعتمدة.'
              : 'A premier academic tech community established at Innovation University to bridge the gap between classroom theory and enterprise software engineering with Microsoft Azure, Generative AI, and Cloud Security.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {language === 'ar' ? 'معتمد رسمياً بالحرم الجامعي' : 'Official University Chapter'}
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {language === 'ar' ? 'شريك مجتمع مايكروسوفت للطلبة' : 'Microsoft Student Partner'}
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {language === 'ar' ? 'شهادات موثقة بالرقم التسلسلي' : 'Cryptographically Verified Credentials'}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Mission & Vision Split Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="fluent-card rounded-2xl p-8 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'ar' ? 'رسالتنا (Mission)' : 'Our Mission'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'إتاحة بيئة تعلم تطبيقية مجانية ومحفزة لكل طالب في جامعة الابتكار، عبر ورش عمل معمقة، وتكليفات برمجية حقيقية، ومعسكرات هاكاثون تنافسية تؤهلهم لقيادة قطاع التكنولوجيا إقليمياً وعالمياً.'
                : 'To democratize access to world-class cloud, AI, and cybersecurity education for every student at Innovation University through hands-on bootcamps, code reviews, and community hackathons.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="fluent-card rounded-2xl p-8 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'ar' ? 'رؤيتنا (Vision)' : 'Our Vision'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'أن تكون جامعة الابتكار الصرح الأكثر تصديراً للكفاءات الهندسية المعتمدة في الشرق الأوسط، والمجتمع الطلابي الأكثر إلهاماً وتأثيراً في ابتكارات الذكاء الاصطناعي والحوسبة السحابية.'
                : 'To be the most impactful, engineering-focused student tech chapter in the region, recognized globally for producing exceptional software engineers and breakthrough student innovators.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {language === 'ar' ? 'قيمنا الجوهرية' : 'Our Core Values'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {language === 'ar' ? 'المبادئ التي توجه كل نشاط وتكليف' : 'Principles Guiding Our Community'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreValues.map((val, idx) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="fluent-card rounded-2xl p-6 shadow-xs space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? val.titleAr : val.titleEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'ar' ? val.descAr : val.descEn}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Leadership Board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {language === 'ar' ? 'مجلس إدارة النادي' : 'Club Leadership Board'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {language === 'ar' ? 'قادة المسارات والمسؤولون الأكاديميون' : 'Dedicated Faculty & Student Chapter Leads'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {boardMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="fluent-card rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div className="h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={member.image}
                  alt={member.nameEn}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? member.nameAr : member.nameEn}
                </h4>
                <div className="text-[11px] font-semibold text-blue-700">
                  {language === 'ar' ? member.roleAr : member.roleEn}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {language === 'ar' ? member.bioAr : member.bioEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
