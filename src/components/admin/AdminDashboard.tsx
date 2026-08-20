import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { AdminUsersTab } from './AdminUsersTab.tsx';
import { AdminDepositsTab } from './AdminDepositsTab.tsx';
import { AdminWithdrawalsTab } from './AdminWithdrawalsTab.tsx';
import { AdminKycTab } from './AdminKycTab.tsx';
import { AdminPlansTab } from './AdminPlansTab.tsx';
import { AdminAuditTab } from './AdminAuditTab.tsx';
import { AdminSettingsTab } from './AdminSettingsTab.tsx';

import { 
  LayoutDashboard, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  Cpu, 
  Coins, 
  FileText, 
  ArrowLeft,
  RefreshCw,
  Key,
  Sliders,
  Bell
} from 'lucide-react';

interface EBState { hasError: boolean; error: string }
class AdminErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
  declare state: EBState;
  constructor(props: { children: React.ReactNode }) {
    super(props);
    (this as any).state = { hasError: false, error: '' } as EBState;
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error: error?.message || String(error) };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AdminDashboard] Rendering crash:', error, info);
  }
  render() {
    const { hasError, error } = (this as any).state as EBState;
    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <div className="bg-slate-900 border border-red-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-4">
            <div className="text-red-400 text-4xl">⚠️</div>
            <h2 className="text-white text-xl font-black">Erro no Painel Admin</h2>
            <p className="text-slate-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#1769D1] hover:bg-blue-600 text-white font-bold rounded-xl text-sm"
            >
              Recarregar Painel
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const AdminDashboardInner: React.FC = () => {
  const { 
    currentUser, 
    setCurrentRoute, 
    showToast, 
    kcRate, 
    refreshAll, 
    triggerConfetti
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'deposits' | 'withdrawals' | 'kyc' | 'users' | 'plans' | 'tokenomics' | 'audit' | 'settings'
  >('overview');

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allDeposits, setAllDeposits] = useState<any[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tokenomics Form
  const totalApprovedDepositsAoa = (allDeposits || [])
    .filter((d) => d.status === 'approved' || d.status === 'completed')
    .reduce((acc, d) => acc + (Number(d.amount) || Number(d.amountAoa) || 0), 0);

  const totalPaidWithdrawalsAoa = (allWithdrawals || [])
    .filter((w) => w.status === 'paid' || w.status === 'approved' || w.status === 'completed')
    .reduce((acc, w) => acc + (Number(w.amount) || Number(w.amountAoa) || 0), 0);

  const realKwanzaCoinInCirculation = (allUsers || []).reduce(
    (acc, u) => acc + (Number(u.wallet?.kwanzaCoinBalance) || Number(u.kwanzaCoinBalance) || 0),
    0
  );

  const realHashrate = (allUsers || []).reduce(
    (acc, u) => acc + (Number(u.wallet?.miningMultiplier ? u.wallet.miningMultiplier * 12.5 : 0) || Number(u.hashrate) || 0),
    0
  );

  const stats = {
    totalInvestedAoa: totalApprovedDepositsAoa,
    activeInvestmentsCount: (allPlans || []).filter((p) => p.status === 'active' || p.active).length,
    totalWithdrawnAoa: totalPaidWithdrawalsAoa,
    processedWithdrawalsCount: (allWithdrawals || []).filter((w) => w.status === 'paid' || w.status === 'approved' || w.status === 'completed').length,
    kwanzaCoinInCirculation: realKwanzaCoinInCirculation,
    totalMiningHashrateGh: realHashrate,
  };

  const calculatedTreasury = kcRate?.treasuryBackingAoa && kcRate.treasuryBackingAoa > 0
    ? kcRate.treasuryBackingAoa
    : Math.max(0, totalApprovedDepositsAoa - totalPaidWithdrawalsAoa);

  const [rateInput, setRateInput] = useState<number>(kcRate?.rateAoa || 100);
  const [treasuryInput, setTreasuryInput] = useState<number>(calculatedTreasury);
  const [change24hInput, setChange24hInput] = useState<number>(kcRate?.change24h || 0);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  useEffect(() => {
    if (kcRate) {
      if (kcRate.rateAoa) setRateInput(kcRate.rateAoa);
      if (kcRate.change24h !== undefined) setChange24hInput(kcRate.change24h);
      if (kcRate.treasuryBackingAoa && kcRate.treasuryBackingAoa > 0) {
        setTreasuryInput(kcRate.treasuryBackingAoa);
      } else {
        setTreasuryInput(calculatedTreasury);
      }
    }
  }, [kcRate, calculatedTreasury]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [uRes, dRes, wRes, pRes] = await Promise.allSettled([
        api.getAllUsers(),
        api.getAllDeposits(),
        api.getAllWithdrawals(),
        api.getPlans()
      ]);

      if (uRes.status === 'fulfilled' && uRes.value) {
        const val = uRes.value;
        setAllUsers(Array.isArray(val) ? val : (val.users || val.data || []));
      }
      if (dRes.status === 'fulfilled' && dRes.value) {
        const val = dRes.value;
        setAllDeposits(Array.isArray(val) ? val : (val.deposits || val.data || []));
      }
      if (wRes.status === 'fulfilled' && wRes.value) {
        const val = wRes.value;
        setAllWithdrawals(Array.isArray(val) ? val : (val.withdrawals || val.data || []));
      }
      if (pRes.status === 'fulfilled' && pRes.value) {
        const val = pRes.value;
        setAllPlans(Array.isArray(val) ? val : (val.plans || val.data || []));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateKcRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingRate(true);
    try {
      await api.adminUpdateKcRate(rateInput, treasuryInput, change24hInput);
      triggerConfetti();
      showToast(`Cotação do KwanzaCoin atualizada para ${rateInput} AOA!`, 'success');
      refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar cotação', 'error');
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const pendingDepositsCount = allDeposits.filter((d) => d.status === 'pending').length;
  const pendingWithdrawalsCount = allWithdrawals.filter((w) => w.status === 'pending' || w.status === 'processing').length;
  const pendingKycCount = allUsers.filter((u) => u.role === 'user' && (u.kycStatus === 'in_review' || u.kycStatus === 'pending')).length;


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentRoute('/')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Voltar à Plataforma Principais"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <BrandLogo />
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-800/60 rounded-full text-amber-300 text-xs font-bold font-mono">
              <Key className="w-3.5 h-3.5" />
              <span>PAINEL DE AUTONOMIA TOTAL SUPERADMIN</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadAdminData();
                refreshAll();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Atualizar Dados"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#1769D1]' : ''}`} />
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{currentUser?.name || 'Administrador'}</div>
              <div className="text-[10px] text-slate-400 font-mono">{currentUser?.email}</div>
            </div>

            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-amber-500"
            />
          </div>
        </div>
      </header>

      {/* Navigation Sub-Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveAdminTab('overview')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'overview'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Métricas Globais</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'users'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestão Utilizadores</span>
            <span className="px-1.5 py-0.2 bg-slate-950 text-cyan-400 text-[10px] rounded-full font-mono">
              {allUsers.filter(u => u.role === 'user').length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('deposits')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'deposits'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Depósitos</span>
            {pendingDepositsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full animate-bounce">
                {pendingDepositsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('withdrawals')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'withdrawals'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>Saques & Tesouraria</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('kyc')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'kyc'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Validação KYC</span>
            {pendingKycCount > 0 && (
              <span className="px-1.5 py-0.2 bg-cyan-500 text-slate-950 font-black text-[10px] rounded-full">
                {pendingKycCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('plans')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'plans'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Planos Mineração</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('tokenomics')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'tokenomics'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Cotação KC</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'audit'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Auditoria</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeAdminTab === 'settings'
                ? 'bg-[#1769D1] text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>Definições Globais</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* OVERVIEW TAB */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Volume Total Investido</div>
                <div className="text-2xl font-black text-white">
                  {stats.totalInvestedAoa.toLocaleString('pt-AO')} AOA
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  {stats.activeInvestmentsCount} Planos de mineração em atividade
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Levantamentos Processados</div>
                <div className="text-2xl font-black text-amber-400">
                  {stats.totalWithdrawnAoa.toLocaleString('pt-AO')} AOA
                </div>
                <div className="text-[10px] text-slate-400">
                  {stats.processedWithdrawalsCount} Transações pagas aos investidores
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">KwanzaCoin em Circulação</div>
                <div className="text-2xl font-black text-cyan-400">
                  {stats.kwanzaCoinInCirculation.toLocaleString('pt-AO')} KC
                </div>
                <div className="text-[10px] text-cyan-300 font-mono">
                  1 KC = {(kcRate?.rateAoa || 100).toLocaleString('pt-AO')} AOA
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Comunidade de Investidores</div>
                <div className="text-2xl font-black text-white">
                  {allUsers.filter(u => u.role === 'user').length} Investidores
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">
                  Poder total de Hashrate: {stats.totalMiningHashrateGh} MH/s
                </div>
              </div>
            </div>

            {/* Quick Action Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveAdminTab('deposits')}
                className="p-5 rounded-3xl bg-emerald-950/40 border border-emerald-800/60 cursor-pointer hover:bg-emerald-900/40 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase">Depósitos Pendentes</div>
                  <div className="text-xl font-black text-emerald-400">{pendingDepositsCount} Para Aprovar</div>
                </div>
                <ArrowDownLeft className="w-8 h-8 text-emerald-400 opacity-80" />
              </div>

              <div 
                onClick={() => setActiveAdminTab('withdrawals')}
                className="p-5 rounded-3xl bg-amber-950/40 border border-amber-800/60 cursor-pointer hover:bg-amber-900/40 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase">Saques Pendentes</div>
                  <div className="text-xl font-black text-amber-300">{pendingWithdrawalsCount} Em Espera</div>
                </div>
                <ArrowUpRight className="w-8 h-8 text-amber-400 opacity-80" />
              </div>

              <div 
                onClick={() => setActiveAdminTab('kyc')}
                className="p-5 rounded-3xl bg-cyan-950/40 border border-cyan-800/60 cursor-pointer hover:bg-cyan-900/40 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase">KYC Pendente</div>
                  <div className="text-xl font-black text-cyan-400">{pendingKycCount} Documentos BI</div>
                </div>
                <ShieldCheck className="w-8 h-8 text-cyan-400 opacity-80" />
              </div>
            </div>

            {/* Quick Autonomy Shortcuts */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white">Ações Rápidas de Gestão Administrativa</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                <button
                  onClick={() => setActiveAdminTab('users')}
                  className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-left transition-all space-y-1"
                >
                  <Users className="w-5 h-5 mb-1" />
                  <div>Gestão & Crédito de Saldo</div>
                </button>

                <button
                  onClick={() => setActiveAdminTab('plans')}
                  className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-left transition-all space-y-1"
                >
                  <Cpu className="w-5 h-5 mb-1" />
                  <div>Criar Plano Mineração</div>
                </button>

                <button
                  onClick={() => setActiveAdminTab('settings')}
                  className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 text-left transition-all space-y-1"
                >
                  <Bell className="w-5 h-5 mb-1" />
                  <div>Emitir Anúncio Global</div>
                </button>

                <button
                  onClick={() => setActiveAdminTab('tokenomics')}
                  className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-blue-400 text-left transition-all space-y-1"
                >
                  <Coins className="w-5 h-5 mb-1" />
                  <div>Ajustar Cotação KC</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeAdminTab === 'users' && (
          <AdminUsersTab
            users={allUsers}
            onRefresh={loadAdminData}
            showToast={showToast}
            triggerConfetti={triggerConfetti}
          />
        )}

        {/* DEPOSITS TAB */}
        {activeAdminTab === 'deposits' && (
          <AdminDepositsTab
            deposits={allDeposits}
            onRefresh={loadAdminData}
            showToast={showToast}
            triggerConfetti={triggerConfetti}
          />
        )}

        {/* WITHDRAWALS TAB */}
        {activeAdminTab === 'withdrawals' && (
          <AdminWithdrawalsTab
            withdrawals={allWithdrawals}
            onRefresh={loadAdminData}
            showToast={showToast}
            triggerConfetti={triggerConfetti}
          />
        )}

        {/* KYC TAB */}
        {activeAdminTab === 'kyc' && (
          <AdminKycTab
            users={allUsers}
            onRefresh={loadAdminData}
            showToast={showToast}
            triggerConfetti={triggerConfetti}
          />
        )}

        {/* PLANS TAB */}
        {activeAdminTab === 'plans' && (
          <AdminPlansTab
            plans={allPlans}
            onRefresh={loadAdminData}
            showToast={showToast}
            triggerConfetti={triggerConfetti}
          />
        )}

        {/* TOKENOMICS TAB */}
        {activeAdminTab === 'tokenomics' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  Gestão da Cotação & Tesouro KwanzaCoin (KC)
                </h2>
                <p className="text-xs text-slate-400">
                  Alteração da paridade oficial do KwanzaCoin em relação ao Kwanza (AOA) e reservas do tesouro.
                </p>
              </div>

              <form onSubmit={handleUpdateKcRateSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cotação 1 KC (AOA)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={rateInput}
                      onChange={(e) => setRateInput(Number(e.target.value))}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-black text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reserva no Tesouro (AOA)</label>
                    <input
                      type="number"
                      step={100000}
                      value={treasuryInput}
                      onChange={(e) => setTreasuryInput(Number(e.target.value))}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-black text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Variação 24h (%)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={change24hInput}
                      onChange={(e) => setChange24hInput(Number(e.target.value))}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-cyan-400 font-black text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase">Simulação de Valor Total de Mercado</div>
                    <div className="text-lg font-black text-white">
                      {(stats.kwanzaCoinInCirculation * rateInput).toLocaleString('pt-AO')} AOA
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingRate}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all"
                  >
                    {isUpdatingRate ? 'A atualizar...' : 'Atualizar Cotação Oficial'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeAdminTab === 'audit' && (
          <AdminAuditTab showToast={showToast} />
        )}

        {/* SETTINGS TAB */}
        {activeAdminTab === 'settings' && (
          <AdminSettingsTab />
        )}
      </main>
    </div>
  );
};

export const AdminDashboard: React.FC = () => (
  <AdminErrorBoundary>
    <AdminDashboardInner />
  </AdminErrorBoundary>
);
