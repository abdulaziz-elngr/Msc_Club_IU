import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Globe, Github, Linkedin, Youtube } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useApp();
  const ar = language === 'ar';

  const cols = [
    { title: ar ? 'التعلم والأنشطة' : 'Learning & Activities', links: ['about', 'learning', 'workshops', 'tasks', 'events'] },
    { title: ar ? 'الابتكار والمجتمع' : 'Innovation & Hub', links: ['projects', 'achievements', 'resources', 'news', 'teams'] },
  ];
  const social = [
    { href: 'https://github.com', Icon: Github, title: 'GitHub' },
    { href: 'https://linkedin.com', Icon: Linkedin, title: 'LinkedIn' },
    { href: 'https://youtube.com', Icon: Youtube, title: 'YouTube' },
    { href: 'https://learn.microsoft.com', Icon: Globe, title: 'Microsoft Learn' },
  ];

  return (
    <footer className="relative bg-[#07111f] text-slate-300 pt-14 pb-8 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 flex">
        <span className="flex-1 bg-[#f25022]" /><span className="flex-1 bg-[#7fba00]" /><span className="flex-1 bg-[#00a4ef]" /><span className="flex-1 bg-[#ffb900]" />
      </div>
      <div className="absolute -top-32 end-0 w-96 h-96 rounded-full bg-[#0078d4]/15 blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          <div className="space-y-4 md:col-span-4">
            <Logo size="lg" textColor="text-white" subtitleColor="text-[#4cc2ff]" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">{t.brand.tagline}</p>
            <div className="text-xs text-[#4cc2ff] font-medium">
              {ar ? 'جامعة الابتكار — مجمع التكنولوجيا والذكاء الاصطناعي' : 'Innovation University — Tech & AI Complex'}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="rounded-lg px-3 py-2 flex items-center" style={{ background: "#fff" }}><img src="/brand/iu-logo.png" alt="Innovation University" className="h-7 w-auto" /></div>
              <div className="rounded-lg px-3 py-2 flex items-center" style={{ background: "#fff" }}><img src="/brand/microsoft-logo.png" alt="Microsoft" className="h-7 w-auto" /></div>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{c.title}</h4>
              <ul className="space-y-2.5 text-xs">
                {c.links.map((id) => (
                  <li key={id}>
                    <button onClick={() => onNavigate(id)} className="text-slate-400 hover:text-white hover:translate-x-0.5 rtl:hover:-translate-x-0.5 transition-all">{(t.nav as any)[id]}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{ar ? 'المجتمع والشبكات التقنية' : 'Community & Social'}</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {ar ? 'تابع أحدث المحاضرات والمسابقات عبر حساباتنا الرسمية.' : 'Follow our verified student channels for masterclasses & hackathons.'}
            </p>
            <div className="flex items-center gap-2.5">
              {social.map(({ href, Icon, title }) => (
                <a key={title} href={href} target="_blank" rel="noreferrer" title={title}
                  className="p-2.5 bg-white/5 hover:bg-[#0078d4] text-slate-300 hover:text-white rounded-lg border border-white/10 transition-all hover:-translate-y-0.5">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => onNavigate('join')} className="px-4 py-2 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-lg transition-colors">{t.nav.join}</button>
              <button onClick={() => onNavigate('contact')} className="px-4 py-2 text-xs font-semibold text-slate-200 border border-white/15 hover:bg-white/10 rounded-lg transition-colors">{t.nav.contact}</button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>© {new Date().getFullYear()} Microsoft Student Clubs — Innovation University. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <span>Microsoft Learn Student Ambassadors Community Partner</span>
            <span aria-hidden="true">·</span>
            <span>{ar ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
