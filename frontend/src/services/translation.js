/**
 * TVUSVET Translation Service - Offline PT ↔ EN
 * Provides translation for veterinary diagnostic reports
 */

// Portuguese to English translations
const PT_TO_EN = {
  // Patient & Exam Info
  'Paciente': 'Patient',
  'Raça': 'Breed',
  'Peso cadastrado': 'Registered weight',
  'Peso no exame': 'Exam weight',
  'Data do exame': 'Exam date',
  'Tipo de Exame': 'Exam Type',
  'Laudo': 'Report',
  'Imagens': 'Images',
  'Conclusão': 'Conclusion',
  'Cão': 'Dog',
  'Gato': 'Cat',
  
  // Exam Types
  'Ultrassom Abdominal': 'Abdominal Ultrasound',
  'Ecocardiograma': 'Echocardiogram',
  'Eletrocardiograma': 'Electrocardiogram',
  'Radiografia': 'Radiography',
  'Tomografia': 'Tomography',
  
  // Abdominal Organs
  'Estômago': 'Stomach',
  'Fígado': 'Liver',
  'Adrenais': 'Adrenal Glands',
  'Vesícula Biliar': 'Gallbladder',
  'Adrenal Esquerda': 'Left Adrenal Gland',
  'Adrenal Direita': 'Right Adrenal Gland',
  'Cavidade Peritoneal': 'Peritoneal Cavity',
  'Baço': 'Spleen',
  'Rim Esquerdo': 'Left Kidney',
  'Rim Direito': 'Right Kidney',
  'Vesícula Urinária': 'Urinary Bladder',
  'Adrenal Esquerda': 'Left Adrenal',
  'Adrenal Direita': 'Right Adrenal',
  'Duodeno': 'Duodenum',
  'Jejuno': 'Jejunum',
  'Cólon': 'Colon',
  'Ceco': 'Cecum',
  'Íleo': 'Ileum',
  'Linfonodos': 'Lymph Nodes',
  'Próstata': 'Prostate',
  'Testículo Direito': 'Right Testicle',
  'Testículo Esquerdo': 'Left Testicle',
  'Corpo Uterino': 'Uterine Body',
  'Corno Uterino Direito': 'Right Uterine Horn',
  'Corno Uterino Esquerdo': 'Left Uterine Horn',
  'Ovário Direito': 'Right Ovary',
  'Ovário Esquerdo': 'Left Ovary',
  
  // Echocardiogram Structures
  'Valva Mitral': 'Mitral Valve',
  'Valva Aórtica': 'Aortic Valve',
  'Valva Tricúspide': 'Tricuspid Valve',
  'Valva Pulmonar': 'Pulmonary Valve',
  'Ventrículo Esquerdo (Modo M)': 'Left Ventricle (M-Mode)',
  'Ventrículo Direito': 'Right Ventricle',
  'Átrio Esquerdo': 'Left Atrium',
  'Átrio Direito': 'Right Atrium',
  'Septo Interventricular': 'Interventricular Septum',
  'Parede Livre VE': 'LV Free Wall',
  'Aorta': 'Aorta',
  'Artéria Pulmonar': 'Pulmonary Artery',
  'Doppler Aórtico': 'Aortic Doppler',
  'Doppler Mitral': 'Mitral Doppler',
  'Doppler Tricúspide': 'Tricuspid Doppler',
  'Derrame Pericárdico': 'Pericardial Effusion',
  'Função Sistólica': 'Systolic Function',
  'Função Diastólica': 'Diastolic Function',
  
  // ECG Parameters
  'Traçado DII': 'Lead II Trace',
  'Análise de Ritmo': 'Rhythm Analysis',
  'Frequência Cardíaca': 'Heart Rate',
  'Intervalo PR': 'PR Interval',
  'Duração QRS': 'QRS Duration',
  'Intervalo QT': 'QT Interval',
  'Segmento ST': 'ST Segment',
  'Onda P': 'P Wave',
  'Onda T': 'T Wave',
  'Eixo Elétrico': 'Electrical Axis',
  'Arritmias': 'Arrhythmias',
  
  // Radiography Views
  'Projeção VD (Ventro-Dorsal)': 'VD Projection (Ventro-Dorsal)',
  'Projeção LL (Látero-Lateral)': 'LL Projection (Latero-Lateral)',
  'Tórax - Campos Pulmonares': 'Thorax - Pulmonary Fields',
  'Tórax - Silhueta Cardíaca': 'Thorax - Cardiac Silhouette',
  'Tórax - Traqueia e Brônquios': 'Thorax - Trachea and Bronchi',
  'Tórax - Mediastino': 'Thorax - Mediastinum',
  'Abdômen - Órgãos': 'Abdomen - Organs',
  'Abdômen - Intestinos': 'Abdomen - Intestines',
  'Abdômen - Bexiga': 'Abdomen - Bladder',
  'Musculoesquelético': 'Musculoskeletal',
  'Coluna Vertebral': 'Vertebral Column',
  'Conclusão Radiográfica': 'Radiographic Conclusion',
  
  // Tomography Scans
  'Região Escaneada': 'Scanned Region',
  'Plano de Corte': 'Slice Plane',
  'Uso de Contraste': 'Contrast Use',
  'Fase Arterial': 'Arterial Phase',
  'Fase Venosa': 'Venous Phase',
  'Fase Tardia': 'Late Phase',
  'Achados Crânio': 'Cranial Findings',
  'Achados Tórax': 'Thorax Findings',
  'Achados Abdômen': 'Abdomen Findings',
  'Achados Membros': 'Limb Findings',
  'Achados Coluna': 'Spine Findings',
  'Medidas e Dimensões': 'Measurements and Dimensions',
  'Conclusão Tomográfica': 'Tomographic Conclusion',
  
  // Common Descriptors
  'com dimensões': 'with dimensions',
  'contornos': 'contours',
  'ecogenicidade': 'echogenicity',
  'ecotextura': 'echotexture',
  'preservados': 'preserved',
  'apresenta': 'shows',
  'alteração': 'alteration',
  'aumento': 'enlargement',
  'dimensões': 'dimensions',
  'normal': 'normal',
  'anormal': 'abnormal',
  'aumentado': 'enlarged',
  'diminuído': 'decreased',
  'hiperecóico': 'hyperechoic',
  'hipoecóico': 'hypoechoic',
  'isoecóico': 'isoechoic',
  'homogêneo': 'homogeneous',
  'heterogêneo': 'heterogeneous',
  'regular': 'regular',
  'irregular': 'irregular',
  'definidos': 'defined',
  'indefinidos': 'undefined',
  'espessamento': 'thickening',
  'massa': 'mass',
  'nódulo': 'nodule',
  'cisto': 'cyst',
  'lesão': 'lesion',
  'calcificação': 'calcification',
  'dilatação': 'dilation',
  'estenose': 'stenosis',
  'derrame': 'effusion',
  'líquido livre': 'free fluid',
  
  // Measurements
  'comprimento': 'length',
  'largura': 'width',
  'altura': 'height',
  'espessura': 'thickness',
  'diâmetro': 'diameter',
  'volume': 'volume',
  'área': 'area',
  
  // Units
  'cm': 'cm',
  'mm': 'mm',
  'kg': 'kg',
  'bpm': 'bpm',
  'ms': 'ms',
  
  // Time
  'segundo': 'second',
  'minuto': 'minute',
  'hora': 'hour',
  'dia': 'day',
  
  // Common Report Phrases
  'sem alterações': 'no changes',
  'dentro dos limites da normalidade': 'within normal limits',
  'compatível com': 'compatible with',
  'sugestivo de': 'suggestive of',
  'achado incidental': 'incidental finding',
  'recomenda-se': 'it is recommended',
  'acompanhamento': 'follow-up',
  'controle': 'monitoring',
  'reavaliação': 'reassessment'
};

// Create reverse mapping (EN to PT)
const EN_TO_PT = {};
Object.entries(PT_TO_EN).forEach(([pt, en]) => {
  EN_TO_PT[en.toLowerCase()] = pt;
});

/**
 * Translate text from Portuguese to English or vice versa
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language ('pt' or 'en')
 * @returns {string} - Translated text
 */
export function translate(text, targetLang = 'en') {
  if (!text || typeof text !== 'string') return text;
  
  // If target is Portuguese and text is already in Portuguese, return as is
  if (targetLang === 'pt') {
    return translateToPortuguese(text);
  }
  
  // Default: translate to English
  return translateToEnglish(text);
}

/**
 * Translate Portuguese text to English
 */
function translateToEnglish(text) {
  let translated = text;
  
  // Sort by length (longest first) to handle multi-word phrases correctly
  const sortedEntries = Object.entries(PT_TO_EN).sort((a, b) => b[0].length - a[0].length);
  
  for (const [pt, en] of sortedEntries) {
    // Case-insensitive replacement, preserving original case when possible
    const regex = new RegExp(escapeRegex(pt), 'gi');
    translated = translated.replace(regex, (match) => {
      // Preserve capitalization of first letter
      if (match[0] === match[0].toUpperCase()) {
        return en.charAt(0).toUpperCase() + en.slice(1);
      }
      return en;
    });
  }
  
  return translated;
}

/**
 * Translate English text to Portuguese
 */
function translateToPortuguese(text) {
  let translated = text;
  
  // Sort by length (longest first)
  const sortedEntries = Object.entries(EN_TO_PT).sort((a, b) => b[0].length - a[0].length);
  
  for (const [en, pt] of sortedEntries) {
    const regex = new RegExp(escapeRegex(en), 'gi');
    translated = translated.replace(regex, (match) => {
      // Preserve capitalization
      if (match[0] === match[0].toUpperCase()) {
        return pt.charAt(0).toUpperCase() + pt.slice(1);
      }
      return pt;
    });
  }
  
  return translated;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get available languages
 */
export function getAvailableLanguages() {
  return [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
}

/**
 * Translate organ/structure names
 */
export function translateStructureName(name, targetLang = 'en') {
  return translate(name, targetLang);
}

/**
 * Translate entire report object
 */
export function translateReport(reportData, targetLang = 'en') {
  if (!reportData) return reportData;
  
  const translated = { ...reportData };
  
  // Translate organ names
  if (translated.organs_data) {
    translated.organs_data = translated.organs_data.map(organ => ({
      ...organ,
      organ_name: translate(organ.organ_name, targetLang),
      report_text: translate(organ.report_text || '', targetLang)
    }));
  }
  
  return translated;
}

export default {
  translate,
  translateStructureName,
  translateReport,
  getAvailableLanguages
};
