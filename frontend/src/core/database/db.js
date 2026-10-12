import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';
import { 
  PatientSchema, SettingsSchema, DrugSchema, PrescriptionSchema, 
  ExamSchema, OphthalmoSchema, TemplateSchema, ReferenceValueSchema, 
  ProfileSchema, FinancialSchema, LabExamSchema, AnamnesisSchema        
} from './schemas';
import { initialDrugs, initialSettings, initialTemplates } from '../../config/seeds';
import { v4 as uuidv4 } from 'uuid';

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === undefined;

// Plugins
try {
    if (isDev) {
        addRxPlugin(RxDBDevModePlugin);
    }
    addRxPlugin(RxDBUpdatePlugin);
    addRxPlugin(RxDBQueryBuilderPlugin);
    addRxPlugin(RxDBLeaderElectionPlugin);
    addRxPlugin(RxDBMigrationPlugin);
} catch (e) {
    console.warn("Erro ao carregar plugins RxDB:", e);
}

// Generic Migration Strategy: Pass-through (keeps data as is)
const returnSameDoc = (oldDoc) => oldDoc;

const _create = async () => {
  console.log(`Database: Initializing RxDB tvusvet_db_v9 [Env: ${isDev ? 'DEV' : 'PROD'}]...`);

  const storage = isDev 
      ? wrappedValidateAjvStorage({ storage: getRxStorageDexie() }) 
      : getRxStorageDexie();

  // Hash function for Jest/Node.js environment
  const hashFunction = async (data) => {
    try {
      const crypto = require("crypto");
      return crypto.createHash("sha256").update(data).digest("hex");
    } catch (e) {
      // Fallback for browser environments
      return data;
    }
  };

  const db = await createRxDatabase({
    name: "tvusvet_db_v9", // Reset limpo para forçar atualização de seeds

    storage: storage,
    ignoreDuplicate: true,
    hashFunction: hashFunction
  });

  // Create Collections with migration strategies for ALL versioned schemas
  try {
    await db.addCollections({


      patients: { 
        schema: PatientSchema,
        migrationStrategies: {
            1: returnSameDoc,
            // v2 migration: inject scope for old records
            2: (oldDoc) => ({
              ...oldDoc,
              scope: oldDoc.scope || (oldDoc.practice === 'human' ? 'HUMAN' : 'VET')
            })
        }
    },
      settings: { 
        schema: SettingsSchema,
        migrationStrategies: {
            1: returnSameDoc,
            2: returnSameDoc
        }
    },
      exams: { 
        schema: ExamSchema,
        migrationStrategies: {
            1: returnSameDoc,
            2: returnSameDoc,
            3: returnSameDoc
        }
    },
    
    drugs: {
      schema: DrugSchema,
      migrationStrategies: {
        // v1 migration: add missing category for legacy seed entries
        1: (oldDoc) => ({
          ...oldDoc,
          category: oldDoc.category || 'Geral'
        })
      }
    },
      prescriptions: { schema: PrescriptionSchema },
      templates: { schema: TemplateSchema },
      reference_values: { schema: ReferenceValueSchema },
      profiles: { schema: ProfileSchema },
      financial: {
        schema: FinancialSchema,
        migrationStrategies: {
            // v1 migration: ensure pro cashflow fields exist for legacy entries
            1: (oldDoc) => ({
              ...oldDoc,
              status: 'paid',
              payment_method: 'cash',
              due_date: oldDoc.date ?? null,
              paid_at: oldDoc.date ?? null
            })
        }
    },
      lab_exams: { schema: LabExamSchema },
      anamnesis: { schema: AnamnesisSchema },
      
      // Ophthalmo with version: 1 needs migration
      ophthalmo: { 
        schema: OphthalmoSchema,
        migrationStrategies: {
            1: (oldDoc) => {
                // Migrate from old simple schema to new OD/OS structure
                return {
                    ...oldDoc,
                    right_eye: oldDoc.right_eye || {},
                    left_eye: oldDoc.left_eye || {},
                    general_diagnosis: oldDoc.diagnosis || '',
                    created_at: oldDoc.created_at || new Date().toISOString()
                };
            }
        }
    }
  });
  } catch (e) {
    // DB6 happens when IndexedDB already has the collection with a different schema version/shape.
    // This typically occurs after downgrades or local disk containing newer schema.
    console.error('RxDB addCollections() failed. Possible schema conflict (DB6).', e);

    if (isDev) {
      console.error(
        'DEV HINT: If you recently changed schema versions, you may need to clear the local IndexedDB (Application -> Storage -> IndexedDB) and reload. ' +
          'Prefer bumping schema versions + adding migrations over clearing data.'
      );
    }
    throw e;
  }


  await seedDatabase(db);
  console.log('Database: Ready.');
  return db;
};

const seedDatabase = async (db) => {
  try {
      const settingsDoc = await db.settings.findOne({ selector: { id: 'global_settings' } }).exec();
      if (!settingsDoc) {
        console.log('Seeding Settings...');
        await db.settings.insert(initialSettings);
      }

      // Se count de drugs for baixo, roda o bulkInsert(initialDrugs) novamente
      const drugsCount = await db.drugs.count().exec();
      if (drugsCount < 5) {
        try {
          await db.drugs.bulkInsert(initialDrugs);
        } catch (e) {
          // ignore duplicates
        }
      }

      // SMART SEED: Templates
      const templatesCount = await db.templates.count().exec();
      if (templatesCount < 3) {
          try {
            await db.templates.bulkInsert(initialTemplates);
          } catch (e) {
            // ignore duplicates
          }
      }
  } catch (e) {
      console.warn("Seed warning:", e);
  }
};

export const getDatabase = () => {
  if (window._tvusvet_db_promise) {
      return window._tvusvet_db_promise;
  }
  window._tvusvet_db_promise = _create().catch(err => {
      console.error("DB Init Failed:", err);
      throw err;
  });
  return window._tvusvet_db_promise;
};

export const genId = () => uuidv4();
