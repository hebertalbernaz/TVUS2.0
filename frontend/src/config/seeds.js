/**
 * NEXACLINQ SEEDS - MEDICAL INTELLIGENCE DATABASE
 * Curated by Senior Medical & Veterinary Board.
 */

// ==================================================================================
// 1. MEDICAMENTOS VETERINÁRIOS (CÃES/GATOS)
// ==================================================================================
const VET_DRUGS_DB = [
  // --- ANTIBIÓTICOS ---
  { id: 'v_atb_01', name: 'Doxiciclina 80mg (Doxitec)', type: 'vet', category: 'Antibiótico', default_dosage: '5mg/kg a cada 12h ou 10mg/kg a cada 24h, VO, por 21-28 dias.' },
  { id: 'v_atb_02', name: 'Amoxicilina + Clavulanato 250mg (Agemoxi)', type: 'vet', category: 'Antibiótico', default_dosage: '12,5mg/kg a cada 12h, VO, por 7-10 dias.' },
  { id: 'v_atb_03', name: 'Metronidazol 250mg (Giardicid)', type: 'vet', category: 'Antibiótico', default_dosage: '15-25mg/kg a cada 12h, VO, por 5-7 dias.' },
  { id: 'v_atb_04', name: 'Enrofloxacina 50mg (Baytril)', type: 'vet', category: 'Antibiótico', default_dosage: '5mg/kg a cada 24h, VO, por 5-7 dias (Evitar em filhotes).' },
  { id: 'v_atb_05', name: 'Cefalexina 300mg', type: 'vet', category: 'Antibiótico', default_dosage: '22-30mg/kg a cada 12h, VO, por 7-14 dias (Piodermites).' },

  // --- ANTI-INFLAMATÓRIOS / ANALGÉSICOS ---
  { id: 'v_ain_01', name: 'Meloxicam 2.0mg (Maxicam)', type: 'vet', category: 'Anti-inflamatório', default_dosage: '0,1mg/kg (1º dia) -> 0,05mg/kg a cada 24h, VO, por 3-5 dias.' },
  { id: 'v_ain_02', name: 'Carprofeno 25mg (Rimadyl)', type: 'vet', category: 'Anti-inflamatório', default_dosage: '2,2mg/kg a cada 12h ou 4,4mg/kg a cada 24h, VO.' },
  { id: 'v_ain_03', name: 'Dipirona Sódica 500mg/mL (Gotas)', type: 'vet', category: 'Analgesia', default_dosage: '25mg/kg (1 gota/kg) a cada 8h, VO.' },
  { id: 'v_ain_04', name: 'Tramadol 50mg', type: 'vet', category: 'Analgesia', default_dosage: '2-4mg/kg a cada 8h ou 12h, VO (Dor moderada/grave).' },
  { id: 'v_ain_05', name: 'Gabapentina 100mg', type: 'vet', category: 'Analgesia', default_dosage: '5-10mg/kg a cada 12h, VO (Dor neuropática/Crônica).' },

  // --- GASTRO / ANTIEMÉTICOS ---
  { id: 'v_gas_01', name: 'Omeprazol 20mg', type: 'vet', category: 'Gastro', default_dosage: '1mg/kg a cada 24h, VO, em jejum.' },
  { id: 'v_gas_02', name: 'Ondansetrona 5mg (Vonau)', type: 'vet', category: 'Antiemético', default_dosage: '0,5-1mg/kg a cada 12h, VO.' },
  { id: 'v_gas_03', name: 'Maropitant 16mg (Cerenia)', type: 'vet', category: 'Antiemético', default_dosage: '2mg/kg a cada 24h, VO, por até 5 dias.' },

  // --- DERMATO / OTOLÓGICOS ---
  { id: 'v_derm_01', name: 'Apoquel 3.6mg (Oclacitinib)', type: 'vet', category: 'Dermato', default_dosage: '0,4-0,6mg/kg a cada 12h (14 dias) -> a cada 24h.' },
  { id: 'v_derm_02', name: 'Simparic 20-40kg (Sarolaner)', type: 'vet', category: 'Antiparasitário', default_dosage: '1 comprimido mensal conforme peso.' },
  { id: 'v_derm_03', name: 'Bravecto (Fluralaner)', type: 'vet', category: 'Antiparasitário', default_dosage: '1 comprimido a cada 12 semanas (3 meses).' },

  // --- CARDIOLOGIA ---
  { id: 'v_card_01', name: 'Pimobendan 5mg (Vetmedin)', type: 'vet', category: 'Cardio', default_dosage: '0,25mg/kg a cada 12h, VO, 1h antes da refeição.' },
  { id: 'v_card_02', name: 'Benazepril 5mg', type: 'vet', category: 'Cardio', default_dosage: '0,25-0,5mg/kg a cada 24h, VO.' },
  { id: 'v_card_03', name: 'Furosemida 40mg', type: 'vet', category: 'Cardio', default_dosage: '1-4mg/kg a cada 12h (conforme edema), VO.' }
];

// ==================================================================================
// 2. MEDICAMENTOS HUMANOS (CLÍNICA GERAL)
// ==================================================================================
const HUMAN_DRUGS_DB = [
  // --- CARDIOLOGIA / HIPERTENSÃO ---
  { id: 'h_cv_01', name: 'Losartana Potássica 50mg', type: 'human', category: 'Anti-hipertensivo', default_dosage: 'Tomar 1 comprimido via oral de 12/12h ou 24/24h.' },
  { id: 'h_cv_02', name: 'Enalapril 20mg', type: 'human', category: 'Anti-hipertensivo', default_dosage: 'Tomar 1 comprimido via oral de 12/12h.' },
  { id: 'h_cv_03', name: 'Anlodipino 5mg', type: 'human', category: 'Anti-hipertensivo', default_dosage: 'Tomar 1 comprimido via oral 1x ao dia.' },
  { id: 'h_cv_04', name: 'Hidroclorotiazida 25mg', type: 'human', category: 'Diurético', default_dosage: 'Tomar 1 comprimido via oral pela manhã.' },
  { id: 'h_cv_05', name: 'Sinvastatina 20mg', type: 'human', category: 'Hipolipemiante', default_dosage: 'Tomar 1 comprimido via oral à noite.' },

  // --- ANALGESIA / AINES ---
  { id: 'h_dor_01', name: 'Dipirona Monohidratada 1g', type: 'human', category: 'Analgesia', default_dosage: 'Tomar 1 comprimido via oral de 6/6h se dor ou febre.' },
  { id: 'h_dor_02', name: 'Paracetamol 750mg', type: 'human', category: 'Analgesia', default_dosage: 'Tomar 1 comprimido via oral de 8/8h (Máx 4g/dia).' },
  { id: 'h_dor_03', name: 'Ibuprofeno 600mg', type: 'human', category: 'Anti-inflamatório', default_dosage: 'Tomar 1 comprimido via oral de 8/8h após refeições (por 3-5 dias).' },
  { id: 'h_dor_04', name: 'Nimesulida 100mg', type: 'human', category: 'Anti-inflamatório', default_dosage: 'Tomar 1 comprimido via oral de 12/12h por 3 a 5 dias.' },
  { id: 'h_dor_05', name: 'Tramadol 50mg', type: 'human', category: 'Opioide', default_dosage: 'Tomar 1 comprimido de 8/8h se dor intensa.' },

  // --- ANTIBIÓTICOS ---
  { id: 'h_atb_01', name: 'Amoxicilina 500mg', type: 'human', category: 'Antibiótico', default_dosage: 'Tomar 1 cápsula via oral de 8/8h por 7 dias.' },
  { id: 'h_atb_02', name: 'Amoxicilina + Clavulanato 875mg', type: 'human', category: 'Antibiótico', default_dosage: 'Tomar 1 comprimido via oral de 12/12h por 7-10 dias.' },
  { id: 'h_atb_03', name: 'Azitromicina 500mg', type: 'human', category: 'Antibiótico', default_dosage: 'Tomar 1 comprimido via oral 1x ao dia por 3 ou 5 dias.' },
  { id: 'h_atb_04', name: 'Ciprofloxacino 500mg', type: 'human', category: 'Antibiótico', default_dosage: 'Tomar 1 comprimido via oral de 12/12h por 7-14 dias.' },
  { id: 'h_atb_05', name: 'Cefalexina 500mg', type: 'human', category: 'Antibiótico', default_dosage: 'Tomar 1 comprimido via oral de 6/6h por 7 dias.' },

  // --- METABÓLICO / GASTRO ---
  { id: 'h_met_01', name: 'Metformina 850mg (Glifage XR)', type: 'human', category: 'Antidiabético', default_dosage: 'Tomar 1 ou 2 comprimidos após o jantar.' },
  { id: 'h_met_02', name: 'Omeprazol 20mg', type: 'human', category: 'Gastro', default_dosage: 'Tomar 1 cápsula em jejum pela manhã.' }
];

// ==================================================================================
// 3. TEMPLATES DE LAUDOS (ULTRASSOM)
// ==================================================================================
const REPORT_TEMPLATES_DB = [
  // --- VETERINÁRIA ---
  {
    id: 'vt_abd_01', title: '[VET] USG Abdominal Total (Canino/Normal)', organ: 'Abdomen', lang: 'pt',
    text: `FÍGADO: Dimensões preservadas, contornos regulares. Ecotextura homogênea e ecogenicidade preservada.\nVESÍCULA BILIAR: Repleta, conteúdo anecóico, paredes finas.\nBAÇO: Ecotextura homogênea e granular fina.\nRINS: Simétricos, relação córtico-medular mantida (1:1). Sem cálculos.\nBEXIGA: Repleta, paredes finas, sem sedimentos.\nTGI: Peristaltismo presente, estratificação parietal preservada.\nCONCLUSÃO: Estudo sonográfico abdominal sem alterações dignas de nota.`
  },
  {
    id: 'vt_card_01', title: '[VET] Ecocardiograma (Triagem)', organ: 'Cardio', lang: 'pt',
    text: `ÁTRIO ESQUERDO: Relação AE/Ao preservada (< 1.5).\nVALVA MITRAL: Folhetos finos e móveis, sem fluxo regurgitante significativo ao Doppler.\nVENTRÍCULO ESQUERDO: Contratilidade preservada (Fração de Encurtamento > 25%). Paredes com espessura normal.\nCONCLUSÃO: Ausência de sinais ecocardiográficos de remodelamento cardíaco no momento.`
  },
  {
    id: 'vt_gest_01', title: '[VET] Diagnóstico Gestacional', organ: 'Gestacional', lang: 'pt',
    text: `ÚTERO: Presença de vesículas gestacionais contendo embriões.\nVIABILIDADE: Batimentos cardíacos presentes e rítmicos (> 180 bpm).\nESTIMATIVA: Vesículas medindo aprox. [XX] cm, compatível com [XX] dias.\nCONCLUSÃO: Gestação tópica com fetos viáveis.`
  },

  // --- HUMANA ---
  {
    id: 'ht_abd_01', title: '[MED] USG Abdome Total (Normal)', organ: 'Abdomen', lang: 'pt',
    text: `FÍGADO: Morfologia, dimensões e contornos normais. Ecotextura homogênea. Ausência de lesões focais.\nVIAS BILIARES: Sem dilatação intra ou extra-hepática.\nVESÍCULA BILIAR: Paredes finas, conteúdo anecóico (sem cálculos).\nPÂNCREAS: Visibilizado cabeça e corpo, com aspecto habitual.\nRINS: Tópicos, dimensões normais, espessura parenquimatosa preservada. Sem hidronefrose ou litíase.\nBEXIGA: Boa repleção, paredes lisas.\nCONCLUSÃO: Exame dentro dos limites da normalidade.`
  },
  {
    id: 'ht_tv_01', title: '[MED] USG Transvaginal (Normal)', organ: 'Pelvico', lang: 'pt',
    text: `ÚTERO: Em anteversoflexão, centrado. Contornos regulares e ecotextura miometrial homogênea.\nENDOMÉTRIO: Centrado, linear, medindo [XX] mm de espessura.\nOVÁRIOS: Tópicos, com morfologia e dimensões preservadas, apresentando folículos simples.\nFUNDOS DE SACO: Livres de líquido.\nCONCLUSÃO: Ultrassonografia pélvica transvaginal sem alterações.`
  },
  {
    id: 'ht_thy_01', title: '[MED] USG Tireoide (Normal)', organ: 'Pescoco', lang: 'pt',
    text: `TIREOIDE: Tópica, dimensões normais, contornos regulares.\nECOTEXTURA: Homogênea. Ausência de nódulos sólidos ou císticos.\nVASCULARIZAÇÃO: Ao Doppler, padrão de vascularização habitual.\nCONCLUSÃO: Tireoide de aspecto ecográfico normal (TI-RADS 1).`
  }
];

// ==================================================================================
// 4. ANAMNESIS DEFAULTS
// ==================================================================================
const ANAMNESIS_TEMPLATES = {
  vet_default: "Paciente ativo, normocorado, hidratado. TPC < 2s. Linfonodos não reativos. Ausculta limpa. Abdome indolor.",
  human_default: "BEG (Bom Estado Geral), LOTE, Afebril, Acianótico, Anictérico. Eupneico em ar ambiente. \nACV: RCR 2T NF, sem sopros.\nAR: MV+ sem RA.\nABD: Flácido, indolor, RHA+."
};

export const initialDrugs = [...VET_DRUGS_DB, ...HUMAN_DRUGS_DB];
export const initialTemplates = [...REPORT_TEMPLATES_DB];
export const initialSettings = {
  id: 'global_settings',
  practice_type: 'vet',
  active_modules: ['core', 'ultrasound', 'financial', 'prescription'],
  clinic_name: 'NexaClinq Demo Clinic',
  theme: 'light'
};
export const anamnesisDefaults = ANAMNESIS_TEMPLATES;
