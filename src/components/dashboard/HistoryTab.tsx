import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Coins, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  XCircle
} from 'lucide-react';

export const HistoryTab: React.FC = () => {
  const { ledgerEntries, transactions, showToast, currentUser } = useApp();
  const [deposits, setDeposits] = useState<any[]>([]);

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const safeEntries = ledgerEntries || transactions || [];

  // Load user deposits to show pending status
  useEffect(() => {
    if (!currentUser) return;
    api.getDeposits(currentUser.id).then((res) => {
      if (res?.deposits) setDeposits(res.deposits);
    }).catch(() => {});
  }, [currentUser]);

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const approvedDeposits = deposits.filter(d => d.status === 'approved');

  // Filter entries safely
  const filteredLedger = safeEntries.filter(entry => {
    if (!entry) return false;
    if (filterType !== 'all' && entry.type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const desc = (entry.description || '').toLowerCase();
      const id = (entry.id || '').toLowerCase();
      const ref = (entry.reference || (entry as any).referenceId || '').toLowerCase();
      return desc.includes(term) || id.includes(term) || ref.includes(term);
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Data,Tipo,Descricao,Valor,Moeda,Saldo_Anterior,Saldo_Posterior\n';
    const rows = filteredLedger.map(e => 
      `"${e.id}","${e.createdAt}","${e.type}","${(e.description || '').replace(/"/g, '""')}","${e.amount}","${e.currency}","${e.balanceBefore}","${e.balanceAfter}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kwanzacoin_extrato_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Extrato CSV exportado com sucesso!', 'info');
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'investment_created':
      case 'investment':
        return <Cpu className="w-4 h-4 text-[#1769D1]" />;
      case 'profit_accrual':
      case 'profit_claimed':
      case 'mining_profit':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'kc_conversion':
      case 'kwanza_coin_conversion':
      case 'kwanza_coin_mined':
        return <Coins className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Deposits Alert */}
      {pendingDeposits.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-900 text-sm">Depósitos Pendentes de Validação ({pendingDeposits.length})</span>
          </div>
          <div className="space-y-2">
            {pendingDeposits.map(dep => (
              <div key={dep.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">{dep.amount.toLocaleString('pt-AO')} AOA</div>
                  <div className="text-[10px] text-slate-500 font-mono">{dep.id} • {new Date(dep.createdAt).toLocaleString('pt-AO')}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Em Validação
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-800 mt-2">⏳ O saldo será creditado automaticamente após aprovação pela equipa financeira.</p>
        </div>
      )}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Histórico de Movimentações & Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registo contábil completo de todas as transações, investimentos, minerações e rendimentos.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Extrato (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por descrição, ID..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1769D1]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'deposit', label: 'Depósitos' },
            { id: 'investment', label: 'Investimentos' },
            { id: 'mining_profit', label: 'Rendimentos' },
            { id: 'kc_conversion', label: 'Conversões KC' },
            { id: 'withdrawal', label: 'Saques' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-[#1769D1] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Operação & Data</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Saldo Anterior</th>
                <th className="py-3 px-4">Saldo Posterior</th>
                <th className="py-3 px-4">Referência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum registo encontrado com os filtros actuais.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((entry) => {
                  const isPositive = ['deposit', 'profit_accrual', 'profit_claimed', 'mining_profit', 'kwanza_coin_mined'].includes(entry.type) || (entry.type === 'kc_conversion' && entry.currency === 'AOA');

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-100">
                            {getEntryIcon(entry.type)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 capitalize">
                              {(entry.type || '').replace(/_/g, ' ')}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {entry.createdAt ? new Date(entry.createdAt).toLocaleString('pt-AO') : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                        {entry.description}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-bold font-mono ${
                          isPositive ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          {isPositive ? '+' : ''}{(entry.amount || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} {entry.currency}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {(entry.balanceBefore || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} {entry.currency}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {(entry.balanceAfter || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} {entry.currency}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                        {entry.reference || (entry as any).referenceId || entry.id}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
