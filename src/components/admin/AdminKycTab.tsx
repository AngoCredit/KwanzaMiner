import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import { KycVerification } from '../../types/index.ts';
import { 
  ShieldCheck, 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  X, 
  FileText, 
  UserCheck 
} from 'lucide-react';

interface AdminKycTabProps {
  users: any[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  triggerConfetti: () => void;
}

export const AdminKycTab: React.FC<AdminKycTabProps> = ({
  users,
  onRefresh,
  showToast,
  triggerConfetti
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    // Exclude admin accounts from KYC verification list
    if (u.role === 'admin' || u.role === 'superadmin') return false;

    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.kycDocumentNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const status = u.kycStatus || 'unverified';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (userId: string) => {
    try {
      const res = await api.adminUpdateKyc(userId, 'approved', 'Documento verificado com sucesso pelo sistema de conformidade.');
      if (res.success) {
        triggerConfetti();
        showToast(`KYC aprovado com sucesso!`, 'success');
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao aprovar KYC', 'error');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await api.adminUpdateKyc(selectedUser.id, 'rejected', rejectReason || 'Documento ilegível ou caducado.');
      if (res.success) {
        showToast(`KYC de ${selectedUser.name} rejeitado.`, 'info');
        setRejectModalOpen(false);
        setInspectModalOpen(false);
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao rejeitar KYC', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Validação de Identidade (KYC / AML)
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono border border-cyan-800">
              {filteredUsers.length} Documentos
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Aprovação de Bilhetes de Identidade angolanos (BI) para conformidade regulatória e prevenção de fraudes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, nº BI..."
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
            <option value="all">Todos os Estados KYC</option>
            <option value="in_review">Em Análise (Pendentes)</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
            <option value="unverified">Não Verificados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Investidor</th>
                <th className="p-4">Email / Telefone</th>
                <th className="p-4">Nº BI / Documento</th>
                <th className="p-4">Status KYC</th>
                <th className="p-4 text-right">Ação de Conformidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhum registo KYC encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {u.name}
                      <div className="text-[10px] text-slate-400 font-mono">ID: {u.id}</div>
                    </td>

                    <td className="p-4 text-slate-300">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.phone || 'Sem telefone'}</div>
                    </td>

                    <td className="p-4 font-mono font-bold text-cyan-400">
                      {u.kycDocumentNumber || 'Pendente de Envio'}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                        u.kycStatus === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : u.kycStatus === 'rejected'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          u.kycStatus === 'approved' ? 'bg-emerald-400' : u.kycStatus === 'rejected' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'
                        }`} />
                        {(u.kycStatus || 'unverified').toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setInspectModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Inspecionar</span>
                        </button>

                        {u.kycStatus !== 'approved' && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                          >
                            Aprovar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT MODAL */}
      {inspectModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white">Inspeção de Documentos KYC</h3>
                <p className="text-xs text-slate-400">{selectedUser.name} • {selectedUser.email}</p>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Bilhete de Identidade (Frente)</div>
                <img
                  src="/assets/kyc_doc_front.png"
                  alt="BI Frente"
                  className="w-full h-32 object-cover rounded-lg border border-slate-800"
                  onError={(e: any) => {
                    e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400';
                  }}
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Selfie de Confirmação</div>
                <img
                  src={selectedUser.avatar || '/assets/kyc_selfie.png'}
                  alt="Selfie"
                  className="w-full h-32 object-cover rounded-lg border border-slate-800"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div>Nº BI: <strong className="font-mono text-cyan-400 font-bold">{selectedUser.kycDocumentNumber || '009845123LA031'}</strong></div>
              <div>Data de Nascimento: <strong className="text-white">{selectedUser.birthDate || '1990-01-01'}</strong></div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectReason('');
                  setRejectModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 font-bold text-xs"
              >
                Rejeitar Documento
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedUser.id);
                  setInspectModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Aprovar KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white">Rejeitar Documento KYC</h3>
            <p className="text-xs text-slate-400">Forneça o motivo para o investidor efetuar a re-submissão.</p>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <textarea
                rows={3}
                placeholder="Ex: Foto do BI ilegível, documento caducado..."
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
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
