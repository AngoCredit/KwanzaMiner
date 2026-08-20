import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import { User, Wallet } from '../../types/index.ts';
import { 
  Search, 
  Eye, 
  DollarSign, 
  Shield, 
  Sparkles, 
  Ban, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  X,
  CreditCard,
  Building,
  Calendar,
  Phone,
  Mail,
  Coins
} from 'lucide-react';

interface AdminUsersTabProps {
  users: any[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  triggerConfetti: () => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onRefresh,
  showToast,
  triggerConfetti
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('user');


  // Modals state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  // Balance Adjustment state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustUser, setAdjustUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10000);
  const [adjustCurrency, setAdjustCurrency] = useState<'AOA' | 'KC'>('AOA');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').includes(searchTerm) ||
      (u.kycDocumentNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleToggleStatus = async (user: any, newStatus: string) => {
    try {
      await api.toggleAdminUserStatus(user.id, newStatus);
      showToast(`Estado da conta de ${user.name} alterado para: ${newStatus.toUpperCase()}`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar estado do utilizador', 'error');
    }
  };

  const handleTogglePremium = async (user: any) => {
    try {
      await api.toggleAdminUserPremium(user.id);
      triggerConfetti();
      showToast(`Nível de ${user.name} atualizado!`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar nível', 'error');
    }
  };

  const handleUpdateRole = async (user: any, newRole: string) => {
    try {
      await api.adminUpdateUserRole(user.id, newRole);
      triggerConfetti();
      showToast(`Função de ${user.name} alterada para: ${newRole.toUpperCase()}`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar função', 'error');
    }
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUser) return;
    if (adjustAmount <= 0) {
      showToast('O montante deve ser superior a 0', 'error');
      return;
    }
    if (!adjustReason.trim()) {
      showToast('A justificativa administrativa é obrigatória', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.adminAdjustUserBalance(
        adjustUser.id,
        adjustAmount,
        adjustCurrency,
        adjustType,
        adjustReason
      );
      if (res.success) {
        triggerConfetti();
        showToast(
          `Ajuste de ${adjustAmount.toLocaleString('pt-AO')} ${adjustCurrency} (${adjustType === 'credit' ? 'Crédito' : 'Débito'}) concluído para ${adjustUser.name}!`,
          'success'
        );
        setAdjustModalOpen(false);
        setAdjustReason('');
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao realizar ajuste de saldo', 'error');
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
            Gestão Global & Inspeção de Investidores
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono border border-cyan-800">
              {filteredUsers.length} Contas
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Supervisão de perfis, controlo de permissões, estados de segurança e ajustes administrativos de saldo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, BI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-[#1769D1] outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:ring-2 focus:ring-[#1769D1] outline-hidden"
          >
            <option value="all">Todos os Estados</option>
            <option value="active">Ativos</option>
            <option value="blocked">Bloqueados</option>
            <option value="suspended_withdrawals">Saques Suspensos</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:ring-2 focus:ring-[#1769D1] outline-hidden"
          >
            <option value="user">Investidores Apenas (Users)</option>
            <option value="admin">Administradores</option>
            <option value="superadmin">Superadmin</option>
            <option value="all">Todas as Contas (Incluir Admins)</option>

          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Investidor</th>
                <th className="p-4">Contacto / BI</th>
                <th className="p-4">Nível / Função</th>
                <th className="p-4">Estado da Conta</th>
                <th className="p-4">Saldo Disponível</th>
                <th className="p-4">Saldo em Mineração</th>
                <th className="p-4 text-right">Ações de Autonomia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhum utilizador encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const w: Wallet | undefined = u.wallet;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{u.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300">
                        <div>{u.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{u.phone || 'Sem telefone'}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.membershipLevel === 'premium' 
                              ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {u.membershipLevel === 'premium' ? '★ PREMIUM VIP' : 'NORMAL'}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                            {u.role}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                          u.status === 'active' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : u.status === 'blocked' 
                            ? 'bg-red-950 text-red-400 border border-red-800' 
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'active' ? 'bg-emerald-400 animate-pulse' : u.status === 'blocked' ? 'bg-red-500' : 'bg-amber-400'
                          }`} />
                          {u.status === 'active' ? 'Ativo' : u.status === 'blocked' ? 'Bloqueado' : 'Saques Suspensos'}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-emerald-400">
                        {w ? w.availableBalance.toLocaleString('pt-AO') : '0'} AOA
                        <div className="text-[10px] text-amber-400 font-mono font-normal">
                          {w ? (w.kwanzaCoinBalance || 0).toFixed(2) : '0.00'} KC
                        </div>
                      </td>

                      <td className="p-4 font-bold text-slate-200">
                        {w ? w.investedBalance.toLocaleString('pt-AO') : '0'} AOA
                        <div className="text-[10px] text-slate-400 font-normal">
                          {u.investmentsCount || 0} planos ativos
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Modal Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setInspectModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            title="Inspecionar Detalhes da Conta"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Balance Adjustment Button */}
                          <button
                            onClick={() => {
                              setAdjustUser(u);
                              setAdjustAmount(10000);
                              setAdjustCurrency('AOA');
                              setAdjustType('credit');
                              setAdjustReason('');
                              setAdjustModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors"
                            title="Ajuste Administrativo de Saldo (Crédito/Débito)"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>

                          {/* Toggle Status Dropdown / Buttons */}
                          {u.status === 'active' ? (
                            <button
                              onClick={() => handleToggleStatus(u, 'blocked')}
                              className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 transition-colors"
                              title="Bloquear Conta"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u, 'active')}
                              className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors"
                              title="Desbloquear e Ativar Conta"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Toggle Premium */}
                          <button
                            onClick={() => handleTogglePremium(u)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              u.membershipLevel === 'premium'
                                ? 'bg-amber-950 text-amber-400 border-amber-800 hover:bg-slate-800'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300'
                            }`}
                            title="Alternar Nível Premium"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT USER MODAL */}
      {inspectModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#1769D1]"
                />
                <div>
                  <h3 className="text-lg font-black text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.email} • {selectedUser.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Dados da Conta</div>
                <div><span className="text-slate-500">ID de Utilizador:</span> <strong className="font-mono text-white">{selectedUser.id}</strong></div>
                <div><span className="text-slate-500">Função:</span> <strong className="text-cyan-400 capitalize">{selectedUser.role}</strong></div>
                <div><span className="text-slate-500">Nível Adesão:</span> <strong className="text-amber-400 capitalize">{selectedUser.membershipLevel}</strong></div>
                <div><span className="text-slate-500">Status KYC:</span> <strong className="text-emerald-400 capitalize">{selectedUser.kycStatus || 'Unverified'}</strong></div>
                <div><span className="text-slate-500">Nº Documento BI:</span> <strong className="font-mono text-white">{selectedUser.kycDocumentNumber || 'Não Fornecido'}</strong></div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Saldos & Carteira</div>
                <div><span className="text-slate-500">Disponível em Kwanza:</span> <strong className="text-emerald-400 font-bold">{selectedUser.wallet?.availableBalance?.toLocaleString('pt-AO')} AOA</strong></div>
                <div><span className="text-slate-500">Alocado em Mineração:</span> <strong className="text-white font-bold">{selectedUser.wallet?.investedBalance?.toLocaleString('pt-AO')} AOA</strong></div>
                <div><span className="text-slate-500">Saldo KwanzaCoin:</span> <strong className="text-amber-400 font-bold">{selectedUser.wallet?.kwanzaCoinBalance?.toFixed(2)} KC</strong></div>
                <div><span className="text-slate-500">Lucro Total Acumulado:</span> <strong className="text-cyan-400 font-bold">{selectedUser.wallet?.accumulatedProfit?.toLocaleString('pt-AO')} AOA</strong></div>
                <div><span className="text-slate-500">Saldo Cativado/Bloqueado:</span> <strong className="text-red-400 font-bold">{selectedUser.wallet?.lockedBalance?.toLocaleString('pt-AO')} AOA</strong></div>
              </div>
            </div>

            {/* Bank account details */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-400 uppercase text-[10px] flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Conta Bancária Associada para Saques
              </div>
              {selectedUser.bankAccount ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div>Banco: <strong className="text-white">{selectedUser.bankAccount.bankName}</strong></div>
                  <div>Titular: <strong className="text-white">{selectedUser.bankAccount.accountHolder}</strong></div>
                  <div className="sm:col-span-2 font-mono text-[#1769D1]">IBAN: {selectedUser.bankAccount.iban}</div>
                </div>
              ) : (
                <div className="text-slate-500 italic">Nenhum IBAN bancário registado nesta conta.</div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setInspectModalOpen(false);
                  setAdjustUser(selectedUser);
                  setAdjustAmount(10000);
                  setAdjustCurrency('AOA');
                  setAdjustType('credit');
                  setAdjustReason('');
                  setAdjustModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Efetuar Ajuste de Saldo
              </button>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BALANCE ADJUSTMENT MODAL */}
      {adjustModalOpen && adjustUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Ajuste Administrativo de Saldo
                </h3>
                <p className="text-xs text-slate-400">Credite ou debite fundos diretamente na carteira de {adjustUser.name}.</p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipo de Operação</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="credit">Crédito (+ Adicionar)</option>
                    <option value="debit">Débito (- Subtrair)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Moeda Target</label>
                  <select
                    value={adjustCurrency}
                    onChange={(e) => setAdjustCurrency(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="AOA">Kwanza (AOA)</option>
                    <option value="KC">KwanzaCoin (KC)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Montante</label>
                <input
                  type="number"
                  min={1}
                  step={adjustCurrency === 'KC' ? 0.1 : 1000}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-black text-emerald-400 focus:ring-2 focus:ring-[#1769D1]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Justificativa Administrativa (Obrigatório / Auditado)</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Bónus de incentivo regional, correção de depósito bancário presencial, compensação..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-[#1769D1]"
                  required
                />
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Esta operação é final, modifica imediatamente o saldo do investidor e será registada permanentemente nos Logs de Auditoria do Superadmin.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1769D1] hover:bg-blue-600 text-white font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'A processar...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
