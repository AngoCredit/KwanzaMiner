import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { 
  Users, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  TrendingUp, 
  Wallet, 
  Award, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const ReferralTab: React.FC = () => {
  const { currentUser, showToast, triggerConfetti } = useApp();

  const [referralData, setReferralData] = useState<{
    referralCode: string;
    referralEarningsAoa: number;
    referralsCount: number;
    commissionPercent: number;
    referralEnabled: boolean;
    referredUsers: any[];
    records: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await api.getReferrals(currentUser.id);
      if (res.success) {
        setReferralData(res);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const refCode = referralData?.referralCode || currentUser?.referralCode || `KWZ-${currentUser?.id?.slice(-5).toUpperCase()}`;
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${refCode}` 
    : `https://kwanzacoin.ao/?ref=${refCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Link de indicação copiado para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(
      `Junta-te à KwanzaCoin e começa a minerar e investir com rentabilidade diária! Regista-te através do meu link de indicação: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const commPercent = referralData?.commissionPercent || 1.0;
  const exampleAmount = 50000;
  const exampleCommission = (exampleAmount * commPercent) / 100;

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="bg-gradient-to-r from-[#071A3A] via-[#0C2D64] to-[#1769D1] text-white p-6 sm:p-7 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>Programa de Afiliados Oficial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Comissões por Receita Gerada
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Indique investidores e receba <strong className="text-amber-300">{commPercent}% de comissão direta</strong> em todas as subscrições ativadas pelos seus indicados.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15 text-center shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-300">Total em Comissões Ganhas</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
              {(referralData?.referralEarningsAoa || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link & Share Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#1769D1]" />
              <span>O Seu Link Exclusivo de Indicação</span>
            </h2>
            <p className="text-xs text-slate-500">
              Partilhe este link com amigos, familiares ou nas redes sociais.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
            Código: {refCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-800 truncate select-all">
            {referralLink}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsapp}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explanatory Banner: Revenue Commission Model */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Como funciona a Comissão sobre Receita Efetiva?</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          A KwanzaCoin adota um modelo ético e sustentável de afiliados: não atribuímos bónus por simples cadastros vazios, mas sim uma <strong>comissão real sobre o valor investido</strong> pelos utilizadores indicados por si.
        </p>
        <div className="bg-white/80 p-3.5 rounded-xl border border-amber-300/60 mt-2 font-mono text-[11px] space-y-1">
          <div className="text-amber-900 font-bold">Exemplo Prático:</div>
          <div className="text-slate-700">
            1. O seu amigo (Maria) regista-se pelo seu link e ativa um plano de <strong className="text-slate-900">{exampleAmount.toLocaleString('pt-AO')} AOA</strong>.
          </div>
          <div className="text-slate-700">
            2. A comissão de <strong className="text-emerald-700">{commPercent}% ({exampleCommission.toLocaleString('pt-AO')} AOA)</strong> é creditada <strong>imediatamente na sua carteira</strong> no saldo disponível.
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Comissões Ganhas</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {(referralData?.referralEarningsAoa || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">AOA</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Disponível para saque ou investimento
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Amigos Indicados</span>
            <Users className="w-4 h-4 text-[#1769D1]" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {referralData?.referralsCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Utilizadores registados com o seu código
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Investidores Ativos</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {(referralData?.referredUsers || []).filter(u => u.hasInvested).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Com planos ativados no ecossistema
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Taxa de Comissão</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-[#071A3A] mt-1">
            {commPercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Por cada plano subscrito
          </div>
        </div>
      </div>

      {/* Referred Users List & Commission Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referred Users */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-[#1769D1]" />
            <span>Lista de Indicados ({referralData?.referredUsers?.length || 0})</span>
          </h3>

          {(!referralData?.referredUsers || referralData.referredUsers.length === 0) ? (
            <div className="text-center py-8 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">Nenhum amigo indicado ainda</div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Partilhe o seu link de indicação acima para começar a acumular comissões.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {referralData.referredUsers.map((user) => (
                <div key={user.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </div>
                  <div className="text-right">
                    {user.hasInvested ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Investidor Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-medium">
                        Registado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commission Records History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>Histórico de Comissões Recebidas</span>
          </h3>

          {(!referralData?.records || referralData.records.length === 0) ? (
            <div className="text-center py-8 space-y-2">
              <Gift className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">Nenhuma comissão recebida ainda</div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Assim que os seus indicados ativarem um plano de investimento, as suas comissões aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {referralData.records.map((rec) => (
                <div key={rec.id} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">
                      {rec.referredUserName} ({rec.planName})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Investimento: {Number(rec.investmentAmount).toLocaleString('pt-AO')} AOA • {new Date(rec.createdAt).toLocaleDateString('pt-AO')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-700 text-sm">
                      +{Number(rec.commissionAmount).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">Creditado</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
