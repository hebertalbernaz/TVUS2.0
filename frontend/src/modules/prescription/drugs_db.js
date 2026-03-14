/**
 * TVUSVET V2.0 - Banco de Medicamentos Local (In-Memory)
 * 
 * Estrutura do objeto:
 * @typedef {Object} Drug
 * @property {string} id - Identificador único
 * @property {string} name - Nome comercial / princípio ativo
 * @property {'vet'|'human'|'both'} practice - Contexto de uso
 * @property {string} concentration - Concentração da apresentação (ex: '50mg/ml', '500mg')
 * @property {number} baseDose - Dose base numérica
 * @property {string} doseUnit - Unidade da dose (ex: 'mg/kg', 'mg')
 * @property {string} route - Via de administração (ex: 'VO', 'IV', 'SC', 'IM')
 * @property {string} frequency - Frequência de administração
 */

export const DRUG_DATABASE = [
  // ═══════════════════════════════════════════
  //  MEDICAMENTOS VETERINÁRIOS
  // ═══════════════════════════════════════════
  {
    id: 'vet-meloxicam',
    name: 'Meloxicam 2mg',
    practice: 'vet',
    concentration: '2mg/comp',
    baseDose: 0.1,
    doseUnit: 'mg/kg',
    route: 'VO',
    frequency: 'SID (24/24h)',
  },
  {
    id: 'vet-dipirona',
    name: 'Dipirona Sódica 500mg/ml',
    practice: 'vet',
    concentration: '500mg/ml',
    baseDose: 25,
    doseUnit: 'mg/kg',
    route: 'VO',
    frequency: 'TID (8/8h)',
  },
  {
    id: 'vet-cefalexina',
    name: 'Cefalexina 500mg',
    practice: 'vet',
    concentration: '500mg/comp',
    baseDose: 30,
    doseUnit: 'mg/kg',
    route: 'VO',
    frequency: 'BID (12/12h)',
  },
  {
    id: 'vet-prednisona',
    name: 'Prednisona 20mg',
    practice: 'vet',
    concentration: '20mg/comp',
    baseDose: 0.5,
    doseUnit: 'mg/kg',
    route: 'VO',
    frequency: 'SID (24/24h)',
  },
  {
    id: 'vet-ondansetrona',
    name: 'Ondansetrona 4mg',
    practice: 'vet',
    concentration: '4mg/comp',
    baseDose: 0.5,
    doseUnit: 'mg/kg',
    route: 'VO',
    frequency: 'BID (12/12h)',
  },
  {
    id: 'vet-tramadol',
    name: 'Tramadol 50mg',
    practice: 'vet',
    concentration: '50mg/comp',
    baseDose: 3,
    doseUnit: 'mg/kg',
    route: 'VO',
    frequency: 'TID (8/8h)',
  },
  {
    id: 'vet-doxiciclina',
    name: 'Doxiciclina 100mg',
    practice: 'vet',
    concentration: '100mg/comp',
    baseDose: 5,
    doseUnit: 'mg/kg',
    route: 'VO',
    frequency: 'BID (12/12h)',
  },
  {
    id: 'vet-gabapentina',
    name: 'Gabapentina 100mg',
    practice: 'vet',
    concentration: '100mg/caps',
    baseDose: 5,
    doseUnit: 'mg/kg',
    route: 'VO',
    frequency: 'BID (12/12h)',
  },

  // ═══════════════════════════════════════════
  //  MEDICAMENTOS HUMANOS
  // ═══════════════════════════════════════════
  {
    id: 'hum-ibuprofeno',
    name: 'Ibuprofeno 600mg',
    practice: 'human',
    concentration: '600mg/comp',
    baseDose: 600,
    doseUnit: 'mg',
    route: 'VO',
    frequency: 'TID (8/8h)',
  },
  {
    id: 'hum-amoxicilina',
    name: 'Amoxicilina 500mg',
    practice: 'human',
    concentration: '500mg/caps',
    baseDose: 500,
    doseUnit: 'mg',
    route: 'VO',
    frequency: 'TID (8/8h)',
  },
  {
    id: 'hum-omeprazol',
    name: 'Omeprazol 20mg',
    practice: 'human',
    concentration: '20mg/caps',
    baseDose: 20,
    doseUnit: 'mg',
    route: 'VO',
    frequency: 'SID (jejum)',
  },
  {
    id: 'hum-paracetamol',
    name: 'Paracetamol 750mg',
    practice: 'human',
    concentration: '750mg/comp',
    baseDose: 750,
    doseUnit: 'mg',
    route: 'VO',
    frequency: 'QID (6/6h)',
  },
  {
    id: 'hum-azitromicina',
    name: 'Azitromicina 500mg',
    practice: 'human',
    concentration: '500mg/comp',
    baseDose: 500,
    doseUnit: 'mg',
    route: 'VO',
    frequency: 'SID (24/24h)',
  },
  {
    id: 'hum-losartana',
    name: 'Losartana 50mg',
    practice: 'human',
    concentration: '50mg/comp',
    baseDose: 50,
    doseUnit: 'mg',
    route: 'VO',
    frequency: 'SID (24/24h)',
  },
  {
    id: 'hum-cetirizina',
    name: 'Cetirizina 10mg',
    practice: 'human',
    concentration: '10mg/comp',
    baseDose: 10,
    doseUnit: 'mg',
    route: 'VO',
    frequency: 'SID (24/24h)',
  },
  {
    id: 'hum-escopolamina',
    name: 'Escopolamina 10mg',
    practice: 'human',
    concentration: '10mg/comp',
    baseDose: 10,
    doseUnit: 'mg',
    route: 'VO',
    frequency: 'TID (8/8h)',
  },
];

/**
 * Filtra medicamentos por prática (vet/human).
 * Inclui medicamentos marcados como 'both'.
 */
export function getDrugsByPractice(practice) {
  return DRUG_DATABASE.filter(
    (d) => d.practice === practice || d.practice === 'both'
  );
}

/**
 * Busca medicamento por ID
 */
export function getDrugById(id) {
  return DRUG_DATABASE.find((d) => d.id === id) || null;
}
