import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import { Deposit } from '../../types/index.ts';
import { 
  ArrowDownLeft, 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  X, 
  FileText, 
  AlertCircle 
} from 'lucide-react';

interface AdminDepositsTabProps {
  deposits: Deposit[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  triggerConfetti: () => void;
}

export const AdminDepositsTab: React.FC<AdminDepositsTabProps> = ({
  deposits,
  onRefresh,
  showToast,
  triggerConfetti
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Proof Document modal
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDeposits = deposits.filter((d) => {
    const matchesSearch = 
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (depId: string) => {
    try {
      const res = await api.adminApproveDeposit(depId);
      if (res.success) {
        triggerConfetti();
        showToast('Depósito aprovado com sucesso e saldo libertado para a carteira do utilizador!', 'success');
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao aprovar depósito', 'error');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit) return;

    setIsSubmitting(true);
    try {
      await api.rejectDeposit(selectedDeposit.id, rejectReason || 'Comprovativo ilegível ou referência não conciliada no extrato bancário.');
      showToast(`Depósito #${selectedDeposit.id} rejeitado.`, 'info');
      setRejectModalOpen(false);
      setRejectReason('');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao rejeitar depósito', 'error');
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
            Aprovação & Validação de Depósitos (AOA)
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono border border-emerald-800">
              {filteredDeposits.length} Registos
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Confrontação de comprovativos de transferência (Multicaixa Express / BAI / BFA) com liberação instantânea de saldo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Pesquisar ID, utilizador, ref..."
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
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes de Aprovação</option>
            <option value="approved">Aprovados</option>
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
                <th className="p-4">ID Transação</th>
                <th className="p-4">Investidor</th>
                <th className="p-4">Montante</th>
                <th className="p-4">Método / Canal</th>
                <th className="p-4">Comprovativo</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações de Aprovação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhum depósito encontrado.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#1769D1]">
                      {dep.id}
                      <div className="text-[10px] text-slate-500 font-normal">{new Date(dep.createdAt).toLocaleString('pt-AO')}</div>
                    </td>

                    <td className="p-4 text-white font-medium">
                      <div>{dep.userName || dep.userId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{dep.userEmail}</div>
                    </td>

                    <td className="p-4 font-bold text-emerald-400 text-sm">
                      +{dep.amount.toLocaleString('pt-AO')} AOA
                    </td>

                    <td className="p-4 capitalize text-slate-300">
                      <div className="font-semibold">{dep.method?.replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{dep.phoneOrEntity || dep.reference}</div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedDeposit(dep);
                          setProofModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px] flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ver Documento</span>
                      </button>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                        dep.status === 'approved' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : dep.status === 'rejected'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          dep.status === 'approved' ? 'bg-emerald-400' : dep.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'
                        }`} />
                        {dep.status === 'approved' ? 'Aprovado' : dep.status === 'rejected' ? 'Rejeitado' : 'Pendente de Auditoria'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {dep.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(dep.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                          >
                            Aprovar & Creditar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDeposit(dep);
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
                          {dep.status === 'approved' ? '✓ Credito Efetuado' : '× Rejeitado'}
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

      {/* PROOF DOCUMENT VIEWER MODAL */}
      {proofModalOpen && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white">Comprovativo de Pagamento</h3>
                <p className="text-xs text-slate-400">Depósito #{selectedDeposit.id} • {selectedDeposit.amount.toLocaleString('pt-AO')} AOA</p>
              </div>
              <button
                onClick={() => setProofModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[220px]">
              {selectedDeposit.proofDocumentUrl?.endsWith('.pdf') ? (
                <div className="text-center space-y-3">
                  <FileText className="w-12 h-12 text-[#1769D1] mx-auto" />
                  <div className="text-xs text-slate-300 font-bold">Documento em Formato PDF</div>
                  <a
                    href={selectedDeposit.proofDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-[#1769D1] hover:bg-blue-600 text-white font-bold rounded-xl text-xs"
                  >
                    Abrir PDF Completo
                  </a>
                </div>
              ) : (
                <img
                  src={selectedDeposit.proofDocumentUrl || selectedDeposit.proofFile || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                  alt="Comprovativo"
                  className="max-h-[360px] object-contain rounded-xl border border-slate-800"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-slate-400">
                Ref: <span className="font-mono text-white font-bold">{selectedDeposit.reference || selectedDeposit.phoneOrEntity}</span>
              </div>

              {selectedDeposit.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setProofModalOpen(false);
                      handleApprove(selectedDeposit.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Aprovar Agora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white">Rejeitar Depósito</h3>
            <p className="text-xs text-slate-400">Indique o motivo pelo qual este depósito não pôde ser conciliado.</p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <textarea
                rows={3}
                placeholder="Ex: Comprovativo ilegível, montante não deu entrada na conta bancária do BAI..."
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
                  {isSubmitting ? 'A guardar...' : 'Confirmar Rejeição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
