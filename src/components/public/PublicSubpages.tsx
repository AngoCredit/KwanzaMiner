import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  ShieldCheck, 
  Cpu, 
  Coins, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  AlertTriangle,
  Building,
  Lock
} from 'lucide-react';

// 1. PLANS PAGE
export const PlansPage: React.FC = () => {
  const { plans, currentUser, setCurrentRoute, setAuthModalOpen, setAuthMode } = useApp();

  return (
    <div className="bg-[#F4F7FA] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#1769D1] text-xs font-bold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Infraestrutura de Mineração</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Planos de Investimento & Mineração KwanzaCoin
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Planos estruturados com rendimentos calculados segundo a segundo pelo motor financeiro oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div 
              key={p.id}
              className={`rounded-2xl p-6 bg-white border ${
                p.isPopular ? 'border-[#1769D1] shadow-xl ring-2 ring-[#1769D1]/20' : 'border-slate-200 shadow-sm'
              } flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">{p.durationDays} Dias</span>
                  {p.isPopular && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#1769D1] font-bold">
                      Popular
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{p.description}</p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Investimento Mínimo</span>
                  <div className="text-2xl font-black text-[#071A3A] mt-0.5">
                    {p.minimumAmount.toLocaleString('pt-AO')} <span className="text-xs text-slate-500">AOA</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Até {p.maximumAmount.toLocaleString('pt-AO')} AOA
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 mb-6">
                  <div className="flex justify-between">
                    <span>Taxa Total de Retorno:</span>
                    <strong className="text-emerald-600 font-bold">+{p.returnRatePercent}% ({p.dailyRatePercent}%/dia)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Geração de KwanzaCoin:</span>
                    <strong className="text-amber-600 font-bold">+{p.miningRatePerHour} KC / hora</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Bónus de Conversão:</span>
                    <strong className="text-slate-900 font-bold">+{p.kwanzaCoinRatePercent}% KC</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidação de Ganhos:</span>
                    <strong className="text-[#1769D1] font-bold">Em Tempo Real</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentUser) {
                    setCurrentRoute('/dashboard/investimentos');
                  } else {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }
                }}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                  p.isPopular ? 'bg-[#1769D1] text-white shadow-md hover:bg-[#1357ad]' : 'bg-[#071A3A] text-white hover:bg-slate-800'
                }`}
              >
                Subscrever Agora
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. TOKENOMICS & KWANZACOIN PAGE
export const TokenomicsPage: React.FC = () => {
  const { kcRate, stats, setCurrentRoute } = useApp();

  return (
    <div className="bg-[#F4F7FA] py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>KwanzaCoin (Ticker: KC)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Tokenomics & Mecanismo de Valorização do KwanzaCoin
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            O KwanzaCoin é uma unidade de recompensa e activo digital interno minerado exclusivamente pelos nós computacionais da rede.
          </p>
        </div>

        {/* Live Market Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-bold uppercase">Cotação Oficial Atual</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              1 KC = {kcRate.rateAoa.toLocaleString('pt-AO')} AOA
            </div>
            <span className="text-xs text-emerald-600 font-bold">+{kcRate.change24h}% (24h)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-bold uppercase">Oferta em Circulação</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.kwanzaCoinInCirculation.toLocaleString('pt-AO')} <span className="text-xs text-slate-500">KC</span>
            </div>
            <span className="text-xs text-slate-400">Total Minerado: {kcRate.totalMined.toLocaleString('pt-AO')} KC</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-bold uppercase">Lastro de Liquidez em Tesouro</span>
            <div className="text-2xl font-black text-[#1769D1] mt-1">
              {kcRate.treasuryBackingAoa.toLocaleString('pt-AO')} <span className="text-xs text-slate-500">AOA</span>
            </div>
            <span className="text-xs text-slate-400">Garantia de Conversão</span>
          </div>
        </div>

        {/* Utility explanation */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Utilidade & Regras de Conversão (AOA ↔ KC)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <h4 className="text-sm font-bold text-[#1769D1] mb-2">1. Como se Ganha KwanzaCoin?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ao ativar qualquer plano de mineração a partir de 6.000 AOA, a sua conta acumula fracções de KC continuamente com base na taxa de hashrate do plano, além de bónus de investimento iniciais.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-700 mb-2">2. Como Funciona a Conversão para Kwanza?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No painel de investidor, basta aceder à aba "KwanzaCoin" e utilizar o conversor instantâneo. O valor em KC é liquidado de imediato na taxa em vigor para a sua carteira de Kwanza disponível para saque.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. COMO FUNCIONA (HOW IT WORKS)
export const HowItWorksPage: React.FC = () => {
  const { setCurrentRoute, setAuthModalOpen, setAuthMode } = useApp();

  const steps = [
    { title: '1. Criação de Conta', desc: 'Registo gratuito com seu email, nome e número de telefone angolano (+244).' },
    { title: '2. Verificação de Identidade (KYC)', desc: 'Carregamento do Bilhete de Identidade (BI) e IBAN para segurança e conformidade financeira.' },
    { title: '3. Depósito em Kwanza (AOA)', desc: 'Envio de fundos através de Multicaixa Express ou Transferência Bancária directa (BAI, BFA, BIC, Atlântico, etc).' },
    { title: '4. Selecção do Plano de Mineração', desc: 'Escolha da capacidade de mineração com investimento a partir de 6.000 AOA.' },
    { title: '5. Acompanhamento em Tempo Real', desc: 'Os ganhos e fracções de KwanzaCoin acumulam-se continuamente na sua carteira visível no dashboard.' },
    { title: '6. Conversão & Reinvestimento', desc: 'Converta KwanzaCoin em AOA ou reinvesta o capital para acelerar o seu hashrate diário.' },
    { title: '7. Levantamento Rápido em Kwanza', desc: 'Solicite saques para a sua conta bancária angolana (com prazos prioritários de menos de 1 hora para contas Premium).' }
  ];

  return (
    <div className="bg-[#F4F7FA] py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Como Funciona a Plataforma KwanzaCoin
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Um ecossistema desenhado para oferecer transparência, facilidade de uso e controlo financeiro absoluto.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1769D1] text-white font-black text-base flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => {
              setAuthMode('register');
              setAuthModalOpen(true);
            }}
            className="px-8 py-3.5 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>Começar Agora com 6.000 AOA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. FAQ PAGE
export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Qual é o valor mínimo para começar a investir?',
      a: 'O valor mínimo de entrada na plataforma KwanzaCoin é de 6.000 AOA através do Plano Micro-Mineração inicial. Você pode depositar e ativar este plano a qualquer momento.'
    },
    {
      q: 'Como são processados os depósitos?',
      a: 'Os depósitos são efetuados via Multicaixa Express (com referência gerada na plataforma) ou por transferência bancária para as contas oficiais da KwanzaCoin nos principais bancos de Angola (BAI, BFA, BIC, Atlântico). Os depósitos são creditados na sua carteira após validação e conciliação bancária.'
    },
    {
      q: 'Quanto tempo demora um levantamento?',
      a: 'Para contas Normal, o prazo operacional estimado de processamento bancário é de 24 a 48 horas úteis. Para utilizadores com Conta Premium VIP, o processamento é prioritário, com tempo operacional estimado em menos de 1 hora (sujeito à disponibilidade dos serviços bancários interbancários).'
    },
    {
      q: 'Posso levantar o capital investido em menos de 1 mês?',
      a: 'Em investimentos com menos de 1 mês (30 dias de ciclo), é permitido apenas o levantamento do lucro acumulado gerado pela mineração. O capital investido permanece alocado no poder computacional até ao final do ciclo contratual.'
    },
    {
      q: 'Qual é o valor mínimo para solicitar um levantamento?',
      a: 'O lucro acumulado deve atingir no mínimo 5.000 Kz (AOA) para habilitar o pedido de levantamento bancário para a sua conta em Angola.'
    },
    {
      q: 'O que é o KwanzaCoin (KC)?',
      a: 'O KwanzaCoin (KC) é o ativo digital interno e unidade de recompensa da plataforma. Ele é gerado continuamente conforme a capacidade de mineração do seu plano e pode ser convertido a qualquer momento em Kwanza (AOA) com base na cotação oficial do tesouro.'
    },
    {
      q: 'Por que é necessária a verificação de identidade (KYC)?',
      a: 'A verificação de identidade (KYC/AML) é obrigatória para cumprir as normas de conformidade financeira e combate ao branqueamento de capitais em Angola, garantindo que os saques são enviados apenas para o titular legítimo da conta bancária cadastrada.'
    },
    {
      q: 'Os ganhos são garantidos?',
      a: 'Os rendimentos apresentados nos planos e simuladores são calculados de acordo com os parâmetros técnicos e regras do plano de computação seleccionado. Não constituem promessa de enriquecimento imediato.'
    }
  ];

  return (
    <div className="bg-[#F4F7FA] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#1769D1] text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tire as Suas Dúvidas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Perguntas Frequentes (FAQ)
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Respostas claras para as principais dúvidas sobre depósitos, planos, KwanzaCoin e saques.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{f.q}</span>
                {openIndex === i ? <ChevronUp className="w-4 h-4 text-[#1769D1]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. SOBRE NÓS & CONTACTOS
export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#F4F7FA] py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Sobre a KwanzaCoin Angola
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Infraestrutura pioneira de computação de activos digitais e mineração em moeda nacional.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-sm text-slate-700 leading-relaxed">
          <h3 className="text-lg font-bold text-slate-900">A Nossa Missão</h3>
          <p>
            A <strong>KwanzaCoin</strong> foi concebida para democratizar o acesso à economia digital em Angola, permitindo que cidadãos e empresas participem no ecossistema de mineração e activos digitais utilizando a moeda oficial, o Kwanza (AOA).
          </p>
          <p>
            Eliminamos a complexidade de câmbios externos e equipamentos caros, oferecendo hashrate partilhado em datacenters com liquidez direta em bancos angolanos.
          </p>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769D1] flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Escritório Central</h4>
            <p className="text-xs text-slate-500">Torre Kilamba, Av. 4 de Fevereiro, Luanda, Angola</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Atendimento Telefónico</h4>
            <p className="text-xs text-slate-500">+244 923 000 777 / 945 111 222</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Email de Suporte</h4>
            <p className="text-xs text-slate-500">suporte@kwanzacoin.ao</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. LEGAL & COMPLIANCE PAGES
export const LegalPages: React.FC<{ type: 'termos' | 'privacidade' | 'risco' }> = ({ type }) => {
  return (
    <div className="bg-[#F4F7FA] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {type === 'termos' && (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Termos e Condições de Uso</h1>
            <div className="text-xs text-slate-600 space-y-4 leading-relaxed">
              <p>1. <strong>Aceitação dos Termos:</strong> Ao registar-se na plataforma KwanzaCoin, o utilizador concorda plenamente com as regras de operação, prazos de processamento bancário e políticas de verificação de identidade aplicáveis em Angola.</p>
              <p>2. <strong>Contas e Identidade:</strong> Cada utilizador é responsável pela veracidade dos seus dados pessoais e bancários informados no processo de KYC.</p>
              <p>3. <strong>Depósitos e Saques:</strong> Todas as transferências são conciliadas em Kwanza (AOA). Nenhum saldo é liberado sem a efetiva liquidação bancária.</p>
              <p>4. <strong>Planos de Mineração:</strong> Os contratos de poder de computação começam a partir de 6.000 AOA e vigoram pelo período especificado no plano.</p>
            </div>
          </>
        )}

        {type === 'privacidade' && (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Política de Privacidade & KYC/AML</h1>
            <div className="text-xs text-slate-600 space-y-4 leading-relaxed">
              <p>1. <strong>Segurança de Dados:</strong> Os documentos de identificação (BI, Passaporte) são armazenados em repositórios criptografados e acessados exclusivamente por operadores de conformidade para aprovação de contas.</p>
              <p>2. <strong>Prevenção ao Branqueamento de Capitais:</strong> A plataforma cumpre com as diretrizes do Banco Nacional de Angola (BNA) e da Unidade de Informação Financeira (UIF) relativamente à conciliação e rastreabilidade de fundos.</p>
            </div>
          </>
        )}

        {type === 'risco' && (
          <>
            <div className="flex items-center gap-2 text-amber-600 font-bold">
              <AlertTriangle className="w-6 h-6" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Aviso de Risco & Isenção de Responsabilidade</h1>
            </div>
            <div className="text-xs text-slate-600 space-y-4 leading-relaxed">
              <p>A mineração de ativos digitais envolve parâmetros técnicos de rede, custos energéticos e variações operacionais. Os retornos calculados em simuladores baseiam-se nos algoritmos do plano escolhido e não devem ser interpretados como garantias absolutas de lucro comercial sem risco.</p>
              <p>Recomendamos que todos os participantes invistam montantes condizentes com o seu perfil financeiro.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
