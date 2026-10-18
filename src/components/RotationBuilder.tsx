import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  Info,
  Calendar,
  Zap,
  Droplets
} from 'lucide-react';
import { RotationPhase, Crop, Language, NasaSatelliteData } from '../types';
import { CROPS_DATABASE } from '../data/crops';
import { PRESET_STRATEGIES } from '../data/presets';

interface RotationBuilderProps {
  phases: RotationPhase[];
  onUpdatePhases: (phases: RotationPhase[]) => void;
  nasaData: NasaSatelliteData;
  language: Language;
}

export const RotationBuilder: React.FC<RotationBuilderProps> = ({
  phases,
  onUpdatePhases,
  nasaData,
  language,
}) => {
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const isPt = language === 'pt';

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_STRATEGIES.find(p => p.id === presetId);
    if (preset) {
      onUpdatePhases([...preset.phases]);
    }
  };

  const handleAddPhase = () => {
    const nextIndex = phases.length + 1;
    const isSafra = nextIndex % 2 !== 0;
    const newPhase: RotationPhase = {
      id: `phase_${Date.now()}`,
      slot: isSafra ? 'safra_2' : 'safrinha_2',
      label: isSafra 
        ? `${isPt ? 'Safra Principal' : 'Main Season'} (${isPt ? 'Ano' : 'Year'} ${Math.ceil(nextIndex / 2)})` 
        : `${isPt ? 'Safrinha / Cobertura' : 'Second / Cover'} (${isPt ? 'Ano' : 'Year'} ${Math.ceil(nextIndex / 2)})`,
      seasonPeriod: isSafra ? 'Out - Fev' : 'Fev - Jun',
      cropId: isSafra ? 'soja' : 'braquiaria_solteira',
      customNotes: isPt ? 'Planejado com dados da NASA' : 'Planned with NASA data'
    };
    onUpdatePhases([...phases, newPhase]);
  };

  const handleRemovePhase = (phaseId: string) => {
    if (phases.length <= 2) return;
    onUpdatePhases(phases.filter(p => p.id !== phaseId));
  };

  const handleSelectCropForPhase = (cropId: string) => {
    if (!editingPhaseId) return;
    const updated = phases.map(p => {
      if (p.id === editingPhaseId) {
        return { ...p, cropId };
      }
      return p;
    });
    onUpdatePhases(updated);
    setEditingPhaseId(null);
  };

  const categories = [
    { id: 'all', label: isPt ? 'Todas as Culturas' : 'All Crops' },
    { id: 'Grão Comercial', label: isPt ? 'Grãos Comerciais' : 'Cash Grains' },
    { id: 'Adubação Verde / Leguminosa', label: isPt ? 'Leguminosas / N-Fix' : 'Legumes / N-Fix' },
    { id: 'Cobertura / Gramínea', label: isPt ? 'Gramíneas de Cobertura' : 'Cover Grasses' },
    { id: 'Descompactador / Raiz Pivotante', label: isPt ? 'Descompactadores' : 'Bio-Drills' },
    { id: 'Resistente a Seca Extrema', label: isPt ? 'Anti-Seca Extrema' : 'Extreme Drought' },
  ];

  const filteredCrops = CROPS_DATABASE.filter(crop => {
    const matchesCategory = categoryFilter === 'all' || crop.category === categoryFilter;
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          crop.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 shadow-lg">
      
      {/* Header & Preset Quick Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white sm:text-lg">
              {isPt ? 'Construtor de Rotação de Culturas' : 'Crop Rotation Strategy Builder'}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-stone-400">
            {isPt 
              ? 'Organize a sequência temporal de safras, safrinhas e coberturas de solo.'
              : 'Design your chronological sequence of main crops, second crops, and soil covers.'}
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-stone-400 mr-1 hidden md:inline">
            {isPt ? 'Estratégias Prontas:' : 'Presets:'}
          </span>
          {PRESET_STRATEGIES.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                preset.focus === 'Resiliente NASA' 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
              title={preset.tagline}
            >
              {preset.focus === 'Resiliente NASA' && <Sparkles className="mr-1 inline h-3 w-3 text-emerald-400" />}
              {preset.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Steps Grid */}
      <div className="mt-5 space-y-3">
        {phases.map((phase, index) => {
          const crop = CROPS_DATABASE.find(c => c.id === phase.cropId) || CROPS_DATABASE[0];
          const prevPhase = index > 0 ? phases[index - 1] : null;
          const prevCrop = prevPhase ? CROPS_DATABASE.find(c => c.id === prevPhase.cropId) : null;
          const isFamilyRepeated = prevCrop && prevCrop.family === crop.family;
          const moistureDeficit = nasaData.smapRootZoneMoisture < crop.optimalSmapMoistureMin;

          return (
            <div 
              key={phase.id}
              className="relative flex flex-col gap-3 rounded-xl border border-stone-800 bg-stone-900/90 p-4 transition-all hover:border-stone-700 md:flex-row md:items-center md:justify-between"
            >
              {/* Step indicator */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 font-mono text-xs font-bold text-stone-300 border border-stone-700">
                  {index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-400">
                      {phase.label}
                    </span>
                    <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-mono text-stone-300">
                      {phase.seasonPeriod}
                    </span>
                  </div>

                  {/* Crop title and key stats */}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white sm:text-base">
                      {crop.name}
                    </span>
                    <span className="text-xs italic text-stone-400 hidden sm:inline">
                      ({crop.scientificName})
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400">
                    <span className="text-emerald-400 font-medium">
                      {crop.category}
                    </span>
                    <span>·</span>
                    <span>{crop.family}</span>
                    <span>·</span>
                    <span>{isPt ? 'Raiz:' : 'Root:'} <strong className="text-stone-300">{crop.rootDepthCm} cm</strong> ({crop.rootType})</span>
                    <span>·</span>
                    <span>{isPt ? 'Biomassa:' : 'Biomass:'} <strong className="text-stone-300">{crop.biomassYieldTonHa} t/ha</strong></span>
                    <span>·</span>
                    <span>
                      {crop.nitrogenBalanceKgHa > 0 ? (
                        <span className="text-emerald-400 font-semibold">+{crop.nitrogenBalanceKgHa} kg N/ha (Fixação)</span>
                      ) : (
                        <span className="text-stone-400">{crop.nitrogenBalanceKgHa} kg N/ha</span>
                      )}
                    </span>
                  </div>

                  {/* Alerts if any */}
                  {(isFamilyRepeated || moistureDeficit) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {isFamilyRepeated && (
                        <span className="flex items-center gap-1 rounded bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 text-amber-300">
                          <AlertTriangle className="h-3 w-3" />
                          {isPt ? 'Atenção: Família botânica repetida consecutivamente (risco sanitário).' : 'Warning: Same botanical family repeated consecutively.'}
                        </span>
                      )}
                      {moistureDeficit && (
                        <span className="flex items-center gap-1 rounded bg-rose-950/70 border border-rose-800/60 px-2 py-0.5 text-rose-300">
                          <Droplets className="h-3 w-3" />
                          {isPt 
                            ? `Alerta SMAP: Umidade de ${nasaData.smapRootZoneMoisture}% abaixo dos ${crop.optimalSmapMoistureMin}% recomendados.`
                            : `SMAP Alert: Moisture ${nasaData.smapRootZoneMoisture}% is below crop min ${crop.optimalSmapMoistureMin}%.`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setEditingPhaseId(phase.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-200 transition-colors hover:border-emerald-600 hover:bg-emerald-950 hover:text-emerald-300"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{isPt ? 'Trocar Cultura' : 'Change Crop'}</span>
                </button>

                {phases.length > 2 && (
                  <button
                    onClick={() => handleRemovePhase(phase.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-800 text-stone-400 transition-colors hover:border-rose-800 hover:bg-rose-950/50 hover:text-rose-400"
                    title={isPt ? "Remover esta fase" : "Remove this phase"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Phase Button */}
      <div className="mt-4 flex items-center justify-between border-t border-stone-800 pt-3">
        <span className="text-xs text-stone-400">
          {isPt 
            ? `Total de ${phases.length} períodos de rotação simulados.`
            : `Total of ${phases.length} rotation periods simulated.`}
        </span>

        <button
          onClick={handleAddPhase}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-stone-700 bg-stone-800/60 px-4 py-2 text-xs font-medium text-stone-200 transition-colors hover:border-emerald-600 hover:bg-stone-800 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5 text-emerald-400" />
          <span>{isPt ? 'Adicionar Período / Safra' : 'Add Season / Crop'}</span>
        </button>
      </div>

      {/* Crop Selection Modal */}
      {editingPhaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl">
            
            {/* Modal Header */}
            <div className="border-b border-stone-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isPt ? 'Selecione a Cultura para a Rotação' : 'Select Crop for Rotation Phase'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {isPt 
                      ? 'Escolha espécies com características complementares de raiz, demanda hídrica e ciclagem de nutrientes.'
                      : 'Choose species with complementary roots, water requirements, and nutrient cycling.'}
                  </p>
                </div>
                <button
                  onClick={() => setEditingPhaseId(null)}
                  className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Category Filter Pills & Search */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        categoryFilter === cat.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder={isPt ? "Buscar cultura..." : "Search crop..."}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Crops Catalog Grid */}
            <div className="overflow-y-auto p-5 space-y-3">
              {filteredCrops.map(crop => {
                const smapFit = nasaData.smapRootZoneMoisture >= crop.optimalSmapMoistureMin;

                return (
                  <div
                    key={crop.id}
                    onClick={() => handleSelectCropForPhase(crop.id)}
                    className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-stone-800 bg-stone-950/70 p-4 transition-all hover:border-emerald-600 hover:bg-stone-850 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300">
                          {crop.name}
                        </span>
                        <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] text-stone-300 font-mono">
                          {crop.category}
                        </span>
                        {smapFit ? (
                          <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/50">
                            ✓ {isPt ? 'Adequado ao SMAP' : 'SMAP Compatible'}
                          </span>
                        ) : (
                          <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-800/50">
                            ⚠ {isPt ? 'Exige mais umidade' : 'High Water Need'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-400 line-clamp-2">
                        {crop.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-300">
                        <span>{isPt ? 'Raiz:' : 'Root:'} <strong>{crop.rootDepthCm}cm</strong></span>
                        <span>·</span>
                        <span>{isPt ? 'Demanda Hídrica:' : 'Water:'} <strong>{crop.waterDemandMm}mm</strong></span>
                        <span>·</span>
                        <span>{isPt ? 'Biomassa:' : 'Biomass:'} <strong>{crop.biomassYieldTonHa} t/ha</strong></span>
                        <span>·</span>
                        <span>
                          {crop.nitrogenBalanceKgHa > 0 ? (
                            <strong className="text-emerald-400">+{crop.nitrogenBalanceKgHa} kg N/ha</strong>
                          ) : (
                            <span>{crop.nitrogenBalanceKgHa} kg N/ha</span>
                          )}
                        </span>
                        <span>·</span>
                        <span>Nematoides: <strong>{crop.nematodeEffect}</strong></span>
                      </div>
                    </div>

                    <button
                      className="shrink-0 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-emerald-600 transition-colors"
                    >
                      {isPt ? 'Selecionar' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-stone-800 p-3 text-right">
              <button
                onClick={() => setEditingPhaseId(null)}
                className="rounded-lg bg-stone-800 px-4 py-1.5 text-xs font-medium text-stone-300 hover:bg-stone-700 hover:text-white"
              >
                {isPt ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
