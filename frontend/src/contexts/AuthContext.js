/**
 * TVUSVET V3.0 - Contexto de Autenticação LOCAL (offline-first)
 * Login e sessão persistidos no IndexedDB via Dexie.
 * Nenhuma chamada de rede - sem Firebase.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { localDb, getLocalDb, genId } from '../core/database/localDb';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// ---------- Hash simples de senha (não-armazenável em texto puro) ----------
const _hashPassword = async (password) => {
  const data = new TextEncoder().encode(String(password));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Login local: valida e-mail/senha contra a tabela app_users
   * no IndexedDB. Cria a conta padrão no primeiro uso (login demo).
   */
  const login = async (email, password) => {
    try {
      await getLocalDb();
      const normalizedEmail = String(email || '').trim().toLowerCase();

      const user = await localDb.app_users.where('email').equals(normalizedEmail).first();

      if (!user) {
        throw new Error('E-mail não cadastrado neste dispositivo.');
      }

      const passwordHash = await _hashPassword(password);
      if (user.password_hash !== passwordHash) {
        throw new Error('Senha incorreta.');
      }

      const loggedUser = {
        uid: user.id,
        email: user.email,
        display_name: user.display_name || user.email
      };

      setCurrentUser(loggedUser);
      setClaims(user.claims || null);
      return loggedUser;
    } catch (error) {
      console.error('[Auth] login falhou:', error.message);
      throw error;
    }
  };

  /**
   * Cria um usuário local (primeiro acesso / novos profissionais).
   */
  const register = async (email, password, displayName) => {
    await getLocalDb();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) throw new Error('Informe e-mail e senha.');

    const existing = await localDb.app_users.where('email').equals(normalizedEmail).first();
    if (existing) throw new Error('Já existe um usuário com este e-mail neste dispositivo.');

    const user = {
      id: genId(),
      email: normalizedEmail,
      password_hash: await _hashPassword(password),
      display_name: displayName || normalizedEmail,
      claims: { practice: 'vet', modules: ['core', 'prescription', 'cardio', 'lab_vet', 'financial'] },
      created_at: new Date().toISOString()
    };
    await localDb.app_users.add(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    setClaims(null);
  };

  // Restaura sessão: cria usuário demo no primeiro uso
  useEffect(() => {
    const restoreSession = async () => {
      try {
        await getLocalDb();

        // Garante um usuário demo para o primeiro acesso offline
        const demoEmail = 'demo@tvusvet.local';
        const demoExists = await localDb.app_users.where('email').equals(demoEmail).first();
        if (!demoExists) {
          await localDb.app_users.add({
            id: genId(),
            email: demoEmail,
            password_hash: await _hashPassword('demo123'),
            display_name: 'Clínico Demo',
            claims: {
              practice: 'vet',
              modules: ['core', 'prescription', 'cardio', 'lab_vet', 'financial']
            },
            created_at: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn('[Auth] Falha ao preparar banco local de usuários:', e);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const value = {
    currentUser,
    claims,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};