import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../lib/api.ts';
import { 
  Cpu, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Coins, 
  Layers, 
  Activity, 
  RefreshCw, 
  ChevronRight,
  Server
} from 'lucide-react';

interface MiningLiveStationProps {
  onNavigate?: (tab: string) => void;
}

export const MiningLiveStation: React.FC<MiningLiveStationProps> = ({ onNavigate }) => {
  const { currentUser, wallet, kcRate, showToast, refreshAll, triggerConfetti } = useApp();

  const [miningStatus, setMiningStatus] = useState<any>(null);
  const [upgradingLevel, setUpgradingLevel] = useState<number | null>(null);

  const loadStatus = async () => {
    if (!currentUser) return;
    try {
      const res = await api.getMiningStatus(currentUser.id);
      if (res.success) {
        setMiningStatus(res);
      }
    } catch (err) {
      // Silent
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleUpgradeBoost = async (targetLevel: number) => {
    if (!currentUser) return;
    setUpgradingLevel(targetLevel);
    try {
      const res = await api.upgradeMiningBoost(currentUser.id, targetLevel);
      if (res.success) {
        triggerConfetti();
        showToast(`Acelerador de Mineração promovido para o Nível ${targetLevel}!`, 'success');
        await loadStatus();
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao subir de nível', 'error');
    } finally {
      setUpgradingLevel(null);
    }
  };

  const currentLevel = miningStatus?.boostLevel || wallet?.miningBoostLevel || 1;
  const currentMultiplier = miningStatus?.multiplier || 1.0;
  const hashrate = miningStatus?.hashrate || '12.5 MH/s';

  return (
    <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1769D1]/20 border border-[#1769D1]/40 flex items-center justify-center text-[#1769D1]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Estação de Mineração em Tempo Real</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nós computacionais em Luanda e Benguela. Processamento contínuo 24/24h.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Hashrate:</span>
            <span className="font-mono font-bold text-amber-400">{hashrate}</span>
          </div>

          <div className="bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-300">
            {currentMultiplier}x Multiplicador
          </div>
        </div>
      </div>

      {/* Nodes Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {(miningStatus?.activeNodes || [
          { id: 'AO-NODE-01', location: 'Luanda Datacenter Hub', status: 'optimal', latency: '4ms' },
          { id: 'AO-NODE-02', location: 'Benguela Solar Farm', status: 'optimal', latency: '8ms' },
          { id: 'AO-NODE-03', location: 'Soyo Hydro Mining Unit', status: 'standby', latency: '6ms' },
          { id: 'AO-NODE-04', location: 'Cabinda Offshore Supernode', status: 'standby', latency: '12ms' },
        ]).map((node: any) => (
          <div key={node.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-slate-400 font-bold">{node.id}</div>
              <div className="text-white font-semibold text-[11px]">{node.location}</div>
            </div>
            <div className="text-right">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mb-1"></span>
              <div className="text-[10px] font-mono text-slate-400">{node.latency}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Boost Level Progression */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Nível do Acelerador de Mineração
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-bold">Nível Atual: {currentLevel}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { level: 1, name: 'Básico', mult: '1.0x', cost: 0, desc: 'Mineração Standard incluída em todos os planos.' },
            { level: 2, name: 'Pro Turbo', mult: '1.5x', cost: 50, desc: 'Aumenta rendimento diário de microcêntimos em +50%.' },
            { level: 3, name: 'Quantum Ultra', mult: '2.5x', cost: 150, desc: 'Aceleração máxima e prioridade nos nós da rede.' },
          ].map((tier) => {
            const isCurrent = currentLevel === tier.level;
            const isAvailable = currentLevel < tier.level;

            return (
              <div
                key={tier.level}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#1769D1]/10 border-[#1769D1] text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-amber-400">{tier.mult} Velocidade</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{tier.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">
                    {tier.cost === 0 ? 'Grátis' : `${tier.cost} KC`}
                  </span>

                  {isAvailable && (
                    <button
                      onClick={() => handleUpgradeBoost(tier.level)}
                      disabled={upgradingLevel === tier.level}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black transition-colors"
                    >
                      {upgradingLevel === tier.level ? '...' : 'Subir Nível'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
