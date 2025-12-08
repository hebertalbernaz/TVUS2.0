/**
 * TVUSVET V2.0 - Seed Data (Dados Iniciais)
 * Popula o banco com dados de teste e produção inicial
 */

export const initialSettings = {
  id: 'global_settings',
  practice_type: 'vet', // Default fallback
  active_modules: ['core', 'ultrasound', 'financial'], // Basic modules
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
    type: 'ultrasound',
    organ: 'Fígado',
    practice: 'vet',
    title: 'Fígado Normal',
    content: 'Fígado com dimensões preservadas, contornos regulares e bordas finas. Ecotextura homogênea e ecogenicidade preservada. Calibre dos vasos intra-hepáticos preservado.'
  },
  {
    id: 't_usg_spleen_normal',
    type: 'ultrasound',
    organ: 'Baço',
    practice: 'vet',
    title: 'Baço Normal',
    content: 'Baço com dimensões preservadas, contornos regulares e ecotextura homogênea característica.'
  },
  {
    id: 't_usg_thyroid_nodule',
    type: 'ultrasound',
    organ: 'Tireoide',
    practice: 'human',
    title: 'Nódulo Sólido (TI-RADS 4)',
    content: 'Presença de nódulo sólido, hipoecoico, com contornos irregulares, medindo 1.2 x 0.8 cm no lobo direito. Vascularização central ao Doppler.'
  }
];
