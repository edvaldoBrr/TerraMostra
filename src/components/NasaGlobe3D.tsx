import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  Globe2, 
  Satellite, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Radio, 
  Layers, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Cloud, 
  ArrowLeft,
  Calendar,
  Compass,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  MapPin,
  Sparkles,
  Maximize2,
  ListFilter,
  X,
  ChevronRight,
  Clock,
  Leaf
} from 'lucide-react';
import { Region } from '../types';
import { REGIONS } from '../data/regions';

// High Precision Hotspot Event Data with Exact Timing and Duration
export interface ClimateHotspot {
  id: string;
  regionId: string;
  name: string;
  state: string;
  country: string;
  eventType: 'Seca Severa' | 'Onda de Calor' | 'Chuva Torrencial' | 'Crise Aquífera';
  lat: number;
  lon: number;
  recordedTime: string;      // "Hora que aconteceu"
  duration: string;          // "Quanto tempo isso aí"
  sensorDetected: string;    // NASA Sensor
  severity: 'Crítico' | 'Severo' | 'Moderado' | 'Alerta';
  keyMetric: string;
  colorHex: number;
  colorTailwind: string;
  impactDescription: string;
  recommendedCrop: string;
}

// Satellite Mission Specifications
export interface SatelliteMission {
  id: string;
  name: string;
  fullName: string;
  orbitType: string;
  altitudeKm: number;
  speedKmh: number;
  inclinationDeg: number;
  colorHex: number;
  primaryInstrument: string;
  downlinkFrequency: string;
  status: 'Transmitindo' | 'Calibrando' | 'Em Órbita';
  currentLat?: number;
  currentLon?: number;
}

interface NasaGlobe3DProps {
  currentRegion?: Region;
  onSelectRegion?: (region: Region) => void;
  onBackToFarm?: () => void;
  language?: 'pt' | 'en';
  isDedicatedPage?: boolean;
}

// Helper to convert lat/long to 3D Cartesian spherical coordinates
// Three.js UV equirectangular mapping matches:
// phi = (90 - lat) * (PI / 180)
// theta = (lon + 180) * (PI / 180)
export const latLongToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Convert Vector3 back to lat/lon
export const vector3ToLatLon = (pos: THREE.Vector3) => {
  const norm = pos.clone().normalize();
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, norm.y))) * (180 / Math.PI);
  let lon = (Math.atan2(norm.z, -norm.x) * (180 / Math.PI)) - 180;
  while (lon < -180) lon += 360;
  while (lon > 180) lon -= 360;
  return { lat, lon };
};

// High-resolution Canvas Billboard Sprite Generator for Country & State Labels
const createBillboardLabel = (
  title: string, 
  subtitle: string = '', 
  type: 'country' | 'state' | 'hotspot' = 'state',
  badgeColor: string = '#0284c7'
): THREE.Sprite => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 512, 160);

    // Pill background
    const rx = 36;
    const ry = 30;
    const rw = 440;
    const rh = 100;
    const radius = 24;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = type === 'country' ? 'rgba(7, 15, 29, 0.88)' : 'rgba(12, 20, 24, 0.90)';
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, radius);
    ctx.fill();

    // Border stroke
    ctx.lineWidth = type === 'country' ? 3.5 : 2.5;
    ctx.strokeStyle = badgeColor;
    ctx.stroke();
    ctx.restore();

    // Left accent badge
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.roundRect(rx + 16, ry + 18, 54, rh - 36, 12);
    ctx.fill();

    // Accent icon/dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(rx + 43, ry + rh / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Title Text
    ctx.fillStyle = '#ffffff';
    ctx.font = type === 'country' 
      ? 'bold 36px "Inter", -apple-system, sans-serif' 
      : 'bold 32px "Inter", -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, rx + 84, ry + (subtitle ? 38 : rh / 2));

    // Subtitle Text (if present)
    if (subtitle) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 20px "JetBrains Mono", monospace';
      ctx.fillText(subtitle, rx + 86, ry + 72);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 1.0,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(spriteMat);
  const scale = type === 'country' ? 0.42 : 0.28;
  sprite.scale.set(scale, scale * (160 / 512), 1.0);
  return sprite;
};

export const NasaGlobe3D: React.FC<NasaGlobe3DProps> = ({
  currentRegion,
  onSelectRegion = () => {},
  onBackToFarm,
  language = 'pt',
  isDedicatedPage = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Groups and Mesh refs
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const countryBordersGroupRef = useRef<THREE.Group | null>(null);
  const countryLabelsGroupRef = useRef<THREE.Group | null>(null);
  const stateBordersGroupRef = useRef<THREE.Group | null>(null);
  const stateLabelsGroupRef = useRef<THREE.Group | null>(null);
  const hotspotsGroupRef = useRef<THREE.Group | null>(null);

  // Interactive UI states
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [showClouds, setShowClouds] = useState<boolean>(true);
  const [showBorders, setShowBorders] = useState<boolean>(true);
  const [showSatellites, setShowSatellites] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'seca' | 'calor' | 'chuva' | 'aquifero'>('all');
  const [isEventListOpen, setIsEventListOpen] = useState<boolean>(false);
  
  // Real-time Zoom LOD status (Global -> Countries -> States)
  const [zoomLevelInfo, setZoomLevelInfo] = useState<{
    distance: number;
    levelName: string;
    levelDescription: string;
    activeLevel: 1 | 2 | 3;
  }>({
    distance: 5.8,
    levelName: 'Visão Global / Órbita',
    levelDescription: 'Aproxime para revelar Países e Estados em alta definição',
    activeLevel: 1,
  });

  // Hotspot hover and selection
  const [hoveredHotspot, setHoveredHotspot] = useState<ClimateHotspot | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<ClimateHotspot | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Selected Satellite Mission & downlink telemetry
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteMission | null>(null);
  const [isConnectedToSatellite, setIsConnectedToSatellite] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [telemetryPacketsCount, setTelemetryPacketsCount] = useState<number>(1429);

  const isPt = language === 'pt';

  // Audio synthesizer for telemetry sound feedback
  const playBeep = (freq = 880, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  // Satellite Missions Catalog
  const satellites: SatelliteMission[] = useMemo(() => [
    {
      id: 'smap',
      name: 'NASA SMAP',
      fullName: 'Soil Moisture Active Passive',
      orbitType: 'Sol-Síncrona Polar (LEO)',
      altitudeKm: 685,
      speedKmh: 27072,
      inclinationDeg: 98.1,
      colorHex: 0x10b981,
      primaryInstrument: 'Radiômetro Banda L (1.41 GHz) + Radar Micro-ondas',
      downlinkFrequency: '8.435 GHz (X-Band NASA DSN)',
      status: 'Transmitindo',
    },
    {
      id: 'gpm',
      name: 'NASA GPM Core',
      fullName: 'Global Precipitation Measurement',
      orbitType: 'Órbita Não-Sol-Síncrona',
      altitudeKm: 407,
      speedKmh: 27520,
      inclinationDeg: 65.0,
      colorHex: 0x38bdf8,
      primaryInstrument: 'Radar DPR + Radiômetro de Micro-ondas GMI',
      downlinkFrequency: '8.150 GHz',
      status: 'Transmitindo',
    },
    {
      id: 'ecostress',
      name: 'ECOSTRESS (ISS)',
      fullName: 'Ecosystem Spaceborne Thermal Radiometer',
      orbitType: 'Órbita da Estação Espacial Internacional (ISS)',
      altitudeKm: 420,
      speedKmh: 27600,
      inclinationDeg: 51.6,
      colorHex: 0xf59e0b,
      primaryInstrument: 'Radiômetro Termal Multiespectral (70m de resolução)',
      downlinkFrequency: '13.4 GHz (Ku Band TDRSS)',
      status: 'Transmitindo',
    },
    {
      id: 'terra',
      name: 'NASA Terra (MODIS)',
      fullName: 'Earth Observing System AM-1',
      orbitType: 'Sol-Síncrona Descendente (10:30 AM)',
      altitudeKm: 705,
      speedKmh: 27040,
      inclinationDeg: 98.2,
      colorHex: 0x22c55e,
      primaryInstrument: 'MODIS 36 bandas espectrais & ASTER',
      downlinkFrequency: '8.212 GHz',
      status: 'Transmitindo',
    },
    {
      id: 'aqua',
      name: 'NASA Aqua (MODIS)',
      fullName: 'Earth Observing System PM-1',
      orbitType: 'Sol-Síncrona Ascendente (1:30 PM)',
      altitudeKm: 705,
      speedKmh: 27040,
      inclinationDeg: 98.2,
      colorHex: 0x06b6d4,
      primaryInstrument: 'MODIS & AIRS Sensor Atmosférico',
      downlinkFrequency: '8.212 GHz',
      status: 'Transmitindo',
    },
    {
      id: 'grace',
      name: 'NASA GRACE-FO',
      fullName: 'Gravity Recovery and Climate Experiment Follow-On',
      orbitType: 'Satélites Gêmeos Tandem Polar',
      altitudeKm: 490,
      speedKmh: 27410,
      inclinationDeg: 89.0,
      colorHex: 0xa855f7,
      primaryInstrument: 'Interferometria Laser de Medição Gravitacional de Aquíferos',
      downlinkFrequency: '8.450 GHz',
      status: 'Transmitindo',
    },
    {
      id: 'landsat',
      name: 'Landsat 9 (USGS/NASA)',
      fullName: 'Land Remote Sensing Satellite',
      orbitType: 'Sol-Síncrona Polar (LEO)',
      altitudeKm: 705,
      speedKmh: 27050,
      inclinationDeg: 98.2,
      colorHex: 0xec4899,
      primaryInstrument: 'OLI-2 (Operational Land Imager) + TIRS-2',
      downlinkFrequency: '8.245 GHz',
      status: 'Transmitindo',
    }
  ], []);

  // Hotspots Database (Real-time agroclimatic extreme events with state, location, exact time, and duration)
  const hotspots: ClimateHotspot[] = useMemo(() => [
    {
      id: 'hs_cerrado',
      regionId: 'cerrado_goias',
      name: 'Rio Verde & Jataí',
      state: 'Goiás (GO)',
      country: 'Brasil',
      eventType: 'Seca Severa',
      lat: -17.79,
      lon: -50.92,
      recordedTime: '14:28:15 UTC (Passagem Orbital SMAP)',
      duration: 'Detectado há 8 min · Ativo há 19 dias contínuos',
      sensorDetected: 'NASA SMAP L3 & GPM IMERG',
      severity: 'Severo',
      keyMetric: 'Umidade Solo: 18.2% | Déficit: -34% anomalia',
      colorHex: 0xef4444,
      colorTailwind: 'text-rose-400 bg-rose-950/80 border-rose-800',
      impactDescription: 'Estresse hídrico na fase crítica de floração; rápida dessecação do horizonte de 0-20 cm.',
      recommendedCrop: 'Braquiária ruziziensis consorciada para criar bioporos e reter orvalho matinal.',
    },
    {
      id: 'hs_sorriso',
      regionId: 'sorriso_mt',
      name: 'Sorriso & Lucas do Rio Verde',
      state: 'Mato Grosso (MT)',
      country: 'Brasil',
      eventType: 'Onda de Calor',
      lat: -12.54,
      lon: -55.72,
      recordedTime: '13:45:00 UTC (Passagem ECOSTRESS)',
      duration: 'Detectado há 22 min · Ativo há 6 dias contínuos',
      sensorDetected: 'NASA ECOSTRESS (ISS)',
      severity: 'Severo',
      keyMetric: 'Temp Dossel: 38.6°C | VPD: 3.4 kPa',
      colorHex: 0xf97316,
      colorTailwind: 'text-orange-400 bg-orange-950/80 border-orange-800',
      impactDescription: 'Pico de evapotranspiração forçada com fechamento estomático prematuro às 11:30h.',
      recommendedCrop: 'Manejo com palhada densa de milheto (> 6 t/ha) para amortecer gradiente térmico.',
    },
    {
      id: 'hs_matopiba',
      regionId: 'oeste_bahia',
      name: 'Luís Eduardo Magalhães & Barreiras',
      state: 'Bahia (BA)',
      country: 'Brasil',
      eventType: 'Seca Severa',
      lat: -12.09,
      lon: -45.79,
      recordedTime: '11:12:30 UTC (Passagem SMAP)',
      duration: 'Detectado há 1h 14min · Ativo há 26 dias contínuos',
      sensorDetected: 'NASA SMAP Banda L (1.4 GHz)',
      severity: 'Crítico',
      keyMetric: 'Umidade: 12.8% (Ponto Murcha) | ESI: 0.22',
      colorHex: 0xd97706,
      colorTailwind: 'text-amber-400 bg-amber-950/80 border-amber-800',
      impactDescription: 'Horizonte arenoso B-latossólico com retenção residual mínima de água útil.',
      recommendedCrop: 'Consórcio de braquiária brizantha com adubação fosfatada profunda em sulco.',
    },
    {
      id: 'hs_sul',
      regionId: 'passo_fundo_rs',
      name: 'Passo Fundo & Carazinho',
      state: 'Rio Grande do Sul (RS)',
      country: 'Brasil',
      eventType: 'Chuva Torrencial',
      lat: -28.26,
      lon: -52.40,
      recordedTime: '15:10:00 UTC (Passagem GPM Core DPR)',
      duration: 'Detectado há 45 min · Acumulado nas últimas 36 horas',
      sensorDetected: 'NASA GPM Dual-Frequency Radar',
      severity: 'Alerta',
      keyMetric: 'Chuva: 114 mm/36h | Saturação Solo: 97%',
      colorHex: 0x38bdf8,
      colorTailwind: 'text-sky-400 bg-sky-950/80 border-sky-800',
      impactDescription: 'Saturação de macroporos, escorrimento superficial acelerado e risco de anoxia radicular.',
      recommendedCrop: 'Manutenção de canais de drenagem biológica e curvas de nível vegetadas.',
    },
    {
      id: 'hs_sp',
      regionId: 'ribeirao_preto_sp',
      name: 'Ribeirão Preto & Sertãozinho',
      state: 'São Paulo (SP)',
      country: 'Brasil',
      eventType: 'Onda de Calor',
      lat: -21.17,
      lon: -47.81,
      recordedTime: '12:05:00 UTC (Passagem Aqua MODIS)',
      duration: 'Detectado há 2h 08min · Ativo há 8 dias',
      sensorDetected: 'NASA Aqua MODIS & ECOSTRESS',
      severity: 'Severo',
      keyMetric: 'Temp Superfície: 36.4°C | Umid Relativa: 21%',
      colorHex: 0xf97316,
      colorTailwind: 'text-orange-400 bg-orange-950/80 border-orange-800',
      impactDescription: 'Estresse respiratório acentuado e dessecação de cana-de-açúcar e soja safrinha.',
      recommendedCrop: 'Preservação de cobertura morta de palha de cana crua sem queima.',
    },
    {
      id: 'hs_pr',
      regionId: 'cascavel_pr',
      name: 'Cascavel & Toledo',
      state: 'Paraná (PR)',
      country: 'Brasil',
      eventType: 'Seca Severa',
      lat: -24.95,
      lon: -53.46,
      recordedTime: '09:30:10 UTC (Passagem SMAP)',
      duration: 'Detectado há 5h 02min · Ativo há 14 dias',
      sensorDetected: 'NASA SMAP L4 Root-Zone Analysis',
      severity: 'Severo',
      keyMetric: 'Umidade Raiz (0-100cm): 22.1% | Anomalia: -28%',
      colorHex: 0xef4444,
      colorTailwind: 'text-rose-400 bg-rose-950/80 border-rose-800',
      impactDescription: 'Depleção rápida de água útil no perfil de Latossolo Vermelho Eutroférrico.',
      recommendedCrop: 'Plantio direto consolidado com aveia-preta e nabo forrageiro.',
    },
    {
      id: 'hs_mg',
      regionId: 'triangulo_mg',
      name: 'Uberlândia & Patos de Minas',
      state: 'Minas Gerais (MG)',
      country: 'Brasil',
      eventType: 'Seca Severa',
      lat: -18.91,
      lon: -48.27,
      recordedTime: '10:55:00 UTC (Passagem Terra)',
      duration: 'Detectado há 3h 41min · Ativo há 11 dias',
      sensorDetected: 'NASA SMAP & POWER GEOS-5',
      severity: 'Moderado',
      keyMetric: 'Déficit Hídrico: -18.4% | Radiação: 23.8 MJ/m²',
      colorHex: 0xef4444,
      colorTailwind: 'text-rose-400 bg-rose-950/80 border-rose-800',
      impactDescription: 'Redução na taxa de infiltração hídrica em solos argilosos sob manejo intensivo.',
      recommendedCrop: 'Crotalária spectabilis para controle de nematóides e incorporação de matéria orgânica.',
    },
    {
      id: 'hs_california',
      regionId: 'california_valley',
      name: 'Fresno & Bakersfield',
      state: 'Califórnia (CA)',
      country: 'Estados Unidos',
      eventType: 'Crise Aquífera',
      lat: 36.74,
      lon: -119.78,
      recordedTime: '08:15 UTC (Passagem GRACE-FO)',
      duration: 'Detectado há 6h 21min · Crise multi-anual contínua',
      sensorDetected: 'NASA GRACE-FO & ECOSTRESS',
      severity: 'Crítico',
      keyMetric: 'Aquífero Central Valley: -11.4 cm H2O | ESI: 0.28',
      colorHex: 0xa855f7,
      colorTailwind: 'text-purple-400 bg-purple-950/80 border-purple-800',
      impactDescription: 'Rebaixamento severo do lençol freático e subsidência do solo por bombeamento profundo.',
      recommendedCrop: 'Culturas de cobertura com mínima evapotranspiração para retenção de orvalho.',
    },
    {
      id: 'hs_punjab',
      regionId: 'india_punjab',
      name: 'Ludhiana & Amritsar',
      state: 'Punjab',
      country: 'Índia',
      eventType: 'Crise Aquífera',
      lat: 30.90,
      lon: 75.85,
      recordedTime: '05:40 UTC (Passagem GRACE-FO)',
      duration: 'Detectado há 8h 56min · Ativo há 34 dias',
      sensorDetected: 'NASA GRACE-FO Laser Interferometer',
      severity: 'Crítico',
      keyMetric: 'Aquífero: -14.2 cm | Temp Máx: 42.1°C',
      colorHex: 0xa855f7,
      colorTailwind: 'text-purple-400 bg-purple-950/80 border-purple-800',
      impactDescription: 'Esgotamento crítico do lençol freático pela rotação contínua inundada de arroz-trigo.',
      recommendedCrop: 'Substituição urgente por leguminosas de raiz pivotante e milheto de baixo consumo.',
    },
    {
      id: 'hs_sahel',
      regionId: 'senegal_sahel',
      name: 'Bacia de Kaolack',
      state: 'Kaolack',
      country: 'Senegal',
      eventType: 'Seca Severa',
      lat: 14.14,
      lon: -16.08,
      recordedTime: '10:00 UTC (Passagem SMAP)',
      duration: 'Detectado há 4h 36min · Ativo há 40 dias',
      sensorDetected: 'NASA SMAP & NASA POWER',
      severity: 'Crítico',
      keyMetric: 'Umidade SMAP: 9.8% | Temp Máx: 43.1°C',
      colorHex: 0xd97706,
      colorTailwind: 'text-amber-400 bg-amber-950/80 border-amber-800',
      impactDescription: 'Avanço da aridez no Sahel; solo arenoso exposto a erosão eólica extrema.',
      recommendedCrop: 'Feijão-Caupi e Guandu para contenção de dunas e regeneração microbiana.',
    }
  ], []);

  // Filter hotspots based on user tab selection
  const filteredHotspots = useMemo(() => {
    if (filterType === 'all') return hotspots;
    if (filterType === 'seca') return hotspots.filter(h => h.eventType === 'Seca Severa');
    if (filterType === 'calor') return hotspots.filter(h => h.eventType === 'Onda de Calor');
    if (filterType === 'chuva') return hotspots.filter(h => h.eventType === 'Chuva Torrencial');
    if (filterType === 'aquifero') return hotspots.filter(h => h.eventType === 'Crise Aquífera');
    return hotspots;
  }, [hotspots, filterType]);

  // High Precision Country Outlines & Coastlines
  const createCountryBorders = (radius: number): THREE.Group => {
    const group = new THREE.Group();
    const borderMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      linewidth: 1.5,
    });

    // Realistic vector border polylines for South America, Brazil, North America, Eurasia, etc.
    const bordersData: { name: string; coords: [number, number][] }[] = [
      // Brazil Coast & Continental Perimeter
      {
        name: 'Brasil Perímetro',
        coords: [
          [4.4, -51.5], [1.5, -49.8], [-0.5, -48.0], [-2.5, -44.2], [-3.8, -38.5], 
          [-5.3, -35.3], [-7.2, -34.8], [-9.5, -35.7], [-13.0, -38.5], [-17.8, -39.3], 
          [-21.5, -40.8], [-23.0, -43.2], [-24.0, -46.3], [-26.2, -48.6], [-28.5, -49.0], 
          [-32.0, -52.1], [-33.7, -53.4], [-30.3, -57.6], [-28.1, -54.0], [-25.6, -54.6], 
          [-24.0, -54.3], [-22.3, -57.9], [-19.9, -58.0], [-17.6, -57.8], [-16.2, -60.0], 
          [-13.5, -61.0], [-11.0, -65.3], [-9.7, -66.8], [-9.8, -70.5], [-7.5, -73.8], 
          [-4.2, -70.0], [-2.0, -67.0], [1.2, -67.0], [2.2, -64.0], [3.8, -60.2], 
          [5.0, -60.4], [4.4, -51.5]
        ]
      },
      // South America - Argentina / Chile / Uruguay / Peru
      {
        name: 'Argentina & Cone Sul',
        coords: [
          [-22.0, -65.5], [-26.0, -68.5], [-31.0, -70.5], [-38.0, -71.0], [-46.0, -72.0],
          [-52.0, -69.0], [-55.0, -66.5], [-50.0, -65.5], [-42.0, -63.5], [-36.0, -57.0],
          [-34.5, -58.4], [-30.3, -57.6], [-25.6, -54.6], [-22.0, -62.0], [-22.0, -65.5]
        ]
      },
      // North America - USA / Canada Coast & Borders
      {
        name: 'Estados Unidos',
        coords: [
          [49.0, -123.0], [49.0, -95.0], [45.0, -75.0], [41.0, -71.0], [30.0, -81.0], 
          [25.0, -80.0], [29.0, -94.0], [26.0, -97.0], [31.5, -106.5], [32.5, -117.0], 
          [38.0, -123.0], [48.5, -124.5], [49.0, -123.0]
        ]
      },
      // Europe Outline
      {
        name: 'Europa Ocidental',
        coords: [
          [36.0, -6.0], [43.5, -9.0], [48.5, -4.5], [51.0, 2.0], [54.0, 9.0], 
          [57.0, 10.0], [55.0, 14.0], [45.0, 13.0], [38.0, 15.0], [36.5, -4.0], [36.0, -6.0]
        ]
      },
      // Africa Outline
      {
        name: 'África',
        coords: [
          [37.0, 10.0], [31.0, 32.0], [12.0, 43.0], [-12.0, 40.5], [-34.5, 20.0], 
          [-34.0, 18.5], [-16.0, 12.0], [4.5, 9.0], [5.0, -1.0], [14.5, -17.5], 
          [28.0, -13.0], [36.0, -5.0], [37.0, 10.0]
        ]
      },
      // India & South Asia
      {
        name: 'Índia',
        coords: [
          [34.0, 74.0], [31.0, 70.0], [24.0, 69.0], [15.0, 73.5], [8.2, 77.5], 
          [13.0, 80.2], [21.5, 87.0], [26.0, 89.0], [28.5, 80.0], [34.0, 74.0]
        ]
      },
      // Australia Outline
      {
        name: 'Austrália',
        coords: [
          [-12.0, 130.0], [-10.5, 142.0], [-24.0, 153.0], [-37.5, 150.0], [-38.5, 145.0], 
          [-35.0, 116.0], [-22.0, 114.0], [-15.0, 124.0], [-12.0, 130.0]
        ]
      }
    ];

    bordersData.forEach(b => {
      const points: THREE.Vector3[] = [];
      b.coords.forEach(([lat, lon]) => {
        points.push(latLongToVector3(lat, lon, radius * 1.004));
      });
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, borderMat);
      group.add(line);
    });

    return group;
  };

  // High Precision Country Billboard Labels (Appear when zooming to Mid distance)
  const createCountryLabels = (radius: number): THREE.Group => {
    const group = new THREE.Group();
    const countries = [
      { name: 'BRASIL', code: 'BR · América do Sul', lat: -14.23, lon: -51.92, color: '#10b981' },
      { name: 'ARGENTINA', code: 'AR · Cone Sul', lat: -38.41, lon: -63.61, color: '#38bdf8' },
      { name: 'ESTADOS UNIDOS', code: 'USA · América do Norte', lat: 37.09, lon: -95.71, color: '#38bdf8' },
      { name: 'CANADÁ', code: 'CAN', lat: 56.13, lon: -106.34, color: '#94a3b8' },
      { name: 'CHINA', code: 'CHN · Ásia Oriental', lat: 35.86, lon: 104.19, color: '#f59e0b' },
      { name: 'ÍNDIA', code: 'IND · Sul da Ásia', lat: 20.59, lon: 78.96, color: '#f97316' },
      { name: 'AUSTRÁLIA', code: 'AUS · Oceania', lat: -25.27, lon: 133.77, color: '#38bdf8' },
      { name: 'FRANÇA', code: 'FRA · Europa', lat: 46.22, lon: 2.21, color: '#38bdf8' },
      { name: 'ÁFRICA DO SUL', code: 'ZAF · África', lat: -30.55, lon: 22.93, color: '#f59e0b' },
    ];

    countries.forEach(c => {
      const sprite = createBillboardLabel(c.name, c.code, 'country', c.color);
      const pos = latLongToVector3(c.lat, c.lon, radius * 1.018);
      sprite.position.copy(pos);
      group.add(sprite);
    });

    return group;
  };

  // Realistic Brazilian & Global State Boundaries with High-Precision Polygons
  const createStateBorder3DLines = (radius: number): THREE.Group => {
    const group = new THREE.Group();
    const stateBorderMat = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5,
    });

    // Real polygonal boundaries of Brazilian States (especially agricultural grain belt)
    const statePolygons: { name: string; coords: [number, number][] }[] = [
      // Goiás (GO)
      {
        name: 'Goiás',
        coords: [
          [-12.4, -48.0], [-13.2, -46.5], [-14.5, -46.0], [-16.0, -47.2], [-18.5, -48.2], 
          [-19.3, -50.5], [-18.5, -53.0], [-17.2, -52.8], [-15.8, -52.0], [-13.5, -50.8], 
          [-12.4, -48.0]
        ]
      },
      // Mato Grosso (MT)
      {
        name: 'Mato Grosso',
        coords: [
          [-8.0, -58.0], [-8.8, -55.0], [-9.5, -51.5], [-11.0, -50.5], [-14.0, -52.0], 
          [-16.5, -53.5], [-17.8, -55.0], [-17.5, -57.8], [-16.0, -60.0], [-13.5, -61.0], 
          [-11.5, -60.5], [-9.5, -60.5], [-8.0, -58.0]
        ]
      },
      // Mato Grosso do Sul (MS)
      {
        name: 'Mato Grosso do Sul',
        coords: [
          [-17.5, -57.8], [-17.8, -55.0], [-18.5, -53.0], [-19.5, -51.0], [-21.5, -52.0], 
          [-23.8, -54.0], [-24.1, -55.5], [-22.5, -57.9], [-19.9, -58.0], [-17.5, -57.8]
        ]
      },
      // Minas Gerais (MG)
      {
        name: 'Minas Gerais',
        coords: [
          [-14.5, -46.0], [-15.0, -42.5], [-16.0, -40.5], [-19.0, -39.8], [-21.5, -41.5], 
          [-22.8, -44.5], [-22.5, -46.5], [-20.0, -47.5], [-19.3, -50.5], [-18.5, -48.2], 
          [-16.0, -47.2], [-14.5, -46.0]
        ]
      },
      // São Paulo (SP)
      {
        name: 'São Paulo',
        coords: [
          [-19.8, -50.5], [-20.0, -47.5], [-22.5, -46.5], [-23.4, -45.0], [-24.5, -47.5], 
          [-25.2, -48.2], [-24.8, -50.0], [-22.5, -52.5], [-21.5, -52.0], [-19.8, -50.5]
        ]
      },
      // Bahia (BA)
      {
        name: 'Bahia',
        coords: [
          [-8.5, -39.5], [-9.5, -37.5], [-11.5, -37.2], [-13.0, -38.5], [-17.8, -39.3], 
          [-16.0, -40.5], [-15.0, -42.5], [-14.5, -46.0], [-13.2, -46.5], [-10.5, -46.0], 
          [-9.0, -43.0], [-8.5, -39.5]
        ]
      },
      // Paraná (PR)
      {
        name: 'Paraná',
        coords: [
          [-22.5, -52.5], [-24.8, -50.0], [-25.2, -48.2], [-26.0, -48.8], [-26.2, -51.5], 
          [-26.5, -53.5], [-25.6, -54.6], [-24.0, -54.3], [-23.8, -54.0], [-22.5, -52.5]
        ]
      },
      // Rio Grande do Sul (RS)
      {
        name: 'Rio Grande do Sul',
        coords: [
          [-27.2, -53.5], [-27.5, -51.5], [-28.5, -49.5], [-31.5, -51.5], [-33.7, -53.4], 
          [-31.8, -55.5], [-30.3, -57.6], [-28.1, -55.0], [-27.2, -53.5]
        ]
      },
      // Tocantins (TO)
      {
        name: 'Tocantins',
        coords: [
          [-5.5, -48.0], [-6.5, -46.5], [-9.0, -46.0], [-13.0, -46.5], [-12.4, -48.0], 
          [-13.5, -50.8], [-10.5, -50.5], [-7.5, -49.0], [-5.5, -48.0]
        ]
      },
      // Maranhão (MA)
      {
        name: 'Maranhão',
        coords: [
          [-1.5, -44.5], [-2.5, -42.5], [-5.0, -43.0], [-7.5, -45.5], [-9.5, -46.0], 
          [-6.5, -46.5], [-5.5, -48.0], [-3.0, -47.5], [-1.5, -44.5]
        ]
      },
      // Pará (PA)
      {
        name: 'Pará',
        coords: [
          [-0.5, -48.0], [-1.5, -47.0], [-4.0, -48.0], [-8.0, -50.0], [-9.5, -51.5], 
          [-8.8, -55.0], [-8.0, -58.0], [-4.0, -56.5], [-1.5, -58.0], [1.5, -55.0], 
          [1.5, -49.8], [-0.5, -48.0]
        ]
      },
      // California (CA - USA)
      {
        name: 'Califórnia',
        coords: [
          [42.0, -124.2], [42.0, -120.0], [39.0, -120.0], [35.0, -114.5], [32.7, -114.5], 
          [32.5, -117.2], [34.0, -119.5], [38.0, -123.0], [42.0, -124.2]
        ]
      }
    ];

    statePolygons.forEach(sp => {
      const points: THREE.Vector3[] = [];
      sp.coords.forEach(([lat, lon]) => {
        points.push(latLongToVector3(lat, lon, radius * 1.0045));
      });
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, stateBorderMat);
      group.add(line);
    });

    return group;
  };

  // State Centroid Labels (Appear when camera zooms close to Earth)
  const createStateLabels = (radius: number): THREE.Group => {
    const group = new THREE.Group();
    const states = [
      { name: 'GO · Goiás', code: 'Cerrado Central', lat: -15.8, lon: -49.8, color: '#10b981' },
      { name: 'MT · Mato Grosso', code: 'Maior Produtor Grãos', lat: -12.6, lon: -55.4, color: '#10b981' },
      { name: 'MS · Mato Grosso do Sul', code: 'Pantanal & Soja', lat: -20.5, lon: -54.6, color: '#10b981' },
      { name: 'SP · São Paulo', code: 'Cana & Citros', lat: -22.0, lon: -48.8, color: '#38bdf8' },
      { name: 'MG · Minas Gerais', code: 'Triângulo & Café', lat: -18.5, lon: -44.5, color: '#10b981' },
      { name: 'BA · Bahia', code: 'Oeste Baiano (MATOPIBA)', lat: -12.5, lon: -41.7, color: '#f59e0b' },
      { name: 'PR · Paraná', code: 'Norte & Oeste Agrícola', lat: -24.8, lon: -51.5, color: '#10b981' },
      { name: 'RS · Rio Grande do Sul', code: 'Soja, Arroz & Pampa', lat: -29.8, lon: -53.2, color: '#38bdf8' },
      { name: 'TO · Tocantins', code: 'Fronteira Agrícola', lat: -10.2, lon: -48.3, color: '#f59e0b' },
      { name: 'MA · Maranhão', code: 'Balsas & MATOPIBA', lat: -5.0, lon: -45.3, color: '#f59e0b' },
      { name: 'PA · Pará', code: 'Amazônia & Grãos', lat: -3.8, lon: -52.5, color: '#059669' },
      { name: 'CA · Califórnia', code: 'Central Valley', lat: 36.8, lon: -119.5, color: '#a855f7' },
    ];

    states.forEach(s => {
      const sprite = createBillboardLabel(s.name, s.code, 'state', s.color);
      const pos = latLongToVector3(s.lat, s.lon, radius * 1.016);
      sprite.position.copy(pos);
      group.add(sprite);
    });

    return group;
  };

  // Build 3D Satellite Model Mesh
  const createSatelliteModel = (colorHex: number): THREE.Group => {
    const satGroup = new THREE.Group();

    // Satellite Main Body (Hexagonal bus with gold MLI foil texture look)
    const bodyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.11, 6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.9,
      roughness: 0.25,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    satGroup.add(body);

    // Blue Solar Array Panels
    const panelGeo = new THREE.BoxGeometry(0.24, 0.005, 0.08);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.3,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
    });

    // Left solar wing
    const panelLeft = new THREE.Mesh(panelGeo, panelMat);
    panelLeft.position.set(-0.16, 0, 0);
    satGroup.add(panelLeft);

    // Right solar wing
    const panelRight = new THREE.Mesh(panelGeo, panelMat);
    panelRight.position.set(0.16, 0, 0);
    satGroup.add(panelRight);

    // High Gain Antenna Dish
    const dishGeo = new THREE.ConeGeometry(0.035, 0.02, 16, 1, true);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.6,
      roughness: 0.3,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, -0.05, 0.02);
    dish.rotation.x = Math.PI;
    satGroup.add(dish);

    // Instrument Beacon LED
    const ledGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const ledMat = new THREE.MeshBasicMaterial({
      color: colorHex,
    });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0, 0, 0.055);
    satGroup.add(led);

    return satGroup;
  };

  // Main 3D Scene Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020409);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 5.6);
    cameraRef.current = camera;

    // 3. Renderer with high performance and color management
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls: minDistance allows close zoom to inspect states, maxDistance allows full orbit
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.18; // Super close to Earth (radius=2.0) to see states in maximum detail!
    controls.maxDistance = 14;
    controls.enablePan = false;
    controlsRef.current = controls;

    // 5. Starfield & Deep Space Cosmos
    const starsCount = 2400;
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 140;
      starPositions[i + 1] = (Math.random() - 0.5) * 140;
      starPositions[i + 2] = (Math.random() - 0.5) * 140;

      // Realistic subtle starlight color variations (white, cyan, warm gold)
      const colorType = Math.random();
      if (colorType > 0.8) {
        starColors[i] = 0.6; starColors[i + 1] = 0.85; starColors[i + 2] = 1.0; // blue-white
      } else if (colorType > 0.6) {
        starColors[i] = 1.0; starColors[i + 1] = 0.9; starColors[i + 2] = 0.7; // warm gold
      } else {
        starColors[i] = 0.9; starColors[i + 1] = 0.95; starColors[i + 2] = 1.0; // crisp white
      }
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 6. Realistic Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffdf5, 2.9);
    sunLight.position.set(10, 6, 8);
    scene.add(sunLight);

    const blueAtmosphereRim = new THREE.DirectionalLight(0x0ea5e9, 1.3);
    blueAtmosphereRim.position.set(-8, -4, -6);
    scene.add(blueAtmosphereRim);

    // =========================================================================
    // CRITICAL: EARTH PARENT GROUP (globeGroup)
    // ALL planetary objects (Earth sphere, clouds, country borders, country labels,
    // state borders, state labels, and hotspot beacons) are added as CHILDREN of globeGroup!
    // As globeGroup rotates around Y, EVERY POINT AND STATE REMAINS LOCKED
    // 100% IN POSITION ON THE PLANET'S SURFACE WITH ZERO DRIFT!
    // =========================================================================
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const earthRadius = 2.0;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    // Load authentic NASA textures from local public directory
    const dayTexture = textureLoader.load('/textures/earth_atmos_2048.jpg');
    dayTexture.colorSpace = THREE.SRGBColorSpace;

    const normalTexture = textureLoader.load('/textures/earth_normal_2048.jpg');
    const specularTexture = textureLoader.load('/textures/earth_specular_2048.jpg');
    const nightTexture = textureLoader.load('/textures/earth_night.jpg');
    nightTexture.colorSpace = THREE.SRGBColorSpace;

    const cloudsTexture = textureLoader.load('/textures/earth_clouds_1024.png');
    cloudsTexture.colorSpace = THREE.SRGBColorSpace;

    // High quality Phong Material with real NASA specular ocean reflection and topography bump
    const earthMat = new THREE.MeshPhongMaterial({
      map: isNightMode ? nightTexture : dayTexture,
      bumpMap: normalTexture,
      bumpScale: 0.05,
      specularMap: specularTexture,
      specular: new THREE.Color(0x224466),
      shininess: 28,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earth);
    earthMeshRef.current = earth;

    // 8. Atmospheric Cloud Layer (Children of globeGroup, with slight atmospheric drift)
    const cloudsGeo = new THREE.SphereGeometry(earthRadius * 1.012, 64, 64);
    const cloudsMat = new THREE.MeshLambertMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    cloudsMesh.visible = showClouds;
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 9. Radiating Atmospheric Halo (Outer Space Glow with Fresnel Shader)
    const haloGeo = new THREE.SphereGeometry(earthRadius * 1.15, 64, 64);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.64 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.24, 0.68, 1.0, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    scene.add(halo); // Halo remains fixed to space facing camera

    // 10. Country Boundaries & Country Labels (Children of globeGroup)
    const countryBordersGroup = createCountryBorders(earthRadius);
    globeGroup.add(countryBordersGroup);
    countryBordersGroupRef.current = countryBordersGroup;

    const countryLabelsGroup = createCountryLabels(earthRadius);
    globeGroup.add(countryLabelsGroup);
    countryLabelsGroupRef.current = countryLabelsGroup;

    // 11. State Boundaries & State Labels (Children of globeGroup)
    const stateBordersGroup = createStateBorder3DLines(earthRadius);
    stateBordersGroup.visible = showBorders;
    globeGroup.add(stateBordersGroup);
    stateBordersGroupRef.current = stateBordersGroup;

    const stateLabelsGroup = createStateLabels(earthRadius);
    globeGroup.add(stateLabelsGroup);
    stateLabelsGroupRef.current = stateLabelsGroup;

    // 12. Hotspots & Pulsing Beacons (Children of globeGroup)
    const hotspotsGroup = new THREE.Group();
    globeGroup.add(hotspotsGroup);
    hotspotsGroupRef.current = hotspotsGroup;

    const hotspotList: { 
      hotspot: ClimateHotspot; 
      mesh: THREE.Mesh; 
      ring: THREE.Mesh; 
      hitBox: THREE.Mesh;
      pinNeedle: THREE.Mesh;
    }[] = [];

    hotspots.forEach(item => {
      const surfacePos = latLongToVector3(item.lat, item.lon, earthRadius * 1.002);
      const elevatedPos = latLongToVector3(item.lat, item.lon, earthRadius * 1.042);
      const normalVec = surfacePos.clone().normalize();

      // Core glowing beacon dot on the surface
      const dotGeo = new THREE.SphereGeometry(0.028, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: item.colorHex,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(elevatedPos);
      hotspotsGroup.add(dot);

      // High precision vertical 3D Pin needle anchored to Earth ground
      const needleLength = 0.042;
      const needleGeo = new THREE.CylinderGeometry(0.004, 0.008, needleLength, 8);
      const needleMat = new THREE.MeshBasicMaterial({
        color: item.colorHex,
        transparent: true,
        opacity: 0.85,
      });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      const midPos = surfacePos.clone().add(elevatedPos).multiplyScalar(0.5);
      needle.position.copy(midPos);
      needle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normalVec);
      hotspotsGroup.add(needle);

      // Pulsing ring radar shockwave on ground
      const ringGeo = new THREE.RingGeometry(0.035, 0.065, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: item.colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(surfacePos.clone().multiplyScalar(1.002));
      ring.lookAt(surfacePos.clone().add(normalVec));
      hotspotsGroup.add(ring);

      // Invisible hitBox for smooth mouse picking (attached to globeGroup)
      const hitBoxGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.copy(elevatedPos);
      (hitBox as any).userData = { hotspot: item };
      hotspotsGroup.add(hitBox);

      hotspotList.push({ hotspot: item, mesh: dot, ring, hitBox, pinNeedle: needle });
    });

    // 13. Add NASA Orbiting Satellites (Orbits belong to scene/space, not rotating with earth)
    const satMeshList: { 
      mission: SatelliteMission; 
      mesh: THREE.Group; 
      coneBeam: THREE.Mesh;
      orbitAngle: number;
      speed: number;
    }[] = [];

    satellites.forEach((sat, i) => {
      const orbitR = earthRadius + 0.38 + (i * 0.08);
      const inc = (sat.inclinationDeg * Math.PI) / 180;
      const nodeY = (i * Math.PI) / 3.5;

      // 3D Orbital Trajectory Line
      const orbitPoints: THREE.Vector3[] = [];
      const segments = 128;
      for (let s = 0; s <= segments; s++) {
        const u = (s / segments) * Math.PI * 2;
        const xRaw = orbitR * Math.cos(u);
        const zRaw = orbitR * Math.sin(u);
        const x = xRaw * Math.cos(nodeY) - zRaw * Math.cos(inc) * Math.sin(nodeY);
        const z = xRaw * Math.sin(nodeY) + zRaw * Math.cos(inc) * Math.cos(nodeY);
        const y = zRaw * Math.sin(inc);
        orbitPoints.push(new THREE.Vector3(x, y, z));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({
        color: sat.colorHex,
        transparent: true,
        opacity: 0.22,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      scene.add(orbitLine);

      // Detailed Satellite 3D Bus Model
      const satModel = createSatelliteModel(sat.colorHex);
      scene.add(satModel);

      // Radar scanning cone beam pointing down to Earth
      const coneHeight = orbitR - earthRadius;
      const coneGeo = new THREE.ConeGeometry(0.18, coneHeight, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: sat.colorHex,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(0, -coneHeight / 2, 0);
      cone.rotation.x = Math.PI;
      satModel.add(cone);

      satMeshList.push({
        mission: sat,
        mesh: satModel,
        coneBeam: cone,
        orbitAngle: (i * Math.PI) / 3,
        speed: 0.0028 - (i * 0.0002),
      });
    });

    // 14. Raycasting & Tooltip Event Handlers (Works seamlessly with rotating globeGroup)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hitBoxTargets = hotspotList.map(h => h.hitBox);
      const hits = raycaster.intersectObjects(hitBoxTargets, false);

      if (hits.length > 0) {
        const hit = hotspotList.find(h => h.hitBox === hits[0].object);
        if (hit) {
          setHoveredHotspot(hit.hotspot);
          setHoverPos({ x: event.clientX, y: event.clientY });
          container.style.cursor = 'pointer';
          return;
        }
      }

      setHoveredHotspot(null);
      container.style.cursor = 'grab';
    };

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check click on hotspots
      const hitBoxTargets = hotspotList.map(h => h.hitBox);
      const hotspotHits = raycaster.intersectObjects(hitBoxTargets, false);
      if (hotspotHits.length > 0) {
        const hit = hotspotList.find(h => h.hitBox === hotspotHits[0].object);
        if (hit) {
          setSelectedHotspot(hit.hotspot);
          setSelectedSatellite(null);
          playBeep(1040, 0.1);
          return;
        }
      }

      // Check click on satellites
      const satTargets = satMeshList.map(s => s.mesh);
      const satHits = raycaster.intersectObjects(satTargets, true);
      if (satHits.length > 0) {
        const hit = satMeshList.find(s => 
          s.mesh === satHits[0].object || 
          s.mesh.children.includes(satHits[0].object as any)
        );
        if (hit) {
          setSelectedSatellite(hit.mission);
          setSelectedHotspot(null);
          playBeep(780, 0.1);
          return;
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 15. Smooth Animation Loop with Zoom-Dependent LOD & Perfect Synchronization
    let animationFrameId: number;
    let clockTime = 0;
    let lastZoomUpdate = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clockTime += 0.02;

      // 1. Slow continuous rotation of the ENTIRE Earth Group
      // This rotates Earth, country borders, state borders, labels, and all hotspots together!
      if (isRotating && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.0008;
      }

      // 2. Clouds have a subtle differential weather drift relative to Earth
      if (cloudsMeshRef.current && isRotating) {
        cloudsMeshRef.current.rotation.y += 0.0003;
      }

      // 3. ZOOM-DEPENDENT LEVEL OF DETAIL (LOD)
      // "eu aproximo e começa a aparecer os paises depois os estados faça bem realista"
      const camDist = camera.position.length();

      // Country Labels Opacity:
      // Invisible at far orbit (> 4.8)
      // Fades in between 4.8 and 3.6
      // Fades down when very close (< 2.8) so state labels dominate
      let countryLabelOpacity = 0;
      if (camDist < 4.8 && camDist >= 3.6) {
        countryLabelOpacity = (4.8 - camDist) / (4.8 - 3.6);
      } else if (camDist < 3.6 && camDist >= 2.8) {
        countryLabelOpacity = 1.0;
      } else if (camDist < 2.8) {
        countryLabelOpacity = Math.max(0.15, (camDist - 2.2) / 0.6);
      }

      if (countryLabelsGroupRef.current) {
        countryLabelsGroupRef.current.visible = countryLabelOpacity > 0.02;
        countryLabelsGroupRef.current.children.forEach(child => {
          if ((child as THREE.Sprite).material) {
            ((child as THREE.Sprite).material as THREE.SpriteMaterial).opacity = countryLabelOpacity;
          }
        });
      }

      // State Borders Opacity:
      // Subtle start at 3.8, full opacity when zoomed into 3.0 or less
      let stateBorderOpacity = 0;
      if (camDist < 3.8) {
        stateBorderOpacity = Math.min(0.9, (3.8 - camDist) / 0.9);
      }
      if (stateBordersGroupRef.current) {
        stateBordersGroupRef.current.visible = showBorders && stateBorderOpacity > 0.02;
        stateBordersGroupRef.current.children.forEach(line => {
          if ((line as THREE.Line).material) {
            ((line as THREE.Line).material as THREE.LineBasicMaterial).opacity = stateBorderOpacity;
          }
        });
      }

      // State Labels Opacity:
      // Completely hidden when far away (> 3.4)
      // Rapidly appears and becomes crystal-clear when zoomed in (< 3.2)
      let stateLabelOpacity = 0;
      if (camDist < 3.4) {
        stateLabelOpacity = Math.min(1.0, (3.4 - camDist) / 0.85);
      }
      if (stateLabelsGroupRef.current) {
        stateLabelsGroupRef.current.visible = showBorders && stateLabelOpacity > 0.05;
        stateLabelsGroupRef.current.children.forEach(child => {
          if ((child as THREE.Sprite).material) {
            ((child as THREE.Sprite).material as THREE.SpriteMaterial).opacity = stateLabelOpacity;
          }
        });
      }

      // Update UI Zoom LOD Indicator badge periodically
      if (Date.now() - lastZoomUpdate > 250) {
        lastZoomUpdate = Date.now();
        if (camDist > 4.6) {
          setZoomLevelInfo({
            distance: parseFloat(camDist.toFixed(2)),
            levelName: isPt ? 'Nível 1 · Órbita Global' : 'Level 1 · Global Orbit',
            levelDescription: isPt ? 'Aproxime para ver nomes de países e limites' : 'Zoom in to reveal country borders',
            activeLevel: 1,
          });
        } else if (camDist >= 3.2) {
          setZoomLevelInfo({
            distance: parseFloat(camDist.toFixed(2)),
            levelName: isPt ? 'Nível 2 · Países & Biomas' : 'Level 2 · Countries & Biomes',
            levelDescription: isPt ? 'Aproxime mais para revelar os Estados e microrregiões' : 'Zoom in closer for States & Regions',
            activeLevel: 2,
          });
        } else {
          setZoomLevelInfo({
            distance: parseFloat(camDist.toFixed(2)),
            levelName: isPt ? 'Nível 3 · Estados & Talhões (Alta Precisão)' : 'Level 3 · States & Farm Fields (High Precision)',
            levelDescription: isPt ? 'Divisas estaduais e pinpoints ativos com máxima resolução' : 'State boundaries & pinpoints with maximum resolution',
            activeLevel: 3,
          });
        }
      }

      // Animate pulsing hotspot rings
      const scale = 1.0 + Math.sin(clockTime * 3.5) * 0.45;
      const opacity = Math.max(0.15, 0.85 - (scale - 1) * 0.9);
      hotspotList.forEach(item => {
        item.ring.scale.set(scale, scale, scale);
        (item.ring.material as THREE.MeshBasicMaterial).opacity = opacity;
      });

      // Animate satellites along their orbits in space
      satMeshList.forEach((sat, i) => {
        sat.orbitAngle += sat.speed;
        const orbitR = earthRadius + 0.38 + (i * 0.08);
        const inc = (sat.mission.inclinationDeg * Math.PI) / 180;
        const nodeY = (i * Math.PI) / 3.5;

        const xRaw = orbitR * Math.cos(sat.orbitAngle);
        const zRaw = orbitR * Math.sin(sat.orbitAngle);
        const x = xRaw * Math.cos(nodeY) - zRaw * Math.cos(inc) * Math.sin(nodeY);
        const z = xRaw * Math.sin(nodeY) + zRaw * Math.cos(inc) * Math.cos(nodeY);
        const y = zRaw * Math.sin(inc);

        sat.mesh.position.set(x, y, z);
        sat.mesh.lookAt(0, 0, 0);

        const subPoint = vector3ToLatLon(sat.mesh.position);
        sat.mission.currentLat = parseFloat(subPoint.lat.toFixed(2));
        sat.mission.currentLon = parseFloat(subPoint.lon.toFixed(2));

        const coneOpacity = 0.06 + Math.sin(clockTime * 4 + i) * 0.03;
        (sat.coneBeam.material as THREE.MeshBasicMaterial).opacity = coneOpacity;
        sat.mesh.visible = showSatellites;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 16. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
    };
  }, [isRotating, isNightMode, soundEnabled, showSatellites]);

  // Toggle Visibility of Layers
  useEffect(() => {
    if (stateBordersGroupRef.current) {
      stateBordersGroupRef.current.visible = showBorders;
    }
    if (stateLabelsGroupRef.current) {
      stateLabelsGroupRef.current.visible = showBorders;
    }
  }, [showBorders]);

  useEffect(() => {
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.visible = showClouds;
    }
  }, [showClouds]);

  // Telemetry ping interval simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryPacketsCount(prev => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Connect to Satellite downlink command
  const handleConnectSatellite = (satellite: SatelliteMission) => {
    setIsConnectedToSatellite(true);
    setConnectionStatus('Sincronizando Handshake de Micro-ondas...');
    playBeep(660, 0.15);

    setTimeout(() => {
      setConnectionStatus(`Sinal Travado em ${satellite.downlinkFrequency} · Downlink Ativo 150 Mbps`);
      playBeep(1200, 0.2);
    }, 900);
  };

  // Jump camera to specific coordinates with zoom-in capability
  const focusOnCoordinates = (lat: number, lon: number, zoomDistance: number = 3.1) => {
    if (!controlsRef.current || !cameraRef.current) return;
    
    // Position camera along the vector pointing to lat/lon, accounting for current globe rotation!
    const globeY = globeGroupRef.current ? globeGroupRef.current.rotation.y : 0;
    const basePos = latLongToVector3(lat, lon, zoomDistance);
    
    // Rotate position around Y by current globeGroup rotation so camera aims straight at target
    const cosG = Math.cos(globeY);
    const sinG = Math.sin(globeY);
    const targetX = basePos.x * cosG + basePos.z * sinG;
    const targetZ = -basePos.x * sinG + basePos.z * cosG;

    cameraRef.current.position.set(targetX, basePos.y, targetZ);
    controlsRef.current.update();
    playBeep(920, 0.06);
  };

  // Step Zoom helper
  const handleStepZoom = (delta: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const currentDist = cameraRef.current.position.length();
    const newDist = Math.max(2.2, Math.min(10, currentDist + delta));
    cameraRef.current.position.setLength(newDist);
    controlsRef.current.update();
    playBeep(840, 0.04);
  };

  // Load hotspot into simulation and switch back to farm dashboard
  const handleLoadHotspotRegion = (hotspot: ClimateHotspot) => {
    const target = REGIONS.find(r => r.id === hotspot.regionId);
    if (target) {
      onSelectRegion(target);
      playBeep(1080, 0.15);
      if (onBackToFarm) {
        onBackToFarm();
      }
    }
  };

  return (
    <div className={`relative w-full overflow-hidden bg-stone-950 flex flex-col ${
      isDedicatedPage 
        ? 'h-[calc(100vh-64px)] min-h-[600px] border-none' 
        : 'h-[640px] rounded-2xl border border-stone-800 shadow-2xl'
    }`}>
      
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
      />

      {/* 1. TOP UNIFIED COMMAND DECK (Floating Glass Strip) */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-col gap-2 pointer-events-none">
        
        {/* Row 1: Primary Navigation, Identity, Presets & Layer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-stone-800/90 bg-stone-950/85 px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl backdrop-blur-md pointer-events-auto">
          
          {/* Left: Back to Farm & 3D Globe Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isDedicatedPage && onBackToFarm && (
              <button
                onClick={onBackToFarm}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-700/80 bg-emerald-950/80 px-3 py-1.5 text-xs font-bold text-emerald-200 shadow-md transition-all hover:bg-emerald-900 hover:text-white hover:scale-105"
                title={isPt ? "Voltar ao painel de manejo agronômico" : "Return to farm management"}
              >
                <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{isPt ? 'Manejo da Fazenda' : 'Farm Management'}</span>
                <span className="sm:hidden">{isPt ? 'Manejo' : 'Farm'}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 border border-cyan-500/80 text-cyan-400 shadow-md shadow-cyan-950/70">
                <Globe2 className="h-4 w-4 animate-spin-slow" />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {isPt ? 'Planeta Terra 3D' : '3D Planet Earth'}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 border border-emerald-800/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    AO VIVO
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Zoom Level & LOD HUD Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono bg-stone-900/90 px-2.5 py-1 rounded-xl border border-cyan-800/60 text-cyan-300">
              <span className={`h-2 w-2 rounded-full ${
                zoomLevelInfo.activeLevel === 3 ? 'bg-emerald-400 animate-pulse' :
                zoomLevelInfo.activeLevel === 2 ? 'bg-cyan-400' : 'bg-blue-400'
              }`} />
              <strong className="text-white">{zoomLevelInfo.levelName.split('·')[0].trim()}</strong>
              <span className="text-stone-500">·</span>
              <span className="text-stone-300">{zoomLevelInfo.distance.toFixed(1)}x</span>
            </div>
          </div>

          {/* Center: Geographic Quick-Jump Presets */}
          <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-[11px] font-mono">
            <button 
              onClick={() => focusOnCoordinates(-15, -52, 2.75)}
              className="rounded-lg px-2.5 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900 font-bold transition-all shadow-sm flex items-center gap-1"
              title="Focar no Brasil com divisas e estados (Nível 3)"
            >
              <span>🇧🇷</span>
              <span className="hidden sm:inline">Brasil</span>
            </button>
            <button 
              onClick={() => focusOnCoordinates(38, -98, 3.2)}
              className="rounded-lg px-2 py-1 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              title="Focar na América do Norte / EUA"
            >
              <span>🇺🇸</span>
              <span className="hidden sm:inline">EUA</span>
            </button>
            <button 
              onClick={() => {
                if (cameraRef.current && controlsRef.current) {
                  cameraRef.current.position.setLength(5.8);
                  controlsRef.current.update();
                  playBeep(750, 0.05);
                }
              }}
              className="rounded-lg px-2 py-1 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              title="Visão Orbital Global"
            >
              <span>🌍</span>
              <span className="hidden sm:inline">Global</span>
            </button>
          </div>

          {/* Right: Layers, Display Modes, Zoom & Event Explorer Trigger */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            
            {/* Layer Controls Group */}
            <div className="flex items-center gap-0.5 bg-stone-900/90 p-0.5 rounded-xl border border-stone-800">
              
              {/* Rotation toggle */}
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isRotating ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
                title={isPt ? "Girar / Pausar rotação" : "Rotate / Pause"}
              >
                {isRotating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>

              {/* Day / Night toggle */}
              <button
                onClick={() => setIsNightMode(!isNightMode)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isNightMode ? 'bg-indigo-600 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
                title={isPt ? "Alternar Dia / Noite (Luzes de Cidades)" : "Toggle Day / Night lights"}
              >
                {isNightMode ? <Sun className="h-3.5 w-3.5 text-yellow-300" /> : <Moon className="h-3.5 w-3.5 text-cyan-300" />}
              </button>

              {/* Clouds toggle */}
              <button
                onClick={() => setShowClouds(!showClouds)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  showClouds ? 'bg-sky-900 text-sky-200' : 'text-stone-500 hover:text-white hover:bg-stone-800'
                }`}
                title={isPt ? "Exibir/ocultar nuvens" : "Toggle clouds"}
              >
                <Cloud className="h-3.5 w-3.5" />
              </button>

              {/* State Borders toggle */}
              <button
                onClick={() => setShowBorders(!showBorders)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  showBorders ? 'bg-emerald-900 text-emerald-200' : 'text-stone-500 hover:text-white hover:bg-stone-800'
                }`}
                title={isPt ? "Exibir/ocultar limites e estados" : "Toggle states & borders"}
              >
                <Layers className="h-3.5 w-3.5" />
              </button>

              {/* Satellites toggle */}
              <button
                onClick={() => setShowSatellites(!showSatellites)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  showSatellites ? 'bg-purple-900 text-purple-200' : 'text-stone-500 hover:text-white hover:bg-stone-800'
                }`}
                title={isPt ? "Exibir/ocultar satélites em órbita" : "Toggle satellites"}
              >
                <Satellite className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Step Zoom Buttons */}
            <div className="flex items-center gap-0.5 bg-stone-900/90 p-0.5 rounded-xl border border-stone-800">
              <button
                onClick={() => handleStepZoom(-0.6)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
                title={isPt ? "Aproximar (Zoom In)" : "Zoom In"}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleStepZoom(0.6)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
                title={isPt ? "Afastar (Zoom Out)" : "Zoom Out"}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  if (cameraRef.current && controlsRef.current) {
                    cameraRef.current.position.set(0, 1.8, 5.6);
                    controlsRef.current.reset();
                    playBeep(700, 0.05);
                  }
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
                title={isPt ? "Resetar câmera" : "Reset camera"}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Audio toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-xl border border-stone-800 bg-stone-900/90 transition-colors ${
                soundEnabled ? 'text-emerald-400 hover:bg-stone-800' : 'text-stone-500 hover:text-stone-300'
              }`}
              title={soundEnabled ? "Mutar áudio de telemetria" : "Ativar áudio de telemetria NASA"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>

            {/* Event Explorer Drawer Trigger */}
            <button
              onClick={() => setIsEventListOpen(!isEventListOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-md ${
                isEventListOpen
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400/50'
                  : 'bg-stone-900/90 border border-rose-800/80 text-rose-300 hover:bg-stone-850 hover:text-white'
              }`}
              title={isPt ? "Abrir lista de todos os eventos climáticos" : "Open active events list"}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden sm:inline">{isPt ? 'Acontecimentos' : 'Events'}</span>
              <span className="rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-200 text-[10px] font-mono px-1.5 py-0.2">
                {hotspots.length}
              </span>
            </button>

          </div>
        </div>

        {/* Row 2: Secondary Filters & Guidance Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-800/80 bg-stone-950/75 px-3 py-1.5 shadow-lg backdrop-blur-md pointer-events-auto">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className="text-stone-400 hidden sm:inline">{isPt ? 'Filtrar:' : 'Filter:'}</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-stone-400 hover:text-white hover:bg-stone-900'
              }`}
            >
              {isPt ? 'Todos' : 'All'} ({hotspots.length})
            </button>
            <button
              onClick={() => setFilterType('seca')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === 'seca' ? 'bg-rose-700 text-white font-bold' : 'text-stone-400 hover:text-rose-300 hover:bg-stone-900'
              }`}
            >
              Secas (4)
            </button>
            <button
              onClick={() => setFilterType('calor')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === 'calor' ? 'bg-orange-700 text-white font-bold' : 'text-stone-400 hover:text-orange-300 hover:bg-stone-900'
              }`}
            >
              Calor (1)
            </button>
            <button
              onClick={() => setFilterType('chuva')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === 'chuva' ? 'bg-sky-700 text-white font-bold' : 'text-stone-400 hover:text-sky-300 hover:bg-stone-900'
              }`}
            >
              Chuvas (1)
            </button>
            <button
              onClick={() => setFilterType('aquifero')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                filterType === 'aquifero' ? 'bg-purple-700 text-white font-bold' : 'text-stone-400 hover:text-purple-300 hover:bg-stone-900'
              }`}
            >
              Aquíferos (1)
            </button>
          </div>

          {/* Quick Tip */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-stone-400">
            <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
            <span>{isPt ? 'Aproxime com a roda do mouse para ver Estados e cidades · Passe o cursor nos pontos para ver hora e duração' : 'Scroll to zoom into states · Hover over points for time & duration'}</span>
          </div>
        </div>

      </div>

      {/* 2. HOVER TOOLTIP: Instantaneous Aerospace HUD Card */}
      {hoveredHotspot && hoverPos && !selectedHotspot && (
        <div 
          className="fixed z-50 pointer-events-none rounded-2xl border border-stone-700/90 bg-stone-950/95 p-3.5 shadow-2xl backdrop-blur-md text-stone-200 max-w-xs animate-in fade-in zoom-in-95"
          style={{
            left: `${Math.min(window.innerWidth - 330, hoverPos.x + 16)}px`,
            top: `${Math.min(window.innerHeight - 260, hoverPos.y + 16)}px`,
          }}
        >
          {/* Header with state & event badge */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1.5">
            <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase border ${hoveredHotspot.colorTailwind}`}>
              {hoveredHotspot.eventType}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {hoveredHotspot.state} · {hoveredHotspot.country}
            </span>
          </div>

          <h4 className="mt-2 text-xs font-bold text-white flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{hoveredHotspot.name}</span>
          </h4>

          {/* User specifically requested: "onde é", "a hora que aconteceu", "quanto tempo isso aí" */}
          <div className="mt-2 space-y-1.5 text-[10px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 uppercase">{isPt ? '📍 Onde é:' : '📍 Location:'}</span>
              <span className="font-semibold text-white truncate max-w-[170px] text-right">{hoveredHotspot.state}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-400 uppercase">{isPt ? '🕒 Hora do Evento:' : '🕒 Recorded:'}</span>
              <span className="text-emerald-400 font-bold">{hoveredHotspot.recordedTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-400 uppercase">{isPt ? '⏱️ Quanto tempo:' : '⏱️ Duration:'}</span>
              <span className="text-amber-400 font-bold">{hoveredHotspot.duration}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-400 uppercase">{isPt ? '🛰️ Sensor NASA:' : '🛰️ Sensor:'}</span>
              <span className="text-sky-300 font-medium truncate max-w-[160px] text-right">{hoveredHotspot.sensorDetected}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-stone-800 text-[9px] text-stone-400 flex items-center justify-between">
            <span>{isPt ? 'Clique para travar e ver manejo' : 'Click to lock & view plan'}</span>
            <span className="text-cyan-400 font-mono font-bold">GPS Travado</span>
          </div>
        </div>
      )}

      {/* 3. EVENT EXPLORER SLIDE-IN DRAWER (Right Side) */}
      {isEventListOpen && (
        <aside className="absolute top-28 right-3 sm:right-4 z-30 w-80 sm:w-96 max-h-[calc(100%-140px)] rounded-2xl border border-stone-700/90 bg-stone-950/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-right-5 duration-200">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-stone-800 p-3.5 bg-stone-900/70">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-950 text-rose-400 border border-rose-800/80">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-white tracking-wide">
                  {isPt ? 'Acontecimentos no Globo' : 'Planetary Event Explorer'}
                </h3>
                <p className="text-[10px] text-stone-400">
                  {isPt ? 'Observados por satélites NASA em tempo real' : 'Observed by NASA satellites in real-time'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEventListOpen(false)}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Hotspots List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredHotspots.map(hs => (
              <div 
                key={hs.id} 
                className="rounded-xl border border-stone-800/90 bg-stone-900/80 p-3 transition-all hover:border-stone-700 hover:bg-stone-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase border ${hs.colorTailwind}`}>
                      {hs.eventType}
                    </span>
                    <h4 className="mt-1 text-xs font-bold text-white flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-rose-400 shrink-0" />
                      <span>{hs.name} · {hs.state}</span>
                    </h4>
                  </div>
                  <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[9px] font-mono text-stone-300 shrink-0">
                    {hs.country}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-[10px] font-mono">
                  <div className="text-stone-300 flex justify-between">
                    <span className="text-stone-500 uppercase">{isPt ? 'Hora do Evento:' : 'Recorded At:'}</span>
                    <span className="text-emerald-400 font-bold truncate max-w-[170px] text-right">{hs.recordedTime}</span>
                  </div>
                  <div className="text-stone-300 flex justify-between">
                    <span className="text-stone-500 uppercase">{isPt ? 'Quanto tempo:' : 'Duration:'}</span>
                    <span className="text-amber-400 font-bold truncate max-w-[170px] text-right">{hs.duration}</span>
                  </div>
                  <div className="text-stone-300 flex justify-between">
                    <span className="text-stone-500 uppercase">{isPt ? 'Sensor:' : 'Sensor:'}</span>
                    <span className="text-sky-300 font-medium truncate max-w-[170px] text-right">{hs.sensorDetected}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2.5 pt-2 border-t border-stone-800/90 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedHotspot(hs);
                      focusOnCoordinates(hs.lat, hs.lon, 2.75);
                      playBeep(980, 0.08);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-stone-800 hover:bg-stone-700 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors"
                  >
                    <ZoomIn className="h-3 w-3 text-cyan-400" />
                    <span>{isPt ? 'Focar Câmera 3D' : 'Focus 3D View'}</span>
                  </button>

                  <button
                    onClick={() => handleLoadHotspotRegion(hs)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors shadow-sm"
                  >
                    <Leaf className="h-3 w-3 text-emerald-200" />
                    <span>{isPt ? 'Manejo' : 'Farm'}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="p-2.5 border-t border-stone-800 bg-stone-900/60 text-center text-[10px] text-stone-400 font-mono">
            {filteredHotspots.length} {isPt ? 'acontecimentos climáticos monitorados' : 'extreme events monitored'}
          </div>

        </aside>
      )}

      {/* 4. SELECTED HOTSPOT MODAL / DRAWER (Bottom Left) */}
      {selectedHotspot && (
        <div className="absolute bottom-4 left-3 sm:left-4 z-30 w-80 sm:w-96 rounded-2xl border border-stone-700/90 bg-stone-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border ${selectedHotspot.colorTailwind}`}>
                {selectedHotspot.eventType}
              </span>
              <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] font-mono text-stone-300">
                {selectedHotspot.severity}
              </span>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-stone-400 hover:text-white text-xs font-mono px-2 py-1"
            >
              ✕
            </button>
          </div>

          <h3 className="mt-2 text-sm font-black text-white flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{selectedHotspot.name} · {selectedHotspot.state}</span>
          </h3>

          {/* Detailed metrics box */}
          <div className="mt-3 rounded-xl bg-stone-900/90 p-3 border border-stone-800 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? '📍 Onde é:' : '📍 Location:'}</span>
              <span className="text-white font-bold">{selectedHotspot.state}, {selectedHotspot.country}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? '🌐 Coordenadas:' : '🌐 Coordinates:'}</span>
              <span className="text-cyan-300">{selectedHotspot.lat}° S, {selectedHotspot.lon}° W</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? '🕒 Hora do Evento:' : '🕒 Recorded At:'}</span>
              <span className="text-emerald-400 font-bold">{selectedHotspot.recordedTime}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? '⏱️ Quanto tempo:' : '⏱️ Duration:'}</span>
              <span className="text-amber-400 font-bold">{selectedHotspot.duration}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">{isPt ? '🛰️ Sensor NASA:' : '🛰️ Sensor:'}</span>
              <span className="text-sky-300 font-bold">{selectedHotspot.sensorDetected}</span>
            </div>
            <div className="pt-1.5 border-t border-stone-800 text-[11px]">
              <span className="text-stone-400 block mb-0.5">{isPt ? 'Telemetria do Solo:' : 'Soil Telemetry:'}</span>
              <span className="text-emerald-400 font-mono font-bold">{selectedHotspot.keyMetric}</span>
            </div>
          </div>

          <p className="mt-2 text-xs text-stone-300 leading-relaxed">
            {selectedHotspot.impactDescription}
          </p>

          <div className="mt-2 rounded-lg bg-emerald-950/40 p-2 border border-emerald-900/60 text-[11px] text-emerald-300">
            <strong>{isPt ? 'Recomendação de Manejo:' : 'Recommendation:'}</strong> {selectedHotspot.recommendedCrop}
          </div>

          {/* Action: Load this region in Farm Management */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => handleLoadHotspotRegion(selectedHotspot)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow-lg transition-all"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{isPt ? 'Carregar Fazenda & Manejo' : 'Load Farm in Dashboard'}</span>
            </button>
            <button
              onClick={() => focusOnCoordinates(selectedHotspot.lat, selectedHotspot.lon, 2.7)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300"
              title="Aproximar da coordenada"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. SELECTED SATELLITE MODAL / DRAWER (Bottom Right) */}
      {selectedSatellite && (
        <div className="absolute bottom-4 right-3 sm:right-4 z-30 w-80 sm:w-96 rounded-2xl border border-stone-700/90 bg-stone-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-950 text-cyan-400 border border-cyan-800">
                <Satellite className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-black text-white">{selectedSatellite.name}</h3>
            </div>
            <button
              onClick={() => {
                setSelectedSatellite(null);
                setIsConnectedToSatellite(false);
                setConnectionStatus('');
              }}
              className="text-stone-400 hover:text-white text-xs font-mono px-2 py-1"
            >
              ✕
            </button>
          </div>

          <p className="mt-1 text-xs text-stone-400 font-mono">
            {selectedSatellite.fullName}
          </p>

          <div className="mt-3 space-y-1.5 rounded-xl bg-stone-900/90 p-3 border border-stone-800 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-stone-400">{isPt ? 'Altitude Orbital:' : 'Orbit Altitude:'}</span>
              <span className="text-white font-bold">{selectedSatellite.altitudeKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">{isPt ? 'Velocidade Orbital:' : 'Orbital Speed:'}</span>
              <span className="text-emerald-400 font-bold">{selectedSatellite.speedKmh.toLocaleString()} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">{isPt ? 'Inclinação:' : 'Inclination:'}</span>
              <span className="text-sky-300">{selectedSatellite.inclinationDeg}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">{isPt ? 'Instrumento Principal:' : 'Primary Sensor:'}</span>
              <span className="text-yellow-300 font-sans text-[10px] text-right max-w-[190px]">{selectedSatellite.primaryInstrument}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-800">
              <span className="text-stone-400">{isPt ? 'Frequência Downlink:' : 'Downlink Freq:'}</span>
              <span className="text-cyan-400 font-bold">{selectedSatellite.downlinkFrequency}</span>
            </div>
            {selectedSatellite.currentLat !== undefined && (
              <div className="flex justify-between pt-1 border-t border-stone-800 text-stone-400">
                <span>{isPt ? 'Subponto Atual:' : 'Subpoint:'}</span>
                <span className="text-white">{selectedSatellite.currentLat}°, {selectedSatellite.currentLon}°</span>
              </div>
            )}
          </div>

          {/* Microwave Downlink Connection Action */}
          <div className="mt-3">
            {!isConnectedToSatellite ? (
              <button
                onClick={() => handleConnectSatellite(selectedSatellite)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-3 py-2 text-xs font-bold text-white shadow-lg transition-all"
              >
                <Radio className="h-3.5 w-3.5" />
                <span>{isPt ? 'Conectar Downlink de Telemetria' : 'Connect Downlink Stream'}</span>
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-950/80 p-2.5 border border-emerald-700/80 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isPt ? 'Conexão Downlink Estabelecida' : 'Downlink Locked'}</span>
                </div>
                <p className="text-[10px] font-mono text-emerald-200">
                  {connectionStatus}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. BOTTOM CENTER: Real-Time Event Ticker Ribbon */}
      {!selectedHotspot && !selectedSatellite && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-3 bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-stone-800 shadow-xl text-xs font-mono pointer-events-auto">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Calendar className="h-3.5 w-3.5" />
            <span>{isPt ? 'Eventos Recentes:' : 'Recent Hotspots:'}</span>
          </span>
          <div className="flex items-center gap-3 text-stone-300">
            {filteredHotspots.slice(0, 3).map(hs => (
              <button
                key={hs.id}
                onClick={() => {
                  setSelectedHotspot(hs);
                  focusOnCoordinates(hs.lat, hs.lon, 2.75);
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors group"
              >
                <span className={`h-2 w-2 rounded-full`} style={{ backgroundColor: `#${hs.colorHex.toString(16).padStart(6, '0')}` }} />
                <span className="group-hover:underline text-[11px] font-semibold text-white">{hs.name} ({hs.state})</span>
                <span className="text-[10px] text-stone-500">[{hs.recordedTime.split(' ')[0]}]</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
export default NasaGlobe3D;
