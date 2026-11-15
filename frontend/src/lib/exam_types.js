/**
 * TVUSVET - Configuração de Estruturas de Exames
 */

// ============= ECHOCARDIOGRAM STRUCTURES =============
export const ECHOCARDIOGRAM_STRUCTURES = [
  { id: 'analise_2d', label: 'Análise 2D (Modo-B)', measurements: [] },
  {
    id: 'lv_m_mode',
    label: 'Ventrículo Esquerdo (Modo-M)',
    measurements: [
      { id: 'ivsd', label: 'SIVd', unit: 'cm' },
      { id: 'lvidd', label: 'DIVEd', unit: 'cm' },
      { id: 'pwd', label: 'PPVEd', unit: 'cm' },
      { id: 'ivss', label: 'SIVs', unit: 'cm' },
      { id: 'lvids', label: 'DIVEs', unit: 'cm' },
      { id: 'pws', label: 'PPVEs', unit: 'cm' },
      { id: 'fe', label: 'FE', unit: '%' },
      { id: 'fs', label: 'FS', unit: '%' }
    ]
  },
  {
    id: 'ao_la_ratio',
    label: 'Relação Aorta/AE',
    measurements: [
      { id: 'ao', label: 'Aorta', unit: 'cm' },
      { id: 'la', label: 'AE', unit: 'cm' },
      { id: 'la_ao_ratio', label: 'AE/Ao', unit: '' }
    ]
  },
  { id: 'echo_conclusion', label: 'Conclusão', measurements: [] },
  { id: 'diagnostic_impressions', label: 'Impressões Diagnósticas', measurements: [] } // NOVO
];

// ============= ECG STRUCTURES =============
export const ECG_STRUCTURES = [
  { id: 'rhythm', label: 'Ritmo e Frequência', measurements: [{ id: 'hr', label: 'FC', unit: 'bpm' }] },
  { id: 'waves', label: 'Ondas e Intervalos', measurements: [] },
  { id: 'ecg_conclusion', label: 'Conclusão', measurements: [] },
  { id: 'diagnostic_impressions', label: 'Impressões Diagnósticas', measurements: [] } // NOVO
];

// ============= RADIOGRAPHY STRUCTURES =============
export const RADIOGRAPHY_STRUCTURES = [
  { id: 'projections', label: 'Projeções Realizadas', measurements: [] },
  { id: 'thorax_lungs', label: 'Tórax - Campos Pulmonares', measurements: [] },
  { id: 'thorax_heart', label: 'Tórax - Silhueta Cardíaca', measurements: [] },
  { id: 'abdomen_serosa', label: 'Abdômen', measurements: [] },
  { id: 'musculoskeletal', label: 'Esquelético', measurements: [] },
  { id: 'radio_conclusion', label: 'Conclusão', measurements: [] },
  { id: 'diagnostic_impressions', label: 'Impressões Diagnósticas', measurements: [] } // NOVO
];

// ============= TOMOGRAPHY STRUCTURES =============
export const TOMOGRAPHY_STRUCTURES = [
  { id: 'study_info', label: 'Informações', measurements: [] },
  { id: 'findings', label: 'Achados', measurements: [] },
  { id: 'tomo_conclusion', label: 'Conclusão', measurements: [] },
  { id: 'diagnostic_impressions', label: 'Impressões Diagnósticas', measurements: [] } // NOVO
];

// ============= ABDOMINAL ULTRASOUND =============
export const ABDOMINAL_ORGANS = [
  'Fígado', 
  'Vesícula Biliar',
  'Baço', 
  'Rins',
  'Rim Esquerdo', 
  'Rim Direito',
  'Vesícula Urinária',
  'Estômago',
  'Duodeno', 
  'Jejuno', 
  'Íleo', 
  'Ceco', 
  'Cólon', 
  'Pâncreas',
  'Adrenais',
  'Adrenal Esquerda',
  'Adrenal Direita',
  'Linfonodos',
  'Cavidade Peritoneal'
];

export const REPRODUCTIVE_ORGANS_MALE = [
  'Próstata', 
  'Testículos',
  'Testículo Direito', 
  'Testículo Esquerdo'
];

export const REPRODUCTIVE_ORGANS_FEMALE = [
  'Útero',
  'Corpo Uterino', 
  'Ovários',
  'Ovário Direito', 
  'Ovário Esquerdo'
];

// Estruturas descritas em conjunto que também existem por lado no roteiro.
export const AGGREGATE_ORGANS = {
  'Rins': ['Rim Esquerdo', 'Rim Direito'],
  'Adrenais': ['Adrenal Esquerda', 'Adrenal Direita'],
  'Testículos': ['Testículo Direito', 'Testículo Esquerdo'],
  'Ovários': ['Ovário Direito', 'Ovário Esquerdo'],
  'Útero': ['Corpo Uterino']
};

// Itens finais do Ultrassom
export const ULTRASOUND_CONCLUSION = [
    'Impressões Diagnósticas' // NOVO
];

// ============= CONFIGURAÇÃO GERAL =============
export const EXAM_TYPES = {
  ultrasound_abd: {
    id: 'ultrasound_abd',
    name: 'Ultrassom Abdominal',
    icon: '🔊',
    useGenericMeasurements: true,
    getStructures: (patient) => {
      const structures = [...ABDOMINAL_ORGANS];
      if (patient?.sex === 'male') {
        structures.push(...REPRODUCTIVE_ORGANS_MALE);
      } else {
        structures.push(...REPRODUCTIVE_ORGANS_FEMALE);
      }
      // Adiciona Impressões Diagnósticas ao final
      structures.push(...ULTRASOUND_CONCLUSION);
      
      return structures.map(name => ({ label: name, measurements: [] }));
    }
  },
  echocardiogram: {
    id: 'echocardiogram',
    name: 'Ecocardiograma',
    icon: '❤️',
    useGenericMeasurements: false,
    getStructures: () => ECHOCARDIOGRAM_STRUCTURES
  },
  ecg: {
    id: 'ecg',
    name: 'Eletrocardiograma',
    icon: '📈',
    useGenericMeasurements: false,
    getStructures: () => ECG_STRUCTURES
  },
  radiography: {
    id: 'radiography',
    name: 'Radiografia',
    icon: '📷',
    useGenericMeasurements: true,
    getStructures: () => RADIOGRAPHY_STRUCTURES
  },
  tomography: {
    id: 'tomography',
    name: 'Tomografia',
    icon: '🔬',
    useGenericMeasurements: true,
    getStructures: () => TOMOGRAPHY_STRUCTURES
  }
};

export function getStructuresForExam(examType, patient = null) {
  const config = EXAM_TYPES[examType] || EXAM_TYPES.ultrasound_abd;
  return config.getStructures(patient);
}

export function getExamTypeName(examType) {
  return EXAM_TYPES[examType]?.name || 'Exame';
}

export function getAllExamTypes() {
  return Object.values(EXAM_TYPES);
}