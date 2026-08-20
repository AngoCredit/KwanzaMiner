import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { calculateAge, getMax18YearsAgoDateString } from '../../lib/validation.ts';
import { 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User as UserIcon, 
  Shield, 
  ShieldCheck,
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authMode, 
    setAuthMode, 
    login, 
    register, 
    loginWithGoogle,
    switchDemoAccount, 
    isLoading 
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState('');
  
  // Google Auth Dialog state
  const [googleStep, setGoogleStep] = useState<'idle' | 'prompt_dob'>('idle');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleBirthDate, setGoogleBirthDate] = useState('');

  if (!authModalOpen) return null;

  const ageCheck = calculateAge(birthDate);
  const googleAgeCheck = calculateAge(googleBirthDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (authMode === 'login') {
        if (!email) {
          setError('Por favor introduza o seu email');
          return;
        }
        await login(email, password);
      } else {
        if (!name || !email || !phone || !birthDate) {
          setError('Preencha todos os campos obrigatórios');
          return;
        }
        if (!ageCheck.valid || !ageCheck.isAdult) {
          setError(ageCheck.message || 'É obrigatório ter pelo menos 18 anos de idade para se cadastrar.');
          return;
        }
        if (!acceptTerms) {
          setError('Deve aceitar os termos de serviço e declarar que tem mais de 18 anos.');
          return;
        }
        if (password && password !== confirmPassword) {
          setError('As palavras-passe não coincidem');
          return;
        }
        await register(name, email, phone, birthDate, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro no processamento.');
    }
  };

  const handleGoogleClick = () => {
    setError('');
    // Open clean dialog for entering Google account details
    setGoogleStep('prompt_dob');
  };

  const handleGoogleAuthSubmit = async (
    gEmail: string, 
    gName: string, 
    gBirthDate: string
  ) => {
    setError('');
    if (!gEmail || !gEmail.trim()) {
      setError('Por favor introduza o endereço de email da sua conta Google.');
      return;
    }
    const validation = calculateAge(gBirthDate);
    if (!validation.isAdult) {
      setError(validation.message || 'É necessário ter no mínimo 18 anos de idade.');
      return;
    }

    try {
      await loginWithGoogle({
        email: gEmail.trim(),
        name: gName ? gName.trim() : gEmail.split('@')[0],
        birthDate: gBirthDate,
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      });
      setGoogleStep('idle');
      setGoogleEmail('');
      setGoogleName('');
      setGoogleBirthDate('');
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação com Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        
        {/* Header */}
        <div className="bg-[#071A3A] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <BrandLogo size="sm" variant="light" showSubtitle={false} />
            <h3 className="text-base font-bold text-white mt-1">
              {authMode === 'login' ? 'Aceder à Sua Conta' : 'Criar Conta de Investidor (18+ Anos)'}
            </h3>
            <p className="text-[11px] text-slate-300">
              Plataforma Oficial de Mineração e Investimentos KwanzaCoin
            </p>
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={() => {
              setAuthModalOpen(false);
              setGoogleStep('idle');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Modal Step if confirming DOB */}
          {googleStep === 'prompt_dob' ? (
            <div className="space-y-4 py-2 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Google Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-bold text-xs text-slate-800">Criar Conta com o Google</span>
                </div>
                <p className="text-xs text-slate-600">
                  Para cumprir os requisitos legais e bancários de Angola, confirme a sua data de nascimento (maior de 18 anos).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email da Conta Google
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-google-email"
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-[#1769D1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-google-name"
                    type="text"
                    required
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Nome Completo"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-[#1769D1]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Data de Nascimento (Comprovação de Maioridade) *
                  </label>
                  <span className="text-[10px] font-bold text-[#1769D1]">Idade mínima: 18 anos</span>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-google-birthdate"
                    type="date"
                    required
                    max={getMax18YearsAgoDateString()}
                    value={googleBirthDate}
                    onChange={(e) => setGoogleBirthDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-[#1769D1]"
                  />
                </div>

                {/* Real-time Age Feedback */}
                {googleBirthDate && (
                  <div className={`mt-2 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    googleAgeCheck.isAdult 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {googleAgeCheck.isAdult ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{googleAgeCheck.message}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoogleStep('idle')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={!googleAgeCheck.isAdult || isLoading}
                  onClick={() => handleGoogleAuthSubmit(googleEmail, googleName, googleBirthDate)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isLoading ? 'A registar...' : 'Confirmar e Entrar com Google'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Google One-Click Action */}
              <div className="space-y-3">
                <button
                  id="btn-google-auth"
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-3 relative group"
                >
                  {/* Official Google Vector Logo */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {authMode === 'login' ? 'Continuar com a Conta Google' : 'Cadastrar com a Conta Google'}
                  </span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider whitespace-nowrap">
                    ou preencher com email
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>
              </div>

              {/* Regular Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="input-auth-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Manuel António da Silva"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769D1] focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Endereço de Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="input-auth-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.ao"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769D1] focus:border-transparent"
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Número de Telemóvel (Angola)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          id="input-auth-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+244 923 456 789"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769D1] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Birth Date Field with Live 18+ Validation */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Data de Nascimento *
                        </label>
                        <span className="text-[10px] font-bold text-[#1769D1] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Exigido: Maior de 18 anos
                        </span>
                      </div>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          id="input-auth-birthdate"
                          type="date"
                          required
                          max={getMax18YearsAgoDateString()}
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769D1] focus:border-transparent"
                        />
                      </div>

                      {/* Real-time Dynamic Verification Chip */}
                      {birthDate && (
                        <div className={`mt-2 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                          ageCheck.isAdult 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {ageCheck.isAdult ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                          <span>{ageCheck.message}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Palavra-passe
                    </label>
                    {authMode === 'login' && (
                      <span 
                        onClick={() => alert('Para redefinir a palavra-passe, contacte o suporte ou use a sua conta Google vinculada.')}
                        className="text-[11px] text-[#1769D1] hover:underline cursor-pointer"
                      >
                        Esqueceu a senha?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="input-auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769D1] focus:border-transparent"
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Confirmar Palavra-passe
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="input-auth-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1769D1] focus:border-transparent"
                      />
                    </div>

                    {/* 18+ Declaration & Terms Checkbox */}
                    <div className="mt-3 flex items-start gap-2 text-left">
                      <input
                        id="checkbox-accept-terms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 rounded text-[#1769D1] focus:ring-[#1769D1] border-slate-300"
                      />
                      <label htmlFor="checkbox-accept-terms" className="text-[11px] text-slate-600 leading-tight">
                        Declaro solenemente ter <strong className="text-slate-900">18 anos de idade ou mais</strong> e aceito os Termos de Uso e a Política de Conformidade Financeira da KwanzaCoin.
                      </label>
                    </div>
                  </div>
                )}

                <button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={isLoading || (authMode === 'register' && (!ageCheck.isAdult || !acceptTerms))}
                  className="w-full py-2.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span>A processar...</span>
                  ) : authMode === 'login' ? (
                    <>
                      <span>Entrar na Plataforma</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Criar Conta de Investidor (18+)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch mode */}
              <div className="mt-4 text-center text-xs text-slate-500">
                {authMode === 'login' ? (
                  <span>
                    Ainda não tem conta?{' '}
                    <button
                      id="btn-switch-to-register"
                      onClick={() => {
                        setError('');
                        setAuthMode('register');
                      }}
                      className="text-[#1769D1] font-bold hover:underline"
                    >
                      Criar conta com 18+ anos
                    </button>
                  </span>
                ) : (
                  <span>
                    Já possui conta na KwanzaCoin?{' '}
                    <button
                      id="btn-switch-to-login"
                      onClick={() => {
                        setError('');
                        setAuthMode('login');
                      }}
                      className="text-[#1769D1] font-bold hover:underline"
                    >
                      Entrar na conta
                    </button>
                  </span>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
