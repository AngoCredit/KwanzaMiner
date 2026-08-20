import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  Coins, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Layers, 
  Sparkles, 
  Building2, 
  ChevronRight, 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Wallet,
  ArrowUpRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { 
    currentUser, 
    wallet, 
    stats, 
    kcRate, 
    plans, 
    setCurrentRoute, 
    setAuthModalOpen, 
    setAuthMode 
  } = useApp();

  // Simulator state
  const [simAmount, setSimAmount] = useState<number>(6000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-starter-6k');

  // Find selected plan for simulator
  const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0] || {
    id: 'plan-starter-6k',
    name: 'Plano Micro-Mineração (Início)',
    minimumAmount: 6000,
    maximumAmount: 50000,
    durationDays: 15,
    returnRatePercent: 18,
    dailyRatePercent: 1.2,
    miningRatePerHour: 0.08,
    kwanzaCoinRatePercent: 5
  };

  // Ensure simulator amount is valid for active plan
  const validSimAmount = Math.max(activePlan.minimumAmount, Math.min(simAmount, activePlan.maximumAmount));
  const simProfit = validSimAmount * (activePlan.returnRatePercent / 100);
  const simTotal = validSimAmount + simProfit;
  const simKc = (validSimAmount * (activePlan.kwanzaCoinRatePercent / 100)) / kcRate.rateAoa + (activePlan.miningRatePerHour * 24 * activePlan.durationDays * (validSimAmount / 10000));

  return (
    <div className="bg-[#F4F7FA] text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[#071A3A] text-white">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1769D1_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Main Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/80 text-xs font-semibold text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Plataforma de Mineração Digital em Angola</span>
                <span className="text-amber-400 font-bold">• 1 KC = {kcRate.rateAoa} AOA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                MINERE. INVISTA.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
                  CRESÇA COM A KWANZACOIN.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Uma plataforma digital para acompanhar os seus investimentos, ganhos e activos digitais em Kwanza, com transparência e controlo na palma da sua mão.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="btn-hero-start"
                  onClick={() => {
                    if (currentUser) {
                      setCurrentRoute('/dashboard');
                    } else {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-black text-base shadow-xl transition-all transform hover:-translate-y-0.5 hover:shadow-2xl flex items-center justify-center gap-2.5"
                  style={{
                    background: 'linear-gradient(135deg, #1769D1 0%, #0d47a1 100%)'
                  }}
                >
                  <span>COMEÇAR AGORA</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  id="btn-hero-login"
                  onClick={() => {
                    if (currentUser) {
                      setCurrentRoute('/dashboard');
                    } else {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-slate-200 hover:text-white font-bold text-base bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>{currentUser ? 'ACEDER AO MEU DASHBOARD' : 'ENTRAR NA CONTA'}</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Entrada inicial a partir de <strong>6.000 AOA</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Depósitos Multicaixa Express</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Ganhos e Mineração ao Vivo</span>
                </div>
              </div>
            </div>

            {/* Right Col: Live Interactive Terminal & Balance Preview */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <span className="text-xs font-mono text-slate-400 ml-2">TERMINAL DE MINERAÇÃO KC</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800">
                    HASH: 4.28 GH/s
                  </span>
                </div>

                {/* Dashboard metric preview */}
                <div className="mt-4 space-y-4">
                  {/* Saldo Total */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Saldo Total em Activos
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {wallet ? wallet.totalBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 }) : '38.450,00'}{' '}
                      <span className="text-sm font-semibold text-slate-400">AOA</span>
                    </div>
                    <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Rendimento diário automático em execução</span>
                    </div>
                  </div>

                  {/* 3 Grid mini cards */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">KwanzaCoin</div>
                      <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">
                        {wallet ? wallet.kwanzaCoinBalance.toFixed(2) : '142,50'} <span className="text-[10px]">KC</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Invest. Activo</div>
                      <div className="text-sm sm:text-base font-black text-cyan-300 mt-0.5">
                        {wallet ? wallet.investedBalance.toLocaleString('pt-AO') : '26.000'} <span className="text-[10px]">AOA</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Ganhos Acum.</div>
                      <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">
                        {wallet ? wallet.accumulatedProfit.toLocaleString('pt-AO') : '8.320'} <span className="text-[10px]">AOA</span>
                      </div>
                    </div>
                  </div>

                  {/* Live tick visualizer */}
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-slate-300 font-mono">Bloco #89410 - Mineração KC</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">+0.08 KC/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ESTATÍSTICAS EM TEMPO REAL (ACTIVIDADE DA PLATAFORMA) */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1769D1] mb-1">
              Transparência em Tempo Real
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ACTIVIDADE DA PLATAFORMA
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Dados agregados reais provenientes directamente do motor financeiro e ledger KwanzaCoin.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Stat 1 */}
            <div className="bg-[#F4F7FA] p-4 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Investido</div>
              <div className="text-lg sm:text-xl font-black text-[#071A3A] mt-1">
                {stats.totalInvestedAoa.toLocaleString('pt-AO')} <span className="text-xs">AOA</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#F4F7FA] p-4 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold text-slate-500 uppercase">Investidores</div>
              <div className="text-lg sm:text-xl font-black text-[#1769D1] mt-1">
                {stats.totalInvestorsCount.toLocaleString('pt-AO')}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#F4F7FA] p-4 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Pago em Saques</div>
              <div className="text-lg sm:text-xl font-black text-emerald-600 mt-1">
                {stats.totalWithdrawnAoa.toLocaleString('pt-AO')} <span className="text-xs">AOA</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-[#F4F7FA] p-4 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold text-slate-500 uppercase">Saques Processados</div>
              <div className="text-lg sm:text-xl font-black text-slate-800 mt-1">
                {stats.processedWithdrawalsCount.toLocaleString('pt-AO')}
              </div>
            </div>

            {/* Stat 5 */}
            <div className="bg-[#F4F7FA] p-4 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold text-slate-500 uppercase">KC em Circulação</div>
              <div className="text-lg sm:text-xl font-black text-amber-600 mt-1">
                {Math.round(stats.kwanzaCoinInCirculation).toLocaleString('pt-AO')} <span className="text-xs">KC</span>
              </div>
            </div>

            {/* Stat 6 */}
            <div className="bg-[#F4F7FA] p-4 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold text-slate-500 uppercase">Investimentos Activos</div>
              <div className="text-lg sm:text-xl font-black text-cyan-700 mt-1">
                {stats.activeInvestmentsCount.toLocaleString('pt-AO')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIMULADOR DE INVESTIMENTO & RENDIMENTO (Secção 30) */}
      <section className="py-16 bg-[#F4F7FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-[#071A3A] px-6 py-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                  <Calculator className="w-4 h-4" />
                  <span>Simulador de Mineração & Retorno</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Quanto Pretende Investir?
                </h3>
              </div>

              {/* Plan selector pills */}
              <div className="flex flex-wrap gap-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      setSimAmount(p.minimumAmount);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedPlanId === p.id 
                        ? 'bg-[#1769D1] text-white shadow-md' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p.name.split(' ')[1] || p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Input Area */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Valor do Aporte em Kwanza
                    </label>
                    <span className="text-xs font-semibold text-slate-500">
                      Mín: {activePlan.minimumAmount.toLocaleString('pt-AO')} AOA — Máx: {activePlan.maximumAmount.toLocaleString('pt-AO')} AOA
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      id="input-sim-amount"
                      type="number"
                      min={activePlan.minimumAmount}
                      max={activePlan.maximumAmount}
                      step={1000}
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className="w-full pl-4 pr-16 py-3.5 text-xl sm:text-2xl font-black text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1769D1]"
                    />
                    <span className="absolute right-4 top-4 text-sm font-bold text-slate-500">
                      AOA
                    </span>
                  </div>

                  {/* Range slider */}
                  <input
                    type="range"
                    min={activePlan.minimumAmount}
                    max={activePlan.maximumAmount}
                    step={1000}
                    value={validSimAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full mt-4 accent-[#1769D1] cursor-pointer"
                  />
                </div>

                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2">
                  {[6000, 20000, 50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        // find matching plan if outside bounds
                        const matchedPlan = plans.find(p => amt >= p.minimumAmount && amt <= p.maximumAmount);
                        if (matchedPlan) {
                          setSelectedPlanId(matchedPlan.id);
                        }
                        setSimAmount(amt);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        simAmount === amt 
                          ? 'bg-[#1769D1] text-white border-[#1769D1]' 
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {amt.toLocaleString('pt-AO')} AOA
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Aviso importante:</strong> Os valores apresentados são estimativas calculadas com base nas regras do plano seleccionado e podem variar de acordo com as condições de hashrate da rede.
                  </span>
                </div>
              </div>

              {/* Right Output Area */}
              <div className="md:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Estimativa de Retorno ({activePlan.durationDays} Dias)
                </h4>

                <div className="space-y-3 divide-y divide-slate-200">
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-slate-600">Investimento Inicial:</span>
                    <span className="text-sm font-bold text-slate-900">{validSimAmount.toLocaleString('pt-AO')} AOA</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-600">Taxa de Rendimento Total:</span>
                    <span className="text-sm font-bold text-emerald-600">+{activePlan.returnRatePercent}% ({activePlan.dailyRatePercent}%/dia)</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-600">Lucro Estimado (AOA):</span>
                    <span className="text-sm font-bold text-emerald-600">+{simProfit.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-600">KwanzaCoin Acumulado:</span>
                    <span className="text-sm font-bold text-amber-600">+{simKc.toFixed(2)} KC</span>
                  </div>

                  <div className="flex justify-between items-center pt-3">
                    <span className="text-xs font-bold text-slate-900">Total Estimado no Fim:</span>
                    <span className="text-lg font-black text-[#1769D1]">{simTotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA</span>
                  </div>
                </div>

                <button
                  id="btn-sim-invest-now"
                  onClick={() => {
                    if (currentUser) {
                      setCurrentRoute('/dashboard/investimentos');
                    } else {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>Investir Agora no Plano</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLANOS DE INVESTIMENTO / MINERAÇÃO (Secção 5) */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1769D1] mb-1">
              Catálogo de Mineração
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              PLANOS DE INVESTIMENTO & HASHRATE
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Escolha a sua cota de mineração com rendimentos calculados e auditados pelo motor financeiro oficial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => {
              const isStarter = p.minimumAmount === 6000;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-6 transition-all flex flex-col justify-between relative ${
                    p.isPopular
                      ? 'bg-white border-2 border-[#1769D1] shadow-xl'
                      : 'bg-[#F4F7FA] border border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {p.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1769D1] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                      {p.tag || 'Mais Popular'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">{p.durationDays} Dias de Mineração</span>
                      <div className="p-2 rounded-lg bg-blue-50 text-[#1769D1]">
                        <Cpu className="w-5 h-5" />
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 mb-1">
                      {p.name}
                    </h4>

                    <p className="text-xs text-slate-500 min-h-[36px] mb-4">
                      {p.description}
                    </p>

                    {/* Minimum Entry Callout */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 mb-4">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Investimento Mínimo</div>
                      <div className="text-xl font-black text-[#071A3A]">
                        {p.minimumAmount.toLocaleString('pt-AO')} <span className="text-xs font-bold text-slate-500">AOA</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Até {p.maximumAmount.toLocaleString('pt-AO')} AOA
                      </div>
                    </div>

                    {/* Plan highlights */}
                    <ul className="space-y-2 text-xs text-slate-600 mb-6">
                      <li className="flex items-center justify-between">
                        <span>Retorno do Plano:</span>
                        <strong className="text-emerald-600 font-black">+{p.returnRatePercent}% ({p.dailyRatePercent}%/dia)</strong>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Mineração KC:</span>
                        <strong className="text-amber-600 font-bold">+{p.miningRatePerHour} KC / hora</strong>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Bónus de Conversão:</span>
                        <strong className="text-slate-800 font-bold">+{p.kwanzaCoinRatePercent}% KC</strong>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Ganhos em Tempo Real:</span>
                        <strong className="text-[#1769D1] font-bold">Auditado 24/24h</strong>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (currentUser) {
                        setCurrentRoute('/dashboard/investimentos');
                      } else {
                        setAuthMode('register');
                        setAuthModalOpen(true);
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      p.isPopular
                        ? 'bg-[#1769D1] hover:bg-[#1357ad] text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Subscrever Plano</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. COMO FUNCIONA (Secção 29 - Transparência) */}
      <section className="py-16 bg-[#071A3A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              Processo Transparente
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              COMO FUNCIONA A KWANZACOIN?
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              Passo a passo simples e seguro para iniciar as suas operações em moeda nacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {[
              { num: '1', title: 'Criar Conta', desc: 'Registo rápido com email e telefone de Angola.' },
              { num: '2', title: 'Verificar Identidade', desc: 'Envio seguro de BI e comprovativo bancário (KYC).' },
              { num: '3', title: 'Depositar em AOA', desc: 'Carregamento via Multicaixa Express ou Transferência.' },
              { num: '4', title: 'Escolher Plano', desc: 'Seleção do poder de computação a partir de 6.000 AOA.' },
              { num: '5', title: 'Acompanhar Rendimento', desc: 'Visualização de lucros segundo a segundo na carteira.' },
              { num: '6', title: 'Acumular KC', desc: 'Geração de tokens KwanzaCoin com cotação dinâmica.' },
              { num: '7', title: 'Solicitar Saque', desc: 'Levantamento rápido em AOA para qualquer banco de Angola.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#1769D1] text-white font-black text-sm flex items-center justify-center mb-3">
                    {step.num}
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-slate-400 max-w-2xl mx-auto">
            <em>"Os rendimentos apresentados estão sujeitos às regras e condições do plano seleccionado."</em>
          </div>
        </div>
      </section>

      {/* 6. KWANZACOIN (KC) ASSET & CONVERSION OVERVIEW (Secção 8) */}
      <section className="py-16 bg-[#F4F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold border border-amber-500/20">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Activo Digital Interno: KwanzaCoin (KC)</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Minere o Token que Valoriza com a Rede
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                O <strong>KwanzaCoin (KC)</strong> é a unidade de recompensa e activo digital interno da plataforma. Conforme a capacidade de computação e o hashrate crescem, novas frações de KC são emitidas para os investidores activos.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-slate-900">Conversão Instantânea AOA ↔ KC</strong>
                    <p className="text-xs text-slate-500 mt-0.5">Converta seus tokens KC acumulados para Kwanza a qualquer momento com crédito directo no seu saldo disponível.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-slate-900">Reserva e Lastro do Tesouro</strong>
                    <p className="text-xs text-slate-500 mt-0.5">Cotação administrada e auditada com base em liquidez real de AOA e volume de processamento.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentRoute('/kwanzacoin')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#1769D1] hover:underline"
                >
                  <span>Saber mais sobre a Tokenomics do KwanzaCoin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* KC Conversion Widget Preview */}
            <div className="lg:col-span-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-amber-500" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Cotação em Directo</h4>
                      <span className="text-xs text-slate-500">Paridade AOA / KC</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-600">1 KC = {kcRate.rateAoa} AOA</div>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      +{kcRate.change24h}% (24 Horas)
                    </span>
                  </div>
                </div>

                <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Oferta em Circulação:</span>
                    <strong className="text-slate-800">{stats.kwanzaCoinInCirculation.toLocaleString('pt-AO')} KC</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Total de KwanzaCoin Minerado:</span>
                    <strong className="text-slate-800">{kcRate.totalMined.toLocaleString('pt-AO')} KC</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Lastro em Reserva (Tesouro AOA):</span>
                    <strong className="text-emerald-700">{kcRate.treasuryBackingAoa.toLocaleString('pt-AO')} AOA</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (currentUser) {
                      setCurrentRoute('/dashboard/kwanzacoin');
                    } else {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-[#071A3A] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Aceder à Carteira de KwanzaCoin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
