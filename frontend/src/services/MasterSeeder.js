/**
 * TVUSVET Master Data Seeder V2
 *
 * Responsible for loading and upserting medical data from master_data_v2.json
 * Supports: Drugs, Templates, Lab References
 *
 * UPSERT Logic: Update if ID exists, Insert if new
 */

import masterDataV2 from '@/data/master_data_v2.json';

class MasterSeeder {
  constructor() {
    this.data = masterDataV2;
  }

  async seedAll(db) {
    console.log(`MasterSeeder: Starting V${this.data.version} data seeding...`);

    try {
      await this.seedDrugs(db);
      await this.seedTemplates(db);
      await this.seedLabReferences(db);

      console.log('MasterSeeder: All data seeded successfully');
      return { success: true };
    } catch (error) {
      console.error('MasterSeeder: Error during seeding:', error);
      return { success: false, error };
    }
  }

  async seedDrugs(db) {
    if (!this.data.drugs || this.data.drugs.length === 0) {
      console.log('MasterSeeder: No drugs to seed');
      return;
    }

    console.log(`MasterSeeder: Processing ${this.data.drugs.length} drugs...`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const drug of this.data.drugs) {
      try {
        const existing = await db.drugs.findOne(drug.id).exec();

        if (existing) {
          await existing.update({
            $set: {
              name: drug.name,
              type: drug.type,
              category: drug.category || 'Geral',
              default_dosage: drug.default_dosage || ''
            }
          });
          updated++;
        } else {
          await db.drugs.insert({
            id: drug.id,
            name: drug.name,
            type: drug.type,
            category: drug.category || 'Geral',
            default_dosage: drug.default_dosage || ''
          });
          inserted++;
        }
      } catch (error) {
        console.error(`MasterSeeder: Error processing drug ${drug.id}:`, error.message);
        errors++;
      }
    }

    console.log(`MasterSeeder: Drugs - Inserted: ${inserted}, Updated: ${updated}, Errors: ${errors}`);
  }

  async seedTemplates(db) {
    if (!this.data.templates || this.data.templates.length === 0) {
      console.log('MasterSeeder: No templates to seed');
      return;
    }

    console.log(`MasterSeeder: Processing ${this.data.templates.length} templates...`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const template of this.data.templates) {
      try {
        const existing = await db.templates.findOne(template.id).exec();

        if (existing) {
          await existing.update({
            $set: {
              title: template.title,
              text: template.text,
              organ: template.organ || '',
              lang: template.lang || 'pt',
              type: template.type,
              practice: template.practice
            }
          });
          updated++;
        } else {
          await db.templates.insert({
            id: template.id,
            title: template.title,
            text: template.text,
            organ: template.organ || '',
            lang: template.lang || 'pt',
            type: template.type,
            practice: template.practice
          });
          inserted++;
        }
      } catch (error) {
        console.error(`MasterSeeder: Error processing template ${template.id}:`, error.message);
        errors++;
      }
    }

    console.log(`MasterSeeder: Templates - Inserted: ${inserted}, Updated: ${updated}, Errors: ${errors}`);
  }

  async seedLabReferences(db) {
    if (!this.data.lab_references || this.data.lab_references.length === 0) {
      console.log('MasterSeeder: No lab references to seed');
      return;
    }

    console.log(`MasterSeeder: Processing ${this.data.lab_references.length} lab references...`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const ref of this.data.lab_references) {
      try {
        const existing = await db.reference_values.findOne(ref.id).exec();

        if (existing) {
          await existing.update({
            $set: {
              species: ref.species,
              organ: ref.organ,
              parameter: ref.parameter,
              min_value: ref.min,
              max_value: ref.max,
              unit: ref.unit
            }
          });
          updated++;
        } else {
          await db.reference_values.insert({
            id: ref.id,
            species: ref.species,
            organ: ref.organ,
            parameter: ref.parameter,
            min_value: ref.min,
            max_value: ref.max,
            unit: ref.unit
          });
          inserted++;
        }
      } catch (error) {
        console.error(`MasterSeeder: Error processing lab reference ${ref.id}:`, error.message);
        errors++;
      }
    }

    console.log(`MasterSeeder: Lab References - Inserted: ${inserted}, Updated: ${updated}, Errors: ${errors}`);
  }

  getVersion() {
    return this.data.version || 'unknown';
  }

  getDataSummary() {
    return {
      version: this.data.version,
      drugs: this.data.drugs?.length || 0,
      templates: this.data.templates?.length || 0,
      lab_references: this.data.lab_references?.length || 0
    };
  }
}

export const masterSeeder = new MasterSeeder();
