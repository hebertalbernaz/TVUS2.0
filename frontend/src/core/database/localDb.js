/**
 * TVUSVET V3.0 - Banco de dados local 100% offline-first (Dexie)
 *
 * Toda a persistência do app vive no IndexedDB do dispositivo.
 * Nenhuma chamada de rede é feita por este módulo.
 *
 * Convenções:
 * - 'id' (primeira posição) é a chave-primária de todas as tabelas.
 * - Campos seguintes são índices; '[a+b]' é índice composto.
 * - Para mudar tabelas/índices: bump LOCAL_DB_VERSION e adicione um
 *   novo this.version(N).stores({...}) no construtor. Nunca altere
 *   blocos de versão já publicados.
 */

import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { initialDrugs, initialSettings, initialTemplates } from '../../config/seeds';
import { ULTRASOUND_TEMPLATES, ULTRASOUND_REFERENCE_VALUES, BUILTIN_SEED_VERSION } from '../../config/ultrasound_templates';

const LOCAL_DB_NAME = 'tvusvet_local_db';

class TVUSvetLocalDB extends Dexie {
  constructor() {
    super(LOCAL_DB_NAME);

    // v1 - estrutura inicial completa do app
    this.version(1).stores({
      // Pacientes (veterinários e humanos) - segregação por scope
      patients: 'id, scope, name, species, owner_name, created_at, updated_at, [scope+name]',

      // Exames de imagem (ultrassom, radiologia, TC, eco etc.)
      exams: 'id, patient_id, exam_type, date, status, [patient_id+date]',

      // Prescrições
      prescriptions: 'id, patient_id, date, doctor_name, [patient_id+date]',

      // Templates de laudo (por órgão e idioma)
      templates: 'id, title, organ, lang, [organ+lang]',

      // Valores de referência (espécie/órgão/parâmetro)
      reference_values: 'id, species, organ, parameter, [species+organ], [organ+parameter]',

      // Configurações globais (registro único 'global_settings')
      settings: 'id',

      // Banco de medicamentos
      drugs: 'id, name, type, category, [type+name]',

      // Perfis profissionais (identidade do clínico)
      profiles: 'id, name',

      // Financeiro (fluxo de caixa)
      financial: 'id, type, status, category, patient_id, date, due_date',

      // Exames laboratoriais
      lab_exams: 'id, patient_id, exam_type, date, status, patient_name',

      // Anamnese (PEP)
      anamnesis: 'id, patient_id, date, type',

      // Exames oftalmológicos (humanos)
      ophthalmo: 'id, patient_id, patient_name, date, status',

      // Usuários locais (login offline)
      app_users: 'id, email'
    });

    // v2 - arquivos binários (DICOM / imagens originais) como Blob
    this.version(2).stores({
      media: 'id, exam_id, mimeType, created_at'
    });
  }
}

// ---------- Instância única ----------
export const localDb = new TVUSvetLocalDB();

// ---------- Geração de IDs ----------
export const genId = () => uuidv4();

// ---------- Seeds (executa 1x na criação do banco) ----------
localDb.on('populate', (tx) => {
  tx.table('settings').bulkPut([initialSettings]);
  tx.table('drugs').bulkPut(initialDrugs);
  tx.table('templates').bulkPut(initialTemplates);
});

// ---------- Preparação do banco ----------
let _readyPromise = null;

// Pede ao navegador para não apagar o IndexedDB sob pressão de espaço.
export async function requestPersistentStorage() {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

// Registra textos guia e referências do ultrassom uma vez por versão, sem sobrescrever edições do usuário.
export async function seedBuiltins(db = localDb) {
  const settings = await db.settings.get('global_settings');
  if ((settings?.builtin_seed_version || 0) >= BUILTIN_SEED_VERSION) return;
  await db.transaction('rw', db.templates, db.reference_values, db.settings, async () => {
    for (const [table, rows] of [[db.templates, ULTRASOUND_TEMPLATES], [db.reference_values, ULTRASOUND_REFERENCE_VALUES]]) {
      const existing = new Set(await table.bulkGet(rows.map((r) => r.id)).then((l) => l.filter(Boolean).map((r) => r.id)));
      const missing = rows.filter((r) => !existing.has(r.id));
      if (missing.length) await table.bulkAdd(missing);
    }
    await db.settings.update('global_settings', { builtin_seed_version: BUILTIN_SEED_VERSION });
  });
}

/**
 * Abre o banco e garante estrutura pronta. Idempotente.
 * Também re-aplica seeds essenciais (idempotente via bulkPut).
 */
export function getLocalDb() {
  if (!_readyPromise) {
    _readyPromise = localDb.open().then(async (db) => {
      // Garante settings mesmo em bancos já existentes sem populate
      const settingsCount = await db.settings.count();
      if (settingsCount === 0) {
        await db.settings.put(initialSettings);
      }
      await seedBuiltins(db);
      requestPersistentStorage();
      console.log(`LocalDB: pronto (Dexie ${LOCAL_DB_NAME} v${db.verno}).`);
      return db;
    });
  }
  return _readyPromise;
}

// ---------- Arquivos de mídia (Blob) ----------

export async function saveMediaBlob(examId, blob, filename) {
  const record = {
    id: genId(),
    exam_id: examId,
    filename,
    mimeType: blob.type || 'application/octet-stream',
    size: blob.size,
    blob,
    created_at: new Date().toISOString()
  };
  await localDb.media.put(record);
  return record;
}

export async function getMediaDataUrl(mediaId) {
  const rec = mediaId ? await localDb.media.get(mediaId) : null;
  if (!rec) return null;
  const bytes = new Uint8Array(await rec.blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return `data:${rec.mimeType || 'application/octet-stream'};base64,${btoa(bin)}`;
}

// ---------- Helpers de consulta para laudos ----------

/**
 * Busca textual em laudos (report_content + conclusion) de um paciente.
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