// Netlify Serverless Function: Gemini Advisory & Deterministic Fallback
import { GoogleGenAI } from '@google/genai';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      language = 'pt',
      region,
      nasaMetrics,
      soilProfile,
      rotationSequence,
      farmerPriorities,
      customQuery,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build-netlify',
            },
          },
        });

        const systemPrompt = `You are the NASA Earth Observations Agricultural Decision Support Specialist.
Language: Respond strictly in ${language === 'pt' ? 'Portuguese (pt-BR)' : 'English'}.
Tone: Highly professional, scientific yet practical for farmers and agronomists.
Structure:
1. DIAGNÓSTICO CLIMÁTICO NASA (SMAP, GPM, ECOSTRESS, POWER)
2. AVALIAÇÃO DA ROTAÇÃO DE CULTURAS
3. BENEFÍCIOS PARA A SAÚDE DO SOLO
4. JANELA DE PLANTIO & MITIGAÇÃO DE RISCOS
5. 3 AÇÕES IMEDIATAS RECOMENDADAS`;

        const userPrompt = `
Região: ${region?.name} (${region?.country})
Dados NASA: SMAP Zona Radicular: ${nasaMetrics?.smapRootZoneMoisture}%, SMAP Superfície: ${nasaMetrics?.smapSurfaceMoisture}%, GPM Anomalia: ${nasaMetrics?.gpmRainfallAnomaly}%, ECOSTRESS ESI: ${nasaMetrics?.ecostressESI}, MODIS NDVI: ${nasaMetrics?.modisNdvi}, POWER Max Temp: ${nasaMetrics?.powerMaxTemp}°C
Solo: Textura ${soilProfile?.texture}, MO: ${soilProfile?.organicMatter}%, Compactação: ${soilProfile?.compactionLevel}
Rotação: ${rotationSequence?.map((s: any, idx: number) => `Fase ${idx + 1} (${s.season}): ${s.cropName} (${s.purpose})`).join('; ')}
${customQuery ? `Pergunta do Agricultor: "${customQuery}"` : ''}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          config: {
            temperature: 0.3,
            maxOutputTokens: 1800,
          },
        });

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: true,
            analysis: response.text || '',
            isFallback: false,
          }),
        };
      } catch (err: any) {
        console.warn('Gemini API call in Netlify failed:', err.message);
      }
    }

    // Deterministic fallback response
    const isPt = language === 'pt';
    const fallback = isPt
      ? `### 🛰️ DIAGNÓSTICO CLIMÁTICO NASA (Netlify Edge)
- **NASA SMAP (Umidade do Solo):** Registra ${nasaMetrics?.smapSurfaceMoisture ?? 18}% na camada superficial e ${nasaMetrics?.smapRootZoneMoisture ?? 25}% na zona radicular. É imperativo cobrir o solo para evitar a dessecação rápida.
- **NASA GPM (Precipitação):** Anomalia de precipitação acumulada monitorada pela constelação GPM.
- **NASA ECOSTRESS:** Índice ESI em ${nasaMetrics?.ecostressESI ?? 0.38}, indicando estresse térmico-evaporativo moderado a severo.
- **NASA POWER:** Radiação solar intensa e temperatura de pico em ${nasaMetrics?.powerMaxTemp ?? 34}°C.

### 🔄 AVALIAÇÃO DA ROTAÇÃO DE CULTURAS
A combinação entre gramíneas e leguminosas protege a microbiota do solo e mantém a capacidade de infiltração hídrica.

### 🌱 BENEFÍCIOS PARA A SAÚDE DO SOLO
1. **Conservação de Água:** Redução de perdas evaporativas em até 40%.
2. **Fixação Biológica de Nitrogênio:** Redução de custos com adubos químicos.
3. **Descompactação Radicular:** Raízes pivotantes quebram o adensamento mecânico.`
      : `### 🛰️ NASA CLIMATE DIAGNOSTIC (Netlify Edge)
- **NASA SMAP & GPM:** Soil moisture profile requires deep rooting cover crops and organic ground cover.`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        analysis: fallback,
        isFallback: true,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
