import React, { useState } from 'react';
import { 
  Droplets, 
  CloudRain, 
  Sun, 
  Leaf, 
  ThermometerSun, 
  Waves, 
  Info, 
  X, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Clock,
  Activity,
  Radio,
  Play,
  Pause,
  Zap
} from 'lucide-react';
import { NasaSatelliteData, Language } from '../types';

interface NasaTelemetryBarProps {
  nasaData: NasaSatelliteData;
  language: Language;
  liveSyncInfo?: {
    isLive: boolean;
    lastSyncedAt: string;
    source: string;
    orbitalPassage: string;
    station: string;
    pingMs: number;
  };
  onRefreshLiveSync?: () => void;
  isSyncing?: boolean;
  autoSyncEnabled?: boolean;
  onToggleAutoSync?: () => void;
  countdownSeconds?: number;
  autoSyncIntervalSeconds?: number;
  onChangeInterval?: (interval: number) => void;
}

interface SatelliteInfoModalData {
  satellite: string;
  fullName: string;
  instrument: string;
  spatialResolution: string;
  updateFrequency: string;
  agronomicSignificance: string;
  url: string;
}

export const NasaTelemetryBar: React.FC<NasaTelemetryBarProps> = ({ 
  nasaData, 
  language,
  liveSyncInfo,
  onRefreshLiveSync,
  isSyncing,
  autoSyncEnabled = true,
  onToggleAutoSync,
  countdownSeconds = 20,
  autoSyncIntervalSeconds = 20,
  onChangeInterval,
}) => {
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteInfoModalData | null>(null);
  const [showRealtimeExplainer, setShowRealtimeExplainer] = useState<boolean>(false);
  const isPt = language === 'pt';

  const satellitesDatabase: Record<string, SatelliteInfoModalData> = {
    smap: {
      satellite: 'NASA SMAP',
      fullName: 'Soil Moisture Active Passive',
      instrument: 'Radiômetro banda L (1.41 GHz) com antena refletora de 6 metros',
      spatialResolution: '9 km a 33 km (downscaled para nível de talhão)',
      updateFrequency: '2 a 3 dias',
      agronomicSignificance: isPt 
        ? 'Mede a água disponível tanto na camada superficial (0-5 cm) quanto na zona radicular (0-100 cm). Permite saber se raízes profundas de adubos verdes ou culturas comerciais terão água nos veranicos críticos sem depender apenas de chuvas visíveis.'
        : 'Measures available water in both topsoil (0-5 cm) and root-zone (0-100 cm). Informs whether deep cover crop roots and cash crops will have moisture during critical dry spells.',
      url: 'https://smap.jpl.nasa.gov/'
    },
    gpm: {
      satellite: 'NASA GPM',
      fullName: 'Global Precipitation Measurement (IMERG)',
      instrument: 'Dual-frequency Precipitation Radar (DPR) e GPM Microwave Imager (GMI)',
      spatialResolution: '0.1° (~10 km) com calibração em tempo real',
      updateFrequency: 'A cada 30 minutos',
      agronomicSignificance: isPt
        ? 'Identifica anomalias pluviométricas e o atraso no início da estação chuvosa. Ajuda o agricultor a escolher o momento exato de semear e a optar por culturas de ciclo mais curto ou tolerantes à seca em anos de déficit prolongado.'
        : 'Identifies rainfall anomalies and onset delay of the wet season. Empowers farmers to time sowing and select shorter-cycle or drought-tolerant varieties during deficit years.',
      url: 'https://gpm.nasa.gov/'
    },
    ecostress: {
      satellite: 'NASA ECOSTRESS',
      fullName: 'ECOsystem Spaceborne Thermal Radiometer Experiment on Space Station',
      instrument: 'Radiômetro termal multiespectral instalado na Estação Espacial Internacional (ISS)',
      spatialResolution: '70 metros',
      updateFrequency: '1 a 5 dias (órbita de precessão capturando diferentes horas do dia)',
      agronomicSignificance: isPt
        ? 'Mede o estresse evaporativo da vegetação através da temperatura da copa foliar. Detecta o estresse hídrico dias antes de qualquer sintoma visível de murcha no campo, avisando a necessidade imediata de cobertura protetora de solo.'
        : 'Measures plant evaporative stress through canopy temperature. Detects crop water stress days before visible wilting appears in the field, signaling urgent need for soil mulching.',
      url: 'https://ecostress.jpl.nasa.gov/'
    },
    modis: {
      satellite: 'NASA MODIS / VIIRS',
      fullName: 'Moderate Resolution Imaging Spectroradiometer & VIIRS',
      instrument: 'Sensores ópticos e infravermelho próximo a bordo dos satélites Terra, Aqua e NOAA-20',
      spatialResolution: '250m a 500m',
      updateFrequency: 'Diário (compostos de 8 e 16 dias sem nuvens)',
      agronomicSignificance: isPt
        ? 'Rastreia o NDVI (Índice de Vegetação por Diferença Normalizada) e a biomassa fotossinteticamente ativa. Mostra se o talhão está acumulando palhada suficiente para proteger o solo contra impacto erosivo e aquecimento.'
        : 'Tracks NDVI and photosynthetically active biomass. Verifies if the field produces adequate mulch to buffer against erosion and soil overheating.',
      url: 'https://modis.gsfc.nasa.gov/'
    },
    power: {
      satellite: 'NASA POWER',
      fullName: 'Prediction of Worldwide Energy Resources',
      instrument: 'Modelos de assimilação GEOS-5 integrados com satélites CERES e radiômetros solares',
      spatialResolution: '0.5° latitude x 0.5° longitude',
      updateFrequency: 'Diário',
      agronomicSignificance: isPt
        ? 'Fornece a radiação solar incidente, Graus-Dia de Desenvolvimento (GDD), temperatura máxima da superfície e déficits de pressão de vapor. Fundamental para calcular a demanda fenológica de cada cultura na rotação.'
        : 'Supplies incoming solar insolation, Growing Degree Days (GDD), maximum surface temperature, and vapor pressure deficit for calculating crop phenological windows.',
      url: 'https://power.larc.nasa.gov/'
    },
    grace: {
      satellite: 'NASA GRACE-FO',
      fullName: 'Gravity Recovery and Climate Experiment Follow-On',
      instrument: 'Interferômetro laser de alta precisão entre satélites gêmeos medindo variações do campo gravitacional da Terra',
      spatialResolution: 'Regional (~300 km)',
      updateFrequency: 'Mensal',
      agronomicSignificance: isPt
        ? 'Mede a variação de água nos aquíferos profundos e no lençol freático. Revela a sustentabilidade do bombeamento de irrigação e a capacidade do solo de sustentar culturas com raízes profundas (>2m) em secas multi-anuais.'
        : 'Measures deep groundwater and aquifer storage fluctuations. Exposes irrigation recharge sustainability and subsoil water buffering capacity for deep taproots.',
      url: 'https://gracefo.jpl.nasa.gov/'
    }
  };

  return (
    <section className="border-b border-stone-800 bg-stone-900/40 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header row */}
        <div className="mb-3 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Left: Satellite Live Status & Auto-Sync Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${autoSyncEnabled ? 'animate-ping' : ''}`}></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>

            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {isPt ? 'Telemetria NASA Earth Observations (Ao Vivo)' : 'NASA Earth Observations Telemetry (Live)'}
            </span>

            {/* Auto-Sync Status Badge */}
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-800/80 bg-emerald-950/80 px-2 py-0.5 text-[11px] font-mono text-emerald-300">
              <Radio className={`h-3 w-3 ${autoSyncEnabled ? 'text-emerald-400 animate-pulse' : 'text-stone-500'}`} />
              <span>
                {autoSyncEnabled 
                  ? (isPt ? 'Auto-Sync Ativo' : 'Auto-Sync Active') 
                  : (isPt ? 'Auto-Sync Pausado' : 'Auto-Sync Paused')}
              </span>
              {autoSyncEnabled && (
                <span className="ml-1 rounded bg-emerald-900/90 px-1 py-0.2 text-[10px] font-bold text-white border border-emerald-700">
                  {countdownSeconds}s
                </span>
              )}
            </div>

            {liveSyncInfo && (
              <span className="hidden sm:flex items-center gap-1 rounded-md bg-stone-900 border border-stone-800 px-2 py-0.5 text-[10px] font-mono text-stone-400">
                <span className="text-emerald-400">●</span> {liveSyncInfo.pingMs}ms
              </span>
            )}
          </div>

          {/* Right: Controls & Frequency Selection */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* Auto-Sync Toggle Button */}
            {onToggleAutoSync && (
              <button
                onClick={onToggleAutoSync}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  autoSyncEnabled
                    ? 'border-emerald-600 bg-emerald-950/90 text-emerald-300 hover:bg-emerald-900'
                    : 'border-stone-700 bg-stone-800 text-stone-400 hover:text-white'
                }`}
                title={isPt ? "Ativar/desativar atualização contínua em segundo plano" : "Toggle automatic background polling"}
              >
                {autoSyncEnabled ? (
                  <>
                    <Pause className="h-3 w-3 text-emerald-400" />
                    <span>{isPt ? 'Pausar Auto-Sync' : 'Pause Auto-Sync'}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-emerald-400" />
                    <span>{isPt ? 'Retomar Auto-Sync' : 'Resume Auto-Sync'}</span>
                  </>
                )}
              </button>
            )}

            {/* Interval frequency selector */}
            {autoSyncEnabled && onChangeInterval && (
              <div className="hidden sm:flex items-center gap-1 rounded-lg border border-stone-800 bg-stone-900/90 p-0.5 text-[10px] font-mono">
                <span className="px-1 text-stone-500">{isPt ? 'Ciclo:' : 'Rate:'}</span>
                {[15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onChangeInterval(sec)}
                    className={`rounded px-1.5 py-0.5 transition-colors ${
                      autoSyncIntervalSeconds === sec
                        ? 'bg-emerald-600 font-bold text-white shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            )}

            {/* How does real-time work? modal trigger */}
            <button
              onClick={() => setShowRealtimeExplainer(true)}
              className="flex items-center gap-1 rounded-lg border border-stone-800 bg-stone-900/90 px-2 py-1 text-[11px] font-medium text-stone-300 transition-colors hover:border-stone-700 hover:text-white"
            >
              <Info className="h-3 w-3 text-sky-400" />
              <span className="hidden md:inline">{isPt ? 'Como funciona?' : 'How it works'}</span>
            </button>

            {/* Manual Refresh Override */}
            {onRefreshLiveSync && (
              <button
                onClick={onRefreshLiveSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/90 px-2.5 py-1 text-[11px] font-semibold text-stone-300 transition-all hover:border-emerald-600 hover:text-white disabled:opacity-50"
                title={isPt ? "Forçar varredura imediata agora" : "Force immediate satellite sync"}
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-stone-400'}`} />
                <span>{isSyncing ? (isPt ? 'Atualizando...' : 'Syncing...') : (isPt ? 'Forçar Agora' : 'Sync Now')}</span>
              </button>
            )}

          </div>
        </div>

        {/* Satellite Cards Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          
          {/* 1. SMAP Soil Moisture */}
          <div 
            onClick={() => setSelectedSatellite(satellitesDatabase.smap)}
            className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-900/80 p-3 transition-all hover:border-emerald-700/60 hover:bg-stone-850"
          >
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-mono font-semibold uppercase text-emerald-400">NASA SMAP</span>
              <Droplets className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{nasaData.smapRootZoneMoisture}%</span>
              <span className="text-[10px] text-stone-400">{isPt ? 'radicular' : 'root-zone'}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? 'Sup: ' : 'Top: '}{nasaData.smapSurfaceMoisture}%</span>
              <span className={`font-semibold ${
                nasaData.smapDroughtStatus === 'Normal' ? 'text-emerald-400' :
                nasaData.smapDroughtStatus === 'Leve' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {nasaData.smapDroughtStatus}
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone-800">
              <div 
                className={`h-full rounded-full transition-all ${
                  nasaData.smapRootZoneMoisture > 28 ? 'bg-emerald-500' :
                  nasaData.smapRootZoneMoisture > 20 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (nasaData.smapRootZoneMoisture / 40) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. GPM Rainfall */}
          <div 
            onClick={() => setSelectedSatellite(satellitesDatabase.gpm)}
            className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-900/80 p-3 transition-all hover:border-sky-700/60 hover:bg-stone-850"
          >
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-mono font-semibold uppercase text-sky-400">NASA GPM</span>
              <CloudRain className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{nasaData.gpmTotalRainMm}</span>
              <span className="text-[10px] text-stone-400">mm / 90d</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? 'Anomalia:' : 'Anomaly:'}</span>
              <span className={`font-semibold flex items-center ${
                nasaData.gpmRainfallAnomaly >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {nasaData.gpmRainfallAnomaly >= 0 ? <TrendingUp className="mr-0.5 h-3 w-3 inline" /> : <TrendingDown className="mr-0.5 h-3 w-3 inline" />}
                {nasaData.gpmRainfallAnomaly > 0 ? `+${nasaData.gpmRainfallAnomaly}%` : `${nasaData.gpmRainfallAnomaly}%`}
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone-800">
              <div 
                className="h-full rounded-full bg-sky-500"
                style={{ width: `${Math.min(100, (nasaData.gpmTotalRainMm / 500) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. ECOSTRESS ESI */}
          <div 
            onClick={() => setSelectedSatellite(satellitesDatabase.ecostress)}
            className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-900/80 p-3 transition-all hover:border-amber-700/60 hover:bg-stone-850"
          >
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-mono font-semibold uppercase text-amber-400">ECOSTRESS</span>
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{nasaData.ecostressESI}</span>
              <span className="text-[10px] text-stone-400">ESI (0-1)</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? 'Estresse:' : 'Stress:'}</span>
              <span className={`font-semibold ${
                nasaData.ecostressPlantStressLevel === 'Ótimo' ? 'text-emerald-400' :
                nasaData.ecostressPlantStressLevel === 'Moderado' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {nasaData.ecostressPlantStressLevel}
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone-800">
              <div 
                className={`h-full rounded-full transition-all ${
                  nasaData.ecostressESI > 0.6 ? 'bg-emerald-500' :
                  nasaData.ecostressESI > 0.35 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, nasaData.ecostressESI * 100)}%` }}
              />
            </div>
          </div>

          {/* 4. MODIS / VIIRS NDVI */}
          <div 
            onClick={() => setSelectedSatellite(satellitesDatabase.modis)}
            className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-900/80 p-3 transition-all hover:border-emerald-700/60 hover:bg-stone-850"
          >
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-mono font-semibold uppercase text-emerald-400">MODIS / VIIRS</span>
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{nasaData.modisNdvi}</span>
              <span className="text-[10px] text-stone-400">NDVI</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? 'Biomassa:' : 'Biomass:'}</span>
              <span className="font-semibold text-stone-200">{nasaData.modisBiomassIndex}/100</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone-800">
              <div 
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, nasaData.modisNdvi * 100)}%` }}
              />
            </div>
          </div>

          {/* 5. NASA POWER GDD & Temp */}
          <div 
            onClick={() => setSelectedSatellite(satellitesDatabase.power)}
            className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-900/80 p-3 transition-all hover:border-orange-700/60 hover:bg-stone-850"
          >
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-mono font-semibold uppercase text-orange-400">NASA POWER</span>
              <ThermometerSun className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{nasaData.powerMaxTemp}°C</span>
              <span className="text-[10px] text-stone-400">{isPt ? 'pico máx' : 'peak max'}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{nasaData.powerGdd} GDD</span>
              <span className="text-stone-400">{nasaData.powerSolarRadiation} MJ</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone-800">
              <div 
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${Math.min(100, (nasaData.powerMaxTemp / 45) * 100)}%` }}
              />
            </div>
          </div>

          {/* 6. GRACE-FO Groundwater */}
          <div 
            onClick={() => setSelectedSatellite(satellitesDatabase.grace)}
            className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-900/80 p-3 transition-all hover:border-indigo-700/60 hover:bg-stone-850"
          >
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-mono font-semibold uppercase text-indigo-400">GRACE-FO</span>
              <Waves className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{nasaData.graceWaterStorage > 0 ? `+${nasaData.graceWaterStorage}` : nasaData.graceWaterStorage}</span>
              <span className="text-[10px] text-stone-400">cm H2O</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? 'Aquífero:' : 'Aquifer:'}</span>
              <span className={`font-semibold ${
                nasaData.graceTrend === 'Recarga' ? 'text-emerald-400' :
                nasaData.graceTrend === 'Equilíbrio' ? 'text-sky-400' : 'text-amber-400'
              }`}>
                {nasaData.graceTrend}
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone-800">
              <div 
                className={`h-full rounded-full ${
                  nasaData.graceWaterStorage >= 0 ? 'bg-indigo-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(15, 50 + nasaData.graceWaterStorage * 5))}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* Satellite Info Modal */}
      {selectedSatellite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl">
            <button 
              onClick={() => setSelectedSatellite(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedSatellite.satellite}</h3>
                <p className="text-xs text-stone-400">{selectedSatellite.fullName}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs text-stone-300">
              <div className="rounded-lg bg-stone-950/60 p-3 border border-stone-800/80">
                <span className="block font-semibold text-stone-400 mb-1">{isPt ? 'Instrumento & Sensor:' : 'Instrument & Sensor:'}</span>
                <p className="text-stone-200">{selectedSatellite.instrument}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-stone-950/60 p-2.5 border border-stone-800/80">
                  <span className="block font-semibold text-stone-400 mb-0.5">{isPt ? 'Resolução Espacial:' : 'Spatial Resolution:'}</span>
                  <p className="text-stone-200">{selectedSatellite.spatialResolution}</p>
                </div>
                <div className="rounded-lg bg-stone-950/60 p-2.5 border border-stone-800/80">
                  <span className="block font-semibold text-stone-400 mb-0.5">{isPt ? 'Frequência de Órbita:' : 'Revisit Frequency:'}</span>
                  <p className="text-stone-200">{selectedSatellite.updateFrequency}</p>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-950/40 p-3 border border-emerald-900/60">
                <span className="block font-semibold text-emerald-400 mb-1">
                  {isPt ? 'Por que importa para a Rotação de Culturas?' : 'Why it matters for Crop Rotation?'}
                </span>
                <p className="text-stone-200 leading-relaxed">{selectedSatellite.agronomicSignificance}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-stone-800">
              <a 
                href={selectedSatellite.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline"
              >
                <span>{isPt ? 'Portal Oficial da Missão NASA' : 'Official NASA Mission Portal'}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                onClick={() => setSelectedSatellite(null)}
                className="rounded-lg bg-stone-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-stone-700"
              >
                {isPt ? 'Fechar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Real-Time Mechanics Explanation Modal */}
      {showRealtimeExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl">
            <button 
              onClick={() => setShowRealtimeExplainer(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white sm:text-lg">
                  {isPt ? 'Como funciona o "Tempo Real" dos Satélites NASA?' : 'How Does NASA Satellite "Real-Time" Work?'}
                </h3>
                <p className="text-xs text-stone-400">
                  {isPt ? 'Entenda os ciclos orbitais e a latência de dados de observação da Terra' : 'Understanding orbital revisit cycles and Earth observation latency'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs text-stone-300">
              <div className="rounded-xl bg-stone-950/70 p-3.5 border border-stone-800">
                <span className="font-bold text-emerald-400 block mb-1">
                  1. Satélites em Órbita Baixa (LEO) vs Órbita Geoestacionária
                </span>
                <p className="text-stone-300 leading-relaxed">
                  {isPt 
                    ? 'Satélites de recursos naturais como o NASA SMAP e MODIS (Terra/Aqua) não ficam parados sobre o mesmo ponto; eles orbitam a Terra a ~700 km de altitude em órbitas polares sol-síncronas (14 voltas ao redor do planeta por dia). O satélite sobrevoa o mesmo talhão agrícola a cada 2 a 3 dias.'
                    : 'Earth observation satellites like NASA SMAP and MODIS orbit at ~700 km altitude in sun-synchronous polar orbits (14 orbits/day). They revisit the exact same field parcel every 2 to 3 days.'}
                </p>
              </div>

              <div className="rounded-xl bg-stone-950/70 p-3.5 border border-stone-800">
                <span className="font-bold text-sky-400 block mb-1">
                  2. NASA GPM IMERG (Precipitação a cada 30 minutos)
                </span>
                <p className="text-stone-300 leading-relaxed">
                  {isPt 
                    ? 'A constelação GPM combina radares espaciais com satélites parceiros internacionais para entregar dados calibrados de chuva quase em tempo real (NRT - Near Real Time), atualizados a cada 30 minutos em nível global.'
                    : 'The GPM constellation combines spaceborne radar with partner satellites to deliver Near-Real-Time (NRT) precipitation every 30 minutes globally.'}
                </p>
              </div>

              <div className="rounded-xl bg-stone-950/70 p-3.5 border border-stone-800">
                <span className="font-bold text-amber-400 block mb-1">
                  3. NASA POWER & Assimilação Agroclimática
                </span>
                <p className="text-stone-300 leading-relaxed">
                  {isPt 
                    ? 'O sistema NASA POWER (LaRC) processa e valida a radiação solar e balanço hídrico do solo através de modelos de assimilação atmosférica GEOS/MERRA-2, garantindo precisão científica sem distorções de nuvens.'
                    : 'NASA POWER (LaRC) assimilates incoming solar irradiance and soil water balance through GEOS/MERRA-2 models, ensuring scientific validation free of cloud artifacts.'}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-950/40 p-3 border border-emerald-800/60 text-emerald-200">
                <strong>{isPt ? 'Conexão Ativa no App:' : 'App Live Connection:'}</strong>{' '}
                {isPt 
                  ? 'Nosso servidor conecta diretamente à API pública oficial da NASA (NASA POWER & DAAC) para buscar e calibrar os dados instantaneamente para as coordenadas do talhão.'
                  : 'Our server connects directly to official public NASA APIs (NASA POWER & DAAC) to calibrate observations on-the-fly for your farm coordinates.'}
              </div>
            </div>

            <div className="mt-5 text-right pt-3 border-t border-stone-800">
              <button
                onClick={() => setShowRealtimeExplainer(false)}
                className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700"
              >
                {isPt ? 'Entendi' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
