import React from 'react';
import { Columns, X, Check, ArrowRight, ShieldCheck, Droplets, Sprout, Layers, DollarSign } from 'lucide-react';
import { SimulationResult, RotationPhase, Language, NasaSatelliteData, SoilProfile, FarmerPriorities } from '../types';
import { PRESET_STRATEGIES } from '../data/presets';
import { calculateRotationSimulation } from '../utils/agronomicCalculations';
import { CROPS_DATABASE } from '../data/crops';

interface StrategyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSimulation: SimulationResult;
  currentPhases: RotationPhase[];
  nasaData: NasaSatelliteData;
  soil: SoilProfile;
  priorities: FarmerPriorities;
  language: Language;
}

export const StrategyComparisonModal: React.FC<StrategyComparisonModalProps> = ({
  isOpen,
  onClose,
  currentSimulation,
  currentPhases,
  nasaData,
  soil,
  priorities,
  language,
}) => {
  if (!isOpen) return null;
  const isPt = language === 'pt';

  // Calculate Conventional Strategy baseline simulation
  const conventionalPreset = PRESET_STRATEGIES[0];
  const conventionalSim = calculateRotationSimulation(
    conventionalPreset.phases,
    nasaData,
    soil,
    priorities
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
              <Columns className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white sm:text-lg">
                {isPt ? 'Comparador: Manejo Tradicional vs Adaptação NASA' : 'Benchmark: Conventional Practice vs NASA-Adapted Strategy'}
              </h3>
              <p className="text-xs text-stone-400">
                {isPt 
                  ? 'Veja o impacto agronômico e financeiro da transição para uma rotação guiada por satélites.'
                  : 'Quantified agronomic and economic benefits of transitioning to satellite-guided rotation.'}
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

        {/* Comparison Content */}
        <div className="overflow-y-auto p-5 space-y-6">
          
          {/* Top Comparative KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            
            {/* Left: Conventional */}
            <div className="rounded-xl border border-rose-950/70 bg-stone-950/80 p-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  {isPt ? 'Manejo Convencional (Padrão)' : 'Conventional Practice'}
                </span>
                <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-900">
                  {isPt ? 'Risco Alto' : 'High Risk'}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-300">
                  {conventionalSim.resilienceScore}
                </span>
                <span className="text-xs text-stone-500">/ 100 {isPt ? 'Resiliência' : 'Resilience'}</span>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-stone-400">
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-500">✗</span>
                  <span>{isPt ? 'Solo exposto na entressafra (perda rápida de água no SMAP)' : 'Bare winter fallow (rapid SMAP soil moisture loss)'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-500">✗</span>
                  <span>{isPt ? 'Saldo de Nitrogênio:' : 'Nitrogen balance:'} <strong className="text-rose-400">{conventionalSim.nitrogenBalanceNetKg} kg N/ha</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-500">✗</span>
                  <span>{isPt ? 'Biomassa seca total:' : 'Total dry biomass:'} <strong className="text-stone-300">{conventionalSim.biomassTotalTons} t/ha</strong></span>
                </li>
              </ul>
            </div>

            {/* Right: Active NASA Strategy */}
            <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/30 p-4">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {isPt ? 'Estratégia Ativa Adaptada NASA' : 'Active NASA-Adapted Strategy'}
                </span>
                <span className="rounded bg-emerald-900/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-700">
                  {currentSimulation.climateRiskLevel}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400">
                  {currentSimulation.resilienceScore}
                </span>
                <span className="text-xs text-emerald-500">
                  +{currentSimulation.resilienceScore - conventionalSim.resilienceScore} {isPt ? 'pontos de ganho' : 'pts improvement'}
                </span>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-emerald-200">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{isPt ? 'Cobertura contínua: reduz temperatura de superfície em até 8°C' : 'Continuous mulch: lowers POWER ground temp by up to 8°C'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{isPt ? 'Saldo de Nitrogênio:' : 'Nitrogen balance:'} <strong className="text-emerald-300">+{currentSimulation.nitrogenBalanceNetKg} kg N/ha</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{isPt ? 'Biomassa seca acumulada:' : 'Total dry biomass:'} <strong className="text-emerald-300">{currentSimulation.biomassTotalTons} t/ha</strong></span>
                </li>
              </ul>
            </div>

          </div>

          {/* Detailed Metric Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-800 bg-stone-900/80 text-[11px] uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="p-3 font-semibold">{isPt ? 'Indicador Agronômico & NASA' : 'Agronomic & NASA Indicator'}</th>
                  <th className="p-3 font-semibold text-rose-400">{isPt ? 'Convencional' : 'Conventional'}</th>
                  <th className="p-3 font-semibold text-emerald-400">{isPt ? 'Adaptada NASA' : 'NASA-Adapted'}</th>
                  <th className="p-3 font-semibold text-sky-400">{isPt ? 'Diferencial' : 'Net Benefit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-300">
                <tr>
                  <td className="p-3 font-medium text-white">{isPt ? 'Retenção Hídrica (NASA SMAP/ECOSTRESS)' : 'Water Retention (SMAP/ECOSTRESS)'}</td>
                  <td className="p-3 font-mono text-stone-400">{conventionalSim.waterConservationScore}%</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{currentSimulation.waterConservationScore}%</td>
                  <td className="p-3 text-emerald-400 font-semibold">+{currentSimulation.waterSavedM3PerHa} m³/ha</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">{isPt ? 'Regeneração de Carbono e Matéria Orgânica' : 'Organic Carbon Regeneration'}</td>
                  <td className="p-3 font-mono text-stone-400">{conventionalSim.soilRegenerationScore}%</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{currentSimulation.soilRegenerationScore}%</td>
                  <td className="p-3 text-emerald-400 font-semibold">+{((currentSimulation.biomassTotalTons - conventionalSim.biomassTotalTons)).toFixed(1)} t/ha biomassa</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">{isPt ? 'Economia em Adubação Nitrogenada Sintética' : 'Synthetic Nitrogen Fertilizer Savings'}</td>
                  <td className="p-3 font-mono text-stone-400">$0/ha</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">${currentSimulation.fertilizerSavingsUSDPerHa}/ha</td>
                  <td className="p-3 text-emerald-400 font-semibold">+${currentSimulation.fertilizerSavingsUSDPerHa}/ha poupados</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">{isPt ? 'Descompactação Radicular (Pé-de-grade)' : 'Root Depth & Plow Pan Relief'}</td>
                  <td className="p-3 font-mono text-stone-400">{conventionalSim.rootDepthCoverageScore}%</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{currentSimulation.rootDepthCoverageScore}%</td>
                  <td className="p-3 text-sky-400 font-semibold">Bioporos permanentes &gt; 180cm</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">{isPt ? 'Pressão de Fitonematoides de Solo' : 'Nematode Infestation Pressure'}</td>
                  <td className="p-3 font-mono text-rose-400 font-bold">{conventionalSim.nematodeRiskIndex}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{currentSimulation.nematodeRiskIndex}</td>
                  <td className="p-3 text-emerald-400 font-semibold">{isPt ? 'Quebra de ciclo biológica' : 'Biological cycle disruption'}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">{isPt ? 'Blindagem contra Chuvas Torrenciais (GPM)' : 'Erosion Protection Index (GPM)'}</td>
                  <td className="p-3 font-mono text-stone-400">{conventionalSim.erosionProtectionIndex}%</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{currentSimulation.erosionProtectionIndex}%</td>
                  <td className="p-3 text-sky-400 font-semibold">+{currentSimulation.erosionProtectionIndex - conventionalSim.erosionProtectionIndex}% proteção</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-950 p-4 text-xs text-stone-400">
            <span className="font-semibold text-emerald-400">{isPt ? 'Conclusão Técnica:' : 'Technical Takeaway:'}</span>
            <p className="mt-1 leading-relaxed">
              {isPt 
                ? 'A rotação adaptada com dados da NASA transforma a fazenda de um sistema vulnerável a veranicos em um ecossistema com capacidade biológica de amortecimento hídrico. A palhada protege a umidade medida pelo SMAP e a fixação biológica diminui os custos de produção.'
                : 'NASA satellite-adapted crop rotations transform vulnerable farms into self-buffering ecosystems. Retained mulch shields SMAP root-zone moisture while biological N fixation cuts synthetic fertilizer expenses.'}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-stone-800 p-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700"
          >
            {isPt ? 'Fechar Comparador' : 'Close Comparison'}
          </button>
        </div>

      </div>
    </div>
  );
};
