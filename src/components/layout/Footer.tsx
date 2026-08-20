import React from 'react';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { ShieldCheck, Lock, AlertTriangle, Building, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentRoute } = useApp();

  return (
    <footer className="bg-[#071A3A] text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" variant="light" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Plataforma digital para gestão de investimentos, mineração de ativos digitais e acumulação de KwanzaCoin (KC) em Kwanza (AOA), com total transparência e ledger auditável em tempo real.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 text-xs text-amber-400 font-semibold border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Ledger Auditável
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 text-xs text-slate-300 font-medium border border-slate-700">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                Encriptação Bancária
              </span>
            </div>
          </div>

          {/* Col 2: Plataforma */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Plataforma</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setCurrentRoute('/')} className="hover:text-white transition-colors">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('/planos')} className="hover:text-white transition-colors">
                  Planos de Investimento
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('/como-funciona')} className="hover:text-white transition-colors">
                  Como Funciona
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('/kwanzacoin')} className="hover:text-white transition-colors">
                  Tokenomics KwanzaCoin
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('/dashboard')} className="hover:text-white transition-colors">
                  Dashboard de Investidor
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Institucional & Conformidade */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Conformidade</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setCurrentRoute('/sobre')} className="hover:text-white transition-colors">
                  Sobre Nós
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('/termos')} className="hover:text-white transition-colors">
                  Termos e Condições
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('/politica-privacidade')} className="hover:text-white transition-colors">
                  Política de Privacidade & KYC
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('/politica-risco')} className="hover:text-white transition-colors">
                  Aviso de Risco & Isenção
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentRoute('/faq')} className="hover:text-white transition-colors">
                  Perguntas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contactos Angola */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Escritório & Apoio</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Torre Kilamba, Avenida 4 de Fevereiro, Luanda, Angola</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1769D1] shrink-0" />
                <span>+244 923 000 777 / 945 111 222</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>suporte@kwanzacoin.ao</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Risk Notice (Secção 36 - Conformidade) */}
        <div className="my-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Aviso Legal & Regulamentar sobre Investimentos e Activos Digitais em Angola</span>
          </div>
          <p className="leading-relaxed">
            A plataforma <strong>KwanzaCoin</strong> é uma infraestrutura de computação distribuída e gestão de mineração de activos digitais. 
            Os rendimentos apresentados em simuladores e planos estão sujeitos às regras de operação e parâmetros de hashrate da rede. 
            Não constituem garantia de lucro financeiro absoluto. Todas as operações financeiras em Kwanza (AOA) são conciliadas via sistema interbancário nacional (Multicaixa / EMIS / Bancos Comerciais de Angola) e sujeitas a verificação de identidade (KYC/AML) conforme a legislação angolana.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-4">
          <p>© {new Date().getFullYear()} KwanzaCoin Angola. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Versão 2.4.0 (Ambiente de Produção & Sandbox)</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Servidores em Luanda Operacionais
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
