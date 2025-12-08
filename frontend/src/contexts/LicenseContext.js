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
import { getDatabase } from '../core/database/db';
import { vetTerms } from '../config/dictionaries/vet_terms';
import { humanTerms } from '../config/dictionaries/human_terms';

const LicenseContext = createContext({});

export const useLicense = () => useContext(LicenseContext);

export const LicenseProvider = ({ children }) => {
  const { currentUser, claims } = useAuth(); 
  const [practice, setPractice] = useState('vet'); 
  const [licenses, setLicenses] = useState(['core']);
  const [loading, setLoading] = useState(true);

  // Carrega configurações do banco local ou claims
  useEffect(() => {
    const initLicense = async () => {
      try {
        const db = await getDatabase();
        
        // 1. Tenta pegar do Claims (Autenticado - Futuro SaaS Remoto)
        if (currentUser && claims) {
            if (claims.practice) setPractice(claims.practice);
            if (claims.modules) setLicenses([...claims.modules]); // Clone array!
            
            // Sync to local settings
            const settings = await db.settings.findOne({ selector: { id: 'global_settings' } }).exec();
            if (settings) {
                await settings.patch({ 
                    practice_type: claims.practice || 'vet',
                    active_modules: [...(claims.modules || [])]
                });
            }
        } 
        // 2. Fallback: Banco Local (Offline/Anon/Dev)
        else {
            const settings = await db.settings.findOne({ selector: { id: 'global_settings' } }).exec();
            if (settings) {
                const settingsData = settings.toJSON();
                setPractice(settingsData.practice_type || 'vet');
                // IMPORTANT: Clone the array to avoid frozen object issues
                setLicenses([...(settingsData.active_modules || ['core'])]);
            } else {
                setPractice('vet');
                setLicenses(['core']);
            }
        }
      } catch (e) {
        console.error("License Init Error:", e);
        setPractice('vet');
        setLicenses(['core']);
      } finally {
        setLoading(false);
      }
    };

    initLicense();
  }, [currentUser, claims]);

  // Carrega termos baseados na prática
  const terms = practice === 'vet' ? vetTerms : humanTerms;

  // Verifica módulo (Core da Venda Modular)
  const hasModule = (moduleName) => {
    // Core é sempre true
    if (moduleName === 'core') return true;
    
    // Regras Hard-Lock (Segurança de Negócio por Área)
    if (moduleName === 'lab_vet' && practice !== 'vet') return false;
    if (moduleName === 'ophthalmo_human' && practice !== 'human') return false;

    // Se a licença permitir, libera
    return licenses.includes(moduleName);
  };

  /**
   * Função DEV para trocar prática e ativar módulos automaticamente
   * FIXED: Using immutable patterns - never mutate RxDB arrays directly
   */
  const switchPractice = async (newType) => {
      // Update local state first
      setPractice(newType);
      
      try {
          const db = await getDatabase();
          const settings = await db.settings.findOne({ selector: { id: 'global_settings' } }).exec();
          
          if (settings) {
              // CRITICAL FIX: Clone the array from RxDB before modifying
              // RxDB documents are frozen/immutable - we must create NEW arrays
              const currentModulesRaw = settings.get('active_modules');
              
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
              const newModulesArray = Array.from(moduleSet);
              
              // Update local React state with NEW array
              setLicenses(newModulesArray);

              // Persist to RxDB using patch with completely NEW object
              await settings.patch({ 
                  practice_type: newType,
                  active_modules: newModulesArray
              });
              
              console.log(`[LicenseContext] Switched to ${newType}, modules:`, newModulesArray);
          }
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
