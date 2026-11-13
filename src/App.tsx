import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CelebrationModal } from './components/CelebrationModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { LearningPage } from './pages/LearningPage';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { TasksPage } from './pages/TasksPage';
import { EventsPage } from './pages/EventsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { NewsPage } from './pages/NewsPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { TeamsPage } from './pages/TeamsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPortal } from './pages/AdminPortal';
import { JoinPage, ContactPage } from './pages/JoinAndContactPages';
import { NotificationsPage } from './pages/NotificationsPage';
import { LoginPage } from './pages/LoginPage';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Synchronize hash routing (e.g. #verify-MSC-IU-2026-8841)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('verify-')) {
        const code = hash.replace('verify-', '');
        setCurrentView('certificates');
        setViewParam(code);
      } else if (hash) {
        setCurrentView(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage />;
      case 'learning':
        return <LearningPage initialTrackSlug={viewParam} onNavigate={handleNavigate} />;
      case 'workshops':
        return <WorkshopsPage />;
      case 'tasks':
        return <TasksPage onNavigate={handleNavigate} />;
      case 'events':
        return <EventsPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'news':
        return <NewsPage />;
      case 'certificates':
      case 'verify':
        return <CertificatesPage initialCode={viewParam} />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'teams':
        return <TeamsPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPortal />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'join':
        return <JoinPage />;
      case 'contact':
        return <ContactPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (viewParam || '')}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer onNavigate={handleNavigate} />
      <CelebrationModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
