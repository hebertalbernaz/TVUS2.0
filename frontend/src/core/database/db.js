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
  ProfileSchema, FinancialSchema, LabExamSchema, AnamnesisSchema,
  ClinicalDocumentSchema
} from './schemas';
import { initialDrugs, initialSettings, initialTemplates } from '../../config/seeds';
import { masterSeeder } from '../../services/MasterSeeder';
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

  let db;
  try {
    db = await createRxDatabase({
      name: "tvusvet_db_v9",
      storage: storage,
      ignoreDuplicate: true,
      hashFunction: hashFunction
    });
  } catch (createError) {
    console.error('Database creation failed:', createError);

    if (isDev && createError.message.includes('different schema')) {
      console.error(
        '⚠️ SCHEMA VERSION CONFLICT DETECTED\n' +
        'Your IndexedDB has a different schema version than the code expects.\n' +
        'Solutions:\n' +
        '  1. Clear IndexedDB: DevTools → Application → Storage → IndexedDB → Delete "tvusvet_db_v9"\n' +
        '  2. Bump schema version in schemas.js and add migration strategy\n' +
        '  3. Use a different database name (db.js line 54)\n'
      );
    }
    throw createError;
  }

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
            3: returnSameDoc,
            4: returnSameDoc // v4: Added maxLength to patient_id
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
      prescriptions: {
        schema: PrescriptionSchema,
        migrationStrategies: {
            1: returnSameDoc // v1: Added maxLength to patient_id
        }
      },
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
            }),
            2: returnSameDoc // v2: Added maxLength to patient_id
        }
    },
      lab_exams: {
        schema: LabExamSchema,
        migrationStrategies: {
            1: returnSameDoc // v1: Added maxLength to patient_id
        }
      },
      anamnesis: {
        schema: AnamnesisSchema,
        migrationStrategies: {
          1: (oldDoc) => ({
            ...oldDoc,
            chief_complaint: oldDoc.chief_complaint || oldDoc.main_complaint || '',
            history_current_illness: oldDoc.history_current_illness || oldDoc.history || '',
            physiological_data: oldDoc.physiological_data || oldDoc.general_data || {},
            systems_review: oldDoc.systems_review || {},
            physical_exam: oldDoc.physical_exam || {},
            diagnosis_hypothesis: oldDoc.diagnosis_hypothesis || (oldDoc.diagnosis ? [oldDoc.diagnosis] : []),
            treatment_plan: oldDoc.treatment_plan || oldDoc.conduct || '',
            status: oldDoc.status || 'finalized',
            created_at: oldDoc.created_at || oldDoc.date,
            updated_at: oldDoc.updated_at || new Date().toISOString()
          }),
          2: returnSameDoc // v2: Added maxLength to patient_id for index compliance
        }
      },
      clinical_documents: {
        schema: ClinicalDocumentSchema,
        migrationStrategies: {
            1: returnSameDoc // v1: Added maxLength to patient_id
        }
      },

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
            },
            2: returnSameDoc // v2: Added maxLength to patient_id
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


  const seedResult = await seedDatabase(db);
  console.log('Database: Ready.');
  return { db, seedResult };
};

const seedDatabase = async (db) => {
  console.log('Database: Checking if seeding is needed...');

  try {
    // SETTINGS - Insert only if exactly 'global_settings' doesn't exist
    const settingsDoc = await db.settings.findOne({
      selector: { id: 'global_settings' }
    }).exec();

    if (!settingsDoc) {
      console.log('Database: Seeding settings...');
      try {
        await db.settings.insert(initialSettings);
        console.log('Database: Settings seeded successfully');
      } catch (insertError) {
        if (insertError.code === 'CONFLICT' || insertError.code === 409) {
          console.log('Database: Settings already exist (conflict ignored)');
        } else {
          console.warn('Database: Settings insert failed:', insertError.message);
        }
      }
    } else {
      console.log('Database: Settings already exist, skipping');
    }

    // MASTER DATA V2 - Use MasterSeeder for upsert-capable seeding
    console.log(`Database: Loading Master Data V${masterSeeder.getVersion()}...`);
    const summary = masterSeeder.getDataSummary();
    console.log('Database: Master Data Summary:', summary);

    const seedResult = await masterSeeder.seedAll(db);

    console.log('Database: Seeding check completed');
    return seedResult;
  } catch (seedError) {
    console.error("Database: Seeding error:", seedError);
    return { success: false, error: seedError };
  }
};

// Cache for seed result (used by App.js for toast notification)
let _lastSeedResult = null;

export const getDatabase = () => {
  if (window._tvusvet_db_promise) {
      return window._tvusvet_db_promise;
  }
  // _create returns { db, seedResult }; unwrap so consumers always get the raw RxDB instance
  window._tvusvet_db_promise = _create().then(result => {
      _lastSeedResult = result.seedResult;
      return result.db;
  }).catch(err => {
      console.error("DB Init Failed:", err);
      throw err;
  });
  return window._tvusvet_db_promise;
};

export const getLastSeedResult = () => _lastSeedResult;

export const genId = () => uuidv4();

/**
 * EMERGENCY RESET FUNCTION
 * Exposed globally for critical recovery scenarios
 * Usage: Open browser console and type: window.resetDB()
 */
if (typeof window !== 'undefined') {
  window.resetDB = async () => {
    console.warn('🚨 EMERGENCY DATABASE RESET INITIATED');

    if (!window.confirm(
      '⚠️ EMERGENCY DATABASE RESET ⚠️\n\n' +
      'This will COMPLETELY DESTROY the database and reload the page.\n' +
      'ALL DATA WILL BE LOST (patients, exams, financial records, everything).\n\n' +
      'This should only be used for:\n' +
      '- Corrupted database\n' +
      '- Schema version conflicts\n' +
      '- Data stuck or not loading\n\n' +
      'Type OK to proceed with destruction.'
    )) {
      console.log('Reset cancelled by user');
      return;
    }

    try {
      console.log('Destroying database...');

      // Get and destroy RxDB instance
      const db = await getDatabase();
      await db.destroy();
      console.log('RxDB instance destroyed');

      // Clear promise cache
      delete window._tvusvet_db_promise;

      // Delete IndexedDB database
      if (window.indexedDB) {
        await new Promise((resolve, reject) => {
          const deleteRequest = window.indexedDB.deleteDatabase('tvusvet_db_v9');
          deleteRequest.onsuccess = () => {
            console.log('IndexedDB deleted successfully');
            resolve();
          };
          deleteRequest.onerror = (err) => {
            console.error('IndexedDB deletion error:', err);
            resolve(); // Continue anyway
          };
        });
      }

      console.log('✅ Database completely destroyed. Reloading page...');
      alert('Database destroyed successfully. Page will reload now.');

      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('❌ Emergency reset failed:', error);
      alert(
        'Emergency reset failed: ' + error.message + '\n\n' +
        'Manual reset required:\n' +
        '1. Open DevTools (F12)\n' +
        '2. Go to Application → Storage → IndexedDB\n' +
        '3. Delete "tvusvet_db_v9"\n' +
        '4. Reload page'
      );
    }
  };

  console.log('💡 Emergency reset available: window.resetDB()');
}
