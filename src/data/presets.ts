import { RotationPhase } from '../types';

export interface PresetStrategy {
  id: string;
  name: string;
  tagline: string;
  description: string;
  focus: 'Convencional' | 'Resiliente NASA' | 'Regenerativo' | 'Anti-Seca Extrema';
  phases: RotationPhase[];
}

export const PRESET_STRATEGIES: PresetStrategy[] = [
  {
    id: 'conventional',
    name: 'Manejo Convencional (Monocultivo / Solo Nu)',
    tagline: 'Soja seguida de milho safrinha e solo exposto no inverno',
    description: 'Sistema padrão adotado por muitos produtores. Alta dependência de fertilizantes químicos, vulnerabilidade extrema a veranicos do NASA GPM e rápida perda de umidade do solo.',
    focus: 'Convencional',
    phases: [
      {
        id: 'p1',
        slot: 'safra_1',
        label: 'Safra Principal (Verão Ano 1)',
        seasonPeriod: 'Out - Fev',
        cropId: 'soja',
        customNotes: 'Safra principal de grãos.'
      },
      {
        id: 'p2',
        slot: 'safrinha_1',
        label: 'Safrinha Comercial (Outono Ano 1)',
        seasonPeriod: 'Fev - Jun',
        cropId: 'milho',
        customNotes: 'Milho em monocultivo sem forrageira.'
      },
      {
        id: 'p3',
        slot: 'cobertura_1',
        label: 'Pousio / Solo Exposto (Inverno Ano 1)',
        seasonPeriod: 'Jul - Set',
        cropId: 'soja', // Will be flagged as repeated or left bare
        customNotes: 'Sem cobertura vegetal. Solo exposto a radiação solar intensa.'
      },
      {
        id: 'p4',
        slot: 'safra_2',
        label: 'Safra Principal (Verão Ano 2)',
        seasonPeriod: 'Out - Fev',
        cropId: 'soja',
        customNotes: 'Repetição de soja sobre restos culturais degradados.'
      }
    ]
  },
  {
    id: 'nasa_adapted_tropical',
    name: 'Adaptação Resiliente NASA (Consórcio & Blindagem Hídrica)',
    tagline: 'Soja inoculada + Milho consorciado com Braquiária + Crotalária',
    description: 'Projetada para responder aos alertas do NASA SMAP e ECOSTRESS. O consórcio com Braquiária cria bioporos profundos e palhada protetora que reduz a evapotranspiração em até 40%.',
    focus: 'Resiliente NASA',
    phases: [
      {
        id: 'p1',
        slot: 'safra_1',
        label: 'Safra Principal (Verão Ano 1)',
        seasonPeriod: 'Out - Fev',
        cropId: 'soja',
        customNotes: 'Semeadura com inoculação e palhada precedente.'
      },
      {
        id: 'p2',
        slot: 'safrinha_1',
        label: 'Safrinha Consorciada (Outono Ano 1)',
        seasonPeriod: 'Fev - Jun',
        cropId: 'milho_braquiaria',
        customNotes: 'Consórcio Embrapa/NASA: milho granífero + capim ruziziensis.'
      },
      {
        id: 'p3',
        slot: 'cobertura_1',
        label: 'Entressafra Protetora (Inverno Ano 1)',
        seasonPeriod: 'Jul - Set',
        cropId: 'braquiaria_solteira',
        customNotes: 'Pasto de palha perene: retenção de água e descompactação radicular.'
      },
      {
        id: 'p4',
        slot: 'safra_2',
        label: 'Safra Principal (Verão Ano 2)',
        seasonPeriod: 'Out - Fev',
        cropId: 'soja',
        customNotes: 'Plantio direto na palha da braquiária com temperatura de solo 8°C menor.'
      },
      {
        id: 'p5',
        slot: 'safrinha_2',
        label: 'Safrinha Adubação Verde (Outono Ano 2)',
        seasonPeriod: 'Fev - Mai',
        cropId: 'crotalaria_spectabilis',
        customNotes: 'Fixação de >100kg N/ha e controle biológico de nematoides.'
      }
    ]
  },
  {
    id: 'deep_regeneration',
    name: 'Descompactação Biológica & Ciclagem Profunda',
    tagline: 'Nabo Forrageiro + Guandu Anão + Sorgo + Braquiária',
    description: 'Focada em campos com severa compactação (pé-de-grade) e baixa matéria orgânica. As raízes tuberosas do nabo e lenhosas do guandu perfuram até 2 metros de profundidade.',
    focus: 'Regenerativo',
    phases: [
      {
        id: 'p1',
        slot: 'safra_1',
        label: 'Safra Principal (Verão Ano 1)',
        seasonPeriod: 'Out - Fev',
        cropId: 'girassol',
        customNotes: 'Raiz pivotante profunda e reciclagem de micronutrientes.'
      },
      {
        id: 'p2',
        slot: 'safrinha_1',
        label: 'Safrinha Mecânica Biológica (Outono Ano 1)',
        seasonPeriod: 'Fev - Mai',
        cropId: 'nabo_forrageiro',
        customNotes: 'Furadeira biológica: descompacta a camada de 20cm sem arado.'
      },
      {
        id: 'p3',
        slot: 'cobertura_1',
        label: 'Entressafra Resiliente (Inverno Ano 1)',
        seasonPeriod: 'Jun - Set',
        cropId: 'milheto',
        customNotes: 'Biomassa rica em silício e cobertura rápida contra vento e seca.'
      },
      {
        id: 'p4',
        slot: 'safra_2',
        label: 'Safra Principal Recuperada (Verão Ano 2)',
        seasonPeriod: 'Out - Fev',
        cropId: 'soja',
        customNotes: 'Solo totalmente descompactado com taxa de infiltração hídrica triplicada.'
      }
    ]
  },
  {
    id: 'semiarid_extreme',
    name: 'Escudo Hídrico Semiárido & Clima Extremo',
    tagline: 'Sorgo Granífero + Feijão-Caupi + Gergelim + Guandu',
    description: 'Projetada para áreas com déficit hídrico extremo (anomalia GPM < -35% e ESI < 0.3). Utiliza espécies de metabolismo C4 e leguminosas rústicas de alta tolerância a radiação.',
    focus: 'Anti-Seca Extrema',
    phases: [
      {
        id: 'p1',
        slot: 'safra_1',
        label: 'Safra das Águas (Chuvosa Curta)',
        seasonPeriod: 'Nov - Fev',
        cropId: 'sorgo_granifero',
        customNotes: 'Eficiência hídrica 40% superior ao milho, resiste a picos de 40°C.'
      },
      {
        id: 'p2',
        slot: 'safrinha_1',
        label: 'Pós-Chuva Resiliente',
        seasonPeriod: 'Fev - Mai',
        cropId: 'feijao_caupi',
        customNotes: 'Fixação de N e colheita precoce em apenas 70 dias.'
      },
      {
        id: 'p3',
        slot: 'cobertura_1',
        label: 'Estiagem Profunda',
        seasonPeriod: 'Jun - Out',
        cropId: 'gergelim',
        customNotes: 'Raiz aprumada buscando água residual profunda mapeada pelo SMAP.'
      }
    ]
  }
];
