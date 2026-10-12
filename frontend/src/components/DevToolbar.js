import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Database, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { localDb, getLocalDb } from '@/core/database/localDb';
import { 
  testDrugs, 
  testProfiles, 
  testTemplates, 
  testReferenceValues, 
  testFinancialTransactions,
  testPatients,
  getTestSeedsSummary 
} from '@/config/test_seeds_v2';
import { toast } from 'sonner';

/**
 * DevToolbar - Developer utilities for testing
 * Includes:
 * - One-click database seeding
 * - Database stats
 * - Clear test data option
 */
export function DevToolbar() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [dbStats, setDbStats] = useState(null);

  /**
   * Populate database with comprehensive test data
   */
  const handlePopulateDB = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    
    try {
      await getLocalDb();
      const results = {
        drugs: { inserted: 0, skipped: 0 },
        profiles: { inserted: 0, skipped: 0 },
        templates: { inserted: 0, skipped: 0 },
        referenceValues: { inserted: 0, skipped: 0 },
        financial: { inserted: 0, skipped: 0 },
        patients: { inserted: 0, skipped: 0 }
      };

      // 1. Insert Drugs (check for duplicates)
      for (const drug of testDrugs) {
        const existing = await localDb.drugs.get(drug.id);
        if (!existing) {
          await localDb.drugs.add(drug);
          results.drugs.inserted++;
        } else {
          results.drugs.skipped++;
        }
      }

      // 2. Insert Profiles
      for (const profile of testProfiles) {
        const existing = await localDb.profiles.get(profile.id);
        if (!existing) {
          await localDb.profiles.add(profile);
          results.profiles.inserted++;
        } else {
          results.profiles.skipped++;
        }
      }

      // 3. Insert Templates
      for (const template of testTemplates) {
        const existing = await localDb.templates.get(template.id);
        if (!existing) {
          await localDb.templates.add(template);
          results.templates.inserted++;
        } else {
          results.templates.skipped++;
        }
      }

      // 4. Insert Reference Values
      for (const refVal of testReferenceValues) {
        const existing = await localDb.reference_values.get(refVal.id);
        if (!existing) {
          await localDb.reference_values.add(refVal);
          results.referenceValues.inserted++;
        } else {
          results.referenceValues.skipped++;
        }
      }

      // 5. Insert Financial Transactions
      for (const trans of testFinancialTransactions) {
        const existing = await localDb.financial.get(trans.id);
        if (!existing) {
          await localDb.financial.add(trans);
          results.financial.inserted++;
        } else {
          results.financial.skipped++;
        }
      }

      // 6. Insert Test Patients
      for (const patient of testPatients) {
        const existing = await localDb.patients.get(patient.id);
        if (!existing) {
          await localDb.patients.add(patient);
          results.patients.inserted++;
        } else {
          results.patients.skipped++;
        }
      }

      setSeedResult(results);
      
      const totalInserted = Object.values(results).reduce((sum, r) => sum + r.inserted, 0);
      const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0);
      
      if (totalInserted > 0) {
        toast.success(`DB Populated! ${totalInserted} items inserted, ${totalSkipped} skipped (duplicates)`);
      } else {
        toast.info('All test data already exists in database');
      }

      // Update stats after seeding
      await loadDBStats();

    } catch (error) {
      console.error('Seeding error:', error);
      toast.error('Error populating database: ' + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  /**
   * Load current database statistics
   */
  const loadDBStats = async () => {
    try {
      await getLocalDb();
      const stats = {
        patients: await localDb.patients.count(),
        drugs: await localDb.drugs.count(),
        templates: await localDb.templates.count(),
        profiles: await localDb.profiles.count(),
        financial: await localDb.financial.count(),
        exams: await localDb.exams.count()
      };
      setDbStats(stats);
    } catch (e) {
      console.error('Stats error:', e);
    }
  };

  /**
   * Clear only test data (items with test IDs)
   */
  const handleClearTestData = async () => {
    if (!window.confirm('Clear ALL test data? This will remove items with test IDs (td_, tpl_, ref_, fin_, test_pat_).')) {
      return;
    }

    try {
      await getLocalDb();
      let removed = 0;

      // Remove test drugs
      const testDrugDocs = await localDb.drugs.filter((d) => d.id.startsWith('td_')).toArray();
      for (const doc of testDrugDocs) {
        await localDb.drugs.delete(doc.id);
        removed++;
      }

      // Remove test templates
      const testTplDocs = await localDb.templates.filter((d) => d.id.startsWith('tpl_')).toArray();
      for (const doc of testTplDocs) {
        await localDb.templates.delete(doc.id);
        removed++;
      }

      // Remove test profiles
      const testProfileDocs = await localDb.profiles.filter((d) => d.id.startsWith('profile_')).toArray();
      for (const doc of testProfileDocs) {
        await localDb.profiles.delete(doc.id);
        removed++;
      }

      // Remove test reference values
      const testRefDocs = await localDb.reference_values.filter((d) => d.id.startsWith('ref_')).toArray();
      for (const doc of testRefDocs) {
        await localDb.reference_values.delete(doc.id);
        removed++;
      }

      // Remove test financial
      const testFinDocs = await localDb.financial.filter((d) => d.id.startsWith('fin_')).toArray();
      for (const doc of testFinDocs) {
        await localDb.financial.delete(doc.id);
        removed++;
      }

      // Remove test patients
      const testPatDocs = await localDb.patients.filter((d) => d.id.startsWith('test_pat_')).toArray();
      for (const doc of testPatDocs) {
        await localDb.patients.delete(doc.id);
        removed++;
      }

      toast.success(`Removed ${removed} test items`);
      setSeedResult(null);
      await loadDBStats();

    } catch (e) {
      toast.error('Error clearing test data');
    }
  };

  // Load stats on first render
  React.useEffect(() => {
    loadDBStats();
  }, []);

  const summary = getTestSeedsSummary();

  return (
    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-yellow-600" />
        <span className="text-xs font-bold text-yellow-800 dark:text-yellow-300">DEV TOOLS</span>
        <Badge variant="outline" className="text-[9px] bg-yellow-100">
          v2
        </Badge>
      </div>

      {/* Populate Button */}
      <Button
        onClick={handlePopulateDB}
        disabled={isSeeding}
        size="sm"
        className="w-full h-8 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
      >
        {isSeeding ? (
          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Seeding...</>
        ) : (
          <><Zap className="h-3 w-3 mr-1" /> POPULATE DB ({summary.total})</>
        )}
      </Button>

      {/* Result Summary */}
      {seedResult && (
        <div className="text-[10px] space-y-1 bg-white dark:bg-background rounded p-2 border">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span className="font-semibold">Seeding Complete!</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 text-muted-foreground">
            <span>Drugs: +{seedResult.drugs.inserted}</span>
            <span>Profiles: +{seedResult.profiles.inserted}</span>
            <span>Templates: +{seedResult.templates.inserted}</span>
            <span>References: +{seedResult.referenceValues.inserted}</span>
            <span>Financial: +{seedResult.financial.inserted}</span>
            <span>Patients: +{seedResult.patients.inserted}</span>
          </div>
        </div>
      )}

      {/* DB Stats */}
      {dbStats && (
        <div className="text-[10px] bg-white dark:bg-background rounded p-2 border">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-muted-foreground">DB Stats</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={loadDBStats}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="bg-muted rounded px-1 py-0.5">
              <div className="font-bold">{dbStats.patients}</div>
              <div className="text-[8px] text-muted-foreground">Patients</div>
            </div>
            <div className="bg-muted rounded px-1 py-0.5">
              <div className="font-bold">{dbStats.drugs}</div>
              <div className="text-[8px] text-muted-foreground">Drugs</div>
            </div>
            <div className="bg-muted rounded px-1 py-0.5">
              <div className="font-bold">{dbStats.exams}</div>
              <div className="text-[8px] text-muted-foreground">Exams</div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Test Data */}
      <Button
        onClick={handleClearTestData}
        variant="ghost"
        size="sm"
        className="w-full h-6 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3 w-3 mr-1" /> Clear Test Data
      </Button>

      {/* Info */}
      <div className="text-[9px] text-muted-foreground text-center">
        Test data includes: {summary.drugs} drugs, {summary.templates} templates,
        {summary.patients} patients, {summary.financialTransactions} transactions
      </div>
    </div>
  );
}
