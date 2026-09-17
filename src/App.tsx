import { useState, useEffect } from 'react';
import { LanguageProvider } from '@/lib/LanguageContext';
import { Header } from '@/components/Header';
import { BottomNav, type Tab } from '@/components/BottomNav';
import { InstallPrompt } from '@/components/InstallPrompt';
import { HomePage } from '@/pages/HomePage';
import { ReportScamPage } from '@/pages/ReportScamPage';
import { RecentScamsPage } from '@/pages/RecentScamsPage';
import { BusinessVerifyPage } from '@/pages/BusinessVerifyPage';
import { AboutPage } from '@/pages/AboutPage';
import { LegalPage } from '@/pages/LegalPage';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showLegal, setShowLegal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as Tab | null;
    if (tab && ['home', 'report', 'feed', 'business', 'about'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 pb-20">
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'report' && <ReportScamPage />}
          {activeTab === 'feed' && <RecentScamsPage />}
          {activeTab === 'business' && <BusinessVerifyPage />}
          {activeTab === 'about' && !showLegal && <AboutPage onOpenLegal={() => setShowLegal(true)} />}
          {activeTab === 'about' && showLegal && <LegalPage onBack={() => setShowLegal(false)} />}
        </main>
        <InstallPrompt />
        <BottomNav active={activeTab} onChange={handleTabChange} />
      </div>
    </LanguageProvider>
  );
}

export default App;
