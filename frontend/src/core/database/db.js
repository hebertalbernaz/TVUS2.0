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
  ProfileSchema, FinancialSchema, LabExamSchema        
} from './schemas';
import { initialDrugs, initialSettings, initialTemplates } from '../../config/seeds';
import { v4 as uuidv4 } from 'uuid';

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;

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
  console.log(`Database: Initializing RxDB tvusvet_db_v7 [Env: ${isDev ? 'DEV' : 'PROD'}]...`);

  const storage = isDev 
      ? wrappedValidateAjvStorage({ storage: getRxStorageDexie() }) 
      : getRxStorageDexie();

  const db = await createRxDatabase({
    name: 'tvusvet_db_v7', // BUMPED to V7 for Professional Ophthalmo
    storage: storage,
    ignoreDuplicate: true
  });

  // Create Collections with migration strategies for ALL versioned schemas
  await db.addCollections({
    patients: { 
        schema: PatientSchema,
        migrationStrategies: {
            1: returnSameDoc
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
    
    // Collections with version: 0 don't need migration strategies
    drugs: { schema: DrugSchema },
    prescriptions: { schema: PrescriptionSchema },
    templates: { schema: TemplateSchema },
    reference_values: { schema: ReferenceValueSchema },
    profiles: { schema: ProfileSchema },
    financial: { schema: FinancialSchema },
    lab_exams: { schema: LabExamSchema },
    
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

      const drugsCount = await db.drugs.count().exec();
      if (drugsCount === 0) {
         console.log('Seeding Drugs...');
         await db.drugs.bulkInsert(initialDrugs);
      }

      const templatesCount = await db.templates.count().exec();
      if (templatesCount === 0 && initialTemplates?.length > 0) {
          console.log('Seeding Templates...');
          await db.templates.bulkInsert(initialTemplates);
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
