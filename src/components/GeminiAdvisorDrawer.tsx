import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Satellite,
  Compass
} from 'lucide-react';
import { Region, NasaSatelliteData, SoilProfile, RotationPhase, FarmerPriorities, Language } from '../types';
import { CROPS_DATABASE } from '../data/crops';
import { generateAgronomicFallback } from '../utils/agronomicEngine';

interface GeminiAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region;
  nasaData: NasaSatelliteData;
  soil: SoilProfile;
  phases: RotationPhase[];
  priorities: FarmerPriorities;
  language: Language;
}

export const GeminiAdvisorDrawer: React.FC<GeminiAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  region,
  nasaData,
  soil,
  phases,
  priorities,
  language,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const isPt = language === 'pt';

  const quickQuestions = [
    isPt 
      ? 'Como a palhada da braquiária atenua a alta radiação solar do NASA POWER?'
      : 'How does brachiaria mulch shield soil against NASA POWER solar radiation?',
    isPt 
      ? 'Qual o momento ideal de semeadura com base na umidade radicular do SMAP?'
      : 'What is the optimal sowing window based on NASA SMAP root-zone moisture?',
    isPt 
      ? 'Como o Nabo Forrageiro descompacta o solo sem necessidade de subsolador mecânico?'
      : 'How does Daikon Radish bio-drill plow pans without heavy mechanical tilling?',
    isPt 
      ? 'Como lidar com anomalias negativas severas de chuva do sensor GPM?'
      : 'How to manage severe negative precipitation anomalies from NASA GPM?'
  ];

  const fetchAdvisory = async (queryText?: string) => {
    setLoading(true);
    setErrorNotice(null);

    try {
      const rotationSequence = phases.map(p => {
        const c = CROPS_DATABASE.find(crop => crop.id === p.cropId);
        return {
          season: p.label,
          cropName: c ? c.name : p.cropId,
          family: c ? c.family : 'Desconhecida',
          rootDepth: c ? `${c.rootDepthCm} cm (${c.rootType})` : 'N/A',
          purpose: c ? c.category : 'N/A',
        };
      });

      try {
        const response = await fetch('/api/gemini/advisory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            region,
            nasaMetrics: nasaData,
            soilProfile: soil,
            rotationSequence,
            farmerPriorities: priorities,
            customQuery: queryText || (customQuery.trim() ? customQuery : undefined),
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.analysis) {
            setAnalysisText(data.analysis);
            if (data.errorNotice) {
              setErrorNotice(data.errorNotice);
            }
            return;
          }
        }
        throw new Error('API offline, activating client agronomic engine');
      } catch {
        // Fallback for Netlify static deployments: client-side agronomic engine
        const fallbackText = generateAgronomicFallback(
          language,
          region,
          nasaData,
          soil,
          rotationSequence,
          priorities
        );
        setAnalysisText(fallbackText);
      }
    } catch (err: any) {
      console.error(err);
      setErrorNotice(err.message || 'Erro de comunicação');
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchAdvisory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-stone-800 bg-stone-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md text-stone-950 font-bold">
              <Sparkles className="h-5 w-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white sm:text-lg">
                  {isPt ? 'Consultor Agronômico IA NASA' : 'NASA Agronomic AI Co-Pilot'}
                </h3>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {isPt 
                  ? 'Análise cruzada de dados orbitais com o perfil do talhão' 
                  : 'Cross-analysis of satellite telemetry with field conditions'}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Farm Quick Badge */}
          <div className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-950/60 p-3 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-white">{region.name}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-400">
              <span>SMAP: <strong className="text-emerald-400">{nasaData.smapRootZoneMoisture}%</strong></span>
              <span>·</span>
              <span>GPM: <strong className={nasaData.gpmRainfallAnomaly >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{nasaData.gpmRainfallAnomaly}%</strong></span>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div>
            <span className="text-xs font-semibold text-stone-400">
              {isPt ? 'Perguntas Frequentes do Agricultor:' : 'Suggested Questions:'}
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCustomQuery(q);
                    fetchAdvisory(q);
                  }}
                  disabled={loading}
                  className="rounded-lg border border-stone-800 bg-stone-950/80 px-2.5 py-1 text-left text-xs text-stone-300 transition-colors hover:border-emerald-600 hover:text-white disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-stone-800 bg-stone-950/80 p-8 text-center">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <Satellite className="h-8 w-8 text-emerald-400 animate-spin" />
              </div>
              <h4 className="mt-4 text-sm font-bold text-white">
                {isPt ? 'Processando Telemetria NASA & Rotação...' : 'Analyzing NASA Telemetry & Rotation...'}
              </h4>
              <p className="mt-1 max-w-xs text-xs text-stone-400">
                {isPt 
                  ? 'Correlacionando umidade de solo SMAP, anomalia GPM e estresse evaporativo ECOSTRESS...' 
                  : 'Synthesizing SMAP soil moisture, GPM rainfall anomalies, and ECOSTRESS indices...'}
              </p>
            </div>
          )}

          {/* Analysis Output */}
          {!loading && analysisText && (
            <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-5 text-stone-200">
              
              {errorNotice && (
                <div className="mb-4 rounded-lg bg-amber-950/50 border border-amber-800/60 p-2 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorNotice}</span>
                </div>
              )}

              <div className="prose prose-invert prose-stone max-w-none text-xs sm:text-sm leading-relaxed space-y-3">
                {analysisText.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('###') || paragraph.startsWith('##')) {
                    const title = paragraph.replace(/#/g, '').trim();
                    return (
                      <h4 key={index} className="text-sm font-bold text-emerald-400 pt-2 border-b border-stone-800 pb-1">
                        {title}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
                    const items = paragraph.split('\n');
                    return (
                      <ul key={index} className="space-y-1 pl-4 list-disc marker:text-emerald-500">
                        {items.map((it, idx) => (
                          <li key={idx} className="text-stone-300">
                            {it.replace(/^[-*]\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={index} className="text-stone-300">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Custom Question Input Box */}
        <div className="border-t border-stone-800 p-4 bg-stone-950">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (customQuery.trim() && !loading) {
                fetchAdvisory();
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={isPt ? "Pergunte algo ao consultor da NASA..." : "Ask the NASA advisor a question..."}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="flex-1 rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !customQuery.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => fetchAdvisory()}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-800 bg-stone-900 text-stone-400 hover:text-white"
              title={isPt ? "Regenerar parecer" : "Regenerate advisory"}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
