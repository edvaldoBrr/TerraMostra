// Agronomic and NASA Climate Decision Support Engine
// Used for deterministic analysis both on the server and client-side (Netlify static deployment)

export interface RotationStepData {
  season: string;
  cropName: string;
  family: string;
  rootDepth: string;
  purpose: string;
}

export function generateAgronomicFallback(
  lang: string,
  region: any,
  nasaMetrics: any,
  soilProfile: any,
  rotationSequence: RotationStepData[],
  priorities: any
): string {
  const isPt = lang === 'pt';
  const smapStatus =
    nasaMetrics.smapRootZoneMoisture < 25
      ? isPt
        ? 'DÉFICIT CRÍTICO'
        : 'CRITICAL DEFICIT'
      : isPt
      ? 'ADEQUADO'
      : 'ADEQUATE';
  const esiStatus =
    nasaMetrics.ecostressESI < 0.4
      ? isPt
        ? 'ALTO ESTRESSE EVAPORATIVO'
        : 'HIGH EVAPORATIVE STRESS'
      : isPt
      ? 'TRANSPIRAÇÃO ESTÁVEL'
      : 'STABLE TRANSPIRATION';

  if (isPt) {
    return `### 🛰️ DIAGNÓSTICO CLIMÁTICO NASA
- **NASA SMAP (Umidade do Solo):** O sensor SMAP registra ${nasaMetrics.smapSurfaceMoisture}% na camada superficial e ${nasaMetrics.smapRootZoneMoisture}% na zona radicular (0-100 cm). Classificação: **${smapStatus}**. A recarga subsuperficial requer culturas com sistema radicular pivotante agressivo.
- **NASA GPM (Precipitação):** Anomalia de precipitação de **${nasaMetrics.gpmRainfallAnomaly > 0 ? '+' : ''}${nasaMetrics.gpmRainfallAnomaly}%** nos últimos 90 dias com volume de ${nasaMetrics.gpmTotalRainMm} mm. Os ciclos de veranico exigem retenção hídrica por palhada.
- **NASA ECOSTRESS (Estresse Evaporativo):** O índice ESI em **${nasaMetrics.ecostressESI}** indica **${esiStatus}**, revelando alta taxa de evapotranspiração potencial antes mesmo da murcha foliar visível.
- **NASA POWER (Radiação e Temperatura):** Acúmulo térmico de **${nasaMetrics.powerGdd} GDD** com picos superficiais de **${nasaMetrics.powerMaxTemp}°C**, acelerando o ciclo fenológico e a perda hídrica por evaporação direta do solo nu.

### 🔄 AVALIAÇÃO DA ROTAÇÃO DE CULTURAS
A sequência proposta combina:
${rotationSequence.map((s, i) => `* **Fase ${i + 1} (${s.season}):** ${s.cropName} (${s.purpose}) - Raízes ${s.rootDepth}.`).join('\n')}

**Sinergia Agronômica:**
A alternância entre gramíneas (poáceas) e leguminosas (fabáceas) quebra o ciclo de pragas e nematoides do solo. A profundidade radicular combinada explora diferentes perfis hídricos identificados pelo SMAP, evitando o esgotamento na camada de 0-20 cm.

### 🌱 BENEFÍCIOS PARA A SAÚDE DO SOLO
1. **Conservação Hídrica:** Manutenção de cobertura viva ou palhada espessa (> 6 t/ha) reduz a temperatura do solo em até 8°C sob radiação NASA POWER intensa, economizando até 45 mm de água por ciclo.
2. **Fixação Biológica de Nitrogênio:** O uso de leguminosas nesta rotação pode injetar entre 60 a 140 kg N/ha via fixação biológica com bactérias *Bradyrhizobium* / *Rhizobium*, reduzindo a dependência de fertilizantes nitrogenados sintéticos.
3. **Descompactação Biológica:** Culturas com raiz pivotante profunda (ex: Nabo Forrageiro ou Crotalária) criam bioporos na camada compactada (${soilProfile.compactionLevel}), aumentando a infiltração das chuvas torrenciais captadas pelo sensor GPM.

### 📅 JANELA DE PLANTIO & MITIGAÇÃO DE RISCOS
- Monitorar a janela de umidade do SMAP para semeadura quando a umidade radicular ultrapassar 28%.
- Em anos com anomalia negativa no GPM, priorizar consórcios resistentes à seca (como milho com braquiária ou sorgo forrageiro) para garantir palhada protetora mesmo em caso de corte no rendimento de grãos.

### 💡 3 AÇÕES IMEDIATAS RECOMENDADAS
1. **Semeadura antecipada de cobertura:** Estabelecer a cobertura vegetal imediatamente após a colheita da safra principal para blindar o solo contra o estresse térmico monitorado pelo sensor ECOSTRESS.
2. **Inoculação e coinoculação:** Utilizar *Azospirillum brasilense* e *Rhizobium* para estimular raízes 25% mais profundas, alcançando a umidade profunda do SMAP.
3. **Ajuste de densidade populacional:** Em talhões com solo ${soilProfile.texture} e matéria orgânica em ${soilProfile.organicMatter}%, equilibrar o espaçamento foliar para otimizar o índice ECOSTRESS.`;
  } else {
    return `### 🛰️ NASA CLIMATE DIAGNOSTIC
- **NASA SMAP (Soil Moisture):** SMAP registers ${nasaMetrics.smapSurfaceMoisture}% topsoil and ${nasaMetrics.smapRootZoneMoisture}% root-zone moisture. Classification: **${smapStatus}**. Subsurface moisture profile demands deep taproot cover crops.
- **NASA GPM (Precipitation):** Precipitation anomaly is **${nasaMetrics.gpmRainfallAnomaly > 0 ? '+' : ''}${nasaMetrics.gpmRainfallAnomaly}%** over the last 90 days (${nasaMetrics.gpmTotalRainMm} mm total). Rainfall dry spells necessitate organic mulch moisture retention.
- **NASA ECOSTRESS (Evaporative Stress Index):** ESI at **${nasaMetrics.ecostressESI}** indicates **${esiStatus}**, detecting microclimatic canopy heat stress before visible crop wilting.
- **NASA POWER (Radiation & Thermal):** Thermal accumulation of **${nasaMetrics.powerGdd} GDD** with ground peak of **${nasaMetrics.powerMaxTemp}°C**, accelerating evaporative losses from exposed soil.

### 🔄 ROTATION ASSESSMENT & SOIL HEALTH IMPACT
The planned sequence creates optimal agronomic synergy. Root depth stratification protects shallow horizons while cover crops generate substantial biomass, shielding soil against extreme solar radiation and enhancing rainfall infiltration.`;
  }
}
