import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { MiningLiveStation } from './MiningLiveStation.tsx';
import { 
  Wallet, 
  Cpu, 
  TrendingUp, 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Zap, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    wallet, 
    investments, 
    kcRate, 
    refreshAll, 
    showToast, 
    triggerConfetti 
  } = useApp();

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Handle instant claim of accumulated profit
  const handleClaimProfit = async (investmentId: string) => {
    if (!currentUser) return;
    setClaimingId(investmentId);
    try {
      const res = await api.claimProfit(investmentId, currentUser.id);
      if (res.success) {
        triggerConfetti();
        showToast(`Resgatou ${res.amountClaimed?.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA com sucesso para a carteira!`, 'success');
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao resgatar rendimento', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  // Chart data simulation based on user investments
  const chartData30d = [
    { day: 'Dia 1', capital: 26000, ganhos: 0, kc: 10 },
    { day: 'Dia 5', capital: 26000, ganhos: 1560, kc: 35 },
    { day: 'Dia 10', capital: 26000, ganhos: 3120, kc: 68 },
    { day: 'Dia 15', capital: 26000, ganhos: 4680, kc: 95 },
    { day: 'Dia 20', capital: 26000, ganhos: 6240, kc: 118 },
    { day: 'Dia 25', capital: 26000, ganhos: 7800, kc: 135 },
    { day: 'Hoje', capital: 26000, ganhos: (wallet?.accumulatedProfit || 8320), kc: (wallet?.kwanzaCoinBalance || 142.5) },
  ];

  const totalBalance = wallet?.totalBalance || 0;
  const availableBalance = wallet?.availableBalance || 0;
  const investedBalance = wallet?.investedBalance || 0;
  const accumulatedProfit = wallet?.accumulatedProfit || 0;
  const kcBalance = wallet?.kwanzaCoinBalance || 0;

  const activeInvs = (investments || []).filter(i => i && i.status === 'active');

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Painel de Investidor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            Olá, {currentUser?.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mineração activa 24/24h. Os seus rendimentos e KwanzaCoin são calculados e creditados em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refreshAll()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('depositar')}
            className="px-4 py-2.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Depositar</span>
          </button>

          <button
            onClick={() => onNavigate('levantar')}
            className="px-4 py-2.5 rounded-xl bg-[#071A3A] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>Levantar</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Secção 15 - Dashboard do Investidor) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Saldo Total */}
        <div className="bg-[#071A3A] text-white p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
          <div className="text-xs font-medium text-slate-300 uppercase">Saldo Total em Activos</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {totalBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
            <span>AOA (Capital + KC + Lucros)</span>
          </div>
        </div>

        {/* Card 2: Saldo Disponível */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Saldo Disponível</span>
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {availableBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">AOA</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            Pronto para investir ou sacar
          </div>
        </div>

        {/* Card 3: Investimento Activo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Investimento Activo</span>
            <Cpu className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#071A3A] mt-1">
            {investedBalance.toLocaleString('pt-AO')} <span className="text-xs font-normal text-slate-400">AOA</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {activeInvs.length} {activeInvs.length === 1 ? 'plano activo' : 'planos activos'}
          </div>
        </div>

        {/* Card 4: Ganhos Acumulados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Ganhos Acumulados</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            +{accumulatedProfit.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">AOA</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Rendimento auditado
          </div>
        </div>

        {/* Card 5: KwanzaCoin */}
        <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase">
            <span>KwanzaCoin (KC)</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
            {kcBalance.toFixed(2)} <span className="text-xs font-normal text-amber-800">KC</span>
          </div>
          <div className="text-[11px] text-amber-900 mt-1 font-semibold">
            ≈ {(kcBalance * kcRate.rateAoa).toLocaleString('pt-AO')} AOA
          </div>
        </div>
      </div>

      {/* 3. Modern Mining Live Station (Ilustração moderna com ritmo de cêntimos e microcêntimos) */}
      <MiningLiveStation onNavigate={onNavigate} />

      {/* 4. Live Active Investments with Real-Time Profit Counters & Claim button (Secção 7) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Investimentos em Execução & Mineração ao Vivo</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              O motor financeiro acumula rendimentos a cada 3 segundos. Resgate os lucros para o seu saldo disponível a qualquer momento.
            </p>
          </div>

          <button
            onClick={() => onNavigate('investimentos')}
            className="text-xs font-bold text-[#1769D1] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Subscrever Novo Plano (Mín. 6.000 AOA)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {activeInvs.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1769D1] flex items-center justify-center mx-auto">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Nenhum investimento ativo no momento</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Inicie a sua jornada com o Plano Micro-Mineração a partir de apenas 6.000 AOA.
            </p>
            <button
              onClick={() => onNavigate('investimentos')}
              className="px-5 py-2.5 rounded-xl bg-[#1769D1] text-white text-xs font-bold shadow-sm"
            >
              Ver Planos Disponíveis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInvs.map((inv) => {
              const unclaimedProfit = Math.max(0, inv.currentProfit - inv.claimedProfit);
              const totalDays = 15; // approximate
              const returnPercent = inv.returnRatePercent || 18;

              return (
                <div key={inv.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-[#1769D1] font-bold">
                        ID: {inv.id.toUpperCase()}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{inv.planName}</h3>
                      <div className="text-xs text-slate-500">
                        Capital Alocado: <strong>{inv.amount.toLocaleString('pt-AO')} AOA</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        +{returnPercent}% ROI
                      </span>
                      <div className="text-[10px] text-amber-700 font-bold mt-1">
                        +{inv.miningRatePerHour} KC/h
                      </div>
                    </div>
                  </div>

                  {/* Real-time Profit Accrual Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase text-slate-400">
                        Lucro Acumulado Disponível para Resgate
                      </div>
                      <div className="text-lg font-black text-emerald-600 flex items-center gap-1.5">
                        <span>+{unclaimedProfit.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <div className="text-[11px] text-amber-600 font-medium">
                        + {inv.accumulatedKc.toFixed(3)} KC minerados
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimProfit(inv.id)}
                      disabled={claimingId === inv.id || unclaimedProfit < 1}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      {claimingId === inv.id ? 'A resgatar...' : 'Resgatar Lucro'}
                    </button>
                  </div>

                  {/* Timeline & Progress */}
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Início: {new Date(inv.startDate).toLocaleDateString('pt-AO')}</span>
                    </span>
                    <span>Término: {new Date(inv.endDate).toLocaleDateString('pt-AO')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Interactive Charts (Secção 16 - Gráficos) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Evolução do Capital & Ganhos</h3>
              <p className="text-xs text-slate-500">Crescimento diário acumulado com base no poder de mineração</p>
            </div>

            {/* Filter pills (7d, 30d, 90d, 1y) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
              {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    chartPeriod === period ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData30d}>
                <defs>
                  <linearGradient id="colorGanhos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1769D1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1769D1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString('pt-AO')} AOA`, '']}
                  contentStyle={{ backgroundColor: '#071A3A', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="capital" stroke="#1769D1" strokeWidth={2} fillOpacity={1} fill="url(#colorCapital)" name="Capital Investido" />
                <Area type="monotone" dataKey="ganhos" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorGanhos)" name="Lucro Acumulado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick KwanzaCoin conversion tool on the right */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Conversão Rápida KC</span>
              </h3>
              <span className="text-xs font-bold text-amber-600">
                1 KC = {kcRate.rateAoa} AOA
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">O Seu Saldo KC</div>
                <div className="text-lg font-black text-amber-600 mt-0.5">
                  {kcBalance.toFixed(2)} KC
                </div>
                <div className="text-[11px] text-slate-500">
                  Valor estimado: <strong>{(kcBalance * kcRate.rateAoa).toLocaleString('pt-AO')} AOA</strong>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                Liquide os seus tokens KC em Kwanzas a qualquer momento ou acumule para valorização da cotação.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('kwanzacoin')}
            className="w-full py-2.5 rounded-xl bg-[#071A3A] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Abrir Ferramenta de Swap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
