import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Logo } from './Logo';
import { Globe, Bell, Award, ChevronDown, Menu, X, Sparkles, Sun, Moon, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { language, setLanguage, t, currentRole, setCurrentRole, currentUser, notifications, theme, toggleTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = () => { setMoreOpen(false); setRoleOpen(false); };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const roles: { role: Role; label: string }[] = [
    { role: 'STUDENT', label: t.roles.STUDENT },
    { role: 'TEAM_LEAD', label: t.roles.TEAM_LEAD },
    { role: 'ADMIN', label: t.roles.ADMIN },
  ];
  const primaryLinks = [
    { id: 'home', label: t.nav.home },
    { id: 'about', label: t.nav.about },
    { id: 'learning', label: t.nav.learning },
    { id: 'workshops', label: t.nav.workshops },
    { id: 'tasks', label: t.nav.tasks },
    { id: 'events', label: t.nav.events },
    { id: 'projects', label: t.nav.projects },
  ];
  const secondaryLinks = [
    { id: 'achievements', label: t.nav.achievements },
    { id: 'resources', label: t.nav.resources },
    { id: 'news', label: t.nav.news },
    { id: 'certificates', label: t.nav.certificates },
    { id: 'leaderboard', label: t.nav.leaderboard },
    { id: 'teams', label: t.nav.teams },
    { id: 'contact', label: t.nav.contact ?? (language === 'ar' ? 'تواصل معنا' : 'Contact') },
  ];
  const allNavLinks = [...primaryLinks, ...secondaryLinks];
  const iconBtn = 'p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors';

  return (
    <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-slate-200/80 shadow-[0_8px_30px_-18px_rgba(0,0,0,.25)]' : 'bg-white/60 backdrop-blur-md border-transparent'} dark:!bg-[#0a1220]/80`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button onClick={() => onNavigate('home')} className="cursor-pointer shrink-0" aria-label="Home">
            <Logo size="md" />
          </button>

          <nav className="hidden xl:flex items-center gap-0.5 text-[13px] font-medium text-slate-600">
            {primaryLinks.map((link) => {
              const active = currentView === link.id;
              return (
                <button key={link.id} onClick={() => onNavigate(link.id)} className={`relative px-2.5 py-2 rounded-lg whitespace-nowrap transition-colors ${active ? 'text-[#0078d4] font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'}`}>
                  {link.label}
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[#0078d4]" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                </button>
              );
            })}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setMoreOpen(!moreOpen); setRoleOpen(false); }} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <span>{language === 'ar' ? 'المزيد' : 'More'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .15 }}
                    className={`absolute ${language === 'ar' ? 'right-0' : 'left-0'} mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50`}>
                    {secondaryLinks.map((link) => (
                      <button key={link.id} onClick={() => { onNavigate(link.id); setMoreOpen(false); }}
                        className={`w-full text-start px-3 py-2 text-xs rounded-lg transition-colors ${currentView === link.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>
                        {link.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="تغيير اللغة / Switch Language">
              <Globe className="w-3.5 h-3.5 text-[#0078d4]" />
              <span className="hidden sm:inline">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button onClick={toggleTheme} className={iconBtn} aria-label="Toggle theme" title={theme === 'dark' ? 'Light' : 'Dark'}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .18 }} className="block">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </button>

            <div className="relative hidden md:block xl:hidden 2xl:block" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setRoleOpen(!roleOpen); setMoreOpen(false); }} className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors" title={t.roles.viewingAs}>
                <span className="font-bold text-[#0078d4]">{currentRole === 'STUDENT' ? t.roles.STUDENT : currentRole === 'TEAM_LEAD' ? t.roles.TEAM_LEAD : t.roles.ADMIN}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              <AnimatePresence>
                {roleOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .15 }}
                    className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50`}>
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t.roles.viewingAs}</div>
                    {roles.map((r) => (
                      <button key={r.role} onClick={() => { setCurrentRole(r.role); setRoleOpen(false); }}
                        className={`w-full text-start px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${currentRole === r.role ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                        <span>{r.label}</span>
                        {currentRole === r.role && <span>✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => onNavigate('login')} className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              Sign in
            </button>

            <button onClick={() => onNavigate('notifications')} className={`relative hidden sm:block ${iconBtn}`} title={t.notifications.title}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 end-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0078d4]" />
                </span>
              )}
            </button>

            {currentRole === 'ADMIN' ? (
              <button onClick={() => onNavigate('admin')} className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0078d4] to-[#106ebe] hover:brightness-110 rounded-lg transition shadow-md shadow-blue-500/25 whitespace-nowrap">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.nav.admin}</span>
              </button>
            ) : (
              <button onClick={() => onNavigate('dashboard')} className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0078d4] to-[#106ebe] hover:brightness-110 rounded-lg transition shadow-md shadow-blue-500/25 whitespace-nowrap">
                <Award className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{currentUser.name.split(' ')[0]}</span>
                <span className="text-blue-100 hidden sm:inline">({currentUser.xp} XP)</span>
              </button>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`xl:hidden ${iconBtn}`} aria-label="Menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[2px] pointer-events-none">
        <div className="h-full bg-gradient-to-r from-[#f25022] via-[#7fba00] to-[#00a4ef] origin-left rtl:origin-right" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}
            className="xl:hidden overflow-hidden border-t border-slate-200 bg-white">
            <div className="px-4 pt-2 pb-4 space-y-1 max-h-[75vh] overflow-y-auto">
              {allNavLinks.map((link) => (
                <button key={link.id} onClick={() => { onNavigate(link.id); setMobileMenuOpen(false); }}
                  className={`block w-full text-start px-3 py-2.5 text-sm font-medium rounded-lg ${currentView === link.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {link.label}
                </button>
              ))}
              <div className="sm:hidden grid grid-cols-2 gap-2 pt-2">
                <button onClick={() => { onNavigate(currentRole === 'ADMIN' ? 'admin' : 'dashboard'); setMobileMenuOpen(false); }} className="px-3 py-2.5 text-xs font-bold text-white bg-[#0078d4] rounded-lg">{currentRole === 'ADMIN' ? t.nav.admin : `${currentUser.name.split(' ')[0]} · ${currentUser.xp} XP`}</button>
                <button onClick={() => { onNavigate('notifications'); setMobileMenuOpen(false); }} className="px-3 py-2.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg">{t.notifications.title}{unreadCount > 0 ? ` (${unreadCount})` : ''}</button>
              </div>
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                {roles.map((r) => (
                  <button key={r.role} onClick={() => setCurrentRole(r.role)} className={`px-3 py-1.5 text-xs rounded-lg border ${currentRole === r.role ? 'bg-[#0078d4] text-white border-[#0078d4]' : 'border-slate-200 text-slate-700'}`}>{r.label}</button>
                ))}
                <button onClick={() => { onNavigate('join'); setMobileMenuOpen(false); }} className="ms-auto flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#0078d4]">
                  <Sparkles className="w-4 h-4" /><span>{t.nav.join}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
