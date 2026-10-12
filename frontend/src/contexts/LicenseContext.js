/**
 * TVUSVET V2.0 - License & Practice Context
 * Gerencia:
 * 1. Prática Ativa (Vet vs Human)
 * 2. Módulos Licenciados (SaaS)
 * 3. Termos do Dicionário
 * 
 * FIXED: Object Not Extensible crash by using immutable patterns
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/database';
import { vetTerms } from '../config/dictionaries/vet_terms';
import { humanTerms } from '../config/dictionaries/human_terms';

const DEFAULT_PRACTICE = 'vet';
const normalizePractice = (value) => (value === 'human' ? 'human' : DEFAULT_PRACTICE);

const LicenseContext = createContext({
  practice: DEFAULT_PRACTICE,
  terms: vetTerms,
  licenses: ['core'],
  hasModule: (moduleName) => moduleName === 'core',
  setPractice: () => {},
  loading: true
});

export const useLicense = () => useContext(LicenseContext);

// Bypass de desenvolvimento: licença sempre válida, ativa, premium e vitalícia.
// Para reativar o licenciamento real, mude para false.
const DEV_LICENSE_BYPASS = true;

const ALL_MODULES = ['core', 'ultrasound', 'cardio', 'prescription', 'lab_vet', 'ophthalmo_human', 'financial'];

const MOCK_LICENSE = Object.freeze({
  isValid: true,
  isActive: true,
  isPremium: true,
  plan: 'lifetime',
  expiresAt: null,
  modules: ALL_MODULES
});

const fetchLicenseStatus = () => Promise.resolve(MOCK_LICENSE);

export const LicenseProvider = ({ children }) => {
  const { currentUser, claims } = useAuth(); 
  const [practice, setPractice] = useState(DEFAULT_PRACTICE); 
  const [licenses, setLicenses] = useState(DEV_LICENSE_BYPASS ? [...ALL_MODULES] : ['core']);
  const [licenseStatus, setLicenseStatus] = useState(MOCK_LICENSE);
  const [loading, setLoading] = useState(true);

  // Carrega configurações do banco local ou claims
  useEffect(() => {
    const initLicense = async () => {
      try {
        // Banco Local (Offline) - única fonte de verdade
        const settings = await db.getSettings();
        setPractice(normalizePractice(settings?.practice_type));

        if (DEV_LICENSE_BYPASS) {
          const status = await fetchLicenseStatus();
          setLicenseStatus(status);
          setLicenses([...status.modules]);
          return;
        }

        // Clone o array para evitar problemas de imutabilidade
        setLicenses([...(settings?.active_modules || ['core'])]);
      } catch (e) {
        console.error("License Init Error:", e);
        setPractice(DEFAULT_PRACTICE);
        setLicenses(DEV_LICENSE_BYPASS ? [...ALL_MODULES] : ['core']);
      } finally {
        setLoading(false);
      }
    };

    initLicense();
  }, [currentUser, claims]);

  // Carrega termos baseados na prática
  const terms = practice === 'human' ? humanTerms : vetTerms;

  // Verifica módulo (Core da Venda Modular)
  const hasModule = (moduleName) => {
    // Core é sempre true
    if (moduleName === 'core') return true;

    // Regras Hard-Lock (Segurança de Negócio por Área) - separação Vet/Humano, não licença
    if (moduleName === 'lab_vet' && practice !== 'vet') return false;
    if (moduleName === 'ophthalmo_human' && practice !== 'human') return false;

    if (DEV_LICENSE_BYPASS) return true;

    // Se a licença permitir, libera
    return licenses.includes(moduleName);
  };

  /**
   * Função DEV para trocar prática e ativar módulos automaticamente
   */
  const switchPractice = async (newType) => {
      // Update local state first
      setPractice(newType);
      
      try {
          const currentSettings = await db.getSettings();
          const currentModulesRaw = currentSettings?.active_modules;
          
          // Create a new Set for deduplication and easy checking
          const moduleSet = new Set(currentModulesRaw ? [...currentModulesRaw] : ['core']);
          
          if (newType === 'human') {
              // Add human-specific modules
              moduleSet.add('ophthalmo_human');
              moduleSet.add('prescription');
              moduleSet.add('financial');
          } else {
              // Add vet-specific modules
              moduleSet.add('cardio');
              moduleSet.add('prescription');
              moduleSet.add('lab_vet');
              moduleSet.add('financial');
          }
          
          // Always include core
          moduleSet.add('core');
          
          // Convert Set back to Array (NEW array, not mutated)
          const newModulesArray = DEV_LICENSE_BYPASS ? [...ALL_MODULES] : Array.from(moduleSet);
          
          // Update local React state with NEW array
          setLicenses(newModulesArray);

          // Persist to local IndexedDB
          await db.updateSettings({ 
              practice_type: newType,
              active_modules: newModulesArray
          });
          
          console.log(`[LicenseContext] Switched to ${newType}, modules:`, newModulesArray);
      } catch (e) {
          console.error('[LicenseContext] switchPractice error:', e);
          // Rollback state on error
          setPractice(practice);
      }
  };

  const value = {
    practice,
    setPractice: switchPractice,
    licenses,
    ...licenseStatus,
    terms,
    hasModule,
    loading
  };

  return (
    <LicenseContext.Provider value={value}>
      {!loading && children}
    </LicenseContext.Provider>
  );
};
