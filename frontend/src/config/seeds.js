/**
 * NexaClinq - Seed Data (Base de Conhecimento)
 *
 * IMPORTANT:
 * - NÃO INVENTAR DADOS.
 * - Este arquivo é baseado em conteúdo clinicamente validado fornecido pelo time médico.
 */

export const initialSettings = {
  id: 'global_settings',
  practice_type: 'vet', // Default fallback
  // Include critical modules for day-to-day usage on fresh DB
  active_modules: ['core', 'ultrasound', 'financial', 'prescription', 'lab_vet'],
  clinic_name: 'Clínica Exemplo',
  theme: 'light'
};

// =========================
// MEDICAMENTOS (VET)
// =========================
const VET_DRUGS_DB = [
  {
    id: 'vet_drug_01', name: 'Doxiciclina 80mg (Doxitec)', type: 'vet',
    default_dosage: '5mg/kg a cada 12h ou 10mg/kg a cada 24h, via oral, por 21 a 28 dias.'
  },
  {
    id: 'vet_drug_02', name: 'Amoxicilina + Clavulanato 250mg (Agemoxi)', type: 'vet',
    default_dosage: '12,5mg/kg a cada 12h, via oral, por 7 a 10 dias.'
  },
  {
    id: 'vet_drug_03', name: 'Meloxicam 0.2% (Maxicam)', type: 'vet',
    default_dosage: '0,1mg/kg (1º dia) seguido de 0,05mg/kg a cada 24h, por 3 a 5 dias.'
  },
  {
    id: 'vet_drug_04', name: 'Dipirona Sódica 500mg/mL (Gotas)', type: 'vet',
    default_dosage: '25mg/kg (1 gota por kg) a cada 8h, se houver dor ou febre.'
  },
  {
    id: 'vet_drug_05', name: 'Metronidazol 250mg (Giardicid)', type: 'vet',
    default_dosage: '15mg a 25mg/kg a cada 12h, via oral, por 5 a 7 dias.'
  },
  {
    id: 'vet_drug_06', name: 'Prednisolona 20mg', type: 'vet',
    default_dosage: 'Anti-inflamatório: 0,5 a 1mg/kg/dia. Imunossupressor: 2 a 4mg/kg/dia.'
  },
  {
    id: 'vet_drug_07', name: 'Sarolaner (Simparic) - Antipulgas', type: 'vet',
    default_dosage: 'Dose única mensal de acordo com o peso do animal.'
  },
  {
    id: 'vet_drug_08', name: 'Omeprazol 20mg', type: 'vet',
    default_dosage: '1mg/kg a cada 24h, via oral, preferencialmente em jejum.'
  },
  {
    id: 'vet_drug_09', name: 'Tramadol 50mg', type: 'vet',
    default_dosage: '2 a 4mg/kg a cada 8h ou 12h, para controle da dor moderada a grave.'
  },
  {
    id: 'vet_drug_10', name: 'Ondansetrona 5mg (Vonau)', type: 'vet',
    default_dosage: '0,5 a 1mg/kg a cada 12h ou 8h, via oral, para controle de vômito.'
  }
];

// =========================
// MEDICAMENTOS (HUMAN)
// =========================
const HUMAN_DRUGS_DB = [
  {
    id: 'human_drug_01', name: 'Losartana Potássica 50mg', type: 'human',
    default_dosage: 'Tomar 1 comprimido via oral, a cada 12 ou 24 horas (conforme PA).'
  },
  {
    id: 'human_drug_02', name: 'Dipirona Monohidratada 1g', type: 'human',
    default_dosage: 'Tomar 1 comprimido via oral a cada 6 horas, se dor ou febre.'
  },
  {
    id: 'human_drug_03', name: 'Azitromicina 500mg', type: 'human',
    default_dosage: 'Tomar 1 comprimido via oral, uma vez ao dia, por 3 a 5 dias.'
  },
  {
    id: 'human_drug_04', name: 'Amoxicilina 500mg', type: 'human',
    default_dosage: 'Tomar 1 cápsula via oral a cada 8 horas, por 7 dias.'
  },
  {
    id: 'human_drug_05', name: 'Omeprazol 20mg', type: 'human',
    default_dosage: 'Tomar 1 cápsula em jejum, pela manhã, por 30 dias.'
  },
  {
    id: 'human_drug_06', name: 'Sinvastatina 20mg', type: 'human',
    default_dosage: 'Tomar 1 comprimido via oral, à noite.'
  },
  {
    id: 'human_drug_07', name: 'Metformina 850mg (Glifage)', type: 'human',
    default_dosage: 'Tomar 1 comprimido via oral, junto às refeições (almoço/jantar).'
  },
  {
    id: 'human_drug_08', name: 'Ciprofloxacino 500mg', type: 'human',
    default_dosage: 'Tomar 1 comprimido via oral a cada 12 horas, por 7 a 14 dias.'
  },
  {
    id: 'human_drug_09', name: 'Paracetamol 750mg', type: 'human',
    default_dosage: 'Tomar 1 comprimido via oral a cada 6 ou 8 horas, se dor.'
  },
  {
    id: 'human_drug_10', name: 'Pantoprazol 40mg', type: 'human',
    default_dosage: 'Tomar 1 comprimido via oral, pela manhã, em jejum.'
  }
];

// =========================
// TEMPLATES DE LAUDOS (REPORT)
// =========================
const REPORT_TEMPLATES_DB = [
  // --- VETERINÁRIA ---
  {
    id: 'vet_usg_abd_01', title: 'USG Abdominal Total (Canino - Normal)', organ: 'Abdomen', lang: 'pt',
    text: `FÍGADO: Dimensões preservadas, contornos regulares e bordos afilados. Ecotextura homogênea e ecogenicidade preservada. Veia porta e veias hepáticas sem alterações.\n\nVESÍCULA BILIAR: Repleta, conteúdo anecóico, paredes finas e regulares.\n\nBAÇO: Dimensões preservadas, contornos regulares e ecotextura homogênea.\n\nRINS: Topografia habitual, dimensões preservadas, formato conservado. Relação córtico-medular mantida (1:1). Ausência de cálculos ou hidronefrose.\n\nBEXIGA: Repleta, conteúdo anecóico, paredes finas e regulares. Ausência de sedimentos ou urólitos visíveis.\n\nESTÔMAGO E ALÇAS INTESTINAIS: Preservados, com peristaltismo presente. Não há sinais de obstrução ou espessamento parietal.\n\nCONCLUSÃO: Estudo sonográfico abdominal dentro dos limites da normalidade para a espécie.`
  },
  {
    id: 'vet_usg_gest_01', title: 'USG Gestacional (Diagnóstico)', organ: 'Gestacional', lang: 'pt',
    text: `ÚTERO: Identificada presença de vesículas gestacionais com embriões viáveis.\n\nBATIMENTOS CARDÍACOS: Presentes e rítmicos em todos os fetos visualizados (FC > 180 bpm).\n\nVIABILIDADE: Movimentação fetal presente. Líquido amniótico com aspecto normal.\n\nESTIMATIVA: Vesículas medindo em média [XX] cm, compatível com aproximadamente [XX] dias de gestação.\n\nCONCLUSÃO: Gestação tópica com fetos viáveis no momento do exame.`
  },

  // --- HUMANA ---
  {
    id: 'human_usg_abd_01', title: 'USG Abdome Total (Normal)', organ: 'Abdomen', lang: 'pt',
    text: `FÍGADO: Com dimensões, contornos e morfologia normais. Ecotextura homogênea e ecogenicidade habitual. Ausência de lesões focais. Veia porta e veias hepáticas de calibre normal.\n\nVIAS BILIARES: Intra e extra-hepáticas sem dilatação.\n\nVESÍCULA BILIAR: Tópica, distendida, com paredes finas e conteúdo anecóico (sem cálculos).\n\nPÂNCREAS: Com dimensões e ecotextura normais para a faixa etária.\n\nBAÇO: Com dimensões e ecotextura normais.\n\nRINS: Tópicos, com dimensões normais e contornos regulares. Espessura e ecogenicidade do parênquima preservadas. Ausência de sinais de hidronefrose ou cálculos.\n\nAORTA ABDOMINAL: Com calibre e trajeto normais.\n\nBEXIGA: Com boa repleção, paredes finas e conteúdo anecóico.\n\nCONCLUSÃO: Exame ultrassonográfico do abdome total sem alterações significativas.`
  },
  {
    id: 'human_usg_thyroid_01', title: 'USG Tireoide (Normal)', organ: 'Tireoide', lang: 'pt',
    text: `GLÂNDULA TIREOIDE: Tópica, com dimensões normais e contornos regulares.\n\nECOTEXTURA: Homogênea, com ecogenicidade preservada.\n\nLOBOS:\n- Lobo Direito: Medindo [XX] x [XX] x [XX] cm.\n- Lobo Esquerdo: Medindo [XX] x [XX] x [XX] cm.\n- Ístmo: Espessura de [XX] cm.\n\nNÓDULOS: Não foram visibilizados nódulos ou cistos sólidos ou mistos.\n\nVASCULARIZAÇÃO: Ao Doppler colorido, nota-se vascularização parenquimatosa habitual.\n\nCONCLUSÃO: Tireoide de aspecto ecográfico normal.`
  },
  {
    id: 'human_usg_prostate_01', title: 'USG Próstata (Via Abdominal)', organ: 'Prostata', lang: 'pt',
    text: `BEXIGA: Com boa repleção, paredes finas e regulares. Resíduo pós-miccional desprezível.\n\nPRÓSTATA: Tópica, com contornos regulares e ecotextura homogênea.\n\nDIMENSÕES:\n- Diâmetro Transverso: [XX] cm\n- Diâmetro Antero-posterior: [XX] cm\n- Diâmetro Longitudinal: [XX] cm\n\nVOLUME ESTIMADO: [XX] cm³ (Valor de referência: até 30 cm³).\n\nCONCLUSÃO: Próstata com volume e aspecto ultrassonográfico dentro dos limites da normalidade.`
  }
];

// =========================
// ANAMNESE DEFAULTS
// =========================
const ANAMNESIS_TEMPLATES = {
  vet_default: "Paciente ativo, normocorado, hidratado. TPC < 2s. Linfonodos não reativos à palpação. Ausculta cardíaca e pulmonar sem alterações. Temperatura retal normal. Abdome indolor à palpação.",
  human_default: "Paciente em Bom Estado Geral (BEG), Lúcido, Orientado em Tempo e Espaço (LOTE). Eupneico, Afebril, Acianótico, Anictérico. Hidratado e Corado. \nACV: Ritmo Cardíaco Regular em 2 Tempos (RCR 2T), bulhas normofonéticas, sem sopros.\nAR: Murmúrio Vesicular presente (MV+), sem ruídos adventícios.\nABD: Flácido, indolor, RHA presentes."
};

// =========================
// EXPORTS (consumidos pelo seed do RxDB)
// =========================
export const initialDrugs = [...VET_DRUGS_DB, ...HUMAN_DRUGS_DB];
export const initialTemplates = [...REPORT_TEMPLATES_DB];
export const anamnesisDefaults = ANAMNESIS_TEMPLATES;
