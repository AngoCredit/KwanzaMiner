import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  HelpCircle, 
  Send, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const SupportTab: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('deposit');
  const [submittedTickets, setSubmittedTickets] = useState([
    {
      id: 'TCK-8812',
      subject: 'Confirmação de Depósito Multicaixa',
      category: 'Depósitos',
      status: 'Respondido',
      date: 'Há 2 dias',
      reply: 'O seu depósito de 20.000 AOA foi validado e creditado na sua carteira.'
    }
  ]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      showToast('Preencha o assunto e a mensagem do ticket', 'error');
      return;
    }

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category: ticketCategory,
      status: 'Aberto',
      date: 'Agora',
      reply: 'A nossa equipa de apoio em Luanda está a analisar a sua questão.'
    };

    setSubmittedTickets([newTicket, ...submittedTickets]);
    setSubject('');
    setMessage('');
    showToast('Ticket de suporte enviado com sucesso!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900">Centro de Apoio & Suporte ao Investidor</h1>
        <p className="text-xs text-slate-500 mt-1">
          Apoio técnico e financeiro dedicado para investidores em Angola.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Abrir Novo Ticket de Suporte
          </h3>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Categoria do Pedido
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
              >
                <option value="deposit">Dúvida sobre Depósito / Multicaixa Express</option>
                <option value="withdrawal">Estado de Levantamento Bancário</option>
                <option value="kyc">Validação de Documento KYC</option>
                <option value="plans">Rendimentos e Planos de Mineração</option>
                <option value="kwanzacoin">Conversão de KwanzaCoin (KC)</option>
                <option value="other">Outro Assunto</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Assunto Resumido
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Dúvida sobre conciliação bancária"
                className="w-full p-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Mensagem Detalhada
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva a sua dúvida ou ocorrência com o máximo de detalhe..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1769D1]"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Ticket de Suporte</span>
            </button>
          </form>
        </div>

        {/* Luanda Office Contacts & Recent Tickets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#071A3A] text-white p-6 rounded-2xl border border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-white">Contactos Oficiais em Luanda</h3>
            
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Torre Kilamba, Av. 4 de Fevereiro, Luanda, Angola</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+244 923 000 777 / 945 111 222</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>suporte@kwanzacoin.ao</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Segunda a Sábado: 08:00 – 19:00</span>
              </div>
            </div>
          </div>

          {/* Ticket History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase">Os Seus Tickets Anteriores</h4>
            <div className="space-y-3">
              {submittedTickets.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#1769D1]">{t.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      t.status === 'Respondido' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#1769D1]'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{t.subject}</div>
                  <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                    "{t.reply}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
