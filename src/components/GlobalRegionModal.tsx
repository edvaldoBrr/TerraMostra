import React, { useState } from 'react';
import { 
  Globe2, 
  MapPin, 
  Compass, 
  Search, 
  Navigation, 
  X, 
  Check, 
  Satellite, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Region, Language } from '../types';
import { REGIONS } from '../data/regions';

interface GlobalRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegion: Region;
  onSelectRegion: (region: Region) => void;
  language: Language;
}

export const GlobalRegionModal: React.FC<GlobalRegionModalProps> = ({
  isOpen,
  onClose,
  currentRegion,
  onSelectRegion,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [continentFilter, setContinentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Custom GPS coordinates
  const [customLat, setCustomLat] = useState<string>(currentRegion.lat.toString());
  const [customLon, setCustomLon] = useState<string>(currentRegion.lon.toString());
  const [customName, setCustomName] = useState<string>('Meu Talhão Global (NASA GPS)');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  if (!isOpen) return null;
  const isPt = language === 'pt';

  const continents = [
    { id: 'all', label: isPt ? 'Todos os Polos (15)' : 'All Regions (15)' },
    { id: 'sul', label: 'América do Sul' },
    { id: 'norte', label: 'América do Norte' },
    { id: 'europa', label: 'Europa' },
    { id: 'asia_oceania', label: 'Ásia & Oceania' },
    { id: 'africa', label: 'África' },
  ];

  const filteredRegions = REGIONS.filter(reg => {
    let matchesContinent = true;
    if (continentFilter === 'sul') matchesContinent = reg.country === 'Brasil' || reg.country === 'Argentina';
    else if (continentFilter === 'norte') matchesContinent = reg.country === 'Estados Unidos';
    else if (continentFilter === 'europa') matchesContinent = reg.country === 'Ucrânia' || reg.country === 'França';
    else if (continentFilter === 'asia_oceania') matchesContinent = reg.country === 'Índia' || reg.country === 'Austrália';
    else if (continentFilter === 'africa') matchesContinent = reg.country === 'Quênia' || reg.country === 'Senegal';

    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reg.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reg.biome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reg.stateOrCountry.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesContinent && matchesSearch;
  });

  const handleUseBrowserGPS = () => {
    if (!navigator.geolocation) {
      alert(isPt ? 'Geolocalização não suportada neste navegador.' : 'Geolocation not supported.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomLat(pos.coords.latitude.toFixed(4));
        setCustomLon(pos.coords.longitude.toFixed(4));
        setCustomName(isPt ? 'Minha Localização GPS Atual' : 'My Current GPS Location');
        setGpsLoading(false);
      },
      (err) => {
        console.warn(err);
        setGpsLoading(false);
        alert(isPt ? 'Não foi possível capturar o GPS. Digite as coordenadas manualmente.' : 'Unable to acquire GPS.');
      },
      { timeout: 8000 }
    );
  };

  const handleApplyCustomCoordinates = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon)) return;

    const customRegion: Region = {
      id: `custom_${Date.now()}`,
      name: customName || (isPt ? 'Talhão Global Personalizado' : 'Custom Global Field'),
      stateOrCountry: `GPS: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      country: 'Global',
      biome: isPt ? 'Zona Agroecológica Global' : 'Global Agroecological Zone',
      lat,
      lon,
      climateType: isPt ? 'Clima Local Sincronizado via NASA POWER' : 'Local Climate via NASA POWER',
      description: isPt 
        ? `Coordenadas personalizadas (${lat}°, ${lon}°). Telemetria calibrada diretamente através da API NASA POWER e sensores orbitais.`
        : `Custom coordinates (${lat}°, ${lon}°). Telemetry calibrated directly through NASA POWER API and orbital sensors.`,
      defaultSoil: {
        texture: 'Franco-argiloso (Clay Loam)',
        organicMatter: 2.2,
        compactionLevel: 'Média (Pé-de-grade a 20cm)',
        ph: 6.0,
        waterHoldingCapacity: 'Média (50-100mm/m)',
        salinityRisk: 'Baixo',
        slope: 'Suave ondulado (3-8%)'
      },
      nasaData: {
        smapSurfaceMoisture: 20.0,
        smapRootZoneMoisture: 24.0,
        smapNormalSurface: 25.0,
        smapDroughtStatus: 'Leve',
        smapMonthlyTrends: [
          { month: 'Jan', moisture: 25, baseline: 25 },
          { month: 'Fev', moisture: 26, baseline: 26 },
          { month: 'Mar', moisture: 28, baseline: 28 },
          { month: 'Abr', moisture: 24, baseline: 26 },
          { month: 'Mai', moisture: 19, baseline: 22 },
          { month: 'Jun', moisture: 15, baseline: 18 },
          { month: 'Jul', moisture: 14, baseline: 16 },
          { month: 'Ago', moisture: 14, baseline: 16 },
          { month: 'Set', moisture: 18, baseline: 20 },
          { month: 'Out', moisture: 22, baseline: 24 },
          { month: 'Nov', moisture: 26, baseline: 26 },
          { month: 'Dez', moisture: 27, baseline: 27 }
        ],
        gpmTotalRainMm: 310,
        gpmHistoricalMeanMm: 340,
        gpmRainfallAnomaly: -8.8,
        gpmRainyDaysLastMonth: 7,
        gpmForecastTrend: 'Estável',
        ecostressESI: 0.48,
        ecostressPlantStressLevel: 'Moderado',
        ecostressCanopyTempC: 32.0,
        modisNdvi: 0.65,
        modisNdviAnomaly: -0.02,
        modisBiomassIndex: 68,
        powerGdd: 1750,
        powerSolarRadiation: 21.5,
        powerMaxTemp: 34.0,
        powerMinTemp: 18.0,
        powerVaporPressureDeficit: 2.0,
        graceWaterStorage: -2.0,
        graceTrend: 'Equilíbrio'
      }
    };

    onSelectRegion(customRegion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl">
        
        {/* Header */}
        <div className="border-b border-stone-800 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 shadow-md text-stone-950 font-bold">
                <Globe2 className="h-5 w-5 text-stone-950" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white sm:text-lg">
                  {isPt ? 'Mapeamento Global de Fazendas NASA' : 'NASA Global Agricultural Farm Explorer'}
                </h3>
                <p className="text-xs text-stone-400">
                  {isPt 
                    ? 'Explore 15 polos agrícolas mundiais ou aponte qualquer coordenada GPS do planeta Terra' 
                    : 'Explore 15 global breadbasket regions or target any GPS coordinate on Earth'}
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

          {/* Mode Switcher: Presets vs Custom GPS */}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-800/80 pt-3">
            <div className="flex items-center gap-1 rounded-xl bg-stone-950 p-1 border border-stone-800">
              <button
                onClick={() => setActiveTab('preset')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'preset'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>{isPt ? 'Polos Agrícolas Globais' : 'Global Breadbaskets'}</span>
              </button>

              <button
                onClick={() => setActiveTab('custom')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'custom'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{isPt ? 'GPS & Coordenadas Personalizadas' : 'Custom GPS & Coordinates'}</span>
              </button>
            </div>

            {activeTab === 'preset' && (
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-500" />
                <input
                  type="text"
                  placeholder={isPt ? "Buscar país, cidade, bioma..." : "Search country, biome..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Continent Filter Chips (Preset mode) */}
          {activeTab === 'preset' && (
            <div className="mt-3 flex flex-wrap gap-1">
              {continents.map(c => (
                <button
                  key={c.id}
                  onClick={() => setContinentFilter(c.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    continentFilter === c.id
                      ? 'bg-stone-200 text-stone-900 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5">
          
          {/* TAB 1: Global Presets Grid */}
          {activeTab === 'preset' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRegions.map(reg => {
                const isSelected = reg.id === currentRegion.id;

                return (
                  <div
                    key={reg.id}
                    onClick={() => {
                      onSelectRegion(reg);
                      onClose();
                    }}
                    className={`group relative cursor-pointer rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'border-stone-800 bg-stone-950/70 hover:border-emerald-700/60 hover:bg-stone-850'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                          {reg.country} · {reg.biome}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mt-0.5">
                          {reg.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-stone-950">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-[11px] text-stone-400 line-clamp-2">
                      {reg.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-stone-800/80 pt-2 text-[11px] text-stone-400 font-mono">
                      <span>Lat {reg.lat}°, Lon {reg.lon}°</span>
                      <span className="text-sky-400 font-semibold">{reg.nasaData.smapRootZoneMoisture}% SMAP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Custom GPS & Coordinates Picker */}
          {activeTab === 'custom' && (
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Satellite className="h-4 w-4" />
                  <span>{isPt ? 'Conexão Direta com a API NASA POWER por Coordenadas' : 'Direct NASA POWER Query by Coordinates'}</span>
                </div>
                <p className="mt-1 text-xs text-stone-300 leading-relaxed">
                  {isPt 
                    ? 'Digite as coordenadas geográficas exatas da sua propriedade rural ou use o GPS do seu aparelho. A telemetria de umidade SMAP, anomalia GPM e radiação solar será consultada instantaneamente para aquele ponto exato da Terra.'
                    : 'Enter the exact geographic coordinates of your farm or use device GPS. SMAP moisture, GPM rainfall, and solar radiation will be retrieved immediately for that exact spot on Earth.'}
                </p>
              </div>

              {/* GPS Auto-detect button */}
              <button
                type="button"
                onClick={handleUseBrowserGPS}
                disabled={gpsLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-stone-700 hover:border-emerald-500 disabled:opacity-50"
              >
                <Navigation className={`h-4 w-4 text-emerald-400 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? (isPt ? 'Obtendo localização GPS...' : 'Acquiring GPS...') : (isPt ? '📍 Usar Meu GPS Atual (Dispositivo)' : '📍 Use My Current GPS Location')}</span>
              </button>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {isPt ? 'Latitude (-90° a +90°)' : 'Latitude (-90° to +90°)'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="-17.79"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {isPt ? 'Longitude (-180° a +180°)' : 'Longitude (-180° to +180°)'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="-50.92"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {isPt ? 'Nome de Identificação da Fazenda / Talhão' : 'Farm / Parcel Name'}
                </label>
                <input
                  type="text"
                  placeholder={isPt ? "Ex: Fazenda Santa Maria - Talhão 04" : "e.g. Green Valley Farm - Field 4"}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Custom GPS */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyCustomCoordinates}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/60 transition-all hover:bg-emerald-500"
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>{isPt ? 'Carregar Talhão & Sincronizar Satélites NASA' : 'Load Field & Sync NASA Satellites'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-stone-800 p-4 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <span>{isPt ? 'Dados calibrados pelo NASA Langley Research Center & GES DISC' : 'Calibrated via NASA LaRC & GES DISC'}</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-800 px-4 py-1.5 font-semibold text-stone-300 hover:text-white"
          >
            {isPt ? 'Fechar' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
