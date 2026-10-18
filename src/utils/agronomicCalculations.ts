import { Crop, NasaSatelliteData, RotationPhase, SoilProfile, FarmerPriorities, SimulationResult } from '../types';
import { CROPS_DATABASE } from '../data/crops';

export function calculateRotationSimulation(
  phases: RotationPhase[],
  nasaData: NasaSatelliteData,
  soil: SoilProfile,
  priorities: FarmerPriorities
): SimulationResult {
  const cropsInSequence: Crop[] = phases
    .map(p => CROPS_DATABASE.find(c => c.id === p.cropId))
    .filter((c): c is Crop => c !== undefined);

  if (cropsInSequence.length === 0) {
    return {
      resilienceScore: 0,
      waterConservationScore: 0,
      soilRegenerationScore: 0,
      nitrogenBalanceNetKg: 0,
      biomassTotalTons: 0,
      rootDepthCoverageScore: 0,
      nematodeRiskIndex: 'Alto',
      erosionProtectionIndex: 0,
      waterSavedM3PerHa: 0,
      fertilizerSavingsUSDPerHa: 0,
      nasaMoistureDeficitAlerts: ['Nenhuma cultura selecionada no plano.'],
      climateRiskLevel: 'Crítico',
      recommendations: ['Adicione culturas ao plano de rotação.']
    };
  }

  // 1. Crop Family Diversity & Monoculture Penalty
  let familyRepetitions = 0;
  for (let i = 1; i < cropsInSequence.length; i++) {
    if (cropsInSequence[i].family === cropsInSequence[i - 1].family) {
      familyRepetitions++;
    }
  }

  const uniqueFamilies = new Set(cropsInSequence.map(c => c.family)).size;
  const diversityFactor = Math.min(100, (uniqueFamilies / Math.min(cropsInSequence.length, 3)) * 80 + (familyRepetitions === 0 ? 20 : 0));

  // 2. Biomass & Carbon Buildup
  const totalBiomassTons = cropsInSequence.reduce((acc, c) => acc + c.biomassYieldTonHa, 0);
  const avgBiomassPerPhase = totalBiomassTons / cropsInSequence.length;
  // Good threshold is > 7 tons/ha/year of dry matter to regenerate organic carbon
  const soilRegenerationScore = Math.min(100, Math.round((avgBiomassPerPhase / 8) * 70 + (soil.organicMatter < 2 ? 15 : 25)));

  // 3. Nitrogen Balance & Fertilizer Savings
  const nitrogenBalanceNetKg = cropsInSequence.reduce((acc, c) => acc + c.nitrogenBalanceKgHa, 0);
  const nitrogenFixingLegumes = cropsInSequence.filter(c => c.nitrogenBalanceKgHa > 0).length;
  // Synthetic Urea N value approx $1.20 USD per kg
  const positiveN = Math.max(0, nitrogenBalanceNetKg);
  const fertilizerSavingsUSDPerHa = Math.round(positiveN * 1.35 + (nitrogenFixingLegumes > 0 ? 45 : 0));

  // 4. Root Depth Stratification & Compaction Relief
  const rootDepths = cropsInSequence.map(c => c.rootDepthCm);
  const maxRootDepth = Math.max(...rootDepths);
  const hasDeepTaproot = cropsInSequence.some(c => c.rootDepthCm >= 150 && c.rootType === 'Pivotante Profunda');
  const hasAggressiveFasciculate = cropsInSequence.some(c => c.rootType === 'Fasciculada Abundante' && c.rootDepthCm >= 150);
  const compactionBreakers = cropsInSequence.filter(c => c.compactionBreakerScore >= 4).length;

  let rootDepthCoverageScore = 40;
  if (hasDeepTaproot) rootDepthCoverageScore += 30;
  if (hasAggressiveFasciculate) rootDepthCoverageScore += 20;
  if (compactionBreakers > 0) rootDepthCoverageScore += 10;
  rootDepthCoverageScore = Math.min(100, rootDepthCoverageScore);

  // 5. Water Balance & NASA Alignment
  // Compare crop water demands against NASA SMAP and GPM
  const avgWaterDemand = cropsInSequence.reduce((acc, c) => acc + c.waterDemandMm, 0) / cropsInSequence.length;
  const smapMoisture = nasaData.smapRootZoneMoisture;
  const gpmRain = nasaData.gpmTotalRainMm;

  let waterSuitability = 70;
  const alerts: string[] = [];

  // Check moisture deficits for sensitive crops
  cropsInSequence.forEach((crop, idx) => {
    if (smapMoisture < crop.optimalSmapMoistureMin) {
      alerts.push(
        `Fase ${idx + 1} (${crop.name}): Demanda ${crop.optimalSmapMoistureMin}% de umidade radicular, mas NASA SMAP registra ${smapMoisture.toFixed(1)}%. Risco de estresse hídrico no desenvolvimento inicial.`
      );
      waterSuitability -= 12;
    }
    if (nasaData.powerMaxTemp > crop.maxHeatToleranceC) {
      alerts.push(
        `Fase ${idx + 1} (${crop.name}): Sensor NASA POWER registrou picos de ${nasaData.powerMaxTemp}°C (tolerância máxima da cultura: ${crop.maxHeatToleranceC}°C). Risco de abortamento floral.`
      );
      waterSuitability -= 8;
    }
  });

  if (nasaData.gpmRainfallAnomaly < -25 && avgWaterDemand > 500) {
    alerts.push(`Anomalia GPM de ${nasaData.gpmRainfallAnomaly}% é incompatível com rotações de alta demanda hídrica média (${avgWaterDemand.toFixed(0)} mm).`);
    waterSuitability -= 15;
  }

  // Cover crops and continuous mulch save water from direct evaporation
  const hasSoilCover = cropsInSequence.some(c => c.category === 'Cobertura / Gramínea' || c.id === 'milho_braquiaria');
  const waterSavedM3PerHa = hasSoilCover 
    ? Math.round((totalBiomassTons * 65) + 380) 
    : Math.round(totalBiomassTons * 25);

  const waterConservationScore = Math.max(15, Math.min(100, Math.round(
    waterSuitability * 0.5 + 
    (hasSoilCover ? 35 : 0) + 
    (cropsInSequence.filter(c => c.droughtToleranceScore >= 4).length * 8)
  )));

  // 6. Nematode & Pest Pressure
  const nematodeSuppressors = cropsInSequence.filter(c => c.nematodeEffect === 'Supressor / Não Hospedeiro' || c.nematodeEffect === 'Armadilha').length;
  const nematodeMultipliers = cropsInSequence.filter(c => c.nematodeEffect === 'Multiplicador').length;

  let nematodeRiskIndex: 'Baixo' | 'Moderado' | 'Alto' = 'Moderado';
  if (nematodeSuppressors >= 1 && nematodeMultipliers <= 1) {
    nematodeRiskIndex = 'Baixo';
  } else if (nematodeMultipliers >= 2 && nematodeSuppressors === 0) {
    nematodeRiskIndex = 'Alto';
  }

  // 7. Erosion Protection Index
  const hasContinuousCover = cropsInSequence.length >= 3 && hasSoilCover;
  let erosionProtectionIndex = Math.min(100, Math.round(
    (totalBiomassTons / 12) * 50 + 
    (hasContinuousCover ? 40 : 15) + 
    (soil.slope === 'Ondulado (>8%)' && !hasSoilCover ? -25 : 10)
  ));
  erosionProtectionIndex = Math.max(10, erosionProtectionIndex);

  // 8. Overall Weighted Resilience Score (0-100)
  const p = priorities;
  const totalWeight = p.waterConservation + p.soilHealth + p.nitrogenFixation + p.erosionControl + p.pestSuppression + p.economicYield;
  
  const weightedScore = (
    (waterConservationScore * (p.waterConservation / totalWeight)) +
    (soilRegenerationScore * (p.soilHealth / totalWeight)) +
    (Math.min(100, Math.max(20, (nitrogenBalanceNetKg + 100) * 0.45)) * (p.nitrogenFixation / totalWeight)) +
    (erosionProtectionIndex * (p.erosionControl / totalWeight)) +
    ((nematodeRiskIndex === 'Baixo' ? 95 : nematodeRiskIndex === 'Moderado' ? 65 : 30) * (p.pestSuppression / totalWeight)) +
    ((cropsInSequence.filter(c => c.economicTier === 'Alto').length * 28 + 20) * (p.economicYield / totalWeight))
  );

  const resilienceScore = Math.min(99, Math.max(18, Math.round(weightedScore)));

  // Climate Risk Level
  let climateRiskLevel: 'Baixo' | 'Moderado' | 'Elevado' | 'Crítico' = 'Moderado';
  if (resilienceScore >= 80) climateRiskLevel = 'Baixo';
  else if (resilienceScore >= 60) climateRiskLevel = 'Moderado';
  else if (resilienceScore >= 40) climateRiskLevel = 'Elevado';
  else climateRiskLevel = 'Crítico';

  // Recommendations
  const recommendations: string[] = [];
  if (!hasDeepTaproot && soil.compactionLevel !== 'Baixa (Sem impedimento)') {
    recommendations.push('Incorpore uma cultura com raiz pivotante profunda (ex: Nabo Forrageiro ou Guandu) para quebrar o pé-de-grade e facilitar infiltração.');
  }
  if (!hasSoilCover) {
    recommendations.push('Consórcio com Braquiária ou Milheto é altamente recomendado para cobrir o solo e diminuir a temperatura de superfície monitorada pelo NASA POWER.');
  }
  if (nitrogenBalanceNetKg < -50) {
    recommendations.push('O saldo de Nitrogênio está fortemente negativo. Inclua uma leguminosa fixadora como Crotalária spectabilis para economizar fertilizante.');
  }
  if (familyRepetitions > 0) {
    recommendations.push('Evite semear a mesma família botânica consecutivamente para quebrar o ciclo de fitopatógenos e pragas de solo.');
  }
  if (nasaData.smapDroughtStatus === 'Severo' || nasaData.smapDroughtStatus === 'Extremo') {
    recommendations.push('Sob anomalia de seca no SMAP, substitua culturas de alta exigência por Sorgo Granífero ou Feijão-Caupi.');
  }

  return {
    resilienceScore,
    waterConservationScore,
    soilRegenerationScore,
    nitrogenBalanceNetKg,
    biomassTotalTons: Number(totalBiomassTons.toFixed(1)),
    rootDepthCoverageScore,
    nematodeRiskIndex,
    erosionProtectionIndex,
    waterSavedM3PerHa,
    fertilizerSavingsUSDPerHa,
    nasaMoistureDeficitAlerts: alerts,
    climateRiskLevel,
    recommendations
  };
}
