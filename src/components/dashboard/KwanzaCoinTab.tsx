import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { MiningLiveStation } from './MiningLiveStation.tsx';
import { 
  Coins, 
  ArrowRightLeft, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  Zap
} from 'lucide-react';

interface KwanzaCoinTabProps {
  onNavigate?: (tab: string) => void;
}

export const KwanzaCoinTab: React.FC<KwanzaCoinTabProps> = ({ onNavigate }) => {
  const { currentUser, wallet, kcRate, refreshAll, showToast, triggerConfetti } = useApp();

  const [swapDirection, setSwapDirection] = useState<'kc_to_aoa' | 'aoa_to_kc'>('kc_to_aoa');
  const [amount, setAmount] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const kcBalance = wallet?.kwanzaCoinBalance || 0;
  const availableAoa = wallet?.availableBalance || 0;

  // Calculate swap result
  const calculatedOutput = swapDirection === 'kc_to_aoa'
    ? amount * kcRate.rateAoa
    : amount / kcRate.rateAoa;

  const handleExecuteSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (swapDirection === 'kc_to_aoa' && amount > kcBalance) {
      showToast(`Saldo insuficiente de KwanzaCoin (${kcBalance.toFixed(2)} KC)`, 'error');
      return;
    }
    if (swapDirection === 'aoa_to_kc' && amount > availableAoa) {
      showToast(`Saldo insuficiente de Kwanza (${availableAoa.toLocaleString('pt-AO')} AOA)`, 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.convertKwanzaCoin(currentUser.id, amount, swapDirection);
      if (res.success) {
        triggerConfetti();
        showToast(
          swapDirection === 'kc_to_aoa'
            ? `Converteu com sucesso ${amount} KC em ${res.amountReceived?.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA!`
            : `Adquiriu ${res.amountReceived?.toFixed(2)} KC com sucesso!`,
          'success'
        );
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao realizar conversão', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Live Mining Station Visualizer & Boost Tier Upgrade */}
      <MiningLiveStation onNavigate={onNavigate} />

      {/* 2. Swap Box & Market */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Swap Box */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Conversor & Aquisição de KC</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compre KC para acelerar o seu nível de mineração ou converta KC minerados em Kwanza líquido.
              </p>
            </div>
            <button
              onClick={() => {
                setSwapDirection(swapDirection === 'kc_to_aoa' ? 'aoa_to_kc' : 'kc_to_aoa');
                setAmount(10);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Inverter</span>
            </button>
          </div>

          <form onSubmit={handleExecuteSwap} className="space-y-5">
            {/* Input From */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-slate-700 uppercase">
                  {swapDirection === 'kc_to_aoa' ? 'Você Entrega (KwanzaCoin)' : 'Você Entrega (Kwanza)'}
                </span>
                <span className="text-slate-500">
                  Saldo:{' '}
                  <strong>
                    {swapDirection === 'kc_to_aoa'
                      ? `${kcBalance.toFixed(2)} KC`
                      : `${availableAoa.toLocaleString('pt-AO')} AOA`}
                  </strong>
                </span>
              </div>

              <div className="relative">
                <input
                  id="input-swap-amount"
                  type="number"
                  min={0.1}
                  step={swapDirection === 'kc_to_aoa' ? 0.1 : 100}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-4 pr-16 py-3.5 text-xl font-black text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1769D1]"
                />
                <span className="absolute right-4 top-4 text-xs font-bold text-slate-500">
                  {swapDirection === 'kc_to_aoa' ? 'KC' : 'AOA'}
                </span>
              </div>

              {/* Quick % buttons */}
              <div className="flex gap-2 mt-2">
                {[0.25, 0.5, 0.75, 1].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      const max = swapDirection === 'kc_to_aoa' ? kcBalance : availableAoa;
                      setAmount(Number((max * pct).toFixed(2)));
                    }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 transition-colors"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>
            </div>

            {/* Output To */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-slate-700 uppercase">
                  {swapDirection === 'kc_to_aoa' ? 'Você Recebe (Kwanza AOA)' : 'Você Recebe (KwanzaCoin)'}
                </span>
                <span className="text-slate-400 text-[11px]">Cotação Oficial: 1 KC = {kcRate.rateAoa} AOA</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={
                    swapDirection === 'kc_to_aoa'
                      ? calculatedOutput.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : calculatedOutput.toFixed(4)
                  }
                  className="w-full pl-4 pr-16 py-3.5 text-xl font-black text-emerald-600 bg-emerald-50/50 rounded-xl border border-emerald-200 focus:outline-none cursor-default"
                />
                <span className="absolute right-4 top-4 text-xs font-bold text-emerald-700">
                  {swapDirection === 'kc_to_aoa' ? 'AOA' : 'KC'}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-execute-swap"
              type="submit"
              disabled={
                isProcessing ||
                amount <= 0 ||
                (swapDirection === 'kc_to_aoa' ? amount > kcBalance : amount > availableAoa)
              }
              className="w-full py-3.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>A processar conversão...</span>
              ) : (
                <>
                  <span>
                    {swapDirection === 'kc_to_aoa' ? 'Converter KC para Kwanza Líquido' : 'Comprar KwanzaCoin para Mineração'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tokenomics & Treasury Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Métricas da Rede KwanzaCoin</h3>
            
            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Total Minerado:</span>
                <strong className="text-slate-900">{kcRate.totalMined.toLocaleString('pt-AO')} KC</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Fundo de Garantia (Tesouro):</span>
                <strong className="text-emerald-600 font-bold">{kcRate.treasuryBackingAoa.toLocaleString('pt-AO')} AOA</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Algoritmo de Emissão:</span>
                <strong className="text-slate-800">Proof-of-Hashrate Linear</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Liquidez de Conversão:</span>
                <strong className="text-[#1769D1] font-bold">100% Garantida</strong>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#071A3A] text-white space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantia de Conversão & Valorização</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Todos os tokens KC emitidos possuem reserva alocada no tesouro central. Os investidores podem usar KC tanto para ativar aceleradores de hashrate quanto para sacar em Kwanza a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
