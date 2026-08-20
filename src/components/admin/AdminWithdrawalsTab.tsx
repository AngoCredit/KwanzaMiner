import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import { Withdrawal } from '../../types/index.ts';
import { 
  ArrowUpRight, 
  Search, 
  Copy, 
  CheckCircle2, 
  X, 
  Building, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface AdminWithdrawalsTabProps {
  withdrawals: Withdrawal[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  triggerConfetti: () => void;
}

export const AdminWithdrawalsTab: React.FC<AdminWithdrawalsTabProps> = ({
  withdrawals,
  onRefresh,
  showToast,
  triggerConfetti
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settlement Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedWd, setSelectedWd] = useState<Withdrawal | null>(null);
  const [bankProofRef, setBankProofRef] = useState('');
  const [payNote, setPayNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch = 
      w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.iban || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.bankName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyIban = (iban: string, id: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedId(id);
    showToast(`IBAN ${iban} copiado para a área de transferência!`, 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWd) return;

    setIsSubmitting(true);
    try {
      const res = await api.adminApproveWithdrawal(
        selectedWd.id,
        'usr-admin-001',
        bankProofRef || `REF-BANC-${Date.now().toString().slice(-6)}`,
        payNote
      );
      if (res.success) {
        triggerConfetti();
        showToast(`Saque de ${selectedWd.amount.toLocaleString('pt-AO')} AOA marcado como LIQUIDADO!`, 'success');
        setPayModalOpen(false);
        setBankProofRef('');
        setPayNote('');
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao liquidador saque', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWd) return;

    setIsSubmitting(true);
    try {
      await api.rejectWithdrawal(selectedWd.id, rejectReason || 'Dados bancários inconsistentes ou divergência no titular.');
      showToast(`Saque #${selectedWd.id} rejeitado e saldo reembolsado ao utilizador!`, 'info');
      setRejectModalOpen(false);
      setRejectReason('');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao rejeitar saque', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Processamento de Levantamentos Interbancários
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono border border-amber-800">
              {filteredWithdrawals.length} Saques
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Execução e liquidação de transferências para contas nacionais (BAI, BFA, BIC, Standard Bank, Millennium Atlântico).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Pesquisar IBAN, banco, utilizador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-[#1769D1] outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:ring-2 focus:ring-[#1769D1] outline-hidden"
          >
            <option value="all">Todos os Estados</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Liquidados (Pagos)</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">ID Saque</th>
                <th className="p-4">Investidor</th>
                <th className="p-4">Montante</th>
                <th className="p-4">Banco de Destino</th>
                <th className="p-4">IBAN & Titular</th>
                <th className="p-4">Status Liquidação</th>
                <th className="p-4 text-right">Ação de Tesouraria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhum pedido de levantamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {w.id}
                      <div className="text-[10px] text-slate-500 font-normal">{new Date(w.createdAt).toLocaleString('pt-AO')}</div>
                    </td>

                    <td className="p-4 text-white font-medium">
                      <div>{w.userName || w.userId}</div>
                      <div className="text-[10px] text-amber-400 font-semibold">{w.userMembership === 'premium' ? '★ VIP' : 'Normal'}</div>
                    </td>

                    <td className="p-4 font-bold text-red-400 text-sm">
                      -{w.amount.toLocaleString('pt-AO')} AOA
                    </td>

                    <td className="p-4 text-slate-300">
                      <div className="font-bold">{w.bankName || 'BAI'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Nº: {w.accountNumber || 'N/A'}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-cyan-400 font-bold">{w.iban}</div>
                        <button
                          onClick={() => handleCopyIban(w.iban, w.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Copiar IBAN"
                        >
                          {copiedId === w.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">{w.holderName || w.userName}</div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                        w.status === 'approved' || w.status === 'paid'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : w.status === 'rejected'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          w.status === 'approved' || w.status === 'paid' ? 'bg-emerald-400' : w.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'
                        }`} />
                        {w.status === 'approved' || w.status === 'paid' ? 'Liquidado' : w.status === 'rejected' ? 'Rejeitado' : 'Em Processamento'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {w.status === 'pending' || w.status === 'processing' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedWd(w);
                              setBankProofRef(`TRF-${Math.floor(100000 + Math.random() * 900000)}`);
                              setPayNote('');
                              setPayModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#1769D1] hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
                          >
                            Marcar Liquidado
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWd(w);
                              setRejectReason('');
                              setRejectModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 font-bold text-xs"
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs font-mono">
                          {w.status === 'paid' || w.status === 'approved' ? `✓ ${w.bankProofRef || 'Pago'}` : '× Rejeitado'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTLEMENT MODAL */}
      {payModalOpen && selectedWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white">Confirmar Liquidação Bancária</h3>
                <p className="text-xs text-slate-400">Marcar o saque de {selectedWd.amount.toLocaleString('pt-AO')} AOA como efetuado.</p>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div>Beneficiário: <strong className="text-white font-bold">{selectedWd.holderName || selectedWd.userName}</strong></div>
              <div>Banco Destino: <strong className="text-white font-bold">{selectedWd.bankName}</strong></div>
              <div>IBAN: <strong className="font-mono text-[#1769D1] font-bold">{selectedWd.iban}</strong></div>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Referência de Comprovativo Bancário (BFA / BAI / Multicaixa)
                </label>
                <input
                  type="text"
                  value={bankProofRef}
                  onChange={(e) => setBankProofRef(e.target.value)}
                  placeholder="Ex: TRF-REF-00392"
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:ring-2 focus:ring-[#1769D1]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nota Interna (Opcional)</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Ex: Liquidação priorizada via aplicativo BAI Directo..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1769D1] hover:bg-blue-600 text-white font-bold shadow-md transition-colors"
                >
                  {isSubmitting ? 'A liquidar...' : 'Confirmar Liquidação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && selectedWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white">Rejeitar Pedido de Saque</h3>
            <p className="text-xs text-slate-400">O saldo será reembolsado automaticamente para a carteira disponível do investidor.</p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <textarea
                rows={3}
                placeholder="Ex: IBAN incorreto, nome do titular divergente do BI..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-600"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  {isSubmitting ? 'A guardar...' : 'Rejeitar & Reembolsar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
