import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { 
  Settings, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  Bell, 
  CheckCircle2, 
  DollarSign,
  Lock,
  Globe
} from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  const { currentUser, showToast, triggerConfetti, refreshAll } = useApp();

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    depositEnabled: true,
    withdrawalEnabled: true,
    investmentEnabled: true,
    minDepositAoa: 6000,
    minWithdrawalAoa: 5000,
    announcementMessage: 'Bem-vindo à plataforma KwanzaCoin! Os depósitos e mineração operam normalmente 24/7.',
    announcementActive: true,
  });

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSystemSettings();
      if (res.success && res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch {
      // Silent
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const res = await api.updateSystemSettings(settings, currentUser.id);
      if (res.success) {
        triggerConfetti();
        showToast('Configurações globais do sistema salvas com sucesso! As alterações entram em vigor imediatamente.', 'success');
        // Reload settings across all contexts so user-facing components pick up changes
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao guardar configurações', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !broadcastTitle || !broadcastMessage) return;

    setIsBroadcasting(true);
    try {
      const res = await api.broadcastMessage(broadcastTitle, broadcastMessage, currentUser.id);
      if (res.success) {
        triggerConfetti();
        showToast('Notificação do sistema enviada a todos os utilizadores ativos!', 'success');
        setBroadcastTitle('');
        setBroadcastMessage('');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao enviar notificação', 'error');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#1769D1]" />
          <span>Configurações do Sistema & Notificações</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gerencie o estado operacional da plataforma, limites de transação e comunicados globais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Settings Form */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-5 h-5 text-[#1769D1]" />
            <span>Controlo Operacional Global</span>
          </h2>

          <div className="space-y-4">
            {/* Toggles */}
            {[
              { key: 'depositEnabled', title: 'Depósitos de Saldos', desc: 'Permite que os utilizadores façam carregamentos via Multicaixa' },
              { key: 'withdrawalEnabled', title: 'Levantamentos para Conta Bancária', desc: 'Permite a solicitação de levantamento em Kwanza' },
              { key: 'investmentEnabled', title: 'Novas Subscrições de Planos', desc: 'Permite a ativação de novos pacotes de mineração' },
              { key: 'maintenanceMode', title: 'Modo de Manutenção Geral', desc: 'Bloqueia operações de utilizadores para atualização do sistema' },
            ].map((item) => {
              const val = (settings as any)[item.key];
              return (
                <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, [item.key]: !val }))}
                    className="p-1 text-slate-700 hover:text-[#1769D1] transition-colors"
                  >
                    {val ? (
                      <ToggleRight className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>
              );
            })}

            {/* Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Depósito Mínimo (AOA)
                </label>
                <input
                  type="number"
                  min={1000}
                  value={settings.minDepositAoa}
                  onChange={(e) => setSettings({ ...settings, minDepositAoa: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Levantamento Mínimo (AOA)
                </label>
                <input
                  type="number"
                  min={1000}
                  value={settings.minWithdrawalAoa}
                  onChange={(e) => setSettings({ ...settings, minWithdrawalAoa: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Announcement banner text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Mensagem do Comunicado Superior (Banner)
              </label>
              <textarea
                rows={2}
                value={settings.announcementMessage}
                onChange={(e) => setSettings({ ...settings, announcementMessage: e.target.value })}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-xl bg-[#1769D1] hover:bg-[#1357ad] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'A guardar...' : 'Guardar Configurações Operacionais'}</span>
          </button>
        </form>

        {/* Global Broadcast Form */}
        <form onSubmit={handleSendBroadcast} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Enviar Notificação do Sistema</span>
          </h2>

          <p className="text-xs text-slate-500">
            Esta mensagem será enviada instantaneamente via Server-Sent Events para todas as sessões ligadas.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título do Anúncio</label>
            <input
              type="text"
              required
              placeholder="Ex: Atualização de Rendimentos Concluída"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Corpo da Mensagem</label>
            <textarea
              rows={4}
              required
              placeholder="Escreva a mensagem para todos os investidores..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isBroadcasting || !broadcastTitle || !broadcastMessage}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>{isBroadcasting ? 'A transmitir...' : 'Transmitir Notificação em Tempo Real'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
