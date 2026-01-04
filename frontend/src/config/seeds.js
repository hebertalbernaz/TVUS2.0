/**
 * TVUSVET V2.0 - Seed Data (Dados Iniciais)
 * Popula o banco com dados de teste e produção inicial
 */

export const initialSettings = {
  id: 'global_settings',
  practice_type: 'vet', // Default fallback
  // Include critical modules for day-to-day usage on fresh DB
  active_modules: ['core', 'ultrasound', 'financial', 'prescription', 'lab_vet'],
  clinic_name: 'Clínica Exemplo',
  theme: 'light'
};

export const initialDrugs = [
  // --- VETERINÁRIA ---
  { id: 'd_v1', name: 'Doxiciclina 100mg', type: 'vet', default_dosage: '10mg/kg a cada 12h por 21 dias' },
  { id: 'd_v2', name: 'Meloxicam 2mg', type: 'vet', default_dosage: '0.1mg/kg SID por 3 dias' },
  { id: 'd_v3', name: 'Dipirona 500mg', type: 'vet', default_dosage: '25mg/kg a cada 8h' },
  { id: 'd_v4', name: 'Prednisolona 20mg', type: 'vet', default_dosage: '0.5mg/kg SID' },
  
  // --- HUMANA ---
  { id: 'd_h1', name: 'Dipirona Monoidratada 1g', type: 'human', default_dosage: '1 comprimido a cada 6h se necessário' },
  { id: 'd_h2', name: 'Amoxicilina + Clavulanato 875mg', type: 'human', default_dosage: '1 comprimido a cada 12h por 10 dias' },
  { id: 'd_h3', name: 'Losartana Potássica 50mg', type: 'human', default_dosage: '1 comprimido pela manhã (uso contínuo)' },
  { id: 'd_h4', name: 'Sinvastatina 20mg', type: 'human', default_dosage: '1 comprimido à noite' }
];

export const initialTemplates = [
  {
    id: 't_usg_liver_normal',
    organ: 'Fígado',
    title: 'Fígado Normal',
    text: 'Fígado com dimensões preservadas, contornos regulares e bordas finas. Ecotextura homogênea e ecogenicidade preservada. Calibre dos vasos intra-hepáticos preservado.',
    lang: 'pt'
  },
  {
    id: 't_usg_spleen_normal',
    organ: 'Baço',
    title: 'Baço Normal',
    text: 'Baço com dimensões preservadas, contornos regulares e ecotextura homogênea característica.',
    lang: 'pt'
  },
  {
    id: 't_usg_thyroid_nodule',
    organ: 'Tireoide',
    title: 'Nódulo Sólido (TI-RADS 4)',
    text: 'Presença de nódulo sólido, hipoecoico, com contornos irregulares, medindo 1.2 x 0.8 cm no lobo direito. Vascularização central ao Doppler.',
    lang: 'pt'
  },

  // ========================
  // Imagem (Vet)
  // ========================
  {
    id: 't_usg_vet_abd_normal_canine',
    organ: 'USG',
    title: 'USG Abdominal Normal (Canino)',
    text: 'Exame ultrassonográfico abdominal dentro dos padrões de normalidade para a espécie. Fígado com dimensões e ecotextura preservadas; vesícula biliar sem conteúdo anormal; baço com ecotextura homogênea; rins com relação córtico-medular preservada e sem dilatações pielocalicinais; alças intestinais com estratificação mantida e peristalse presente. Sem evidência de efusão abdominal ou massas.',
    lang: 'pt'
  },
  {
    id: 't_usg_vet_gestational_feline',
    organ: 'USG',
    title: 'USG Gestacional (Felino)',
    text: 'Achados compatíveis com gestação. Presença de vesículas gestacionais em cavidade uterina, com embriões/fetos viáveis, com movimentação e batimentos cardíacos presentes. Líquido amniótico dentro da normalidade. Recomenda-se acompanhamento ultrassonográfico seriado conforme idade gestacional e orientação clínica.',
    lang: 'pt'
  },

  // ========================
  // Imagem (Humano)
  // ========================
  {
    id: 't_usg_human_thyroid_normal',
    organ: 'USG',
    title: 'USG Tireoide (Normal)',
    text: 'Tireoide com dimensões preservadas, contornos regulares e ecotextura homogênea. Ausência de nódulos suspeitos. Vascularização habitual ao Doppler. Linfonodos cervicais sem alterações significativas. Conclusão: exame dentro da normalidade.',
    lang: 'pt'
  },
  {
    id: 't_usg_human_abd_steatosis_mild',
    organ: 'USG',
    title: 'USG Abdome Total (Esteatose Leve)',
    text: 'Fígado com discreto aumento difuso da ecogenicidade, compatível com esteatose hepática leve, sem sinais de lesões focais. Vias biliares sem dilatação. Pâncreas e baço sem alterações relevantes. Rins com dimensões preservadas e sem hidronefrose. Ausência de ascite. Conclusão: achados compatíveis com esteatose hepática leve.',
    lang: 'pt'
  },

  // ========================
  // Templates de Anamnese (PEP)
  // ========================
  {
    id: 't_anamnesis_vet_physical_normal',
    organ: 'ANAMNESE',
    title: 'Exame Físico Padrão (Sem alterações) - Vet',
    text: 'Paciente em bom estado geral, normohidratado, mucosas normocoradas, TPC < 2s. Auscultação cardiopulmonar sem alterações audíveis. Palpação abdominal sem dor/sem massas palpáveis. Linfonodos periféricos sem aumento. Temperatura corporal dentro da normalidade. Conduta: orientar monitoramento e retorno se houver piora.',
    lang: 'pt'
  },
  {
    id: 't_anamnesis_human_physical_normal_adult',
    organ: 'ANAMNESE',
    title: 'Exame Físico Normal (Adulto) - Humano',
    text: 'Paciente em bom estado geral, corado(a), hidratado(a), afebril. PA e FC dentro de limites aceitáveis. Ausculta cardíaca e pulmonar sem ruídos adventícios. Abdome flácido, indolor, sem massas. Extremidades sem edema. Conduta: orientar sinais de alarme e retorno conforme necessidade clínica.',
    lang: 'pt'
  }
];
