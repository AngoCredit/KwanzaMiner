import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { Toast } from './components/layout/Toast.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { PhonePromptModal } from './components/auth/PhonePromptModal.tsx';
import { CommunityChat } from './components/common/CommunityChat.tsx';
import { api } from './lib/api.ts';


// Public pages
import { LandingPage } from './components/public/LandingPage.tsx';
import { 
  PlansPage, 
  TokenomicsPage, 
  HowItWorksPage, 
  FaqPage, 
  AboutPage, 
  LegalPages 
} from './components/public/PublicSubpages.tsx';

// Dashboard components
import { DashboardLayout } from './components/dashboard/DashboardLayout.tsx';
import { OverviewTab } from './components/dashboard/OverviewTab.tsx';
import { WalletTab } from './components/dashboard/WalletTab.tsx';
import { InvestmentsTab } from './components/dashboard/InvestmentsTab.tsx';
import { KwanzaCoinTab } from './components/dashboard/KwanzaCoinTab.tsx';
import { DepositTab } from './components/dashboard/DepositTab.tsx';
import { WithdrawTab } from './components/dashboard/WithdrawTab.tsx';
import { HistoryTab } from './components/dashboard/HistoryTab.tsx';
import { KycTab } from './components/dashboard/KycTab.tsx';
import { ProfileTab } from './components/dashboard/ProfileTab.tsx';
import { SupportTab } from './components/dashboard/SupportTab.tsx';
import { ReferralTab } from './components/dashboard/ReferralTab.tsx';

// Admin dashboard
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';

const AppContent: React.FC = () => {
  const { currentRoute, setCurrentRoute, currentUser, setAuthModalOpen, setAuthMode, showToast, refreshAll } = useApp();
  const [dashboardTab, setDashboardTab] = useState<string>('visao-geral');

  // Check if current user is missing phone number for manual verification (Google user)
  const isMissingPhone = Boolean(
    currentUser &&
    currentUser.email.toLowerCase() !== 'bytekwanza@gmail.com' &&
    currentUser.role !== 'superadmin' &&
    (!currentUser.phone || currentUser.phone === '+244 923 000 000')
  );

  const handlePhoneSubmit = async (phone: string) => {
    if (!currentUser) return;
    const res = await api.updatePhone(currentUser.id, phone);
    if (res.success && res.user) {
      showToast('Número de telemóvel registado com sucesso! A sua conta foi enviada para validação manual.', 'success');
      await refreshAll();
    }
  };

  // Handle route-specific dashboard tab navigation
  const handleNavigateDashboard = (tab: string) => {
    setDashboardTab(tab);
    if (!currentRoute.startsWith('/dashboard')) {
      setCurrentRoute('/dashboard');
    }
  };

  // Render Admin View if on /admin
  if (currentRoute === '/admin') {
    return (
      <>
        <AdminDashboard />
        <CommunityChat />
        <Toast />
        <AuthModal />
      </>
    );
  }

  // Render Investor Dashboard if on /dashboard
  if (currentRoute.startsWith('/dashboard')) {
    // If the logged in user is the admin (bytekwanza@gmail.com / superadmin), direct them to /admin exclusively
    if (currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.email.toLowerCase() === 'bytekwanza@gmail.com')) {
      setCurrentRoute('/admin');
      return null;
    }

    if (!currentUser) {
      return (
        <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-between">
          <Navbar />
          <div className="max-w-md mx-auto my-auto p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Autenticação Necessária</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Por favor faça login ou crie uma conta de investidor para aceder ao seu dashboard de mineração.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-[#1769D1] text-white font-bold text-xs shadow-md"
              >
                Entrar na Conta
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Criar Conta Gratuita
              </button>
            </div>
          </div>
          <Footer />
          <Toast />
          <AuthModal />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-between">
        <Navbar />
        <DashboardLayout currentTab={dashboardTab} onSelectTab={setDashboardTab}>
          {dashboardTab === 'visao-geral' && <OverviewTab onNavigate={handleNavigateDashboard} />}
          {dashboardTab === 'carteira' && <WalletTab onNavigate={handleNavigateDashboard} />}
          {dashboardTab === 'investimentos' && <InvestmentsTab onNavigate={handleNavigateDashboard} />}
          {dashboardTab === 'ganhos' && <OverviewTab onNavigate={handleNavigateDashboard} />}
          {dashboardTab === 'kwanzacoin' && <KwanzaCoinTab onNavigate={handleNavigateDashboard} />}
          {dashboardTab === 'afiliados' && <ReferralTab />}
          {dashboardTab === 'depositar' && <DepositTab onNavigate={handleNavigateDashboard} />}
          {dashboardTab === 'levantar' && <WithdrawTab onNavigate={handleNavigateDashboard} />}
          {dashboardTab === 'historico' && <HistoryTab />}
          {dashboardTab === 'kyc' && <KycTab />}
          {dashboardTab === 'perfil' && <ProfileTab />}
          {dashboardTab === 'suporte' && <SupportTab />}
        </DashboardLayout>
        <Footer />
        <CommunityChat />
        <Toast />
        <AuthModal />
        <PhonePromptModal
          isOpen={isMissingPhone}
          userName={currentUser?.name || ''}
          onSubmitPhone={handlePhoneSubmit}
        />
      </div>
    );
  }

  // Render Public Website views
  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {currentRoute === '/' && <LandingPage />}
        {currentRoute === '/planos' && <PlansPage />}
        {currentRoute === '/kwanzacoin' && <TokenomicsPage />}
        {currentRoute === '/como-funciona' && <HowItWorksPage />}
        {currentRoute === '/faq' && <FaqPage />}
        {currentRoute === '/sobre' && <AboutPage />}
        {currentRoute === '/termos' && <LegalPages type="termos" />}
        {currentRoute === '/privacidade' && <LegalPages type="privacidade" />}
        {currentRoute === '/aviso-risco' && <LegalPages type="risco" />}
      </main>

      <Footer />
      <CommunityChat />
      <Toast />
      <AuthModal />
      <PhonePromptModal
        isOpen={isMissingPhone}
        userName={currentUser?.name || ''}
        onSubmitPhone={handlePhoneSubmit}
      />
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
