/**
 * TVUSVET V3.0 - Banco de dados local 100% offline-first (Dexie)
 *
 * Fundação de persistência sem nenhuma dependência de rede.
 * Todos os dados ficam no IndexedDB do dispositivo.
 *
 * As definições espelham os esquemas RxDB existentes (core/database/schemas.js)
 * para permitir migração gradual da camada de serviços sem alterar a UI.
 */

import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';

// ---------- Versão do esquema local ----------
// Bump a LOCAL_DB_VERSION e adicione um novo bloco .stores() no
// upgrades[] ao mudar tabelas/índices. Nunca reordene blocos antigos.
const LOCAL_DB_VERSION = 1;
const LOCAL_DB_NAME = 'tvusvet_local_db';

// ---------- Definições de tabelas ----------
// Convenção Dexie: 'id' é a chave-primária (primeira posição).
// Campos após id são índices de consulta; '[a+b]' = índice composto.

const TABLES = {
  // Pacientes (veterinários e humanos) - segregação por scope
  patients: 'id, scope, name, species, owner_name, created_at, updated_at, [scope+name]',

  // Exames de imagem (ultrassom, radiologia, TC, eco, fundo de olho etc.)
  exams: 'id, patient_id, exam_type, date, status, [patient_id+date]',

  // Prescrições
  prescriptions: 'id, patient_id, date, doctor_name, [patient_id+date]',

  // Templates de laudo (por órgão e idioma)
  templates: 'id, title, organ, lang, [organ+lang]',

  // Valores de referência (por espécie/órgão/parâmetro)
  reference_values: 'id, species, organ, parameter, [species+organ], [organ+parameter]'
};

class TVUSvetLocalDB extends Dexie {
  constructor() {
    super(LOCAL_DB_NAME);
    this.version(LOCAL_DB_VERSION).stores(TABLES);
  }
}

// ---------- Instância única (singleton por janela) ----------
export const localDb = new TVUSvetLocalDB();

// ---------- Geração de IDs ----------
export const genId = () => uuidv4();

// ---------- Helpers de busca para laudos ----------

/**
 * Busca textual em laudos (report_content + conclusion) de um paciente.
 * Texto integral não é indexável no Dexie; usa filter() sobre os exames do
 * paciente, que já vêm do índice patient_id — rápido o suficiente para o
 * volume por paciente e mantém o texto intacto no registro.
 */
export async function searchExamReports(patientId, term) {
  const needle = String(term || '').trim().toLowerCase();
  if (!needle) return [];
  return localDb.exams
    .where('patient_id')
    .equals(patientId)
    .filter((exam) => {
      const blob = `${exam.report_content || ''} ${exam.conclusion || ''}`.toLowerCase();
      return blob.includes(needle);
    })
    .toArray();
}

/**
 * Pacientes de um escopo ('VET' | 'HUMAN'), ordenados por nome.
 * Usa o índice composto [scope+name] para consulta indexada.
 */
export async function getPatientsByScope(scope) {
  return localDb.patients
    .where('[scope+name]')
    .between([scope, Dexie.minKey], [scope, Dexie.maxKey])
    .toArray();
}

/**
 * Últimos exames de um paciente (timeline/laudos), mais recentes primeiro.
 */
export async function getPatientExams(patientId, limit) {
  let q = localDb.exams
    .where('[patient_id+date]')
    .between([patientId, Dexie.minKey], [patientId, Dexie.maxKey])
    .reverse();
  if (limit) q = q.limit(limit);
  return q.toArray();
}

// ---------- Preparação do banco (abertura + seeds opcionais) ----------
let _readyPromise = null;

/**
 * Abre o banco e garante estrutura pronta para uso.
 * Idempotente: retorna a mesma promise em chamadas repetidas.
 * Nenhuma chamada de rede é feita - tudo é local.
 */
export function getLocalDb() {
  if (!_readyPromise) {
    _readyPromise = localDb.open().then((db) => {
      console.log(`LocalDB: pronto (Dexie ${LOCAL_DB_NAME} v${db.verno}).`);
      return db;
    });
  }
  return _readyPromise;
}
