import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  User as UserIcon, 
  Camera, 
  Sparkles,
  Zap 
} from 'lucide-react';

export const KycTab: React.FC = () => {
  const { currentUser, refreshAll, showToast, triggerConfetti } = useApp();

  const [documentType, setDocumentType] = useState<string>('bi');
  const [documentNumber, setDocumentNumber] = useState<string>(currentUser?.kycDocumentNumber || '007238491LA042');
  const [fullName, setFullName] = useState<string>(currentUser?.name || '');
  const [birthDate, setBirthDate] = useState<string>('1990-05-14');
  const [province, setProvince] = useState<string>('Luanda');
  const [uploadedFront, setUploadedFront] = useState<boolean>(true);
  const [uploadedBack, setUploadedBack] = useState<boolean>(true);
  const [uploadedSelfie, setUploadedSelfie] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const kycStatus = currentUser?.kycStatus || 'pending';

  const provinces = [
    'Luanda', 'Benguela', 'Huíla', 'Huambo', 'Cabinda', 'Cuanza Sul', 'Cuanza Norte', 
    'Uíge', 'Zaire', 'Malanje', 'Lunda Norte', 'Lunda Sul', 'Moxico', 'Bié', 
    'Namibe', 'Cunene', 'Cuando Cubango', 'Bengo'
  ];

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitKyc(
        currentUser.id,
        documentType,
        documentNumber,
        fullName,
        birthDate,
        province,
        'bi_frente_doc.jpg',
        'bi_verso_doc.jpg',
        'selfie_titular.jpg'
      );

      if (res.success) {
        triggerConfetti();
        showToast('Documentação KYC submetida com sucesso para análise da equipa de conformidade!', 'success');
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao submeter KYC', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant approve for sandbox testing
  const handleInstantApprove = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await api.adminUpdateKyc(currentUser.id, 'approved', 'Documento verificado e validado com sucesso via Sandbox.');
      triggerConfetti();
      showToast('Conta verificada com sucesso com estatuto KYC APROVADO!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Erro ao aprovar KYC', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1769D1]" />
            <h1 className="text-2xl font-black text-slate-900">Verificação de Identidade (KYC)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conformidade obrigatória com as directrizes de segurança e prevenção de branqueamento de capitais em Angola.
          </p>
        </div>

        <div>
          {kycStatus === 'approved' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>IDENTIDADE VERIFICADA</span>
            </span>
          ) : kycStatus === 'in_review' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>DOCUMENTOS EM ANÁLISE</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 text-[#1769D1] text-xs font-bold border border-blue-300">
              <AlertCircle className="w-4 h-4 text-[#1769D1]" />
              <span>PENDENTE DE SUBMISSÃO</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleSubmitKyc} className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Dados Pessoais & Documento de Identificação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                >
                  <option value="bi">Bilhete de Identidade (BI de Angola)</option>
                  <option value="passport">Passaporte Nacional ou Estrangeiro</option>
                  <option value="residence">Cartão de Residente em Angola</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Número do Documento (BI / Passaporte)
                </label>
                <input
                  type="text"
                  required
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ex: 007238491LA042"
                  className="w-full p-3 text-xs font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Nome Completo (Conforme Documento)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Manuel António da Silva"
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase block">
                    Data de Nascimento (18+ Anos)
                  </label>
                  <span className="text-[10px] font-bold text-[#1769D1]">Idade Mínima Legal: 18</span>
                </div>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Província de Residência
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
                >
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 pt-2">
              2. Upload de Comprovativos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Front */}
              <div 
                onClick={() => setUploadedFront(!uploadedFront)}
                className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  uploadedFront ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800' : 'border-slate-300 hover:border-[#1769D1] bg-slate-50'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-bold">Frente do BI</div>
                <span className="text-[10px] text-slate-500">{uploadedFront ? 'Ficheiro anexado' : 'Clique para carregar'}</span>
              </div>

              {/* Back */}
              <div 
                onClick={() => setUploadedBack(!uploadedBack)}
                className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  uploadedBack ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800' : 'border-slate-300 hover:border-[#1769D1] bg-slate-50'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-bold">Verso do BI</div>
                <span className="text-[10px] text-slate-500">{uploadedBack ? 'Ficheiro anexado' : 'Clique para carregar'}</span>
              </div>

              {/* Selfie */}
              <div 
                onClick={() => setUploadedSelfie(!uploadedSelfie)}
                className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  uploadedSelfie ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800' : 'border-slate-300 hover:border-[#1769D1] bg-slate-50'
                }`}
              >
                <Camera className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-bold">Selfie do Titular</div>
                <span className="text-[10px] text-slate-500">{uploadedSelfie ? 'Selfie capturada' : 'Clique para tirar'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submeter Documentos para Análise</span>
              </button>

              <button
                type="button"
                onClick={handleInstantApprove}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aprovação Imediata em Modo Sandbox</span>
              </button>
            </div>
          </form>
        </div>

        {/* Benefits Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Vantagens da Verificação</h3>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Liberação imediata para saques diários de alto volume em Kwanza.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Proteção contra fraude e clonagem de identidade financeira.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Acesso prioritário a planos de mineração institucionais.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
