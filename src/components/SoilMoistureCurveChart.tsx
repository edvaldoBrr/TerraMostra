import React, { useState } from 'react';
import { Droplets, Calendar, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { NasaSatelliteData, RotationPhase, Language } from '../types';
import { CROPS_DATABASE } from '../data/crops';

interface SoilMoistureCurveChartProps {
  nasaData: NasaSatelliteData;
  phases: RotationPhase[];
  language: Language;
}

export const SoilMoistureCurveChart: React.FC<SoilMoistureCurveChartProps> = ({
  nasaData,
  phases,
  language,
}) => {
  const isPt = language === 'pt';
  const trends = nasaData.smapMonthlyTrends;

  // Find max moisture for scale (usually ~40%)
  const maxVal = 42;
  const chartHeight = 180;

  // Month mapping to check which phase corresponds to which months
  const activeCrops = phases.map(p => CROPS_DATABASE.find(c => c.id === p.cropId)).filter(Boolean);

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-stone-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-sky-400" />
          <h2 className="text-base font-bold text-white sm:text-lg">
            {isPt ? 'Curva Anual de Umidade do Solo (NASA SMAP) vs Demanda da Rotação' : 'NASA SMAP 12-Month Soil Moisture Curve vs Rotation Water Demand'}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-sky-400" />
            <span className="text-stone-300">{isPt ? 'Umidade Atual SMAP' : 'SMAP Actual Moisture'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-stone-600" />
            <span className="text-stone-400">{isPt ? 'Média Histórica (20 Anos)' : 'Historical 20yr Mean'}</span>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-stone-400">
        {isPt 
          ? 'Comparativo sazonal da água volumétrica no perfil de 0 a 100cm. Observe a janela de estiagem entre Maio e Setembro para planejar espécies de cobertura resistentes.'
          : 'Seasonal volumetric soil water comparison (0-100cm). Note the dry deficit period between May and September to schedule drought-hardy cover species.'}
      </p>

      {/* Visual Chart */}
      <div className="mt-6">
        <div className="relative h-[200px] w-full pt-4">
          
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-stone-600">
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-0.5">
              <span>40%</span>
            </div>
            <div className="flex items-center justify-between border-b border-stone-800/40 pb-0.5">
              <span>30%</span>
            </div>
            <div className="flex items-center justify-between border-b border-amber-900/30 pb-0.5 text-amber-500/70">
              <span>20% (Limiar de Estresse Hídrico)</span>
            </div>
            <div className="flex items-center justify-between border-b border-stone-800/40 pb-0.5">
              <span>10%</span>
            </div>
          </div>

          {/* Bar / Column Chart */}
          <div className="relative flex h-full items-end justify-between gap-1 sm:gap-2 px-6">
            {trends.map((item, idx) => {
              const actualHeightPercent = Math.min(100, (item.moisture / maxVal) * 100);
              const baselineHeightPercent = Math.min(100, (item.baseline / maxVal) * 100);
              const isDeficit = item.moisture < item.baseline;
              const isSevereLow = item.moisture <= 18;

              return (
                <div key={idx} className="group relative flex flex-1 flex-col items-center">
                  
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-14 z-20 hidden rounded-lg border border-stone-700 bg-stone-900 p-2 text-center text-[10px] shadow-xl group-hover:block whitespace-nowrap">
                    <span className="font-bold text-white">{item.month}</span>
                    <div className="text-sky-300">SMAP: {item.moisture}%</div>
                    <div className="text-stone-400">Histórico: {item.baseline}%</div>
                  </div>

                  {/* Dual Bars: Actual vs Baseline */}
                  <div className="flex items-end gap-0.5 sm:gap-1 w-full justify-center">
                    
                    {/* Baseline Bar */}
                    <div 
                      className="w-1.5 sm:w-2.5 rounded-t-sm bg-stone-700/60 transition-all duration-500"
                      style={{ height: `${(baselineHeightPercent / 100) * chartHeight}px` }}
                      title={`Histórico: ${item.baseline}%`}
                    />

                    {/* Actual SMAP Bar */}
                    <div 
                      className={`w-2.5 sm:w-4 rounded-t-sm transition-all duration-700 ${
                        isSevereLow 
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/40' 
                          : isDeficit 
                          ? 'bg-amber-400' 
                          : 'bg-sky-400 shadow-sm shadow-sky-400/40'
                      }`}
                      style={{ height: `${(actualHeightPercent / 100) * chartHeight}px` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span className={`mt-2 font-mono text-[10px] ${isSevereLow ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>
                    {item.month}
                  </span>

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Sowing Window Strategy Guide */}
      <div className="mt-6 rounded-xl border border-stone-800 bg-stone-950/60 p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
          <Calendar className="h-4 w-4" />
          <span>{isPt ? 'Janela de Plantio Recomendada pela NASA' : 'NASA Recommended Sowing Windows'}</span>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-stone-300 sm:grid-cols-3">
          <div className="rounded-lg bg-stone-900 p-2.5 border border-stone-800">
            <span className="block text-[11px] font-semibold text-emerald-400">{isPt ? 'Safra Principal (Out - Jan)' : 'Main Season (Oct - Jan)'}</span>
            <p className="mt-1 text-stone-400 text-[11px]">
              {isPt ? 'Umidade SMAP > 28%. Janela ideal para semeadura da cultura comercial principal (ex: Soja/Milho).' : 'SMAP moisture > 28%. Optimum window for main cash crop.'}
            </p>
          </div>
          <div className="rounded-lg bg-stone-900 p-2.5 border border-stone-800">
            <span className="block text-[11px] font-semibold text-amber-400">{isPt ? 'Safrinha (Fev - Abr)' : 'Second Crop (Feb - Apr)'}</span>
            <p className="mt-1 text-stone-400 text-[11px]">
              {isPt ? 'Umidade em declínio (22-16%). Exige consórcio com Braquiária ou troca por Sorgo Granífero.' : 'Declining moisture profile. Demands brachiaria intercropping or grain sorghum.'}
            </p>
          </div>
          <div className="rounded-lg bg-stone-900 p-2.5 border border-stone-800">
            <span className="block text-[11px] font-semibold text-rose-400">{isPt ? 'Entressafra Seca (Mai - Set)' : 'Dry Winter Season (May - Sep)'}</span>
            <p className="mt-1 text-stone-400 text-[11px]">
              {isPt ? 'Umidade crítica (< 14%). Manter palhada contínua para evitar estresse evaporativo do ECOSTRESS.' : 'Critical moisture deficit. Maintain mulch cover to suppress ECOSTRESS evaporative loss.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
