import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { 
  ArrowUpRight, 
  Building, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Sparkles,
  Lock,
  Coins,
  TrendingUp,
  Info
} from 'lucide-react';

interface WithdrawTabProps {
  onNavigate?: (tab: string) => void;
}

export const WithdrawTab: React.FC<WithdrawTabProps> = ({ onNavigate }) => {
  const { currentUser, wallet, investments, withdrawals, transactions, refreshAll, showToast, triggerConfetti, systemSettings } = useApp();

  const [bankName, setBankName] = useState<string>('BAI - Banco Angolano de Investimentos');
  const [accountHolder, setAccountHolder] = useState<string>(currentUser?.name || '');
  const [iban, setIban] = useState<string>(currentUser?.bankAccount?.iban || 'AO06 0040 0000 1234 5678 1010 4');
  const [accountNumber, setAccountNumber] = useState<string>(currentUser?.bankAccount?.accountNumber || '');
  const [amount, setAmount] = useState<number>(5000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableBalance = wallet?.availableBalance || 0;
  const investedBalance = wallet?.investedBalance || 0;
  const accumulatedProfit = wallet?.accumulatedProfit || 0;
  const isPremium = currentUser?.membershipLevel === 'premium';

  // Rule constraints
  const MIN_WITHDRAWAL_AOA = 5000;
  const hasReachedMinThreshold = availableBalance >= MIN_WITHDRAWAL_AOA;
  const progressPercent = Math.min(100, Math.round((availableBalance / MIN_WITHDRAWAL_AOA) * 100));
  const remainingToThreshold = Math.max(0, MIN_WITHDRAWAL_AOA - availableBalance);

  const isBelowMinimum = amount < MIN_WITHDRAWAL_AOA;
  const isExceedingAvailable = amount > availableBalance;

  const angolaBanks = [
    'BAI - Banco Angolano de Investimentos',
    'BFA - Banco de Fomento Angola',
    'Banco BIC (Banco de Fomento)',
    'Banco Millennium Atlântico',
    'Standard Bank Angola',
    'Banco Keve',
    'Banco de Negócios Internacional (BNI)',
    'Banco Comercial Angolano (BCA)',
    'Caixa Geral Angola'
  ];

  const handleAmountChange = (val: number) => {
    setAmount(val);
    if (val > 0 && val < MIN_WITHDRAWAL_AOA) {
      showToast(`Aviso: O montante mínimo permitido para levantamento de lucro é de ${MIN_WITHDRAWAL_AOA.toLocaleString('pt-AO')} AOA (Kz).`, 'error');
    } else if (val > availableBalance) {
      showToast(`Aviso: O montante inserido excede o seu saldo de lucro disponível (${availableBalance.toLocaleString('pt-AO')} AOA). Em menos de 1 mês de investimento, o capital permanece alocado.`, 'error');
    }
  };

  const handleCreateWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Check system settings
    if (systemSettings.maintenanceMode) {
      showToast('A plataforma está em manutenção. Os levantamentos estão temporàriamente suspensos.', 'error');
      return;
    }
    if (!systemSettings.withdrawalEnabled) {
      showToast('Os levantamentos estão temporàriamente suspensos pela administração. Por favor aguarde a reabertura.', 'error');
      return;
    }

    if (!hasReachedMinThreshold) {
      showToast(`Aviso: O seu saldo de lucro disponível (${availableBalance.toLocaleString('pt-AO')} AOA) ainda não atingiu o limiar mínimo de ${MIN_WITHDRAWAL_AOA.toLocaleString('pt-AO')} AOA para solicitar saques.`, 'error');
      return;
    }

    if (amount < MIN_WITHDRAWAL_AOA) {
      showToast(`Aviso: Tentativa de levantamento abaixo do valor mínimo. O montante mínimo permitido é de ${MIN_WITHDRAWAL_AOA.toLocaleString('pt-AO')} AOA (Kz).`, 'error');
      return;
    }

    if (amount > availableBalance) {
      showToast(`Aviso: Saldo de lucro insuficiente (${availableBalance.toLocaleString('pt-AO')} AOA). Em menos de 1 mês, apenas o lucro pode ser levantado. O capital investido (${investedBalance.toLocaleString('pt-AO')} AOA) está alocado na mineração.`, 'error');
      return;
    }

    if (!iban || iban.length < 15) {
      showToast('Por favor introduza um IBAN angolano válido (AO06...)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createWithdrawal(
        currentUser.id,
        amount,
        bankName,
        iban,
        accountHolder || currentUser.name,
        accountNumber
      );
      if (res.success) {
        triggerConfetti();
        showToast(
          `Pedido de levantamento de ${amount.toLocaleString('pt-AO')} AOA de lucro enviado para liquidação bancária!`,
          'success'
        );
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao processar saque', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const myWithdrawals = (withdrawals && withdrawals.length > 0)
    ? withdrawals
    : (transactions || []).filter(t => t && t.type === 'withdrawal');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Levantamento de Lucros em Kwanza (AOA)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Receba os seus rendimentos de mineração diretamente na sua conta bancária em Angola.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-bold uppercase">Lucro Disponível para Saque</span>
          <div className="text-2xl font-black text-emerald-600">
            {availableBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500">AOA</span>
          </div>
        </div>
      </div>

      {/* Regra de 1 Mês & Limiar de 5.000 Kz Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regra 1: Menos de 1 mês -> Apenas Lucro */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wide">
              Regra de Retenção de Capital (&lt; 1 Mês)
            </div>
            <p className="text-slate-700 leading-relaxed">
              Durante o ciclo contratual de <strong>30 dias (1 mês)</strong>, o capital investido ({investedBalance.toLocaleString('pt-AO')} AOA) permanece alocado na infraestrutura de mineração. 
              <strong> Apenas o lucro obtido pode ser levantado.</strong>
            </p>
          </div>
        </div>

        {/* Regra 2: Lucro Mínimo de 5.000 Kz */}
        <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
          hasReachedMinThreshold 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-blue-50/70 border-blue-200 text-slate-800'
        }`}>
          <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
            hasReachedMinThreshold ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#1769D1]'
          }`}>
            <Coins className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wide">
                Limiar Mínimo de Saque: 5.000 Kz
              </span>
              <span className="font-bold font-mono">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  hasReachedMinThreshold ? 'bg-emerald-500' : 'bg-[#1769D1]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600">
              {hasReachedMinThreshold ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline" /> Meta atingida! Já pode solicitar o levantamento do seu lucro.
                </span>
              ) : (
                <span>
                  O seu lucro disponível é de <strong>{availableBalance.toLocaleString('pt-AO')} AOA</strong>. Faltam <strong>{remainingToThreshold.toLocaleString('pt-AO')} AOA</strong> para atingir o mínimo de 5.000 Kz.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Bank Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleCreateWithdrawal} className="space-y-5">
            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Montante de Lucro a Levantar
                </label>
                <span className="text-xs font-bold text-amber-700">Mínimo obrigatório: 5.000 Kz</span>
              </div>

              <div className="relative">
                <input
                  id="input-withdraw-amount"
                  type="number"
                  min={1000}
                  step={500}
                  value={amount || ''}
                  onChange={(e) => handleAmountChange(Number(e.target.value))}
                  onBlur={() => {
                    if (amount < MIN_WITHDRAWAL_AOA) {
                      showToast(`Aviso: O valor introduzido (${amount.toLocaleString('pt-AO')} AOA) é inferior ao saque mínimo de ${MIN_WITHDRAWAL_AOA.toLocaleString('pt-AO')} AOA.`, 'error');
                    } else if (amount > availableBalance) {
                      showToast(`Aviso: O valor introduzido excede o seu saldo de lucro disponível (${availableBalance.toLocaleString('pt-AO')} AOA).`, 'error');
                    }
                  }}
                  className={`w-full pl-4 pr-16 py-3.5 text-xl font-black rounded-xl border focus:outline-none focus:ring-2 transition-colors ${
                    isBelowMinimum || isExceedingAvailable
                      ? 'bg-red-50/60 border-red-300 text-red-900 focus:ring-red-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-[#1769D1]'
                  }`}
                />
                <span className="absolute right-4 top-4 text-xs font-bold text-slate-500">AOA (Kz)</span>
              </div>

              {/* Dynamic Warning Notification Alerts */}
              {isBelowMinimum && (
                <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Aviso de Levantamento Abaixo do Mínimo:</strong>
                    <span>
                      O montante de <strong>{amount.toLocaleString('pt-AO')} AOA</strong> é inferior ao valor mínimo de levantamento de lucro (<strong>5.000 AOA</strong>). Ajuste o valor para no mínimo 5.000 Kz.
                    </span>
                  </div>
                </div>
              )}

              {isExceedingAvailable && !isBelowMinimum && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Aviso de Limite de Lucro Excedido:</strong>
                    <span>
                      O valor inserido ({amount.toLocaleString('pt-AO')} AOA) excede o seu saldo de lucro disponível ({availableBalance.toLocaleString('pt-AO')} AOA). Em menos de 1 mês de investimento, apenas o lucro pode ser levantado.
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Select Buttons */}
              {hasReachedMinThreshold && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleAmountChange(5000)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      amount === 5000 
                        ? 'bg-[#1769D1] text-white shadow-xs' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    5.000 Kz (Mínimo)
                  </button>
                  {availableBalance >= 10000 && (
                    <button
                      type="button"
                      onClick={() => handleAmountChange(10000)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        amount === 10000 
                          ? 'bg-[#1769D1] text-white shadow-xs' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      10.000 Kz
                    </button>
                  )}
                  {availableBalance >= 25000 && (
                    <button
                      type="button"
                      onClick={() => handleAmountChange(25000)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        amount === 25000 
                          ? 'bg-[#1769D1] text-white shadow-xs' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      25.000 Kz
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAmountChange(Math.floor(availableBalance))}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-xs font-bold text-emerald-800 transition-colors"
                  >
                    100% do Lucro ({Math.floor(availableBalance).toLocaleString('pt-AO')} Kz)
                  </button>
                </div>
              )}
            </div>

            {/* Bank Select */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Banco de Destino em Angola
              </label>
              <select
                id="select-withdraw-bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
              >
                {angolaBanks.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* IBAN */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                IBAN Angolano de Liquidação (AO06...)
              </label>
              <input
                id="input-withdraw-iban"
                type="text"
                required
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="AO06 0040 0000 1234 5678 1010 4"
                className="w-full p-3 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Nome Completo do Titular da Conta Bancária
              </label>
              <input
                id="input-withdraw-holder"
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Manuel António da Silva"
                className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Número de Conta (Opcional)
              </label>
              <input
                id="input-withdraw-account-num"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="12345678/10/001"
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
              />
            </div>

            <button
              id="btn-submit-withdrawal"
              type="submit"
              disabled={isSubmitting || !hasReachedMinThreshold || isBelowMinimum || isExceedingAvailable}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                !hasReachedMinThreshold || isBelowMinimum || isExceedingAvailable
                  ? 'bg-slate-400 cursor-not-allowed opacity-60 text-white'
                  : 'bg-[#071A3A] hover:bg-slate-800 text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              <span>
                {!hasReachedMinThreshold
                  ? `Aguarde atingir 5.000 Kz de Lucro (Faltam ${remainingToThreshold.toLocaleString('pt-AO')} Kz)`
                  : isBelowMinimum
                  ? `Aviso: Saque Mínimo é de 5.000 Kz (Ajuste o valor)`
                  : isExceedingAvailable
                  ? `Aviso: Valor excede o lucro disponível`
                  : `Solicitar Levantamento de ${amount.toLocaleString('pt-AO')} Kz`}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Policies & History */}
        <div className="lg:col-span-5 space-y-4">
          {/* Summary Box */}
          <div className="bg-[#071A3A] text-white p-6 rounded-2xl border border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase">Resumo da Carteira de Investidor</h3>
            <div className="space-y-2 text-xs divide-y divide-slate-800">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Capital Investido (30 dias):</span>
                <span className="font-bold font-mono text-white">{investedBalance.toLocaleString('pt-AO')} AOA</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Lucro Disponível para Saque:</span>
                <span className="font-bold font-mono text-emerald-400">{availableBalance.toLocaleString('pt-AO')} AOA</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Limiar Mínimo de Saque:</span>
                <span className="font-bold font-mono text-amber-300">5.000 AOA</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Prazo de Liquidação:</span>
                <span className="font-bold text-cyan-300">{isPremium ? '< 1 hora (VIP)' : '24h - 48h úteis'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Termos Oficiais de Levantamento</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Regra de 30 Dias:</strong> O capital investido está em mineração ativa e só é libertado na maturidade do plano. Apenas o lucro é sacável em menos de 1 mês.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Mínimo de 5.000 Kz:</strong> O saldo de lucros deve totalizar no mínimo 5.000 Kz para ativação da ordem de transferência.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Conformidade Bancária:</strong> Os pagamentos são emitidos por transferência interbancária direta para BAI, BFA, BIC, Atlântico, Caixa Angola e demais membros EMIS.</span>
              </li>
            </ul>
          </div>

          {/* History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase">Histórico de Saques Solicitados</h4>
            {myWithdrawals.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum saque solicitado até o momento.</p>
            ) : (
              <div className="space-y-2">
                {myWithdrawals.slice(0, 4).map((w) => (
                  <div key={w.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{w.amount.toLocaleString('pt-AO')} AOA</div>
                      <div className="text-[10px] text-slate-400">{new Date(w.createdAt).toLocaleDateString('pt-AO')} • {w.bankName || 'Transferência'}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {w.status === 'approved' ? 'Concluído' : 'A Processar'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
