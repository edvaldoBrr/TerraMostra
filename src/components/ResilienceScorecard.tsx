import React from 'react';
import { 
  ShieldCheck, 
  Droplets, 
  Sprout, 
  Layers, 
  DollarSign, 
  AlertOctagon, 
  CheckCircle, 
  TrendingUp, 
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { SimulationResult, Language } from '../types';

interface ResilienceScorecardProps {
  simulation: SimulationResult;
  language: Language;
}

export const ResilienceScorecard: React.FC<ResilienceScorecardProps> = ({
  simulation,
  language,
}) => {
  const isPt = language === 'pt';
  const score = simulation.resilienceScore;

  const getScoreColor = (val: number) => {
    if (val >= 80) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-800/60' };
    if (val >= 60) return { stroke: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-950/60', border: 'border-sky-800/60' };
    if (val >= 40) return { stroke: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-800/60' };
    return { stroke: '#f43f5e', text: 'text-rose-400', bg: 'bg-rose-950/60', border: 'border-rose-800/60' };
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 shadow-lg">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white sm:text-lg">
            {isPt ? 'Índice de Resiliência Climática NASA' : 'NASA Climate Resilience Scorecard'}
          </h2>
        </div>

        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${colors.bg} ${colors.border} ${colors.text}`}>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{isPt ? 'Risco Climático: ' : 'Climate Risk: '} {simulation.climateRiskLevel}</span>
        </div>
      </div>

      {/* Main Grid: Gauge on Left, Metrics on Right */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Gauge Box */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-stone-800/80 bg-stone-950/60 p-5 text-center lg:col-span-4">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-stone-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={colors.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold ${colors.text}`}>
                {score}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                / 100 pts
              </span>
            </div>
          </div>

          <h3 className="mt-3 text-sm font-bold text-white">
            {score >= 80 ? (isPt ? 'Estratégia Altamente Resiliente' : 'Highly Resilient Strategy') :
             score >= 60 ? (isPt ? 'Resiliência Moderada' : 'Moderate Resilience') :
             score >= 40 ? (isPt ? 'Vulnerabilidade Elevada' : 'Elevated Vulnerability') :
             (isPt ? 'Risco Crítico de Quebra' : 'Critical Crop Failure Risk')}
          </h3>
          <p className="mt-1 text-xs text-stone-400">
            {isPt 
              ? 'Calculado com base em dados de umidade SMAP, precipitação GPM e estresse ECOSTRESS.' 
              : 'Computed from NASA SMAP moisture, GPM rainfall, and ECOSTRESS canopy data.'}
          </p>
        </div>

        {/* Right: Sub-scores & Tangible Gains */}
        <div className="space-y-4 lg:col-span-8">
          
          {/* Tangible Impact Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            
            <div className="rounded-xl border border-stone-800 bg-stone-900/90 p-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Droplets className="h-3.5 w-3.5 text-sky-400" />
                <span>{isPt ? 'Água Poupada' : 'Water Saved'}</span>
              </div>
              <div className="mt-1 text-base font-bold text-white sm:text-lg">
                +{simulation.waterSavedM3PerHa.toLocaleString()}
                <span className="ml-1 text-xs font-normal text-stone-400">m³/ha</span>
              </div>
              <span className="text-[10px] text-stone-400">{isPt ? 'via cobertura de palha' : 'via mulch retention'}</span>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-900/90 p-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Sprout className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isPt ? 'Nitrogênio Biológico' : 'Bio-Nitrogen'}</span>
              </div>
              <div className="mt-1 text-base font-bold text-white sm:text-lg">
                {simulation.nitrogenBalanceNetKg > 0 ? `+${simulation.nitrogenBalanceNetKg}` : simulation.nitrogenBalanceNetKg}
                <span className="ml-1 text-xs font-normal text-stone-400">kg/ha</span>
              </div>
              <span className="text-[10px] text-stone-400">{isPt ? 'fixação biológica' : 'symbiotic fixation'}</span>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-900/90 p-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <DollarSign className="h-3.5 w-3.5 text-yellow-400" />
                <span>{isPt ? 'Economia Insumos' : 'Input Savings'}</span>
              </div>
              <div className="mt-1 text-base font-bold text-white sm:text-lg">
                ${simulation.fertilizerSavingsUSDPerHa}
                <span className="ml-1 text-xs font-normal text-stone-400">/ha</span>
              </div>
              <span className="text-[10px] text-stone-400">{isPt ? 'economia de fertilizante' : 'in fertilizer spend'}</span>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-900/90 p-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span>{isPt ? 'Biomassa Seca' : 'Dry Biomass'}</span>
              </div>
              <div className="mt-1 text-base font-bold text-white sm:text-lg">
                {simulation.biomassTotalTons}
                <span className="ml-1 text-xs font-normal text-stone-400">t/ha</span>
              </div>
              <span className="text-[10px] text-stone-400">{isPt ? 'carbono no solo' : 'organic carbon'}</span>
            </div>

          </div>

          {/* Sub-Metric Progress Bars */}
          <div className="space-y-2.5 rounded-xl border border-stone-800/80 bg-stone-950/40 p-4">
            
            {/* Water conservation */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium">{isPt ? 'Eficiência e Conservação Hídrica (NASA SMAP/ECOSTRESS)' : 'Water Conservation Efficiency'}</span>
                <span className="font-bold text-sky-400">{simulation.waterConservationScore}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
                <div 
                  className="h-full rounded-full bg-sky-500 transition-all duration-700" 
                  style={{ width: `${simulation.waterConservationScore}%` }}
                />
              </div>
            </div>

            {/* Soil regeneration */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium">{isPt ? 'Regeneração de Carbono e Saúde do Solo' : 'Soil Organic Carbon Regeneration'}</span>
                <span className="font-bold text-emerald-400">{simulation.soilRegenerationScore}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
                <div 
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700" 
                  style={{ width: `${simulation.soilRegenerationScore}%` }}
                />
              </div>
            </div>

            {/* Root Stratification & Compaction */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium">{isPt ? 'Estratificação Radicular e Rompimento de Compactação' : 'Root Stratification & Plow Pan Relief'}</span>
                <span className="font-bold text-amber-400">{simulation.rootDepthCoverageScore}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
                <div 
                  className="h-full rounded-full bg-amber-500 transition-all duration-700" 
                  style={{ width: `${simulation.rootDepthCoverageScore}%` }}
                />
              </div>
            </div>

            {/* Erosion Protection */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium">{isPt ? 'Blindagem contra Chuvas Torrenciais (NASA GPM)' : 'Erosion Armor against GPM Extreme Rains'}</span>
                <span className="font-bold text-indigo-400">{simulation.erosionProtectionIndex}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
                <div 
                  className="h-full rounded-full bg-indigo-500 transition-all duration-700" 
                  style={{ width: `${simulation.erosionProtectionIndex}%` }}
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Moisture Deficit Alerts if any */}
      {simulation.nasaMoistureDeficitAlerts.length > 0 && (
        <div className="mt-4 rounded-xl border border-rose-900/50 bg-rose-950/30 p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
            <AlertOctagon className="h-4 w-4" />
            <span>{isPt ? 'Alertas de Incompatibilidade Hídrica NASA' : 'NASA Satellite Moisture Deficit Alerts'}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-rose-200">
            {simulation.nasaMoistureDeficitAlerts.map((alert, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-rose-400">•</span>
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strategic Recommendations */}
      {simulation.recommendations.length > 0 && (
        <div className="mt-3 rounded-xl border border-stone-800 bg-stone-950/60 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>{isPt ? 'Recomendações Práticas do Motor Agronômico' : 'Agronomic Engine Recommendations'}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-stone-300">
            {simulation.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
