import React from 'react';
import { Layers, ArrowDown, ShieldAlert, Sparkles } from 'lucide-react';
import { RotationPhase, Language, SoilProfile } from '../types';
import { CROPS_DATABASE } from '../data/crops';

interface SubterraneanRootVisualizerProps {
  phases: RotationPhase[];
  soil: SoilProfile;
  language: Language;
}

export const SubterraneanRootVisualizer: React.FC<SubterraneanRootVisualizerProps> = ({
  phases,
  soil,
  language,
}) => {
  const isPt = language === 'pt';
  const crops = phases.map(p => CROPS_DATABASE.find(c => c.id === p.cropId)).filter(Boolean);

  const maxDepthView = 220; // 220 cm scale

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-stone-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-bold text-white sm:text-lg">
            {isPt ? 'Estratificação Radicular & Descompactação Subterrânea' : 'Subterranean Root Stratigraphy & Compaction Breakers'}
          </h2>
        </div>
        <span className="text-xs text-stone-400">
          {isPt ? 'Exploração de água profunda mapeada pelo NASA SMAP' : 'Deep water exploration mapped by NASA SMAP'}
        </span>
      </div>

      <p className="mt-2 text-xs text-stone-400">
        {isPt 
          ? 'Visualização em corte transversal do solo. Culturas com raízes pivotantes profundas criam bioporos que quebram o pé-de-grade (20-35cm), permitindo que culturas subsequentes alcancem a reserva hídrica subterrânea.'
          : 'Soil cross-section visualization. Crops with deep taproots create biopores breaking through plow pans (20-35cm), enabling subsequent crops to access deep moisture reserves.'}
      </p>

      {/* Cross Section Container */}
      <div className="relative mt-6 overflow-hidden rounded-xl border border-stone-800 bg-stone-950 p-4">
        
        {/* Depth Markers on the Left */}
        <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-[10px] font-mono text-stone-500 pointer-events-none select-none z-10">
          <span>0 cm (Superfície)</span>
          <span className="text-amber-500 font-semibold">20 cm (Pé-de-grade)</span>
          <span>60 cm (Umidade SMAP)</span>
          <span>120 cm (Subsolo)</span>
          <span className="text-sky-400">200 cm (Reserva Aquífera)</span>
        </div>

        {/* Soil Horizon Background Layers */}
        <div className="absolute inset-x-0 top-0 h-[15%] bg-amber-950/20 border-b border-stone-800/60 pointer-events-none" />
        {/* Compaction pan layer */}
        <div 
          className="absolute inset-x-0 top-[15%] h-[12%] bg-rose-950/30 border-y border-dashed border-rose-800/50 pointer-events-none flex items-center justify-end pr-4"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400/80 bg-stone-950/80 px-2 py-0.5 rounded border border-rose-900/50">
            {soil.compactionLevel}
          </span>
        </div>
        {/* Deep Root-Zone */}
        <div className="absolute inset-x-0 top-[27%] bottom-0 bg-stone-900/30 pointer-events-none" />

        {/* Crops Root Columns */}
        <div className="relative ml-16 flex min-h-[300px] items-start justify-around gap-2 pt-2">
          {crops.map((crop, idx) => {
            if (!crop) return null;
            const heightPercent = Math.min(100, (crop.rootDepthCm / maxDepthView) * 100);
            const breaksCompaction = crop.rootDepthCm >= 140 && (crop.compactionBreakerScore >= 4 || crop.rootType === 'Pivotante Profunda');

            return (
              <div key={idx} className="flex flex-col items-center flex-1 max-w-[120px] group">
                
                {/* Above ground plant symbol */}
                <div className="mb-2 flex flex-col items-center text-center">
                  <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[9px] font-mono text-stone-400">
                    Fase {idx + 1}
                  </span>
                  <span className="mt-0.5 text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[100px]" title={crop.name}>
                    {crop.name.split('(')[0]}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    {crop.rootDepthCm} cm
                  </span>
                </div>

                {/* Root visualization stem & fibers */}
                <div className="relative flex flex-col items-center w-full" style={{ height: '240px' }}>
                  
                  {/* The Root Column */}
                  <div 
                    className={`relative w-2 rounded-b-full transition-all duration-700 ${
                      breaksCompaction 
                        ? 'bg-gradient-to-b from-emerald-500 via-amber-400 to-sky-400 shadow-md shadow-emerald-500/30' 
                        : 'bg-gradient-to-b from-stone-400 to-stone-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Lateral branching lines */}
                    <div className="absolute top-1/4 -left-3 w-7 h-px bg-stone-500/60 rotate-12" />
                    <div className="absolute top-1/2 -left-4 w-9 h-px bg-stone-500/60 -rotate-12" />
                    {crop.rootType === 'Fasciculada Abundante' && (
                      <>
                        <div className="absolute top-1/3 -left-5 w-11 h-px bg-amber-500/80 rotate-6" />
                        <div className="absolute top-2/3 -left-4 w-9 h-px bg-amber-500/80 -rotate-6" />
                      </>
                    )}
                    {/* Deep taproot spear head */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Compaction status pill */}
                  {breaksCompaction ? (
                    <div className="mt-2 text-center">
                      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 border border-emerald-800">
                        <Sparkles className="h-2.5 w-2.5" />
                        {isPt ? 'Fura Pé-de-grade' : 'Breaks Hardpan'}
                      </span>
                    </div>
                  ) : crop.rootDepthCm <= 100 ? (
                    <div className="mt-2 text-center">
                      <span className="inline-flex items-center gap-0.5 rounded bg-stone-800 px-1.5 py-0.5 text-[9px] font-medium text-stone-400">
                        {isPt ? 'Raiz Rasa' : 'Shallow Root'}
                      </span>
                    </div>
                  ) : null}

                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span>{isPt ? 'Culturas Descompactadoras (> 150cm bioporos permanentes)' : 'Bio-drill crops (> 150cm permanent biopores)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-500" />
          <span>{isPt ? 'Culturas de Raiz Moderada (exploram camada superficial)' : 'Moderate Root Crops'}</span>
        </div>
      </div>

    </div>
  );
};
