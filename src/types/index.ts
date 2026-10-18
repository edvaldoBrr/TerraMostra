export type Language = 'pt' | 'en';

export interface LiveSyncInfo {
  isLive: boolean;
  lastSyncedAt: string;
  source: string;
  orbitalPassage: string;
  station: string;
  pingMs: number;
  packetId?: string;
}

export interface Region {
  id: string;
  name: string;
  stateOrCountry: string;
  country: string;
  biome: string;
  lat: number;
  lon: number;
  climateType: string;
  description: string;
  defaultSoil: SoilProfile;
  nasaData: NasaSatelliteData;
}

export interface NasaSatelliteData {
  // NASA SMAP (Soil Moisture Active Passive)
  smapSurfaceMoisture: number; // 0-5 cm volumetric % (e.g., 18%)
  smapRootZoneMoisture: number; // 0-100 cm volumetric % (e.g., 24%)
  smapNormalSurface: number; // Historical baseline %
  smapDroughtStatus: 'Normal' | 'Leve' | 'Moderado' | 'Severo' | 'Extremo';
  smapMonthlyTrends: { month: string; moisture: number; baseline: number }[];

  // NASA GPM (Global Precipitation Measurement)
  gpmTotalRainMm: number; // Last 90 days accumulated
  gpmHistoricalMeanMm: number;
  gpmRainfallAnomaly: number; // % deviation (-35%, +12%)
  gpmRainyDaysLastMonth: number;
  gpmForecastTrend: 'Redução Acentuada' | 'Estável' | 'Aumento de Tempestades';

  // NASA ECOSTRESS (ISS Thermal Radiometer)
  ecostressESI: number; // Evaporative Stress Index (0.0 to 1.0)
  ecostressPlantStressLevel: 'Ótimo' | 'Moderado' | 'Crítico';
  ecostressCanopyTempC: number;

  // NASA MODIS / VIIRS (Terra/Aqua & Suomi)
  modisNdvi: number; // 0.0 to 1.0
  modisNdviAnomaly: number; // -0.2 to +0.2
  modisBiomassIndex: number; // 0-100 score

  // NASA POWER (Prediction of Worldwide Energy Resources)
  powerGdd: number; // Growing Degree Days acumulados (°C-dia)
  powerSolarRadiation: number; // MJ/m²/dia
  powerMaxTemp: number; // °C
  powerMinTemp: number; // °C
  powerVaporPressureDeficit: number; // kPa (Déficit de pressão de vapor)

  // NASA GRACE-FO (Gravity Recovery and Climate Experiment)
  graceWaterStorage: number; // Groundwater anomaly in cm equivalent
  graceTrend: 'Recarga' | 'Equilíbrio' | 'Depleção Contínua';
}

export interface SoilProfile {
  texture: 'Arenoso (Sandy)' | 'Franco-arenoso (Loamy Sand)' | 'Franco (Loam)' | 'Franco-argiloso (Clay Loam)' | 'Argiloso (Clay)' | 'Muito Argiloso (Heavy Clay)';
  organicMatter: number; // % (e.g., 1.8%)
  compactionLevel: 'Baixa (Sem impedimento)' | 'Média (Pé-de-grade a 20cm)' | 'Alta (Camada adensada severa)';
  ph: number; // 4.5 - 7.5
  waterHoldingCapacity: 'Baixa (<50mm/m)' | 'Média (50-100mm/m)' | 'Alta (>100mm/m)';
  salinityRisk: 'Baixo' | 'Moderado' | 'Alto';
  slope: 'Plano (0-3%)' | 'Suave ondulado (3-8%)' | 'Ondulado (>8%)';
}

export interface FarmerPriorities {
  waterConservation: number; // 1-10
  soilHealth: number; // 1-10
  nitrogenFixation: number; // 1-10
  erosionControl: number; // 1-10
  economicYield: number; // 1-10
  pestSuppression: number; // 1-10
}

export type CropCategory = 
  | 'Grão Comercial' 
  | 'Adubação Verde / Leguminosa' 
  | 'Cobertura / Gramínea' 
  | 'Descompactador / Raiz Pivotante' 
  | 'Resistente a Seca Extrema';

export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  category: CropCategory;
  family: 'Fabaceae (Leguminosa)' | 'Poaceae (Gramínea)' | 'Brassicaceae (Crucífera)' | 'Asteraceae' | 'Pedaliaceae' | 'Outras';
  cycleDays: number;
  waterDemandMm: number; // Total crop water requirement in mm
  droughtToleranceScore: number; // 1 to 5
  rootDepthCm: number; // Effective rooting depth
  rootType: 'Pivotante Profunda' | 'Fasciculada Abundante' | 'Tuberosa / Reserva' | 'Fasciculada Rasa';
  nitrogenBalanceKgHa: number; // Positive = fixes N, Negative = extracts N
  biomassYieldTonHa: number; // Dry matter biomass production
  nematodeEffect: 'Supressor / Não Hospedeiro' | 'Armadilha' | 'Neutro' | 'Multiplicador';
  compactionBreakerScore: number; // 1 to 5 (biopore creation)
  economicTier: 'Alto' | 'Médio' | 'Baixo (Foco Cobertura)';
  optimalSmapMoistureMin: number; // Minimum root-zone soil moisture % needed
  maxHeatToleranceC: number;
  description: string;
  managementTip: string;
}

export type SeasonSlot = 'safra_1' | 'safrinha_1' | 'cobertura_1' | 'safra_2' | 'safrinha_2' | 'cobertura_2';

export interface RotationPhase {
  id: string;
  slot: SeasonSlot;
  label: string; // e.g. "Safra Principal 2026/27 (Verão)"
  seasonPeriod: string; // e.g. "Out - Fev"
  cropId: string;
  customNotes?: string;
}

export interface SimulationResult {
  resilienceScore: number; // 0-100
  waterConservationScore: number; // 0-100
  soilRegenerationScore: number; // 0-100
  nitrogenBalanceNetKg: number; // net kg/ha
  biomassTotalTons: number; // total dry biomass t/ha
  rootDepthCoverageScore: number; // 0-100
  nematodeRiskIndex: 'Baixo' | 'Moderado' | 'Alto';
  erosionProtectionIndex: number; // 0-100
  waterSavedM3PerHa: number; // estimated m3 saved vs bare soil
  fertilizerSavingsUSDPerHa: number; // estimated economic saving in urea/fert
  nasaMoistureDeficitAlerts: string[];
  climateRiskLevel: 'Baixo' | 'Moderado' | 'Elevado' | 'Crítico';
  recommendations: string[];
}
