import React, { useState } from 'react';
import { Phone, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface PhonePromptModalProps {
  isOpen: boolean;
  userName: string;
  onSubmitPhone: (phone: string) => Promise<void>;
}

export const PhonePromptModal: React.FC<PhonePromptModalProps> = ({
  isOpen,
  userName,
  onSubmitPhone
}) => {
  const [phone, setPhone] = useState('+244 ');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Por favor introduza um número de telemóvel válido (ex: +244 923 456 789).');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmitPhone(cleanPhone);
    } catch (err: any) {
      setError(err.message || 'Erro ao guardar o número de telemóvel.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#071A3A] px-6 py-5 text-white">
          <BrandLogo size="sm" variant="light" showSubtitle={false} />
          <div className="flex items-center gap-2 mt-3 text-amber-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Validação Manual de Conta (Requerido)</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Olá, {userName.split(' ')[0]}! Complete o seu Registo
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Para garantir a segurança financeira e aprovação manual dos seus levantamentos, informe o seu número de telemóvel de Angola.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Número de Telemóvel (Angola) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="input-prompt-phone"
                type="tel"
                required
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+244 923 456 789"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769D1] focus:border-transparent font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Será utilizado pela administração para conferência e validação manual do seu perfil de investidor.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 font-medium">
            🔒 <strong>Política de Privacidade:</strong> O seu contacto é armazenado de forma encriptada e visível apenas para os administradores do ecossistema KwanzaCoin.
          </div>

          <button
            id="btn-submit-prompt-phone"
            type="submit"
            disabled={submitting || !phone.trim()}
            className="w-full py-3 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>A guardar e validar...</span>
            ) : (
              <>
                <span>Confirmar e Enviar para Validação</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
