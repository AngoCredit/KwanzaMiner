import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { 
  ArrowDownLeft, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  FileText,
  ShieldCheck,
  Zap,
  Info,
  Ban
} from 'lucide-react';

interface DepositTabProps {
  onNavigate?: (tab: string) => void;
}

export const DepositTab: React.FC<DepositTabProps> = ({ onNavigate }) => {
  const { currentUser, withdrawals, showToast, refreshAll, triggerConfetti, systemSettings } = useApp();

  const [amount, setAmount] = useState<number>(6000);
  const [method, setMethod] = useState<string>('multicaixa_express');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [phoneOrEntity, setPhoneOrEntity] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Single unified beneficiary details for Premier Bet / Express
  const paymentDetails = {
    entity: '00392',
    reference: '497110000',
    beneficiary: 'Premier Bet',
    minAmount: 6000,
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`${fieldName} copiado para a área de transferência!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('O ficheiro não pode exceder 5MB.', 'error');
        return;
      }
      // Set mock URL for preview
      const fakeUrl = `https://storage.kwanzacoin.ao/proofs/${Date.now()}_${file.name}`;
      setProofUrl(fakeUrl);
      showToast('Comprovativo carregado com sucesso!', 'success');
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Check if deposits are enabled by admin
    if (systemSettings.maintenanceMode) {
      showToast('A plataforma está em manutenção. Os depósitos estão temporariamente suspensos.', 'error');
      return;
    }
    if (!systemSettings.depositEnabled) {
      showToast('Os depósitos estão temporáriamente suspensos pela administração. Por favor aguarde a reabertura.', 'error');
      return;
    }

    if (amount < paymentDetails.minAmount) {
      showToast(`O depósito mínimo permitido é de ${paymentDetails.minAmount.toLocaleString('pt-AO')} AOA.`, 'error');
      return;
    }

    if (!proofUrl) {
      showToast('Por favor anexe o comprovativo do pagamento para prosseguir.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createDeposit(
        currentUser.id,
        amount,
        method,
        phoneOrEntity || paymentDetails.entity,
        bankAccount || paymentDetails.reference,
        proofUrl
      );

      if (res.success) {
        triggerConfetti();
        showToast(
          `✅ Depósito registado com sucesso! O seu saldo será creditado após validação do comprovativo (5-15 minutos).`,
          'success'
        );
        setAmount(6000);
        setProofUrl('');
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao submeter depósito', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Maintenance / Deposit Suspended Banner */}
      {(systemSettings.maintenanceMode || !systemSettings.depositEnabled) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800">
          <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">
              {systemSettings.maintenanceMode ? 'Plataforma em Manutenção' : 'Depósitos Suspensos Temporariamente'}
            </div>
            <p className="text-xs mt-1">
              {systemSettings.maintenanceMode
                ? 'O sistema encontra-se em manutenção programada. Todas as operações estão suspensas. Tente novamente mais tarde.'
                : 'A administração suspendeu temporariamente os depósitos. Por favor aguarde a reabertura do sistema.'}
            </p>
          </div>
        </div>
      )}

      {/* Pending Deposit Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-xs uppercase tracking-wide">Como funciona o crédito do saldo?</div>
          <p className="text-xs mt-1 leading-relaxed">
            Após submeter o comprovativo, o seu depósito fica <strong>pendente de validação manual</strong> pela equipa financeira.
            O saldo só é creditado na sua carteira <strong>após aprovação</strong> (geralmente 5 a 15 minutos em dias úteis).
            Consulte o separador <strong>Histórico</strong> para acompanhar o estado do seu depósito.
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-[#1769D1]" />
            <span>Depósito de Saldos (Kwanza AOA)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Carregue a sua carteira para subscrever planos de mineração a partir de 6.000 AOA.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 text-xs font-bold text-[#1769D1]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Processamento Seguro Regulado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">1. Instruções Finais de Pagamento</h2>
            <p className="text-xs text-slate-500">
              Efetue o pagamento através do Multicaixa Express (Pagamento de Serviços) usando os dados abaixo:
            </p>
          </div>

          {/* Payment Card Info */}
          <div className="p-5 rounded-2xl bg-[#071A3A] text-white space-y-4 shadow-md border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <span className="text-xs text-amber-400 font-extrabold uppercase tracking-wider">
                Pagamento de Serviços / Referência Multicaixa
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                Ativo 24/7
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Entidade</span>
                <div className="flex items-center justify-between mt-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono text-base font-black text-white">
                  <span>{paymentDetails.entity}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentDetails.entity, 'Entidade')}
                    className="p-1 text-slate-400 hover:text-amber-400"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Referência</span>
                <div className="flex items-center justify-between mt-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono text-base font-black text-amber-400">
                  <span>{paymentDetails.reference}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentDetails.reference, 'Referência')}
                    className="p-1 text-slate-400 hover:text-amber-400"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Beneficiário</span>
                <div className="mt-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-bold text-white text-xs truncate">
                  {paymentDetails.beneficiary}
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <form onSubmit={handleSubmitDeposit} className="space-y-4 pt-2">
            <h2 className="text-base font-extrabold text-slate-900">2. Confirmar Transação</h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Montante Transferido (AOA)
              </label>
              <div className="relative">
                <input
                  id="input-deposit-amount"
                  type="number"
                  min={paymentDetails.minAmount}
                  step={1000}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-4 pr-16 py-3 text-lg font-black text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1769D1] focus:outline-none"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500">AOA</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Depósito mínimo: {paymentDetails.minAmount.toLocaleString('pt-AO')} AOA
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Anexar Comprovativo de Pagamento (Imagem ou PDF) *
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-[#1769D1] rounded-xl p-4 text-center bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                  id="file-upload-input"
                />
                <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-8 h-8 text-[#1769D1]" />
                  <span className="text-xs font-bold text-slate-700">
                    {proofUrl ? 'Comprovativo Carregado ✓ (Clique para substituir)' : 'Clique para selecionar o ficheiro de comprovativo'}
                  </span>
                  <span className="text-[10px] text-slate-400">Formatos aceites: PNG, JPG, PDF (Máx. 5MB)</span>
                </label>
              </div>
            </div>

            <button
              id="btn-submit-deposit"
              type="submit"
              disabled={isSubmitting || amount < paymentDetails.minAmount || !proofUrl}
              className="w-full py-3.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? (
                <span>A enviar notificação de depósito...</span>
              ) : (
                <>
                  <span>Enviar Comprovativo para Validação</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Instructions Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1769D1]" />
              <span>Como Funciona o Depósito?</span>
            </h3>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>Abra a sua aplicação Multicaixa Express ou banco online.</li>
              <li>Aceda a <strong>Pagamentos → Pagamento de Serviços</strong>.</li>
              <li>Insira a Entidade <strong className="text-slate-900">00392</strong> e a Referência <strong className="text-amber-600 font-mono">497110000</strong>.</li>
              <li>Conclua o pagamento e guarde o comprovativo digital.</li>
              <li>Carregue o comprovativo no formulário ao lado e submeta. O saldo fica disponível em cerca de 5 a 15 minutos!</li>
            </ol>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Validação Automática 24h</span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Após o envio do comprovativo, os nossos sistemas conciliam automaticamente a transferência bancária com a sua conta de investidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
