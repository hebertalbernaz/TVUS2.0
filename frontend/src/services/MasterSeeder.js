/**
 * TVUSVET Master Data Seeder V2.1
 *
 * Responsible for loading and upserting medical data from master_data_v2.json
 * Supports: Drugs, Templates, Lab References
 *
 * UPSERT Logic: Update if ID exists, Insert if new
 * Returns stats for toast notifications
 */

import masterDataV2 from '@/data/master_data_v2.json';

class MasterSeeder {
  constructor() {
    this.data = masterDataV2;
  }

  async seedAll(db) {
    console.log(`MasterSeeder: Starting V${this.data.version} data seeding...`);

    const stats = {
      drugs: { inserted: 0, updated: 0, errors: 0 },
      templates: { inserted: 0, updated: 0, errors: 0 },
      lab_references: { inserted: 0, updated: 0, errors: 0 },
      totalInserted: 0,
      totalUpdated: 0
    };

    try {
      const drugStats = await this.seedDrugs(db);
      const templateStats = await this.seedTemplates(db);
      const labStats = await this.seedLabReferences(db);

      stats.drugs = drugStats;
      stats.templates = templateStats;
      stats.lab_references = labStats;
      stats.totalInserted = drugStats.inserted + templateStats.inserted + labStats.inserted;
      stats.totalUpdated = drugStats.updated + templateStats.updated + labStats.updated;

      console.log('MasterSeeder: All data seeded successfully');
      console.log(`MasterSeeder: Total - Inserted: ${stats.totalInserted}, Updated: ${stats.totalUpdated}`);

      return { success: true, stats };
    } catch (error) {
      console.error('MasterSeeder: Error during seeding:', error);
      return { success: false, error, stats };
    }
  }

  async seedDrugs(db) {
    const stats = { inserted: 0, updated: 0, errors: 0 };

    if (!this.data.drugs || this.data.drugs.length === 0) {
      console.log('MasterSeeder: No drugs to seed');
      return stats;
    }

    console.log(`MasterSeeder: Processing ${this.data.drugs.length} drugs...`);

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
          stats.updated++;
        } else {
          await db.drugs.insert({
            id: drug.id,
            name: drug.name,
            type: drug.type,
            category: drug.category || 'Geral',
            default_dosage: drug.default_dosage || ''
          });
          stats.inserted++;
        }
      } catch (error) {
        console.error(`MasterSeeder: Error processing drug ${drug.id}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`MasterSeeder: Drugs - Inserted: ${stats.inserted}, Updated: ${stats.updated}, Errors: ${stats.errors}`);
    return stats;
  }

  async seedTemplates(db) {
    const stats = { inserted: 0, updated: 0, errors: 0 };

    if (!this.data.templates || this.data.templates.length === 0) {
      console.log('MasterSeeder: No templates to seed');
      return stats;
    }

    console.log(`MasterSeeder: Processing ${this.data.templates.length} templates...`);

    for (const template of this.data.templates) {
      try {
        const existing = await db.templates.findOne(template.id).exec();

        if (existing) {
          await existing.update({
            $set: {
              title: template.title,
              text: template.text,
              organ: template.organ || '',
              lang: template.lang || 'pt'
            }
          });
          stats.updated++;
        } else {
          await db.templates.insert({
            id: template.id,
            title: template.title,
            text: template.text,
            organ: template.organ || '',
            lang: template.lang || 'pt'
          });
          stats.inserted++;
        }
      } catch (error) {
        console.error(`MasterSeeder: Error processing template ${template.id}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`MasterSeeder: Templates - Inserted: ${stats.inserted}, Updated: ${stats.updated}, Errors: ${stats.errors}`);
    return stats;
  }

  async seedLabReferences(db) {
    const stats = { inserted: 0, updated: 0, errors: 0 };

    if (!this.data.lab_references || this.data.lab_references.length === 0) {
      console.log('MasterSeeder: No lab references to seed');
      return stats;
    }

    console.log(`MasterSeeder: Processing ${this.data.lab_references.length} lab references...`);

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
          stats.updated++;
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
          stats.inserted++;
        }
      } catch (error) {
        console.error(`MasterSeeder: Error processing lab reference ${ref.id}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`MasterSeeder: Lab References - Inserted: ${stats.inserted}, Updated: ${stats.updated}, Errors: ${stats.errors}`);
    return stats;
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
