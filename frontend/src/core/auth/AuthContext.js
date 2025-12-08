/**
 * TVUSVET V2.0 - Contexto de Autenticação (Com Verificação de Hardware)
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../services/auth/firebase';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função de Login Protegida
  const login = async (email, password) => {
    try {
        // 1. Autenticação Básica (Firebase Auth)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 🟢 2. Verificação de Hardware (Anti-Pirataria)
        if (window.api && window.api.getMachineId) {
            const loadingToast = toast.loading("Verificando licença...");
            try {
                // Pega ID da máquina via Electron
                const deviceId = await window.api.getMachineId();
                
                // Chama Cloud Function
                const verifyDevice = httpsCallable(functions, 'verifyDevice');
                const result = await verifyDevice({ deviceId });
                
                toast.dismiss(loadingToast);

                if (!result.data.success) {
                    throw new Error(result.data.message || 'Dispositivo não autorizado.');
                }
                
                toast.success("Licença verificada com sucesso.");

            } catch (deviceError) {
                toast.dismiss(loadingToast);
                console.error("Erro de Licença:", deviceError);
                await signOut(auth); // Desloga imediatamente se falhar
                throw deviceError; // Repassa erro para UI
            }
        } else {
            console.warn("Ambiente Web/Dev: Pulando verificação de hardware.");
        }

        return userCredential;
    } catch (error) {
        throw error;
    }
  };

  const logout = () => {
    signOut(auth);
    setCurrentUser(null);
    setClaims(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
          try {
            // Refresh token para garantir claims atualizadas
            const tokenResult = await user.getIdTokenResult(true);
            
            const customClaims = tokenResult.claims || {};
            
            // Verifica flag de licença ativa
            if (customClaims.license_active === false) {
                toast.error("Sua assinatura expirou.");
                await signOut(auth);
                return;
            }

            setClaims({
                practice: customClaims.practice || 'vet',
                modules: customClaims.modules || ['core', 'prescription', 'cardio', 'lab_vet', 'financial']
            });
          } catch (e) {
            console.error("Erro ao obter claims:", e);
          }
      } else {
          setClaims(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    claims,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
