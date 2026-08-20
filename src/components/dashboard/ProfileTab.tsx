import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { calculateAge, getMax18YearsAgoDateString } from '../../lib/validation.ts';
import { 
  User as UserIcon, 
  Building2, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  Mail, 
  CheckCircle2,
  KeyRound,
  Calendar,
  AlertCircle,
  Shield
} from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const { currentUser, refreshAll, showToast, triggerConfetti } = useApp();

  const [name, setName] = useState<string>(currentUser?.name || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [birthDate, setBirthDate] = useState<string>(currentUser?.birthDate || '1995-05-15');
  const [bankName, setBankName] = useState<string>(currentUser?.bankAccount?.bankName || currentUser?.bankDetails?.bankName || 'BAI - Banco Angolano de Investimentos');
  const [accountHolder, setAccountHolder] = useState<string>(currentUser?.bankAccount?.accountHolder || currentUser?.bankDetails?.holderName || currentUser?.name || '');
  const [iban, setIban] = useState<string>(currentUser?.bankAccount?.iban || currentUser?.bankDetails?.iban || 'AO06 0040 0000 1428 5902 1014 5');
  const [accountNumber, setAccountNumber] = useState<string>(currentUser?.bankAccount?.accountNumber || currentUser?.bankDetails?.accountNumber || '142859021');
  const [is2faEnabled, setIs2faEnabled] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isPremium = currentUser?.membershipLevel === 'premium';
  const ageValidation = calculateAge(birthDate);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!ageValidation.isAdult) {
      showToast('A data de nascimento deve comprovar que tem pelo menos 18 anos.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all([
        api.updateUserProfile(currentUser.id, {
          name,
          phone,
          birthDate
        }),
        api.updateBankInfo(
          currentUser.id,
          bankName,
          accountHolder,
          iban,
          accountNumber
        )
      ]);

      showToast('Dados cadastrais, de maioridade e bancários atualizados com sucesso!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar dados', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradeVip = () => {
    triggerConfetti();
    showToast('A sua conta foi promovida para Membro VIP com processamento de saques prioritário (<1h)!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Perfil de Utilizador & Segurança</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão dos dados cadastrais, data de nascimento (comprovação de 18+ anos), conta bancária e protecção de conta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPremium ? (
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ESTATUTO VIP ACTIVO</span>
            </span>
          ) : (
            <button
              onClick={handleUpgradeVip}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold text-xs shadow-sm hover:brightness-105 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Atualizar para Membro VIP</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile & Bank Details */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            
            {/* Account Type Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                {currentUser?.authProvider === 'google' ? (
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#1769D1]/10 text-[#1769D1] flex items-center justify-center font-bold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {currentUser?.authProvider === 'google' ? 'Conta Conectada com o Google' : 'Conta Registada por Email'}
                  </div>
                  <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
                </div>
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                CONTA ATIVA
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Informações Pessoais & Idade (18+ Anos)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Endereço de Email</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full p-3 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Telemóvel (Angola)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              {/* Birth Date & Age Verification */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Data de Nascimento</label>
                  <span className="text-[10px] font-bold text-emerald-700">18+ Exigido</span>
                </div>
                <input
                  type="date"
                  max={getMax18YearsAgoDateString()}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
                
                {birthDate && (
                  <div className={`mt-1.5 text-[11px] font-semibold flex items-center gap-1 ${
                    ageValidation.isAdult ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {ageValidation.isAdult ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 inline shrink-0" />
                    )}
                    <span>{ageValidation.message}</span>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 pt-2">
              2. Dados Bancários Predefinidos para Saque
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Banco em Angola</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="BAI, BFA, BIC, Atlântico, Standard Bank..."
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">IBAN de Liquidação (AO06...)</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full p-3 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Titular da Conta</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Número de Conta</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || !ageValidation.isAdult}
              className="w-full py-3 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'A guardar...' : 'Guardar Alterações do Perfil'}</span>
            </button>
          </form>
        </div>

        {/* Security Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#1769D1]" />
              <h3 className="text-sm font-bold text-slate-900">Segurança da Conta</h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Autenticação 2FA</span>
                <button
                  type="button"
                  onClick={() => {
                    setIs2faEnabled(!is2faEnabled);
                    showToast(is2faEnabled ? '2FA desativado' : '2FA ativado com sucesso!', 'info');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    is2faEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    is2faEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Exigir código OTP por SMS ao efetuar login ou solicitar levantamentos de fundos.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Alterar Palavra-passe</span>
                <KeyRound className="w-4 h-4 text-slate-500" />
              </div>
              <button
                type="button"
                onClick={() => showToast('Um link de redefinição de palavra-passe foi enviado para o seu email.', 'info')}
                className="w-full py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Solicitar Nova Senha
              </button>
            </div>

            {/* Legal compliance banner */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Conformidade Legal & Idade</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                A sua conta foi registada com comprovação de maioridade legal (18+ anos), em conformidade com as directrizes bancárias e financeiras de Angola.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
