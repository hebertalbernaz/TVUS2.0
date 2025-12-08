/**
 * TVUSVET V2.0 - Laboratory Reference Values
 * Comprehensive reference intervals for Dogs and Cats
 * Sources: Veterinary Clinical Pathology (Stockham & Scott), IDEXX Reference Ranges
 */

// ============================================================================
// HEMOGRAM (Complete Blood Count) Reference Values
// ============================================================================
export const HEMOGRAM_REFERENCES = {
  dog: {
    // ERITROGRAMA (Red Blood Cell Parameters)
    eritrograma: [
      { parameter: 'Eritrócitos', unit: '10⁶/µL', ref_min: 5.5, ref_max: 8.5 },
      { parameter: 'Hemoglobina', unit: 'g/dL', ref_min: 12.0, ref_max: 18.0 },
      { parameter: 'Hematócrito', unit: '%', ref_min: 37, ref_max: 55 },
      { parameter: 'VCM', unit: 'fL', ref_min: 60, ref_max: 74 },
      { parameter: 'HCM', unit: 'pg', ref_min: 19.5, ref_max: 24.5 },
      { parameter: 'CHCM', unit: 'g/dL', ref_min: 32, ref_max: 36 },
      { parameter: 'RDW', unit: '%', ref_min: 12, ref_max: 15 },
      { parameter: 'Reticulócitos', unit: '%', ref_min: 0, ref_max: 1.5 },
    ],
    // LEUCOGRAMA (White Blood Cell Parameters)
    leucograma: [
      { parameter: 'Leucócitos Totais', unit: '/µL', ref_min: 6000, ref_max: 17000 },
      { parameter: 'Neutrófilos Segmentados', unit: '/µL', ref_min: 3000, ref_max: 11500 },
      { parameter: 'Neutrófilos Bastonetes', unit: '/µL', ref_min: 0, ref_max: 300 },
      { parameter: 'Linfócitos', unit: '/µL', ref_min: 1000, ref_max: 4800 },
      { parameter: 'Monócitos', unit: '/µL', ref_min: 150, ref_max: 1350 },
      { parameter: 'Eosinófilos', unit: '/µL', ref_min: 100, ref_max: 1250 },
      { parameter: 'Basófilos', unit: '/µL', ref_min: 0, ref_max: 100 },
    ],
    // PLAQUETOGRAMA (Platelet Parameters)
    plaquetograma: [
      { parameter: 'Plaquetas', unit: '10³/µL', ref_min: 175, ref_max: 500 },
      { parameter: 'VPM', unit: 'fL', ref_min: 6.1, ref_max: 10.1 },
    ],
    // PROTEÍNAS
    proteinas: [
      { parameter: 'Proteína Plasmática Total', unit: 'g/dL', ref_min: 6.0, ref_max: 8.0 },
      { parameter: 'Fibrinogênio', unit: 'mg/dL', ref_min: 100, ref_max: 400 },
    ]
  },
  cat: {
    eritrograma: [
      { parameter: 'Eritrócitos', unit: '10⁶/µL', ref_min: 5.0, ref_max: 10.0 },
      { parameter: 'Hemoglobina', unit: 'g/dL', ref_min: 8.0, ref_max: 15.0 },
      { parameter: 'Hematócrito', unit: '%', ref_min: 30, ref_max: 45 },
      { parameter: 'VCM', unit: 'fL', ref_min: 39, ref_max: 55 },
      { parameter: 'HCM', unit: 'pg', ref_min: 12.5, ref_max: 17.5 },
      { parameter: 'CHCM', unit: 'g/dL', ref_min: 30, ref_max: 36 },
      { parameter: 'RDW', unit: '%', ref_min: 14, ref_max: 18 },
      { parameter: 'Reticulócitos', unit: '%', ref_min: 0, ref_max: 0.4 },
    ],
    leucograma: [
      { parameter: 'Leucócitos Totais', unit: '/µL', ref_min: 5500, ref_max: 19500 },
      { parameter: 'Neutrófilos Segmentados', unit: '/µL', ref_min: 2500, ref_max: 12500 },
      { parameter: 'Neutrófilos Bastonetes', unit: '/µL', ref_min: 0, ref_max: 300 },
      { parameter: 'Linfócitos', unit: '/µL', ref_min: 1500, ref_max: 7000 },
      { parameter: 'Monócitos', unit: '/µL', ref_min: 0, ref_max: 850 },
      { parameter: 'Eosinófilos', unit: '/µL', ref_min: 0, ref_max: 1500 },
      { parameter: 'Basófilos', unit: '/µL', ref_min: 0, ref_max: 100 },
    ],
    plaquetograma: [
      { parameter: 'Plaquetas', unit: '10³/µL', ref_min: 175, ref_max: 500 },
      { parameter: 'VPM', unit: 'fL', ref_min: 12, ref_max: 18 },
    ],
    proteinas: [
      { parameter: 'Proteína Plasmática Total', unit: 'g/dL', ref_min: 6.0, ref_max: 8.0 },
      { parameter: 'Fibrinogênio', unit: 'mg/dL', ref_min: 50, ref_max: 300 },
    ]
  }
};

// ============================================================================
// BIOCHEMISTRY Reference Values
// ============================================================================
export const BIOCHEM_REFERENCES = {
  dog: {
    // PERFIL RENAL (Renal Profile)
    renal: [
      { parameter: 'Ureia', unit: 'mg/dL', ref_min: 21, ref_max: 60 },
      { parameter: 'Creatinina', unit: 'mg/dL', ref_min: 0.5, ref_max: 1.8 },
      { parameter: 'Fósforo', unit: 'mg/dL', ref_min: 2.6, ref_max: 6.2 },
      { parameter: 'SDMA', unit: 'µg/dL', ref_min: 0, ref_max: 14 },
      { parameter: 'Relação Proteína/Creatinina Urinária', unit: '', ref_min: 0, ref_max: 0.5 },
    ],
    // PERFIL HEPÁTICO (Hepatic Profile)
    hepatico: [
      { parameter: 'ALT (TGP)', unit: 'U/L', ref_min: 10, ref_max: 125 },
      { parameter: 'AST (TGO)', unit: 'U/L', ref_min: 10, ref_max: 50 },
      { parameter: 'Fosfatase Alcalina (FA)', unit: 'U/L', ref_min: 23, ref_max: 212 },
      { parameter: 'GGT', unit: 'U/L', ref_min: 0, ref_max: 11 },
      { parameter: 'Bilirrubina Total', unit: 'mg/dL', ref_min: 0.1, ref_max: 0.5 },
      { parameter: 'Bilirrubina Direta', unit: 'mg/dL', ref_min: 0, ref_max: 0.15 },
      { parameter: 'Albumina', unit: 'g/dL', ref_min: 2.6, ref_max: 3.3 },
      { parameter: 'Proteína Total', unit: 'g/dL', ref_min: 5.4, ref_max: 7.1 },
      { parameter: 'Globulinas', unit: 'g/dL', ref_min: 2.7, ref_max: 4.4 },
    ],
    // PERFIL GLICÊMICO (Glycemic Profile)
    glicemico: [
      { parameter: 'Glicose', unit: 'mg/dL', ref_min: 74, ref_max: 143 },
      { parameter: 'Frutosamina', unit: 'µmol/L', ref_min: 225, ref_max: 365 },
    ],
    // PERFIL LIPÍDICO (Lipid Profile)
    lipidico: [
      { parameter: 'Colesterol Total', unit: 'mg/dL', ref_min: 135, ref_max: 270 },
      { parameter: 'Triglicerídeos', unit: 'mg/dL', ref_min: 50, ref_max: 150 },
    ],
    // ELETRÓLITOS (Electrolytes)
    eletrólitos: [
      { parameter: 'Sódio (Na+)', unit: 'mEq/L', ref_min: 144, ref_max: 160 },
      { parameter: 'Potássio (K+)', unit: 'mEq/L', ref_min: 3.5, ref_max: 5.8 },
      { parameter: 'Cloreto (Cl-)', unit: 'mEq/L', ref_min: 109, ref_max: 122 },
      { parameter: 'Cálcio Total', unit: 'mg/dL', ref_min: 9.0, ref_max: 11.3 },
      { parameter: 'Cálcio Ionizado', unit: 'mmol/L', ref_min: 1.12, ref_max: 1.42 },
      { parameter: 'Magnésio', unit: 'mg/dL', ref_min: 1.8, ref_max: 2.4 },
    ],
    // ENZIMAS MUSCULARES (Muscle Enzymes)
    muscular: [
      { parameter: 'CK (Creatina Quinase)', unit: 'U/L', ref_min: 10, ref_max: 200 },
      { parameter: 'LDH', unit: 'U/L', ref_min: 45, ref_max: 233 },
    ],
    // PANCREÁTICO (Pancreatic)
    pancreatico: [
      { parameter: 'Lipase', unit: 'U/L', ref_min: 10, ref_max: 160 },
      { parameter: 'Amilase', unit: 'U/L', ref_min: 500, ref_max: 1500 },
      { parameter: 'cPL (Lipase Pancreática Canina)', unit: 'µg/L', ref_min: 0, ref_max: 200 },
    ]
  },
  cat: {
    renal: [
      { parameter: 'Ureia', unit: 'mg/dL', ref_min: 16, ref_max: 36 },
      { parameter: 'Creatinina', unit: 'mg/dL', ref_min: 0.8, ref_max: 1.8 },
      { parameter: 'Fósforo', unit: 'mg/dL', ref_min: 3.1, ref_max: 6.8 },
      { parameter: 'SDMA', unit: 'µg/dL', ref_min: 0, ref_max: 14 },
      { parameter: 'Relação Proteína/Creatinina Urinária', unit: '', ref_min: 0, ref_max: 0.4 },
    ],
    hepatico: [
      { parameter: 'ALT (TGP)', unit: 'U/L', ref_min: 12, ref_max: 130 },
      { parameter: 'AST (TGO)', unit: 'U/L', ref_min: 10, ref_max: 48 },
      { parameter: 'Fosfatase Alcalina (FA)', unit: 'U/L', ref_min: 14, ref_max: 111 },
      { parameter: 'GGT', unit: 'U/L', ref_min: 0, ref_max: 4 },
      { parameter: 'Bilirrubina Total', unit: 'mg/dL', ref_min: 0.1, ref_max: 0.4 },
      { parameter: 'Bilirrubina Direta', unit: 'mg/dL', ref_min: 0, ref_max: 0.1 },
      { parameter: 'Albumina', unit: 'g/dL', ref_min: 2.1, ref_max: 3.3 },
      { parameter: 'Proteína Total', unit: 'g/dL', ref_min: 5.7, ref_max: 7.8 },
      { parameter: 'Globulinas', unit: 'g/dL', ref_min: 2.6, ref_max: 5.1 },
    ],
    glicemico: [
      { parameter: 'Glicose', unit: 'mg/dL', ref_min: 74, ref_max: 159 },
      { parameter: 'Frutosamina', unit: 'µmol/L', ref_min: 190, ref_max: 340 },
    ],
    lipidico: [
      { parameter: 'Colesterol Total', unit: 'mg/dL', ref_min: 65, ref_max: 225 },
      { parameter: 'Triglicerídeos', unit: 'mg/dL', ref_min: 25, ref_max: 160 },
    ],
    eletrólitos: [
      { parameter: 'Sódio (Na+)', unit: 'mEq/L', ref_min: 150, ref_max: 165 },
      { parameter: 'Potássio (K+)', unit: 'mEq/L', ref_min: 3.5, ref_max: 5.8 },
      { parameter: 'Cloreto (Cl-)', unit: 'mEq/L', ref_min: 117, ref_max: 123 },
      { parameter: 'Cálcio Total', unit: 'mg/dL', ref_min: 8.8, ref_max: 11.9 },
      { parameter: 'Cálcio Ionizado', unit: 'mmol/L', ref_min: 1.12, ref_max: 1.42 },
      { parameter: 'Magnésio', unit: 'mg/dL', ref_min: 1.8, ref_max: 2.4 },
    ],
    muscular: [
      { parameter: 'CK (Creatina Quinase)', unit: 'U/L', ref_min: 10, ref_max: 200 },
      { parameter: 'LDH', unit: 'U/L', ref_min: 45, ref_max: 233 },
    ],
    pancreatico: [
      { parameter: 'Lipase', unit: 'U/L', ref_min: 10, ref_max: 120 },
      { parameter: 'Amilase', unit: 'U/L', ref_min: 500, ref_max: 1500 },
      { parameter: 'fPL (Lipase Pancreática Felina)', unit: 'µg/L', ref_min: 0, ref_max: 3.5 },
    ]
  }
};

// ============================================================================
// PANEL PRESETS - Quick Templates
// ============================================================================
export const PANEL_PRESETS = {
  hemogram: {
    id: 'hemogram',
    label: 'Hemograma Completo',
    description: 'Eritrograma + Leucograma + Plaquetas',
    icon: '🩸',
    categories: ['eritrograma', 'leucograma', 'plaquetograma', 'proteinas']
  },
  renal_profile: {
    id: 'renal_profile',
    label: 'Perfil Renal',
    description: 'Ureia, Creatinina, Fósforo, SDMA',
    icon: '🫘',
    categories: ['renal']
  },
  hepatic_profile: {
    id: 'hepatic_profile',
    label: 'Perfil Hepático',
    description: 'ALT, AST, FA, GGT, Bilirrubinas',
    icon: '🫀',
    categories: ['hepatico']
  },
  biochem_complete: {
    id: 'biochem_complete',
    label: 'Bioquímico Completo',
    description: 'Renal + Hepático + Glicêmico',
    icon: '🧪',
    categories: ['renal', 'hepatico', 'glicemico', 'lipidico']
  },
  electrolytes: {
    id: 'electrolytes',
    label: 'Eletrólitos',
    description: 'Na+, K+, Cl-, Ca++',
    icon: '⚡',
    categories: ['eletrólitos']
  },
  pancreatic: {
    id: 'pancreatic',
    label: 'Perfil Pancreático',
    description: 'Lipase, Amilase, cPL/fPL',
    icon: '🥞',
    categories: ['pancreatico']
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get reference values for a specific panel and species
 * @param {string} panelId - Panel ID from PANEL_PRESETS
 * @param {string} species - 'dog' or 'cat'
 * @returns {Array} Array of parameter objects with reference values
 */
export function getPanelReferences(panelId, species = 'dog') {
  const preset = PANEL_PRESETS[panelId];
  if (!preset) return [];
  
  const normalizedSpecies = species?.toLowerCase() === 'cat' ? 'cat' : 'dog';
  const results = [];
  
  preset.categories.forEach(category => {
    // Check hemogram references first
    const hemoRef = HEMOGRAM_REFERENCES[normalizedSpecies]?.[category];
    if (hemoRef) {
      hemoRef.forEach(ref => {
        results.push({
          parameter: ref.parameter,
          unit: ref.unit,
          ref_min: ref.ref_min,
          ref_max: ref.ref_max,
          value: '',
          flag: '',
          category: category
        });
      });
    }
    
    // Check biochem references
    const bioRef = BIOCHEM_REFERENCES[normalizedSpecies]?.[category];
    if (bioRef) {
      bioRef.forEach(ref => {
        results.push({
          parameter: ref.parameter,
          unit: ref.unit,
          ref_min: ref.ref_min,
          ref_max: ref.ref_max,
          value: '',
          flag: '',
          category: category
        });
      });
    }
  });
  
  return results;
}

/**
 * Calculate flag based on value and reference range
 * @param {string|number} value - The measured value
 * @param {number} refMin - Minimum reference value
 * @param {number} refMax - Maximum reference value
 * @returns {string} 'low', 'normal', 'high', 'critical_low', 'critical_high', or ''
 */
export function calculateFlag(value, refMin, refMax) {
  if (value === '' || value === null || value === undefined) return '';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '';
  
  // Calculate critical thresholds (20% beyond normal range)
  const criticalLowThreshold = refMin - (refMax - refMin) * 0.3;
  const criticalHighThreshold = refMax + (refMax - refMin) * 0.3;
  
  if (numValue < criticalLowThreshold) return 'critical_low';
  if (numValue < refMin) return 'low';
  if (numValue > criticalHighThreshold) return 'critical_high';
  if (numValue > refMax) return 'high';
  
  return 'normal';
}

/**
 * Get category display name in Portuguese
 */
export function getCategoryLabel(category) {
  const labels = {
    eritrograma: 'Eritrograma',
    leucograma: 'Leucograma',
    plaquetograma: 'Plaquetograma',
    proteinas: 'Proteínas Plasmáticas',
    renal: 'Perfil Renal',
    hepatico: 'Perfil Hepático',
    glicemico: 'Perfil Glicêmico',
    lipidico: 'Perfil Lipídico',
    eletrólitos: 'Eletrólitos',
    muscular: 'Enzimas Musculares',
    pancreatico: 'Perfil Pancreático'
  };
  return labels[category] || category;
}

/**
 * Get flag color classes for styling
 */
export function getFlagStyles(flag) {
  const styles = {
    low: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-400',
      icon: '↓'
    },
    critical_low: {
      bg: 'bg-blue-200 dark:bg-blue-800/50',
      text: 'text-blue-800 dark:text-blue-200 font-bold',
      border: 'border-blue-600',
      icon: '↓↓'
    },
    high: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-400',
      icon: '↑'
    },
    critical_high: {
      bg: 'bg-red-200 dark:bg-red-800/50',
      text: 'text-red-800 dark:text-red-200 font-bold',
      border: 'border-red-600',
      icon: '↑↑'
    },
    normal: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-300',
      icon: '✓'
    },
    '': {
      bg: '',
      text: 'text-muted-foreground',
      border: 'border-border',
      icon: ''
    }
  };
  return styles[flag] || styles[''];
}
