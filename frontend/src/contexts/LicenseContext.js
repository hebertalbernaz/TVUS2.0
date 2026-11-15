/**
 * TVUSVET - Licença & Prática (100% local)
 * - Licença sempre válida (bypass offline), nunca bloqueia a tela.
 * - Prática travada em Veterinária enquanto HUMAN_PRACTICE_LOCKED = true.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/database';
import { vetTerms } from '../config/dictionaries/vet_terms';
import { humanTerms } from '../config/dictionaries/human_terms';

export const HUMAN_PRACTICE_LOCKED = true;
const DEFAULT_PRACTICE = 'vet';
const ALL_MODULES = ['core', 'ultrasound', 'cardio', 'prescription', 'lab_vet', 'ophthalmo_human', 'financial'];

export const LICENSE_STATUS = Object.freeze({
  isValid: true,
  isActive: true,
  isPremium: true,
  plan: 'lifetime',
  expiresAt: null,
  modules: ALL_MODULES
});

export const normalizePractice = (value) =>
  (!HUMAN_PRACTICE_LOCKED && value === 'human' ? 'human' : DEFAULT_PRACTICE);

const LicenseContext = createContext({
  practice: DEFAULT_PRACTICE,
  terms: vetTerms,
  licenses: ALL_MODULES,
  hasModule: () => true,
  setPractice: () => {},
  humanLocked: HUMAN_PRACTICE_LOCKED,
  loading: false
});

export const useLicense = () => useContext(LicenseContext);

export const LicenseProvider = ({ children }) => {
  const [practice, setPracticeState] = useState(DEFAULT_PRACTICE);

  useEffect(() => {
    db.getSettings()
      .then((settings) => {
        const p = normalizePractice(settings?.practice_type);
        setPracticeState(p);
        if (settings?.practice_type !== p) db.updateSettings({ practice_type: p });
      })
      .catch((e) => console.error('[License] settings:', e));
  }, []);

  const hasModule = (moduleName) => {
    if (moduleName === 'lab_vet' && practice !== 'vet') return false;
    if (moduleName === 'ophthalmo_human' && practice !== 'human') return false;
    return true;
  };

  const setPractice = async (newType) => {
    const p = normalizePractice(newType);
    setPracticeState(p);
    try {
      await db.updateSettings({ practice_type: p, active_modules: [...ALL_MODULES] });
    } catch (e) {
      console.error('[License] setPractice:', e);
    }
  };

  const value = {
    practice,
    setPractice,
    licenses: ALL_MODULES,
    ...LICENSE_STATUS,
    terms: practice === 'human' ? humanTerms : vetTerms,
    hasModule,
    humanLocked: HUMAN_PRACTICE_LOCKED,
    loading: false
  };

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
};
