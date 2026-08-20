import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  LayoutDashboard, 
  Wallet, 
  Cpu, 
  TrendingUp, 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  User as UserIcon, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  LogOut,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  currentTab, 
  onSelectTab, 
  children 
}) => {
  const { currentUser, wallet, kcRate, setCurrentRoute, logout } = useApp();

  const navItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'carteira', label: 'Minha Carteira', icon: Wallet },
    { id: 'investimentos', label: 'Investimentos', icon: Cpu, badge: '6.000 AOA' },
    { id: 'ganhos', label: 'Ganhos & Mineração', icon: TrendingUp },
    { id: 'kwanzacoin', label: 'KwanzaCoin (KC)', icon: Coins, highlight: true },
    { id: 'depositar', label: 'Depositar', icon: ArrowDownLeft },
    { id: 'levantar', label: 'Levantar Dinheiro', icon: ArrowUpRight },
    { id: 'historico', label: 'Histórico Completo', icon: Clock },
    { id: 'kyc', label: 'Verificação KYC', icon: ShieldCheck },
    { id: 'perfil', label: 'Perfil & Segurança', icon: UserIcon },
    { id: 'suporte', label: 'Apoio ao Cliente', icon: HelpCircle },
  ];

  const isKycApproved = currentUser?.kycStatus === 'approved';
  const isPremium = currentUser?.membershipLevel === 'premium';

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col lg:flex-row">
      {/* Sidebar on Desktop */}
      <aside className="w-full lg:w-64 bg-[#071A3A] text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* User quick profile banner */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1769D1] to-amber-500 flex items-center justify-center font-bold text-white shadow-md">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs text-slate-400 font-medium">Investidor</div>
                <div className="text-sm font-bold text-white truncate">{currentUser?.name}</div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 mt-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                isPremium ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {isPremium ? '★ MEMBRO VIP' : 'CONTA NORMAL'}
              </span>

              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                isKycApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isKycApproved ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {isKycApproved ? 'KYC VERIFICADO' : 'KYC PENDENTE'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#1769D1] text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cotação KC:</span>
            <strong className="text-amber-400">1 KC = {kcRate.rateAoa} AOA</strong>
          </div>

          {currentUser?.role === 'superadmin' && (
            <button
              onClick={() => setCurrentRoute('/admin')}
              className="w-full py-2 px-3 rounded-lg bg-blue-950 text-cyan-300 hover:bg-blue-900 text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-800 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Aceder ao Painel Admin</span>
            </button>
          )}

          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};
