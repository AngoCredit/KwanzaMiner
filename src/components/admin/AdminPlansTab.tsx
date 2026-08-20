import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import { InvestmentPlan } from '../../types/index.ts';
import { 
  Cpu, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  X, 
  Sparkles, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

interface AdminPlansTabProps {
  plans: InvestmentPlan[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  triggerConfetti: () => void;
}

export const AdminPlansTab: React.FC<AdminPlansTabProps> = ({
  plans,
  onRefresh,
  showToast,
  triggerConfetti
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minimumAmount, setMinimumAmount] = useState<number>(6000);
  const [maximumAmount, setMaximumAmount] = useState<number>(100000);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [returnRatePercent, setReturnRatePercent] = useState<number>(25);
  const [miningRatePerHour, setMiningRatePerHour] = useState<number>(0.2);
  const [kwanzaCoinRatePercent, setKwanzaCoinRatePercent] = useState<number>(5);
  const [tag, setTag] = useState('Recomendado');
  const [isPopular, setIsPopular] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setDescription('');
    setMinimumAmount(6000);
    setMaximumAmount(100000);
    setDurationDays(30);
    setReturnRatePercent(25);
    setMiningRatePerHour(0.2);
    setKwanzaCoinRatePercent(5);
    setTag('Novo Plano');
    setIsPopular(false);
    setModalOpen(true);
  };

  const openEditModal = (p: InvestmentPlan) => {
    setEditingPlan(p);
    setName(p.name);
    setDescription(p.description);
    setMinimumAmount(p.minimumAmount);
    setMaximumAmount(p.maximumAmount);
    setDurationDays(p.durationDays);
    setReturnRatePercent(p.returnRatePercent);
    setMiningRatePerHour(p.miningRatePerHour);
    setKwanzaCoinRatePercent(p.kwanzaCoinRatePercent);
    setTag(p.tag || '');
    setIsPopular(Boolean(p.isPopular));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minimumAmount < 6000) {
      showToast('O investimento mínimo deve ser de pelo menos 6.000 AOA', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description,
        minimumAmount,
        maximumAmount,
        durationDays,
        returnRatePercent,
        dailyRatePercent: returnRatePercent / durationDays,
        miningRatePerHour,
        kwanzaCoinRatePercent,
        tag,
        isPopular
      };

      if (editingPlan) {
        await api.updatePlan(editingPlan.id, payload);
        showToast(`Plano "${name}" atualizado com sucesso!`, 'success');
      } else {
        await api.createPlan(payload);
        triggerConfetti();
        showToast(`Novo Plano "${name}" criado e publicado!`, 'success');
      }

      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao guardar plano', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (p: InvestmentPlan) => {
    try {
      await api.updatePlan(p.id, { active: !p.active });
      showToast(`Plano "${p.name}" ${!p.active ? 'ativado' : 'desativado'}.`, 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar estado do plano', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            Configuração dos Planos de Mineração
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono border border-amber-800">
              {plans.length} Ofertas
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Criação e edição dinâmica dos pacotes de computação em nuvem (Início a 6.000 AOA).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#1769D1] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Plano de Mineração</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">{p.name}</h3>
                  {p.tag && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">ID: {p.id}</div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                p.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
              }`}>
                {p.active ? 'Ativo na Rede' : 'Inativo / Arquivado'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>

            <div className="p-4 bg-slate-950 rounded-2xl space-y-2 text-xs border border-slate-800/80">
              <div className="flex justify-between text-slate-300">
                <span>Rendimento Total ROI:</span>
                <strong className="text-emerald-400 font-black">+{p.returnRatePercent}% ({p.dailyRatePercent?.toFixed(2)}%/dia)</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Investimento Mínimo:</span>
                <strong className="text-white font-mono">{p.minimumAmount.toLocaleString('pt-AO')} AOA</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Investimento Máximo:</span>
                <strong className="text-white font-mono">{p.maximumAmount.toLocaleString('pt-AO')} AOA</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Duração do Ciclo:</span>
                <strong className="text-white font-bold">{p.durationDays} Dias</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxa Mineração KC:</span>
                <strong className="text-amber-400 font-bold">{p.miningRatePerHour} KC/hora</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleToggleActive(p)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors ${
                  p.active
                    ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}
              >
                {p.active ? 'Desativar Oferta' : 'Ativar Oferta'}
              </button>

              <button
                onClick={() => openEditModal(p)}
                className="px-4 py-1.5 rounded-xl bg-[#1769D1] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Plano</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white">
                  {editingPlan ? `Editar ${editingPlan.name}` : 'Criar Novo Plano de Mineração'}
                </h3>
                <p className="text-xs text-slate-400">Defina os parâmetros financeiros e taxa de mineração.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nome do Plano</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Plano Master Rig"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tag / Destaque</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Ex: Mais Popular"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição apelativa para os investidores..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mínimo (AOA)</label>
                  <input
                    type="number"
                    min={6000}
                    step={1000}
                    value={minimumAmount}
                    onChange={(e) => setMinimumAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Máximo (AOA)</label>
                  <input
                    type="number"
                    min={6000}
                    step={10000}
                    value={maximumAmount}
                    onChange={(e) => setMaximumAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duração (Dias)</label>
                  <input
                    type="number"
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Retorno Total (%)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={returnRatePercent}
                    onChange={(e) => setReturnRatePercent(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mineração (KC/hora)</label>
                  <input
                    type="number"
                    step={0.01}
                    value={miningRatePerHour}
                    onChange={(e) => setMiningRatePerHour(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-bold text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-[#1769D1]"
                />
                <label htmlFor="isPopular" className="text-xs text-slate-300 font-bold">
                  Marcar como Plano Popular em Destaque na Landing Page
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1769D1] hover:bg-blue-600 text-white font-bold shadow-md transition-colors"
                >
                  {isSubmitting ? 'A guardar...' : editingPlan ? 'Guardar Alterações' : 'Publicar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
