import React from 'react';
import { Sliders, X, Sparkles, Check, Droplets, Sprout, DollarSign, ShieldAlert } from 'lucide-react';
import { SoilProfile, FarmerPriorities, Language } from '../types';

interface FieldConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  soil: SoilProfile;
  onChangeSoil: (soil: SoilProfile) => void;
  priorities: FarmerPriorities;
  onChangePriorities: (priorities: FarmerPriorities) => void;
  language: Language;
}

export const FieldConfigModal: React.FC<FieldConfigModalProps> = ({
  isOpen,
  onClose,
  soil,
  onChangeSoil,
  priorities,
  onChangePriorities,
  language,
}) => {
  if (!isOpen) return null;
  const isPt = language === 'pt';

  const textures = [
    'Arenoso (Sandy)',
    'Franco-arenoso (Loamy Sand)',
    'Franco (Loam)',
    'Franco-argiloso (Clay Loam)',
    'Argiloso (Clay)',
    'Muito Argiloso (Heavy Clay)',
  ] as const;

  const compactionOptions = [
    'Baixa (Sem impedimento)',
    'Média (Pé-de-grade a 20cm)',
    'Alta (Camada adensada severa)',
  ] as const;

  const waterCapacities = [
    'Baixa (<50mm/m)',
    'Média (50-100mm/m)',
    'Alta (>100mm/m)',
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white sm:text-lg">
                {isPt ? 'Configuração do Solo e Prioridades do Produtor' : 'Soil Profile & Farmer Priorities'}
              </h3>
              <p className="text-xs text-stone-400">
                {isPt 
                  ? 'Ajuste os parâmetros pedológicos locais para calibrar o motor de decisão da NASA.'
                  : 'Adjust local soil parameters to calibrate the NASA agronomic decision engine.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: Local Soil Profile */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isPt ? '1. Perfil Físico & Químico do Solo' : '1. Physical & Chemical Soil Profile'}
            </h4>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              
              {/* Texture */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {isPt ? 'Textura do Solo' : 'Soil Texture'}
                </label>
                <select
                  value={soil.texture}
                  onChange={e => onChangeSoil({ ...soil, texture: e.target.value as any })}
                  className="w-full rounded-lg border border-stone-700 bg-stone-950 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {textures.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Compaction Level */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {isPt ? 'Nível de Compactação (Pé-de-grade)' : 'Compaction Layer (Hardpan)'}
                </label>
                <select
                  value={soil.compactionLevel}
                  onChange={e => onChangeSoil({ ...soil, compactionLevel: e.target.value as any })}
                  className="w-full rounded-lg border border-stone-700 bg-stone-950 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {compactionOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Organic Matter % Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-300 mb-1">
                  <span>{isPt ? 'Matéria Orgânica do Solo (MO %)' : 'Soil Organic Matter (SOM %)'}</span>
                  <span className="font-mono text-emerald-400">{soil.organicMatter}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.1"
                  value={soil.organicMatter}
                  onChange={e => onChangeSoil({ ...soil, organicMatter: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-stone-400">
                  {soil.organicMatter < 1.5 
                    ? (isPt ? 'Baixa: vulnerável a erosão e perda de água' : 'Low: prone to erosion and moisture loss')
                    : (isPt ? 'Boa capacidade biológica de retenção' : 'Healthy biological buffering capacity')}
                </span>
              </div>

              {/* Soil pH */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-300 mb-1">
                  <span>{isPt ? 'pH do Solo (em água / CaCl2)' : 'Soil pH'}</span>
                  <span className="font-mono text-sky-400">{soil.ph}</span>
                </div>
                <input
                  type="range"
                  min="4.5"
                  max="7.8"
                  step="0.1"
                  value={soil.ph}
                  onChange={e => onChangeSoil({ ...soil, ph: parseFloat(e.target.value) })}
                  className="w-full accent-sky-500"
                />
                <span className="text-[10px] text-stone-400">
                  {soil.ph < 5.2 
                    ? (isPt ? 'Ácido: fixação biológica de leguminosas exige calagem' : 'Acidic: requires liming for N-fixation')
                    : (isPt ? 'Faixa ideal para ciclagem de nutrientes' : 'Ideal nutrient availability range')}
                </span>
              </div>

              {/* Water holding capacity */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {isPt ? 'Capacidade de Retenção de Água (CAD)' : 'Available Water Capacity (AWC)'}
                </label>
                <select
                  value={soil.waterHoldingCapacity}
                  onChange={e => onChangeSoil({ ...soil, waterHoldingCapacity: e.target.value as any })}
                  className="w-full rounded-lg border border-stone-700 bg-stone-950 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {waterCapacities.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Farmer Objectives & Weights */}
          <div className="border-t border-stone-800 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              {isPt ? '2. Prioridades do Produtor (Pesos de Decisão)' : '2. Farmer Priorities (Decision Weights)'}
            </h4>
            <p className="mt-1 text-xs text-stone-400">
              {isPt 
                ? 'Defina o que é mais urgente no seu planejamento para que o algoritmo NASA pondere os resultados.'
                : 'Prioritize your management objectives so the NASA algorithm tailors recommendations.'}
            </p>

            <div className="mt-4 space-y-4">
              
              {/* Water Conservation */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">
                    {isPt ? 'Conservação Hídrica / Tolerância a Secas' : 'Water Conservation / Drought Tolerance'}
                  </span>
                  <span className="font-mono text-sky-400 font-bold">{priorities.waterConservation}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={priorities.waterConservation}
                  onChange={e => onChangePriorities({ ...priorities, waterConservation: parseInt(e.target.value) })}
                  className="w-full accent-sky-500"
                />
              </div>

              {/* Soil Health & Carbon */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">
                    {isPt ? 'Regeneração de Matéria Orgânica e Solo' : 'Soil Organic Matter & Carbon Sequestration'}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{priorities.soilHealth}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={priorities.soilHealth}
                  onChange={e => onChangePriorities({ ...priorities, soilHealth: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Biological Nitrogen */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">
                    {isPt ? 'Fixação Biológica de Nitrogênio (Corte de Adubo Químico)' : 'Biological Nitrogen Fixation (Fertilizer Savings)'}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{priorities.nitrogenFixation}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={priorities.nitrogenFixation}
                  onChange={e => onChangePriorities({ ...priorities, nitrogenFixation: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Erosion Protection */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">
                    {isPt ? 'Controle de Erosão e Cobertura Permanente' : 'Erosion Control & Year-Round Soil Armor'}
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">{priorities.erosionControl}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={priorities.erosionControl}
                  onChange={e => onChangePriorities({ ...priorities, erosionControl: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Economic Yield */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">
                    {isPt ? 'Rentabilidade Financeira e Fluxo de Caixa' : 'Financial Profitability & Grain Revenue'}
                  </span>
                  <span className="font-mono text-yellow-400 font-bold">{priorities.economicYield}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={priorities.economicYield}
                  onChange={e => onChangePriorities({ ...priorities, economicYield: parseInt(e.target.value) })}
                  className="w-full accent-yellow-500"
                />
              </div>

              {/* Pest Suppression */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">
                    {isPt ? 'Quebra de Ciclo de Pragas e Nematoides' : 'Nematode & Soil Pest Cycle Suppression'}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{priorities.pestSuppression}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={priorities.pestSuppression}
                  onChange={e => onChangePriorities({ ...priorities, pestSuppression: parseInt(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-stone-800 p-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
          >
            {isPt ? 'Salvar e Recalcular Modelo' : 'Save & Recalculate Model'}
          </button>
        </div>

      </div>
    </div>
  );
};
