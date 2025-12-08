/**
 * TVUSVET V2.0 - Comprehensive Test Seeds (Mega-Seed)
 * Professional data for stress-testing UI and Reports
 * 
 * Categories:
 * - 20 Medications (10 Vet + 10 Human)
 * - 3 Professional Profiles
 * - 15 Report Templates
 * - Complete Hemogram Reference Values (Dog + Cat)
 * - 5 Financial Transactions
 */
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 1. MEDICATIONS (20 items)
// ============================================================================
export const testDrugs = [
  // --- VETERINARY DRUGS (10) - with mg/kg logic ---
  { 
    id: 'td_v01', 
    name: 'Doxiciclina 100mg', 
    type: 'vet', 
    default_dosage: '10mg/kg VO a cada 12h por 21 dias (Erliquiose)' 
  },
  { 
    id: 'td_v02', 
    name: 'Meloxicam 2mg', 
    type: 'vet', 
    default_dosage: '0.1mg/kg VO SID por 3-5 dias (AINE)' 
  },
  { 
    id: 'td_v03', 
    name: 'Dipirona 500mg/mL', 
    type: 'vet', 
    default_dosage: '25mg/kg VO/SC a cada 8h se febre ou dor' 
  },
  { 
    id: 'td_v04', 
    name: 'Prednisolona 20mg', 
    type: 'vet', 
    default_dosage: '0.5-2mg/kg VO SID (dose imunossupressora)' 
  },
  { 
    id: 'td_v05', 
    name: 'Enrofloxacina 50mg', 
    type: 'vet', 
    default_dosage: '5mg/kg VO SID por 7-14 dias' 
  },
  { 
    id: 'td_v06', 
    name: 'Omeprazol 20mg', 
    type: 'vet', 
    default_dosage: '1mg/kg VO SID em jejum' 
  },
  { 
    id: 'td_v07', 
    name: 'Metronidazol 250mg', 
    type: 'vet', 
    default_dosage: '15mg/kg VO a cada 12h por 7 dias (Giardia)' 
  },
  { 
    id: 'td_v08', 
    name: 'Cefalexina 500mg', 
    type: 'vet', 
    default_dosage: '22mg/kg VO a cada 12h por 14-21 dias' 
  },
  { 
    id: 'td_v09', 
    name: 'Tramadol 50mg', 
    type: 'vet', 
    default_dosage: '2-5mg/kg VO a cada 8h para dor' 
  },
  { 
    id: 'td_v10', 
    name: 'Furosemida 40mg', 
    type: 'vet', 
    default_dosage: '2-4mg/kg VO a cada 12h (ICC)' 
  },
  
  // --- HUMAN DRUGS (10) ---
  { 
    id: 'td_h01', 
    name: 'Dipirona Monoidratada 1g', 
    type: 'human', 
    default_dosage: '1 comprimido VO a cada 6h se dor ou febre' 
  },
  { 
    id: 'td_h02', 
    name: 'Amoxicilina + Clavulanato 875mg', 
    type: 'human', 
    default_dosage: '1 comprimido VO a cada 12h por 7-10 dias' 
  },
  { 
    id: 'td_h03', 
    name: 'Losartana Potássica 50mg', 
    type: 'human', 
    default_dosage: '1 comprimido VO pela manhã (uso contínuo - HAS)' 
  },
  { 
    id: 'td_h04', 
    name: 'Sinvastatina 20mg', 
    type: 'human', 
    default_dosage: '1 comprimido VO à noite (uso contínuo - Dislipidemia)' 
  },
  { 
    id: 'td_h05', 
    name: 'Omeprazol 20mg', 
    type: 'human', 
    default_dosage: '1 cápsula VO em jejum por 28 dias' 
  },
  { 
    id: 'td_h06', 
    name: 'Prednisona 20mg', 
    type: 'human', 
    default_dosage: '1 comprimido VO pela manhã por 5 dias, depois desmame' 
  },
  { 
    id: 'td_h07', 
    name: 'Azitromicina 500mg', 
    type: 'human', 
    default_dosage: '1 comprimido VO SID por 3 dias' 
  },
  { 
    id: 'td_h08', 
    name: 'Ibuprofeno 600mg', 
    type: 'human', 
    default_dosage: '1 comprimido VO a cada 8h após refeições se dor' 
  },
  { 
    id: 'td_h09', 
    name: 'Metformina 850mg', 
    type: 'human', 
    default_dosage: '1 comprimido VO após almoço e jantar (DM2)' 
  },
  { 
    id: 'td_h10', 
    name: 'Clonazepam 2mg', 
    type: 'human', 
    default_dosage: '1 comprimido VO à noite se insônia (uso controlado)' 
  }
];

// ============================================================================
// 2. PROFILES (3 clinics)
// ============================================================================
// Placeholder Base64 for logos (tiny 1x1 pixel transparent PNG)
const PLACEHOLDER_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const PLACEHOLDER_SIGNATURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const testProfiles = [
  {
    id: 'profile_vetcare24h',
    name: 'Vet Care 24h',
    clinic_name: 'Vet Care 24 Horas',
    clinic_address: 'Av. Paulista, 1000 - São Paulo/SP - CEP: 01310-100',
    veterinarian_name: 'Dr. Carlos Alberto Silva',
    crmv: 'CRMV-SP 12345',
    professional_email: 'contato@vetcare24h.com.br',
    professional_phone: '(11) 3333-4444',
    letterhead_path: PLACEHOLDER_LOGO,
    signature_path: PLACEHOLDER_SIGNATURE,
    letterhead_margins_mm: { top: 25, left: 15, right: 15, bottom: 20 }
  },
  {
    id: 'profile_oftalmo_vision',
    name: 'Clínica Oftalmo Vision',
    clinic_name: 'Oftalmo Vision - Centro de Oftalmologia Avançada',
    clinic_address: 'Rua Oscar Freire, 500 - Jardins - São Paulo/SP',
    veterinarian_name: 'Dra. Ana Paula Mendes',
    crmv: 'CRM-SP 98765',
    professional_email: 'dra.ana@oftalmovision.com.br',
    professional_phone: '(11) 2222-3333',
    letterhead_path: PLACEHOLDER_LOGO,
    signature_path: PLACEHOLDER_SIGNATURE,
    letterhead_margins_mm: { top: 30, left: 20, right: 20, bottom: 25 }
  },
  {
    id: 'profile_cardiovet',
    name: 'CardioVet Especialidades',
    clinic_name: 'CardioVet - Cardiologia Veterinária',
    clinic_address: 'Rua Harmonia, 200 - Vila Madalena - São Paulo/SP',
    veterinarian_name: 'Dr. Ricardo Ferreira',
    crmv: 'CRMV-SP 54321',
    professional_email: 'dr.ricardo@cardiovet.vet.br',
    professional_phone: '(11) 5555-6666',
    letterhead_path: PLACEHOLDER_LOGO,
    signature_path: PLACEHOLDER_SIGNATURE,
    letterhead_margins_mm: { top: 25, left: 15, right: 15, bottom: 20 }
  }
];

// ============================================================================
// 3. TEMPLATES (15 items)
// ============================================================================
export const testTemplates = [
  // --- ULTRASOUND TEMPLATES (5) ---
  {
    id: 'tpl_usg_liver_normal',
    organ: 'Fígado',
    title: 'Fígado - Normal',
    text: 'Fígado com dimensões preservadas, contornos regulares e bordas finas. Ecotextura homogênea e ecogenicidade normal em relação ao córtex renal direito. Calibre dos vasos intra-hepáticos e da veia cava preservados. Vesícula biliar de paredes finas e conteúdo anecóico.',
    lang: 'pt'
  },
  {
    id: 'tpl_usg_liver_hepatomegaly',
    organ: 'Fígado',
    title: 'Fígado - Hepatomegalia',
    text: 'Fígado com aumento difuso de suas dimensões e bordas arredondadas. Ecotextura homogênea, porém hiperecogênica em relação ao córtex renal, compatível com esteatose hepática/lipidose. Vesícula biliar distendida com conteúdo denso (lama biliar).',
    lang: 'pt'
  },
  {
    id: 'tpl_usg_spleen_normal',
    organ: 'Baço',
    title: 'Baço - Normal',
    text: 'Baço com dimensões, contornos e ecotextura preservados. Parênquima homogêneo e ecogenicidade característica. Não foram visualizadas massas ou nódulos.',
    lang: 'pt'
  },
  {
    id: 'tpl_usg_kidney_normal',
    organ: 'Rim',
    title: 'Rins - Normais',
    text: 'Rins em topografia habitual, com dimensões preservadas (esquerdo: 4.5cm; direito: 4.3cm). Relação corticomedular mantida. Pelves renais sem dilatação. Não foram visualizados cálculos ou massas.',
    lang: 'pt'
  },
  {
    id: 'tpl_usg_bladder_cystitis',
    organ: 'Bexiga',
    title: 'Bexiga - Cistite',
    text: 'Bexiga adequadamente repleta, com espessamento difuso de parede (0.4cm) e irregularidades na superfície mucosa. Sedimento ecogênico em suspensão. Achados compatíveis com cistite.',
    lang: 'pt'
  },
  
  // --- CARDIOLOGY TEMPLATES (5) ---
  {
    id: 'tpl_cardio_mitral_normal',
    organ: 'Valva Mitral',
    title: 'Valva Mitral - Normal',
    text: 'Valva mitral com folhetos de espessura e mobilidade normais. Sem prolapso ou regurgitação ao Doppler colorido. Área valvar preservada.',
    lang: 'pt'
  },
  {
    id: 'tpl_cardio_mitral_regurg',
    organ: 'Valva Mitral',
    title: 'Valva Mitral - Degeneração Mixomatosa',
    text: 'Valva mitral com espessamento de ambos os folhetos (degeneração mixomatosa). Prolapso do folheto septal para o átrio esquerdo durante a sístole. Regurgitação mitral moderada ao Doppler colorido, com jato central atingindo o terço médio do átrio esquerdo.',
    lang: 'pt'
  },
  {
    id: 'tpl_cardio_lv_function',
    organ: 'Ventrículo Esquerdo',
    title: 'Função VE - Normal',
    text: 'Ventrículo esquerdo com espessura parietal e dimensões internas normais. Contratilidade global e segmentar preservadas. Fração de Ejeção (Simpson): 65%. Fração de Encurtamento: 38%.',
    lang: 'pt'
  },
  {
    id: 'tpl_cardio_dcm',
    organ: 'Ventrículo Esquerdo',
    title: 'Cardiomiopatia Dilatada',
    text: 'Ventrículo esquerdo com dilatação importante (DIVEd: 55mm). Paredes finas com hipocinesia difusa. Fração de Ejeção reduzida: 28%. Átrio esquerdo dilatado (AE/Ao: 2.1). Achados compatíveis com Cardiomiopatia Dilatada.',
    lang: 'pt'
  },
  {
    id: 'tpl_cardio_pericardial',
    organ: 'Pericárdio',
    title: 'Derrame Pericárdico',
    text: 'Derrame pericárdico de moderado volume, circunferencial, com espessura máxima de 1.5cm posterior ao VE. Sem sinais de tamponamento cardíaco no momento do exame. Recomenda-se investigação etiológica.',
    lang: 'pt'
  },
  
  // --- OPHTHALMOLOGY TEMPLATES (5) ---
  {
    id: 'tpl_oftalmo_normal_fundus',
    organ: 'Fundoscopia',
    title: 'Fundoscopia - Normal',
    text: 'Disco óptico de coloração rósea, bordas nítidas, escavação fisiológica (E/D: 0.3). Mácula com reflexo foveal presente. Vasos retinianos com calibre e trajeto normais, relação A/V preservada. Retina aplicada em 360°, sem lesões.',
    lang: 'pt'
  },
  {
    id: 'tpl_oftalmo_cataract',
    organ: 'Cristalino',
    title: 'Catarata Senil',
    text: 'Cristalino com opacificação cortical e nuclear, de aspecto brunescente, compatível com catarata senil madura. Reflexo vermelho ausente. Não foi possível avaliar o segmento posterior devido à opacidade de meios.',
    lang: 'pt'
  },
  {
    id: 'tpl_oftalmo_glaucoma',
    organ: 'Disco Óptico',
    title: 'Glaucoma - Escavação Aumentada',
    text: 'Disco óptico com escavação aumentada (E/D: 0.8), assimétrica. Palidez do anel neurorretiniano em região temporal. Atrofia peripapilar presente. Achados suspeitos de neuropatia glaucomatosa.',
    lang: 'pt'
  },
  {
    id: 'tpl_oftalmo_diabetic_retinopathy',
    organ: 'Retina',
    title: 'Retinopatia Diabética',
    text: 'Múltiplos microaneurismas e hemorragias puntiformes nos quatro quadrantes. Exsudatos duros perimaculares. Edema macular clinicamente significativo. Achados compatíveis com Retinopatia Diabética Não-Proliferativa Moderada.',
    lang: 'pt'
  },
  {
    id: 'tpl_oftalmo_dry_eye',
    organ: 'Córnea',
    title: 'Ceratoconjuntivite Seca',
    text: 'Córnea com ponteado superficial difuso à fluoresceína. BUT reduzido (3 segundos). Teste de Schirmer: 5mm (ambos os olhos). Conjuntiva hiperemiada com secreção mucoide. Diagnóstico: Ceratoconjuntivite Seca (Olho Seco).',
    lang: 'pt'
  }
];

// ============================================================================
// 4. REFERENCE VALUES (Complete Hemogram for Dog & Cat)
// ============================================================================
export const testReferenceValues = [
  // --- DOG HEMOGRAM ---
  { id: 'ref_dog_rbc', species: 'dog', organ: 'Hemograma', parameter: 'Eritrócitos', min_value: 5.5, max_value: 8.5, unit: 'x10⁶/µL', size: 'all' },
  { id: 'ref_dog_hb', species: 'dog', organ: 'Hemograma', parameter: 'Hemoglobina', min_value: 12.0, max_value: 18.0, unit: 'g/dL', size: 'all' },
  { id: 'ref_dog_ht', species: 'dog', organ: 'Hemograma', parameter: 'Hematócrito', min_value: 37, max_value: 55, unit: '%', size: 'all' },
  { id: 'ref_dog_vcm', species: 'dog', organ: 'Hemograma', parameter: 'VCM', min_value: 60, max_value: 74, unit: 'fL', size: 'all' },
  { id: 'ref_dog_hcm', species: 'dog', organ: 'Hemograma', parameter: 'HCM', min_value: 19.5, max_value: 24.5, unit: 'pg', size: 'all' },
  { id: 'ref_dog_chcm', species: 'dog', organ: 'Hemograma', parameter: 'CHCM', min_value: 32, max_value: 36, unit: 'g/dL', size: 'all' },
  { id: 'ref_dog_wbc', species: 'dog', organ: 'Hemograma', parameter: 'Leucócitos Totais', min_value: 6000, max_value: 17000, unit: '/µL', size: 'all' },
  { id: 'ref_dog_neut', species: 'dog', organ: 'Hemograma', parameter: 'Neutrófilos Segmentados', min_value: 3000, max_value: 11500, unit: '/µL', size: 'all' },
  { id: 'ref_dog_lymph', species: 'dog', organ: 'Hemograma', parameter: 'Linfócitos', min_value: 1000, max_value: 4800, unit: '/µL', size: 'all' },
  { id: 'ref_dog_mono', species: 'dog', organ: 'Hemograma', parameter: 'Monócitos', min_value: 150, max_value: 1350, unit: '/µL', size: 'all' },
  { id: 'ref_dog_eos', species: 'dog', organ: 'Hemograma', parameter: 'Eosinófilos', min_value: 100, max_value: 1250, unit: '/µL', size: 'all' },
  { id: 'ref_dog_plt', species: 'dog', organ: 'Hemograma', parameter: 'Plaquetas', min_value: 175000, max_value: 500000, unit: '/µL', size: 'all' },
  
  // --- CAT HEMOGRAM ---
  { id: 'ref_cat_rbc', species: 'cat', organ: 'Hemograma', parameter: 'Eritrócitos', min_value: 5.0, max_value: 10.0, unit: 'x10⁶/µL', size: 'all' },
  { id: 'ref_cat_hb', species: 'cat', organ: 'Hemograma', parameter: 'Hemoglobina', min_value: 8.0, max_value: 15.0, unit: 'g/dL', size: 'all' },
  { id: 'ref_cat_ht', species: 'cat', organ: 'Hemograma', parameter: 'Hematócrito', min_value: 30, max_value: 45, unit: '%', size: 'all' },
  { id: 'ref_cat_vcm', species: 'cat', organ: 'Hemograma', parameter: 'VCM', min_value: 39, max_value: 55, unit: 'fL', size: 'all' },
  { id: 'ref_cat_hcm', species: 'cat', organ: 'Hemograma', parameter: 'HCM', min_value: 12.5, max_value: 17.5, unit: 'pg', size: 'all' },
  { id: 'ref_cat_chcm', species: 'cat', organ: 'Hemograma', parameter: 'CHCM', min_value: 30, max_value: 36, unit: 'g/dL', size: 'all' },
  { id: 'ref_cat_wbc', species: 'cat', organ: 'Hemograma', parameter: 'Leucócitos Totais', min_value: 5500, max_value: 19500, unit: '/µL', size: 'all' },
  { id: 'ref_cat_neut', species: 'cat', organ: 'Hemograma', parameter: 'Neutrófilos Segmentados', min_value: 2500, max_value: 12500, unit: '/µL', size: 'all' },
  { id: 'ref_cat_lymph', species: 'cat', organ: 'Hemograma', parameter: 'Linfócitos', min_value: 1500, max_value: 7000, unit: '/µL', size: 'all' },
  { id: 'ref_cat_mono', species: 'cat', organ: 'Hemograma', parameter: 'Monócitos', min_value: 0, max_value: 850, unit: '/µL', size: 'all' },
  { id: 'ref_cat_eos', species: 'cat', organ: 'Hemograma', parameter: 'Eosinófilos', min_value: 0, max_value: 1500, unit: '/µL', size: 'all' },
  { id: 'ref_cat_plt', species: 'cat', organ: 'Hemograma', parameter: 'Plaquetas', min_value: 175000, max_value: 500000, unit: '/µL', size: 'all' }
];

// ============================================================================
// 5. FINANCIAL TRANSACTIONS (5 items)
// ============================================================================
export const testFinancialTransactions = [
  // Incomes (3)
  {
    id: 'fin_inc_01',
    type: 'income',
    category: 'Consulta',
    amount: 180.00,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    description: 'Consulta de rotina - Rex (Labrador)',
    patient_id: null
  },
  {
    id: 'fin_inc_02',
    type: 'income',
    category: 'Exame',
    amount: 350.00,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    description: 'Ultrassom Abdominal - Mia (SRD)',
    patient_id: null
  },
  {
    id: 'fin_inc_03',
    type: 'income',
    category: 'Cirurgia',
    amount: 1200.00,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    description: 'Castração eletiva - Thor (Golden)',
    patient_id: null
  },
  // Expenses (2)
  {
    id: 'fin_exp_01',
    type: 'expense',
    category: 'Fornecedor',
    amount: 850.00,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    description: 'Reposição de medicamentos - Distribuidora Vet',
    patient_id: null
  },
  {
    id: 'fin_exp_02',
    type: 'expense',
    category: 'Material',
    amount: 320.00,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    description: 'Material descartável (luvas, seringas)',
    patient_id: null
  }
];

// ============================================================================
// 6. TEST PATIENTS (for quick testing)
// ============================================================================
export const testPatients = [
  // Veterinary Patients
  {
    id: 'test_pat_v01',
    name: 'Rex',
    species: 'dog',
    breed: 'Labrador Retriever',
    size: 'large',
    owner_name: 'João da Silva',
    ownerPhone: '(11) 99999-1111',
    birth_year: '2019',
    weight: 32.5,
    sex: 'M',
    is_neutered: true,
    practice: 'vet',
    created_at: new Date().toISOString()
  },
  {
    id: 'test_pat_v02',
    name: 'Mia',
    species: 'cat',
    breed: 'SRD',
    size: 'small',
    owner_name: 'Maria Santos',
    ownerPhone: '(11) 99999-2222',
    birth_year: '2021',
    weight: 4.2,
    sex: 'F',
    is_neutered: true,
    practice: 'vet',
    created_at: new Date().toISOString()
  },
  {
    id: 'test_pat_v03',
    name: 'Thor',
    species: 'dog',
    breed: 'Golden Retriever',
    size: 'large',
    owner_name: 'Pedro Oliveira',
    ownerPhone: '(11) 99999-3333',
    birth_year: '2020',
    weight: 35.0,
    sex: 'M',
    is_neutered: false,
    practice: 'vet',
    created_at: new Date().toISOString()
  },
  // Human Patients
  {
    id: 'test_pat_h01',
    name: 'Carlos Eduardo Mendes',
    species: 'human',
    breed: '',
    size: '',
    owner_name: '',
    ownerPhone: '(11) 98888-1111',
    document: '123.456.789-00',
    birth_year: '1975',
    weight: 82,
    sex: 'M',
    practice: 'human',
    created_at: new Date().toISOString()
  },
  {
    id: 'test_pat_h02',
    name: 'Ana Beatriz Costa',
    species: 'human',
    breed: '',
    size: '',
    owner_name: '',
    ownerPhone: '(11) 98888-2222',
    document: '987.654.321-00',
    birth_year: '1988',
    weight: 65,
    sex: 'F',
    practice: 'human',
    created_at: new Date().toISOString()
  }
];

// ============================================================================
// HELPER: Get all seed data
// ============================================================================
export const getAllTestSeeds = () => ({
  drugs: testDrugs,
  profiles: testProfiles,
  templates: testTemplates,
  referenceValues: testReferenceValues,
  financialTransactions: testFinancialTransactions,
  patients: testPatients
});

// Summary for logging
export const getTestSeedsSummary = () => ({
  drugs: testDrugs.length,
  profiles: testProfiles.length,
  templates: testTemplates.length,
  referenceValues: testReferenceValues.length,
  financialTransactions: testFinancialTransactions.length,
  patients: testPatients.length,
  total: testDrugs.length + testProfiles.length + testTemplates.length + 
         testReferenceValues.length + testFinancialTransactions.length + testPatients.length
});
