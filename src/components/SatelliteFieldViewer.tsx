import React, { useState } from 'react';
import { Satellite, MapPin, Eye, Layers, Compass, Sun, Droplets, Leaf } from 'lucide-react';
import { NasaSatelliteData, Region, Language } from '../types';

interface SatelliteFieldViewerProps {
  region: Region;
  nasaData: NasaSatelliteData;
  language: Language;
}

type LayerMode = 'smap' | 'ndvi' | 'ecostress' | 'rgb';

export const SatelliteFieldViewer: React.FC<SatelliteFieldViewerProps> = ({
  region,
  nasaData,
  language,
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerMode>('smap');
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number; val: string } | null>(null);
  const isPt = language === 'pt';

  // 6x6 simulated field grid representing a 1,200 hectare farm
  const gridCells = [
    // Row 0
    { x: 0, y: 0, smap: 22, ndvi: 0.68, eco: 0.42 },
    { x: 1, y: 0, smap: 21, ndvi: 0.65, eco: 0.40 },
    { x: 2, y: 0, smap: 19, ndvi: 0.58, eco: 0.35 },
    { x: 3, y: 0, smap: 18, ndvi: 0.54, eco: 0.32 },
    { x: 4, y: 0, smap: 20, ndvi: 0.61, eco: 0.38 },
    { x: 5, y: 0, smap: 23, ndvi: 0.70, eco: 0.45 },
    // Row 1
    { x: 0, y: 1, smap: 24, ndvi: 0.72, eco: 0.48 },
    { x: 1, y: 1, smap: 22, ndvi: 0.67, eco: 0.43 },
    { x: 2, y: 1, smap: 17, ndvi: 0.50, eco: 0.29 },
    { x: 3, y: 1, smap: 16, ndvi: 0.46, eco: 0.26 },
    { x: 4, y: 1, smap: 19, ndvi: 0.59, eco: 0.36 },
    { x: 5, y: 1, smap: 22, ndvi: 0.69, eco: 0.44 },
    // Row 2 (Central Field with compaction/dry spot)
    { x: 0, y: 2, smap: 21, ndvi: 0.66, eco: 0.41 },
    { x: 1, y: 2, smap: 18, ndvi: 0.52, eco: 0.31 },
    { x: 2, y: 2, smap: 14, ndvi: 0.41, eco: 0.22 }, // dry spot
    { x: 3, y: 2, smap: 15, ndvi: 0.43, eco: 0.24 }, // dry spot
    { x: 4, y: 2, smap: 18, ndvi: 0.55, eco: 0.33 },
    { x: 5, y: 2, smap: 24, ndvi: 0.73, eco: 0.49 },
    // Row 3
    { x: 0, y: 3, smap: 23, ndvi: 0.71, eco: 0.46 },
    { x: 1, y: 3, smap: 20, ndvi: 0.62, eco: 0.39 },
    { x: 2, y: 3, smap: 16, ndvi: 0.48, eco: 0.28 },
    { x: 3, y: 3, smap: 17, ndvi: 0.51, eco: 0.30 },
    { x: 4, y: 3, smap: 21, ndvi: 0.64, eco: 0.42 },
    { x: 5, y: 3, smap: 25, ndvi: 0.76, eco: 0.52 },
    // Row 4
    { x: 0, y: 4, smap: 25, ndvi: 0.75, eco: 0.51 },
    { x: 1, y: 4, smap: 23, ndvi: 0.69, eco: 0.45 },
    { x: 2, y: 4, smap: 21, ndvi: 0.63, eco: 0.41 },
    { x: 3, y: 4, smap: 20, ndvi: 0.60, eco: 0.38 },
    { x: 4, y: 4, smap: 24, ndvi: 0.72, eco: 0.48 },
    { x: 5, y: 4, smap: 26, ndvi: 0.78, eco: 0.55 },
    // Row 5
    { x: 0, y: 5, smap: 26, ndvi: 0.77, eco: 0.54 },
    { x: 1, y: 5, smap: 24, ndvi: 0.71, eco: 0.47 },
    { x: 2, y: 5, smap: 23, ndvi: 0.68, eco: 0.44 },
    { x: 3, y: 5, smap: 22, ndvi: 0.66, eco: 0.42 },
    { x: 4, y: 5, smap: 25, ndvi: 0.74, eco: 0.50 },
    { x: 5, y: 5, smap: 27, ndvi: 0.81, eco: 0.58 },
  ];

  const getCellColor = (cell: typeof gridCells[0]) => {
    if (activeLayer === 'smap') {
      // SMAP: Amber (dry) to Teal/Cyan (wet)
      if (cell.smap <= 15) return 'bg-amber-600/80 hover:bg-amber-500';
      if (cell.smap <= 18) return 'bg-amber-400/80 hover:bg-amber-300';
      if (cell.smap <= 22) return 'bg-emerald-600/80 hover:bg-emerald-500';
      if (cell.smap <= 25) return 'bg-teal-500/80 hover:bg-teal-400';
      return 'bg-sky-500/80 hover:bg-sky-400';
    }
    if (activeLayer === 'ndvi') {
      // NDVI: yellow (low) to deep green (high vigor)
      if (cell.ndvi <= 0.45) return 'bg-yellow-700/80 hover:bg-yellow-600';
      if (cell.ndvi <= 0.55) return 'bg-lime-700/80 hover:bg-lime-600';
      if (cell.ndvi <= 0.65) return 'bg-emerald-600/80 hover:bg-emerald-500';
      return 'bg-green-500/90 hover:bg-green-400';
    }
    if (activeLayer === 'ecostress') {
      // ECOSTRESS ESI: Red/Orange (severe stress) to Blue/Green (low stress)
      if (cell.eco <= 0.28) return 'bg-rose-600/85 hover:bg-rose-500';
      if (cell.eco <= 0.35) return 'bg-orange-500/85 hover:bg-orange-400';
      if (cell.eco <= 0.45) return 'bg-amber-400/80 hover:bg-amber-300';
      return 'bg-emerald-500/80 hover:bg-emerald-400';
    }
    // RGB Natural
    return 'bg-stone-700/80 hover:bg-stone-600';
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-stone-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-sky-400" />
            <h2 className="text-base font-bold text-white sm:text-lg">
              {isPt ? 'Mapeamento Espacial de Satélite do Talhão' : 'Satellite Field Observation Mapping'}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-stone-400">
            {region.name} · {region.lat}°, {region.lon}° · {isPt ? 'Talhão Piloto (1.200 ha)' : 'Pilot Field (1,200 ha)'}
          </p>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-stone-950 p-1 border border-stone-800">
          <button
            onClick={() => setActiveLayer('smap')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeLayer === 'smap'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Droplets className="h-3 w-3" />
            <span>SMAP {isPt ? 'Umidade' : 'Moisture'}</span>
          </button>

          <button
            onClick={() => setActiveLayer('ndvi')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeLayer === 'ndvi'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Leaf className="h-3 w-3" />
            <span>MODIS NDVI</span>
          </button>

          <button
            onClick={() => setActiveLayer('ecostress')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeLayer === 'ecostress'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Sun className="h-3 w-3" />
            <span>ECOSTRESS ESI</span>
          </button>
        </div>
      </div>

      {/* Main Map Box */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* The Field Interactive Grid (Left) */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-stone-800 bg-stone-950 p-4 lg:col-span-8">
          
          <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] font-mono text-stone-400">
            <Compass className="h-3 w-3 text-stone-500" />
            <span>Norte 0° · Resolução Espacial NASA</span>
          </div>

          {/* Grid of pixels */}
          <div className="mt-4 grid grid-cols-6 gap-1.5 p-2 bg-stone-900/80 rounded-xl border border-stone-800/80">
            {gridCells.map((cell, i) => (
              <button
                key={i}
                onClick={() => {
                  let text = '';
                  if (activeLayer === 'smap') text = `NASA SMAP: ${cell.smap}% umidade`;
                  else if (activeLayer === 'ndvi') text = `NASA MODIS NDVI: ${cell.ndvi}`;
                  else text = `NASA ECOSTRESS: ESI ${cell.eco}`;
                  setSelectedPixel({ x: cell.x, y: cell.y, val: text });
                }}
                className={`relative h-11 w-11 sm:h-14 sm:w-14 rounded-lg transition-all transform hover:scale-105 focus:ring-2 focus:ring-white/80 ${getCellColor(cell)}`}
                title={`Célula [${cell.x}, ${cell.y}]: SMAP ${cell.smap}%, NDVI ${cell.ndvi}, ESI ${cell.eco}`}
              >
                <span className="absolute bottom-1 right-1 text-[8px] font-mono text-stone-950/70 font-bold">
                  {activeLayer === 'smap' ? `${cell.smap}%` : activeLayer === 'ndvi' ? cell.ndvi : cell.eco}
                </span>
              </button>
            ))}
          </div>

          {/* Click Readout */}
          <div className="mt-3 text-center text-xs text-stone-400">
            {selectedPixel ? (
              <span className="rounded-md bg-stone-800 px-3 py-1 font-mono text-stone-200 border border-stone-700">
                Ponto [{selectedPixel.x}, {selectedPixel.y}]: <strong className="text-emerald-400">{selectedPixel.val}</strong>
              </span>
            ) : (
              <span>{isPt ? 'Clique em qualquer célula do talhão para inspecionar os valores pontuais.' : 'Click any field parcel to inspect satellite values.'}</span>
            )}
          </div>

        </div>

        {/* Legend & Telemetry Insights (Right) */}
        <div className="space-y-4 lg:col-span-4">
          
          <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
              {isPt ? 'Interpretação da Camada Ativa' : 'Layer Interpretation'}
            </h4>

            {activeLayer === 'smap' && (
              <div className="mt-2 space-y-2 text-xs text-stone-300">
                <p className="text-stone-400">
                  {isPt 
                    ? 'A camada do NASA SMAP revela as zonas com menor retenção de água subterrânea no centro do talhão (em âmbar, < 16%).' 
                    : 'NASA SMAP identifies parcels with reduced subsoil moisture (< 16% in amber) in the center.'}
                </p>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-500" /> &lt; 16% {isPt ? 'Seca Severa' : 'Severe Dry'}</span>
                    <span className="font-mono text-stone-400">{isPt ? 'Requer Sorgo/Caupi' : 'Needs Sorghum'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> 18-22% {isPt ? 'Moderado' : 'Moderate'}</span>
                    <span className="font-mono text-stone-400">{isPt ? 'Consórcio Braquiária' : 'Brachiaria'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-sky-500" /> &gt; 25% {isPt ? 'Ótimo' : 'Optimum'}</span>
                    <span className="font-mono text-stone-400">{isPt ? 'Safra Soja/Milho' : 'Cash Crops'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeLayer === 'ndvi' && (
              <div className="mt-2 space-y-2 text-xs text-stone-300">
                <p className="text-stone-400">
                  {isPt 
                    ? 'O sensor MODIS/VIIRS quantifica o vigor da biomassa vegetal fotossinteticamente ativa.'
                    : 'MODIS/VIIRS quantifies photosynthetic vegetative canopy vigor.'}
                </p>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-yellow-600" /> &lt; 0.45 {isPt ? 'Solo Desprotegido' : 'Bare/Degraded'}</span>
                    <span className="font-mono text-stone-400">{isPt ? 'Risco de Erosão' : 'Erosion Risk'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-600" /> 0.55 - 0.70 {isPt ? 'Bom Vigor' : 'Good Mulch'}</span>
                    <span className="font-mono text-stone-400">{isPt ? 'Cobertura Ativa' : 'Active Mulch'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-green-500" /> &gt; 0.75 {isPt ? 'Copa Plena' : 'Dense Canopy'}</span>
                    <span className="font-mono text-stone-400">{isPt ? 'Máx Fotossíntese' : 'Max Photosynthesis'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeLayer === 'ecostress' && (
              <div className="mt-2 space-y-2 text-xs text-stone-300">
                <p className="text-stone-400">
                  {isPt 
                    ? 'O ECOSTRESS mede a temperatura do dossel na ISS, revelando estresse evaporativo antes da murcha visual.'
                    : 'ECOSTRESS tracks canopy temperature from the ISS, revealing evaporative stress before visual wilting.'}
                </p>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-500" /> ESI &lt; 0.28 {isPt ? 'Estresse Crítico' : 'Critical Stress'}</span>
                    <span className="font-mono text-rose-400">{isPt ? 'Fechamento Estomático' : 'Stomatal Closure'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> ESI &gt; 0.50 {isPt ? 'Conforto Hídrico' : 'Low Stress'}</span>
                    <span className="font-mono text-emerald-400">{isPt ? 'Transpiração Plena' : 'Full Transpiration'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-950/40 p-3.5 text-xs text-stone-400">
            <span className="font-semibold text-stone-300">{isPt ? 'Dica de Manejo:' : 'Field Tip:'}</span>
            <p className="mt-1">
              {isPt 
                ? 'As manchas centrais de baixo SMAP coincidem com a camada compactada (pé-de-grade). O Nabo Forrageiro ou Guandu resolverão essa heterogeneidade em 1 ciclo.'
                : 'Central low-moisture spots align with plow pan compaction. Deep bio-drills (Daikon Radish or Pigeon Pea) remediate this heterogeneity within one season.'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
