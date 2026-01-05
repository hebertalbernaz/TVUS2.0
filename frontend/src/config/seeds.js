/**
 * NEXACLINQ SEEDS - MEDICAL INTELLIGENCE DATABASE
 */

// 1. VETERINÁRIA
const VET_DRUGS_DB = [
  { id: 'v_atb_01', name: 'Doxiciclina 80mg (Doxitec)', type: 'vet', category: 'Antibiótico', default_dosage: '5mg/kg a cada 12h ou 10mg/kg a cada 24h, VO, por 21-28 dias.' },
  { id: 'v_atb_02', name: 'Amoxicilina + Clavulanato 250mg (Agemoxi)', type: 'vet', category: 'Antibiótico', default_dosage: '12,5mg/kg a cada 12h, VO, por 7-10 dias.' },
  { id: 'v_atb_03', name: 'Metronidazol 250mg (Giardicid)', type: 'vet', category: 'Antibiótico', default_dosage: '15-25mg/kg a cada 12h, VO, por 5-7 dias.' },
  { id: 'v_ain_01', name: 'Meloxicam 2.0mg (Maxicam)', type: 'vet', category: 'Anti-inflamatório', default_dosage: '0,1mg/kg (1º dia) -> 0,05mg/kg a cada 24h, VO, por 3-5 dias.' },
  { id: 'v_ain_03', name: 'Dipirona Sódica 500mg/mL (Gotas)', type: 'vet', category: 'Analgesia', default_dosage: '25mg/kg (1 gota/kg) a cada 8h, VO.' },
  { id: 'v_derm_02', name: 'Simparic (Sarolaner)', type: 'vet', category: 'Antiparasitário', default_dosage: '1 comprimido mensal conforme peso.' },
  { id: 'v_card_01', name: 'Pimobendan (Vetmedin)', type: 'vet', category: 'Cardio', default_dosage: '0,25mg/kg a cada 12h, VO.' }
];

// 2. HUMANA
const HUMAN_DRUGS_DB = [
  { id: 'h_cv_01', name: 'Losartana Potássica 50mg', type: 'human', category: 'Anti-hipertensivo', default_dosage: '1 comprimido via oral de 12/12h ou 24/24h.' },
  { id: 'h_dor_01', name: 'Dipirona 1g', type: 'human', category: 'Analgesia', default_dosage: '1 comprimido de 6/6h se dor ou febre.' },
  { id: 'h_atb_03', name: 'Azitromicina 500mg', type: 'human', category: 'Antibiótico', default_dosage: '1 comprimido ao dia por 3 a 5 dias.' },
  { id: 'h_met_02', name: 'Omeprazol 20mg', type: 'human', category: 'Gastro', default_dosage: '1 cápsula em jejum pela manhã.' }
];

// 3. TEMPLATES
const REPORT_TEMPLATES_DB = [
  { id: 'vt_abd_01', title: '[VET] USG Abdominal Total (Canino/Normal)', organ: 'Abdomen', lang: 'pt', text: 'FÍGADO: Dimensões preservadas, contornos regulares. Ecotextura homogênea...\nCONCLUSÃO: Estudo sonográfico abdominal sem alterações.' },
  { id: 'ht_abd_01', title: '[MED] USG Abdome Total (Normal)', organ: 'Abdomen', lang: 'pt', text: 'FÍGADO: Morfologia e dimensões normais...\nCONCLUSÃO: Exame dentro dos limites da normalidade.' }
];

const ANAMNESIS_TEMPLATES = {
  vet_default: "Paciente ativo, normocorado, hidratado. TPC < 2s. Linfonodos não reativos.",
  human_default: "BEG, LOTE, Afebril, Acianótico. ACV: RCR 2T NF. AR: MV+ sem RA."
};

export const initialDrugs = [...VET_DRUGS_DB, ...HUMAN_DRUGS_DB];
export const initialTemplates = [...REPORT_TEMPLATES_DB];
export const anamnesisDefaults = ANAMNESIS_TEMPLATES;
export const initialSettings = {
  id: 'global_settings',
  practice_type: 'vet',
  active_modules: ['core', 'ultrasound', 'financial', 'prescription'],
  clinic_name: 'NexaClinq Demo Clinic',
  theme: 'light'
};
