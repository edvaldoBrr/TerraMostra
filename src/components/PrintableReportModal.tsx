import React from 'react';
import { X, Printer, Download, CheckCircle2, Satellite, Award, Leaf } from 'lucide-react';
import { Region, NasaSatelliteData, SoilProfile, RotationPhase, SimulationResult, Language } from '../types';
import { CROPS_DATABASE } from '../data/crops';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region;
  nasaData: NasaSatelliteData;
  soil: SoilProfile;
  phases: RotationPhase[];
  simulation: SimulationResult;
  language: Language;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  region,
  nasaData,
  soil,
  phases,
  simulation,
  language,
}) => {
  if (!isOpen) return null;
  const isPt = language === 'pt';

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString(isPt ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 flex w-full max-w-4xl flex-col rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl">
        
        {/* Modal Controls (Not printed) */}
        <div className="no-print flex items-center justify-between border-b border-stone-800 p-4 bg-stone-950">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              {isPt ? 'Plano de Manejo e Certificado de Resiliência NASA' : 'NASA Resilient Farm Adaptation Plan & Certificate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isPt ? 'Imprimir / Salvar PDF' : 'Print / Export PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* The Printable Document Area */}
        <div className="p-8 bg-white text-stone-900 rounded-b-2xl font-sans">
          
          {/* Document Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-stone-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded bg-stone-900 text-white font-bold text-xs">
                  ★
                </span>
                <span className="text-xl font-extrabold uppercase tracking-tight text-stone-900">
                  TerraAdapt <span className="text-emerald-700">NASA</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-600 mt-1">
                NASA Space Apps Challenge · Mudança de Campo: Adaptando Fazendas com Dados da Terra
              </p>
            </div>

            <div className="text-right text-xs text-stone-600">
              <p className="font-bold text-stone-900">{isPt ? 'Data de Emissão:' : 'Issue Date:'} {currentDate}</p>
              <p>ID do Talhão: #NASA-{region.id.toUpperCase()}-2026</p>
            </div>
          </div>

          {/* Certificate Badge */}
          <div className="my-6 rounded-xl border-2 border-emerald-800/20 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {isPt ? 'Certificação de Resiliência Climática' : 'Climate Resilience Certification'}
                </span>
                <h3 className="text-lg font-extrabold text-stone-900">
                  {region.name} ({region.stateOrCountry})
                </h3>
                <p className="text-xs text-stone-600">
                  Coordenadas: {region.lat}°, {region.lon}° · Bioma: {region.biome}
                </p>
              </div>

              <div className="text-center bg-white px-4 py-2 rounded-lg border border-emerald-200 shadow-sm">
                <span className="block text-2xl font-black text-emerald-700">
                  {simulation.resilienceScore} / 100
                </span>
                <span className="text-[10px] font-bold uppercase text-stone-500">
                  {isPt ? 'Score Resiliência' : 'Resilience Index'}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Columns: NASA Baseline, Soil Diagnosis, Tangible Gains */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6 text-xs">
            
            {/* Col 1: NASA Satellites */}
            <div className="rounded-lg border border-stone-200 p-3 bg-stone-50">
              <h4 className="font-bold uppercase text-stone-800 border-b border-stone-200 pb-1 mb-2">
                1. Telemetria NASA
              </h4>
              <ul className="space-y-1 text-stone-700">
                <li>• <strong>SMAP Umidade:</strong> {nasaData.smapRootZoneMoisture}% (0-100cm)</li>
                <li>• <strong>GPM Anomalia:</strong> {nasaData.gpmRainfallAnomaly}% ({nasaData.gpmTotalRainMm}mm)</li>
                <li>• <strong>ECOSTRESS ESI:</strong> {nasaData.ecostressESI} (Estresse foliar)</li>
                <li>• <strong>MODIS NDVI:</strong> {nasaData.modisNdvi} (Vigor do dossel)</li>
                <li>• <strong>POWER Máx:</strong> {nasaData.powerMaxTemp}°C ({nasaData.powerGdd} GDD)</li>
              </ul>
            </div>

            {/* Col 2: Soil Profile */}
            <div className="rounded-lg border border-stone-200 p-3 bg-stone-50">
              <h4 className="font-bold uppercase text-stone-800 border-b border-stone-200 pb-1 mb-2">
                2. Perfil Pedológico
              </h4>
              <ul className="space-y-1 text-stone-700">
                <li>• <strong>Textura:</strong> {soil.texture}</li>
                <li>• <strong>Compactação:</strong> {soil.compactionLevel}</li>
                <li>• <strong>Matéria Orgânica:</strong> {soil.organicMatter}%</li>
                <li>• <strong>pH:</strong> {soil.ph}</li>
                <li>• <strong>Retenção CAD:</strong> {soil.waterHoldingCapacity}</li>
              </ul>
            </div>

            {/* Col 3: Dividends */}
            <div className="rounded-lg border border-stone-200 p-3 bg-stone-50">
              <h4 className="font-bold uppercase text-stone-800 border-b border-stone-200 pb-1 mb-2">
                3. Dividendos Calculados
              </h4>
              <ul className="space-y-1 text-stone-700">
                <li>• <strong>Água Conservada:</strong> +{simulation.waterSavedM3PerHa} m³/ha</li>
                <li>• <strong>Nitrogênio Fixado:</strong> +{simulation.nitrogenBalanceNetKg} kg N/ha</li>
                <li>• <strong>Economia Fertilizante:</strong> ${simulation.fertilizerSavingsUSDPerHa}/ha</li>
                <li>• <strong>Biomassa Acumulada:</strong> {simulation.biomassTotalTons} t/ha</li>
                <li>• <strong>Risco de Nematoides:</strong> {simulation.nematodeRiskIndex}</li>
              </ul>
            </div>

          </div>

          {/* Sowing and Rotation Schedule */}
          <div className="mb-6">
            <h4 className="font-bold uppercase text-stone-800 border-b border-stone-200 pb-1 mb-3 text-xs">
              {isPt ? 'Sequência Cronológica de Rotação de Culturas Aprovada' : 'Approved Multi-Season Crop Rotation Plan'}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-stone-200">
                <thead className="bg-stone-100 font-semibold text-stone-700">
                  <tr>
                    <th className="p-2 border-b">Fase</th>
                    <th className="p-2 border-b">Período</th>
                    <th className="p-2 border-b">Cultura / Espécie</th>
                    <th className="p-2 border-b">Família</th>
                    <th className="p-2 border-b">Raiz Efetiva</th>
                    <th className="p-2 border-b">Saldo N</th>
                    <th className="p-2 border-b">Finalidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  {phases.map((phase, idx) => {
                    const c = CROPS_DATABASE.find(crop => crop.id === phase.cropId);
                    if (!c) return null;
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="p-2 font-bold">{idx + 1}</td>
                        <td className="p-2 font-mono text-[11px]">{phase.seasonPeriod}</td>
                        <td className="p-2 font-bold text-stone-900">{c.name}</td>
                        <td className="p-2 text-stone-600">{c.family}</td>
                        <td className="p-2 font-mono">{c.rootDepthCm} cm</td>
                        <td className="p-2 font-semibold">
                          {c.nitrogenBalanceKgHa > 0 ? `+${c.nitrogenBalanceKgHa} kg` : `${c.nitrogenBalanceKgHa} kg`}
                        </td>
                        <td className="p-2">{c.category}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="mt-8 pt-4 border-t border-stone-300 grid grid-cols-2 gap-8 text-center text-xs text-stone-600">
            <div>
              <div className="border-b border-stone-400 mx-auto w-48 mb-2" />
              <p className="font-bold text-stone-800">{isPt ? 'Produtor Rural / Agrônomo Responsável' : 'Farmer / Agronomist Signature'}</p>
              <p className="text-[10px] text-stone-500">CREA / Registro Profissional</p>
            </div>
            <div>
              <div className="border-b border-stone-400 mx-auto w-48 mb-2" />
              <p className="font-bold text-stone-800">TerraAdapt NASA Earth Observations</p>
              <p className="text-[10px] text-stone-500">Protocolo de Validação Satelital</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
