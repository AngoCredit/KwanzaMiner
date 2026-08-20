import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { InvestmentPlan } from '../../types/index.ts';
import { 
  Cpu, 
  Zap, 
  Coins, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface InvestmentsTabProps {
  onNavigate: (tab: string) => void;
}

export const InvestmentsTab: React.FC<InvestmentsTabProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    wallet, 
    plans, 
    investments, 
    kcRate, 
    refreshAll, 
    showToast, 
    triggerConfetti 
  } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(6000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const availableBalance = wallet?.availableBalance || 0;

  // Open subscribe modal
  const handleOpenSubscribe = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.minimumAmount);
  };

  // Submit new investment
  const handleConfirmInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPlan) return;

    if (investAmount > availableBalance) {
      showToast(`Saldo insuficiente (${availableBalance.toLocaleString('pt-AO')} AOA). Por favor efetue um depósito primeiro.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createInvestment(currentUser.id, selectedPlan.id, investAmount);
      if (res.success) {
        triggerConfetti();
        showToast(`Plano ${selectedPlan.name} ativado com sucesso para ${investAmount.toLocaleString('pt-AO')} AOA!`, 'success');
        setSelectedPlan(null);
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao ativar plano', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Claim profit from active investment
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

  const activeInvs = (investments || []).filter(i => i && i.status === 'active');
  const completedInvs = (investments || []).filter(i => i && i.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Planos de Investimento & Mineração</h1>
          <p className="text-xs text-slate-500 mt-1">
            Escolha um plano para alocar capital em hashrate computacional e receba ganhos diários em AOA e KC.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500 font-semibold uppercase">O Seu Saldo Disponível</div>
          <div className="text-lg font-black text-[#1769D1]">
            {availableBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA
          </div>
        </div>
      </div>

      {/* Active Boost Banner */}
      <div className="bg-gradient-to-r from-[#071A3A] to-[#1769D1] text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Acelerador de Mineração Ativo
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {currentUser?.miningBoostMultiplier || wallet?.miningMultiplier || 1.0}x Velocidade
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              Nível {currentUser?.miningBoostLevel || wallet?.miningBoostLevel || 1} ativado: Todos os ganhos de cêntimos, microcêntimos e tokens KC estão a ser multiplicados em tempo real.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('kwanzacoin')}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>Aumentar Nível de Mineração com KC</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Plans Showcase Grid (A partir de 6.000 AOA) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#1769D1]" />
            <span>Planos Disponíveis para Subscrição</span>
          </h2>
          <span className="text-xs text-slate-500">Mínimo de entrada: <strong>6.000 AOA</strong></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => {
            const hasEnoughBalance = availableBalance >= p.minimumAmount;

            return (
              <div 
                key={p.id}
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between relative ${
                  p.isPopular ? 'border-[#1769D1] shadow-lg ring-1 ring-[#1769D1]/30' : 'border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1769D1] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                    {p.tag || 'Mais Popular'}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{p.durationDays} Dias de Ciclo</span>
                    <div className="p-1.5 rounded-lg bg-blue-50 text-[#1769D1]">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4 min-h-[34px]">{p.description}</p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Investimento Mínimo</span>
                    <div className="text-xl font-black text-[#071A3A] mt-0.5">
                      {p.minimumAmount.toLocaleString('pt-AO')} <span className="text-xs text-slate-500 font-semibold">AOA</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Até {p.maximumAmount.toLocaleString('pt-AO')} AOA
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-5">
                    <div className="flex justify-between">
                      <span>Retorno Total Estimado:</span>
                      <strong className="text-emerald-600 font-bold">+{p.returnRatePercent}% ({p.dailyRatePercent}%/dia)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Mineração KwanzaCoin:</span>
                      <strong className="text-amber-600 font-bold">+{p.miningRatePerHour} KC/hora</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Bónus de Conversão:</span>
                      <strong className="text-slate-900 font-bold">+{p.kwanzaCoinRatePercent}% KC</strong>
                    </div>
                  </div>
                </div>

                <button
                  id={`btn-subscribe-plan-${p.id}`}
                  onClick={() => handleOpenSubscribe(p)}
                  className="w-full py-2.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Ativar Plano Agora</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Active Investments List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Os Seus Investimentos Activos ({activeInvs.length})</span>
        </h2>

        {activeInvs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Ainda não possui investimentos activos. Escolha um dos planos acima para começar a minerar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInvs.map((inv) => {
              const unclaimedProfit = Math.max(0, inv.currentProfit - inv.claimedProfit);

              return (
                <div key={inv.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-[#1769D1] font-bold">
                        {inv.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{inv.planName}</h4>
                      <div className="text-xs text-slate-500">
                        Capital: <strong>{inv.amount.toLocaleString('pt-AO')} AOA</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{inv.returnRatePercent}% ROI
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase text-slate-400">Lucro Disponível para Resgate</div>
                      <div className="text-base font-black text-emerald-600 flex items-center gap-1">
                        <span>+{unclaimedProfit.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <div className="text-[10px] text-amber-600 font-medium">
                        + {inv.accumulatedKc.toFixed(3)} KC minerados
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimProfit(inv.id)}
                      disabled={claimingId === inv.id || unclaimedProfit < 1}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors"
                    >
                      {claimingId === inv.id ? '...' : 'Resgatar'}
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Início: {new Date(inv.startDate).toLocaleDateString('pt-AO')}</span>
                    <span>Término: {new Date(inv.endDate).toLocaleDateString('pt-AO')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#071A3A] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase">Subscrição de Mineração</span>
                <h3 className="text-base font-black text-white">{selectedPlan.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmInvestment} className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Montante a Investir</label>
                  <span className="text-xs text-slate-500">
                    Disponível: <strong>{availableBalance.toLocaleString('pt-AO')} AOA</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="input-invest-amount-modal"
                    type="number"
                    min={selectedPlan.minimumAmount}
                    max={selectedPlan.maximumAmount}
                    step={1000}
                    value={investAmount}
                    onChange={(e) => setInvestAmount(Number(e.target.value))}
                    className="w-full pl-4 pr-16 py-3 text-lg font-black text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1769D1] focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500">AOA</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Mínimo: {selectedPlan.minimumAmount.toLocaleString('pt-AO')} AOA — Máximo: {selectedPlan.maximumAmount.toLocaleString('pt-AO')} AOA
                </div>
              </div>

              {/* Summary projection */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Duração do Plano:</span>
                  <strong className="text-slate-900">{selectedPlan.durationDays} Dias</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Retorno Total (+{selectedPlan.returnRatePercent}%):</span>
                  <strong className="text-emerald-600 font-bold">
                    +{(investAmount * (selectedPlan.returnRatePercent / 100)).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">KwanzaCoin Estimado:</span>
                  <strong className="text-amber-600 font-bold">
                    +{((investAmount * (selectedPlan.kwanzaCoinRatePercent / 100)) / kcRate.rateAoa).toFixed(2)} KC bónus
                  </strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total Previsto no Final:</span>
                  <strong className="text-base font-black text-[#1769D1]">
                    {(investAmount + (investAmount * (selectedPlan.returnRatePercent / 100))).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA
                  </strong>
                </div>
              </div>

              {investAmount > availableBalance && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Saldo disponível insuficiente. Por favor faça um depósito.</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  id="btn-confirm-investment-submit"
                  type="submit"
                  disabled={isSubmitting || investAmount > availableBalance || investAmount < selectedPlan.minimumAmount}
                  className="w-1/2 py-2.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {isSubmitting ? 'A ativar...' : 'Confirmar & Ativar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
