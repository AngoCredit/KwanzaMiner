import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Coins, 
  Lock, 
  TrendingUp, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface WalletTabProps {
  onNavigate: (tab: string) => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({ onNavigate }) => {
  const { wallet, kcRate, currentUser } = useApp();

  const totalBalance = wallet?.totalBalance || 0;
  const availableBalance = wallet?.availableBalance || 0;
  const investedBalance = wallet?.investedBalance || 0;
  const accumulatedProfit = wallet?.accumulatedProfit || 0;
  const kcBalance = wallet?.kwanzaCoinBalance || 0;
  const lockedBalance = wallet?.lockedBalance || 0;

  const MIN_WITHDRAWAL = 5000;
  const canWithdraw = availableBalance >= MIN_WITHDRAWAL;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Minha Carteira & Saldos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de saldos em Kwanza (AOA) e KwanzaCoin (KC) com rastreabilidade contábil em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-wallet-deposit"
            onClick={() => onNavigate('depositar')}
            className="px-4 py-2.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Depositar Fundos</span>
          </button>

          <button
            id="btn-wallet-withdraw"
            onClick={() => onNavigate('levantar')}
            className="px-4 py-2.5 rounded-xl bg-[#071A3A] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>Levantar Lucro</span>
          </button>
        </div>
      </div>

      {/* Regra de Saque & Retenção Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 text-[#1769D1] shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">Regras Oficiais de Levantamento: </span>
            <span>Em menos de 1 mês de investimento, é permitido apenas o levantamento do <strong>lucro obtido</strong> (o capital investido permanece alocado na mineração durante os 30 dias). O lucro deve atingir <strong>5.000 Kz</strong> para permitir o saque.</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('levantar')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 whitespace-nowrap transition-colors ${
            canWithdraw 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs' 
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
        >
          {canWithdraw ? 'Sacar Lucro (5.000+ Kz)' : 'Ver Meta de 5.000 Kz'}
        </button>
      </div>

      {/* Balance Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Saldo Disponível de Lucros */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Lucro Disponível para Saque</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {availableBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">AOA</span>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed space-y-1">
            <p>Rendimentos resgatados e prontos para saque para a sua conta bancária (mínimo de 5.000 Kz).</p>
            {!canWithdraw && (
              <p className="text-amber-700 font-semibold text-[11px]">
                Faltam {(MIN_WITHDRAWAL - availableBalance).toLocaleString('pt-AO')} AOA para habilitar o saque.
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Saldo em Mineração / Investido (30 dias) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Capital em Mineração (30 Dias)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#1769D1]">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#071A3A]">
            {investedBalance.toLocaleString('pt-AO')} <span className="text-xs font-normal text-slate-400">AOA</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Capital alocado em nós de computação gerando lucros diários. O principal fica retido durante o ciclo de 30 dias (1 mês).
          </p>
        </div>

        {/* Card 3: Saldo KwanzaCoin */}
        <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase">Saldo KwanzaCoin (KC)</span>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {kcBalance.toFixed(2)} <span className="text-xs font-normal text-amber-900">KC</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Valor de mercado interno: <strong>{(kcBalance * kcRate.rateAoa).toLocaleString('pt-AO')} AOA</strong>. Pode converter para Kwanza a qualquer momento.
          </p>
        </div>
      </div>

      {/* Secondary balances: Ganhos e Bloqueado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Total de Ganhos Acumulados</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">
              +{accumulatedProfit.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Saques em Processamento Bancário</div>
            <div className="text-xl font-black text-slate-700 mt-0.5">
              {lockedBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ledger Security Guarantee Box */}
      <div className="p-5 rounded-2xl bg-[#071A3A] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-bold text-white">Livro Razão Contábil (Ledger) Auditável</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Todas as movimentações financeiras geram um registro imutável com saldo anterior, saldo posterior, ID de referência e timestamp.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('historico')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors whitespace-nowrap"
        >
          Ver Livro Razão
        </button>
      </div>
    </div>
  );
};
