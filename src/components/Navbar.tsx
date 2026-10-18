import React from 'react';
import { 
  Globe2, 
  Satellite, 
  Sliders, 
  Sparkles, 
  Columns, 
  Printer, 
  ChevronDown, 
  Compass, 
  Layers,
  Leaf,
  CloudUpload
} from 'lucide-react';
import { Region, Language } from '../types';
import { REGIONS } from '../data/regions';

interface NavbarProps {
  currentRegion: Region;
  onSelectRegion: (region: Region) => void;
  onOpenFieldConfig: () => void;
  onOpenComparison: () => void;
  onOpenAdvisor: () => void;
  onOpenPrintReport: () => void;
  onOpenGlobalExplorer: () => void;
  onOpenNetlifyDeploy?: () => void;
  onOpenGlobeTab?: () => void;
  activeMainView?: 'farm' | 'globe';
  onChangeMainView?: (mode: 'farm' | 'globe') => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRegion,
  onSelectRegion,
  onOpenFieldConfig,
  onOpenComparison,
  onOpenAdvisor,
  onOpenPrintReport,
  onOpenGlobalExplorer,
  onOpenNetlifyDeploy,
  onOpenGlobeTab,
  activeMainView = 'farm',
  onChangeMainView,
  language,
  onToggleLanguage,
}) => {
  const isPt = language === 'pt';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand & NASA Hackathon Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 shadow-md shadow-emerald-950/40">
            <Satellite className="h-5 w-5 text-stone-950" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-stone-950">
              ★
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                TerraAdapt <span className="text-emerald-400">NASA</span>
              </span>
              <span className="hidden rounded bg-sky-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-800/60 md:inline-block">
                Space Apps Challenge
              </span>
            </div>
            <p className="hidden text-xs text-stone-400 sm:block">
              {isPt ? 'Apoio à Decisão para Rotação Resiliente de Culturas' : 'Resilient Crop Rotation Decision Support Tool'}
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher & Global Region Selector */}
        <div className="flex items-center gap-2">
          {onChangeMainView && (
            <div className="flex items-center rounded-xl bg-stone-900/90 p-1 border border-stone-800 shadow-inner">
              <button
                onClick={() => onChangeMainView('farm')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMainView === 'farm'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
                title={isPt ? "Ir para o painel de manejo agronômico da fazenda" : "Go to farm agronomic management"}
              >
                <Leaf className="h-3.5 w-3.5 text-emerald-300" />
                <span className="hidden sm:inline">{isPt ? 'Manejo da Fazenda' : 'Farm Management'}</span>
              </button>
              <button
                onClick={() => onChangeMainView('globe')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMainView === 'globe'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
                title={isPt ? "Abrir visualização 3D do Planeta Terra separada e imersiva" : "Open dedicated 3D Earth planetary view"}
              >
                <Globe2 className="h-3.5 w-3.5 text-cyan-300 animate-spin-slow" />
                <span>{isPt ? 'Planeta Terra 3D' : '3D Earth'}</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              </button>
            </div>
          )}

          {/* Region Explorer Trigger */}
          <button
            onClick={onOpenGlobalExplorer}
            className="group hidden lg:flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-stone-200 transition-all hover:border-emerald-600 hover:bg-stone-850 hover:shadow-md"
            title={isPt ? "Explorar polos agrícolas globais ou inserir GPS" : "Explore global regions or enter GPS"}
          >
            <Globe2 className="h-3.5 w-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <div className="text-left">
              <span className="block max-w-[130px] truncate font-bold text-white">
                {currentRegion.name}
              </span>
              <span className="block text-[9px] text-stone-400 truncate max-w-[130px]">
                {currentRegion.country} · {currentRegion.biome}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-stone-400 group-hover:text-white" />
          </button>
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Field & Soil Setup */}
          <button
            onClick={onOpenFieldConfig}
            className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/70 px-2.5 py-1.5 text-xs font-medium text-stone-200 transition-colors hover:border-stone-700 hover:bg-stone-800 hover:text-white"
            title={isPt ? "Configurar solo e prioridades" : "Configure soil and priorities"}
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">{isPt ? 'Talhão & Solo' : 'Field & Soil'}</span>
          </button>

          {/* Strategy Comparison */}
          <button
            onClick={onOpenComparison}
            className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/70 px-2.5 py-1.5 text-xs font-medium text-stone-200 transition-colors hover:border-stone-700 hover:bg-stone-800 hover:text-white"
            title={isPt ? "Comparar com manejo convencional" : "Compare with conventional practice"}
          >
            <Columns className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden lg:inline">{isPt ? 'Comparador' : 'Compare'}</span>
          </button>

          {/* AI Advisor Gemini */}
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-950/50 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-900/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            <span>{isPt ? 'Consultor IA NASA' : 'NASA AI Advisor'}</span>
          </button>

          {/* Netlify Deploy Trigger */}
          <button
            onClick={onOpenNetlifyDeploy}
            className="flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-teal-950/40 px-2.5 py-1.5 text-xs font-semibold text-teal-300 transition-all hover:bg-teal-900/60 hover:border-teal-400 hover:text-white hover:shadow-md hover:shadow-teal-950/50"
            title={isPt ? "Transformar e publicar este site no Netlify" : "Deploy this website to Netlify"}
          >
            <CloudUpload className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
            <span className="hidden sm:inline font-bold">Netlify</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onOpenPrintReport}
            className="flex items-center justify-center rounded-lg border border-stone-800 bg-stone-900/70 p-2 text-stone-300 transition-colors hover:border-stone-700 hover:bg-stone-800 hover:text-white"
            title={isPt ? "Gerar relatório e certificado imprimível" : "Generate printable adaptation plan"}
          >
            <Printer className="h-4 w-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => onToggleLanguage(isPt ? 'en' : 'pt')}
            className="rounded-lg border border-stone-800 bg-stone-900/80 px-2 py-1 text-xs font-mono font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
            title="Mudar idioma / Switch language"
          >
            {isPt ? 'EN' : 'PT'}
          </button>
        </div>

      </div>
    </header>
  );
};
