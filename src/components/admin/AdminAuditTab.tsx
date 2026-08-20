import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.ts';
import { AuditLog } from '../../types/index.ts';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  UserCheck 
} from 'lucide-react';

interface AdminAuditTabProps {
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({ showToast }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(term) ||
      (log.adminEmail || '').toLowerCase().includes(term) ||
      (log.targetResource || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term) ||
      (log.ipAddress || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Trilho de Auditoria & Registro de Operações
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1769D1]/20 text-blue-300 font-mono border border-[#1769D1]/30">
              {filteredLogs.length} Registos Auditados
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Registo imutável de todas as ações administrativas, alterações de saldo, aprovações e privilégios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Pesquisar por ação, admin, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-[#1769D1] outline-hidden"
            />
          </div>

          <button
            onClick={loadAuditLogs}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            title="Atualizar Logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Administrador</th>
                <th className="p-4">Ação Auditada</th>
                <th className="p-4">Recurso Afetado</th>
                <th className="p-4">Detalhes da Operação</th>
                <th className="p-4 text-right">IP & Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhum registo de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString('pt-AO')}
                    </td>

                    <td className="p-4 font-bold text-white">
                      {log.adminEmail}
                      <div className="text-[10px] text-slate-500 font-mono">ID: {log.adminId}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300 font-medium">
                      {log.targetResource}
                    </td>

                    <td className="p-4 text-slate-300 max-w-xs truncate">
                      {log.details}
                    </td>

                    <td className="p-4 text-right font-mono text-slate-400 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
