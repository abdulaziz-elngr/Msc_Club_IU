import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'motion/react';
import { PartnerLogo } from '../components/Logo';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Code,
  Trophy,
} from 'lucide-react';

const Counter: React.FC<{ to: number }> = ({ to }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref} dir="ltr">{v.toLocaleString('en-US')}</span>;
};

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: .6, delay, ease: [0.16, 1, 0.3, 1] }}>
    {children}
  </motion.div>
);

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { language, t, tracks, events, users, testimonials, projects, achievements } = useApp();
  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;

  const topStudents = [...users]
    .filter((u) => u.leaderboardVisible)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3);

  const featuredEvents = events.slice(0, 2);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden mesh-hero text-white -mt-16 pt-16">
        <div className="absolute inset-0 ms-grid-bg pointer-events-none" />
        <motion.div animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-24 end-[8%] w-16 h-16 rounded-2xl bg-[#f25022]/30 border border-white/10 backdrop-blur-sm hidden lg:block" />
        <motion.div animate={{ y: [0, 16, 0], rotate: [0, -8, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-24 start-[6%] w-12 h-12 rounded-xl bg-[#7fba00]/30 border border-white/10 backdrop-blur-sm hidden lg:block" />
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/2 start-[44%] w-10 h-10 rounded-lg bg-[#ffb900]/30 border border-white/10 backdrop-blur-sm hidden lg:block" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-7">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}
                className="inline-flex flex-wrap items-center gap-3 px-3 py-2 rounded-full bg-white/8 border border-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7fba00] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#7fba00]" /></span>
                <span>{language === 'ar' ? 'المنصة الرسمية المعتمدة لجامعة الابتكار' : 'Official Innovation University Chapter'}</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                {(language === 'ar' ? ['نبتكر', 'اليوم', 'لنقود'] : ['Innovate', 'Today,', 'Lead', 'the']).map((w, i) => (
                  <motion.span key={w + i} initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: .15 + i * .1, duration: .6, ease: [0.16, 1, 0.3, 1] }} className="inline-block me-3">{w}</motion.span>
                ))}
                <motion.span initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: .6, duration: .7 }} className="inline-block text-shimmer">
                  {language === 'ar' ? 'مستقبل التكنولوجيا' : 'Tech Future'}
                </motion.span>
              </h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .8, duration: .8 }} className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {t.brand.tagline}. {language === 'ar' ? 'تعلم بنية السحابة والذكاء الاصطناعي مع مهندسي مايكروسوفت، وشارك في الهاكاثونات، واحصل على شهادات موثقة برقم تسلسلي معتمد.' : 'Learn cloud architecture, agentic AI, build production tasks, and receive verified credentials.'}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: .6 }} className="flex flex-wrap items-center gap-3 pt-1">
                <button onClick={() => onNavigate('learning')} className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#0078d4] hover:bg-[#1a8cff] rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-0.5">
                  <span>{t.learning.title}</span><Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </button>
                <button onClick={() => onNavigate('join')} className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-xl transition-all hover:-translate-y-0.5">
                  <Sparkles className="w-4 h-4 text-[#ffb900]" /><span>{t.nav.join}</span>
                </button>
                <button onClick={() => onNavigate('verify')} className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4 text-[#7fba00]" /><span>{t.certificates.verifyTitle}</span>
                </button>
              </motion.div>

              <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { n: 540, suf: '+', l: language === 'ar' ? 'طالب نشط' : 'Active Students' },
                  { n: 48, suf: '+', l: language === 'ar' ? 'ورشة ومعسكر' : 'Workshops & Bootcamps' },
                  { n: 12800, suf: '', l: language === 'ar' ? 'ساعة تعلم' : 'Learning Hours' },
                  { n: 340, suf: '+', l: language === 'ar' ? 'شهادة معتمدة' : 'Issued Credentials' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums"><span dir="ltr" className="inline-flex"><Counter to={s.n} />{s.suf}</span></div>
                    <div className="text-xs text-slate-400 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: .92, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .3, duration: .9, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-5 relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#0078d4]/40 via-transparent to-[#7fba00]/30 blur-2xl rounded-[2rem]" />
              <div className="relative animate-float">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[16/11]">
                  <img src="/src/assets/images/msc_hero_community_1794505303540.jpg" alt="Innovation Lab students at Microsoft Student Clubs" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end p-5">
                    <div className="text-xs text-white space-y-0.5">
                      <span className="font-bold block">{language === 'ar' ? 'مختبر الابتكار الطلابي — جامعة الابتكار' : 'Student Innovation Lab — Innovation University'}</span>
                      <span className="text-slate-300 text-[11px]">{language === 'ar' ? 'معسكر الحوسبة السحابية وهندسة الذكاء الاصطناعي 2026' : 'Azure Cloud & Generative AI Bootcamp'}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-5 -start-5 bg-white/95 dark:bg-[#111b2e]/95 backdrop-blur rounded-2xl p-3 shadow-xl flex items-center gap-3 border border-white/30">
                  <img src="/brand/msc-emblem.png" alt="MSC" className="w-11 h-11" />
                  <div className="text-slate-900 dark:text-white"><div className="text-xs font-extrabold">Microsoft Student Clubs</div><div className="text-[10px] text-slate-500">Innovation University</div></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner strip */}
      <section className="max-w-5xl mx-auto px-4">
        <Reveal>
          <div className="fluent-card rounded-2xl px-6 py-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{language === 'ar' ? 'بالشراكة مع' : 'In partnership with'}</span>
            <PartnerLogo which="iu" className="h-9" />
            <span className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/10" />
            <PartnerLogo which="ms" className="h-10" />
          </div>
        </Reveal>
      </section>

      {/* Section 2: Technical Tracks Showcase */}
      <Reveal><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
              {t.learning.tracks}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.learning.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {t.learning.subtitle}
            </p>
          </div>
          <button
            onClick={() => onNavigate('learning')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors shrink-0"
          >
            <span>{language === 'ar' ? 'استعراض كافة المسارات والدورات' : 'Explore All Tracks & Courses'}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => onNavigate('learning', track.slug)}
              className="fluent-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 start-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-slate-800">
                  {track.level}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {language === 'ar' ? track.titleAr : track.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {language === 'ar' ? track.summaryAr : track.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {track.courseCount} {t.learning.courses}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {track.totalHours} {t.common.hours}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section></Reveal>

      {/* Section 3: Featured Upcoming Events & Workshops */}
      <Reveal><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/70 border border-slate-200 rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
                {t.events.upcoming}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t.events.title}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors shrink-0"
            >
              <span>{language === 'ar' ? 'جميع الفعاليات وحجز التذاكر' : 'View All Events'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredEvents.map((event) => (
              <div
                key={event.id}
                className="fluent-card rounded-2xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-blue-700 uppercase">{event.category}</span>
                    <span className="font-mono tabular-nums">{event.startsAt.split('T')[0]}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'ar' ? event.titleAr : event.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {language === 'ar' ? event.summaryAr : event.summary}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {t.events.speaker} <strong>{language === 'ar' ? event.speakerAr : event.speaker}</strong>
                    </span>
                    <span className="font-bold text-amber-600">+{event.xpReward} XP</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-500">
                      {event.capacity - event.registeredCount} {language === 'ar' ? 'مقعد متاح' : 'seats left'}
                    </div>

                    <button
                      onClick={() => onNavigate('events')}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md transition-colors"
                    >
                      {t.events.register}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section></Reveal>

      {/* Section 4: Leaderboard Standings Preview & Gamification */}
      <Reveal><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              {t.gamification.title}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'ar' ? 'تنافس، تعلم، وارتقِ بمستوى مهاراتك' : 'Compete, Learn, and Level Up'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.gamification.subtitle}
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'نقاط فورية لكل درس مكتمل ومهمة معتمدة' : 'Instant XP for each completed lesson & task'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'أوسمة رسمية تضاف لملفك الجامعي' : 'Official badges added to your university profile'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'فرص تدريب ورعاية للمتميزين في لوحة الشرف' : 'Internship nominations for top performers'}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('leaderboard')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mt-2"
            >
              <span>{t.gamification.leaderboard}</span>
              <Arrow className="w-4 h-4" />
            </button>
          </div>

          {/* Top 3 Leaderboard Cards */}
          <div className="lg:col-span-7 fluent-card rounded-2xl p-6 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'ar' ? 'المتصدرون هذا الفصل الدراسي' : 'Current Semester Top Performers'}
            </div>

            {topStudents.map((student, idx) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : 'bg-amber-700/30 text-amber-900'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {language === 'ar' ? student.nameAr : student.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {language === 'ar' ? student.facultyAr : student.faculty}
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <div className="text-xs font-bold font-mono text-blue-800">
                    {student.xp} XP
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t.common.level} {student.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section></Reveal>

      {/* Section: Featured Student Projects */}
      <Reveal><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
              {t.nav.projects}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {language === 'ar' ? 'ابتكارات برمجية بأيدي طلاب النادي' : 'Featured Student Projects & Systems'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors shrink-0"
          >
            <span>{language === 'ar' ? 'استعراض كافة المشاريع' : 'Explore All Projects'}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((proj) => (
            <div
              key={proj.id}
              onClick={() => onNavigate('projects')}
              className="fluent-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={proj.coverImage}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {proj.technologies.slice(0, 2).map((t, i) => (
                      <span key={i} className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {language === 'ar' ? proj.titleAr : proj.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {language === 'ar' ? proj.descriptionAr : proj.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs font-bold text-blue-700 flex items-center justify-between">
                  <span>{language === 'ar' ? 'تفاصيل المشروع' : 'View System Details'}</span>
                  <Arrow className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section></Reveal>

      {/* Section 5: Student Testimonials */}
      <Reveal><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {language === 'ar' ? 'قصص نجاح الطلاب' : 'Student Success Stories'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {language === 'ar' ? 'أثر النادي في المسيرة المهنية لطلاب جامعة الابتكار' : 'Impact on Student Engineering Careers'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="fluent-card rounded-2xl p-6 flex flex-col justify-between space-y-4"
            >
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "{language === 'ar' ? test.quoteAr : test.quote}"
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  src={test.avatarUrl}
                  alt={test.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? test.authorNameAr : test.authorName}
                  </h4>
                  <div className="text-[11px] text-blue-700 font-medium">
                    {language === 'ar' ? test.roleAr : test.role}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'ar' ? test.facultyAr : test.faculty}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section></Reveal>

      {/* Section 6: Join CTA Banner */}
      <Reveal><section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mesh-hero rounded-3xl p-10 sm:p-16 text-white text-center space-y-4 relative overflow-hidden"><div className="absolute inset-0 ms-grid-bg pointer-events-none" /><img src="/brand/msc-emblem.png" alt="" className="mx-auto w-14 h-14 relative" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.join.title}
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl mx-auto leading-relaxed">
            {t.join.subtitle}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('join')}
              className="px-6 py-3 text-xs sm:text-sm font-bold text-[#0b3a6b] bg-white hover:bg-blue-50 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 relative"
            >
              {t.join.submitApplication}
            </button>
          </div>
        </div>
      </section></Reveal>
    </div>
  );
};
