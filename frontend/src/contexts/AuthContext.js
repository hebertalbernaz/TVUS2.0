/**
 * TVUSVET - Sessão local sempre ativa (sem login).
 * O app abre direto no dashboard; nenhuma verificação de rede ou senha.
 */
import React, { createContext, useContext } from 'react';

export const LOCAL_USER = Object.freeze({
  uid: 'local-user',
  email: 'local@tvusvet.local',
  display_name: 'Médico Veterinário'
});

const LOCAL_CLAIMS = Object.freeze({ practice: 'vet' });

const value = {
  currentUser: LOCAL_USER,
  claims: LOCAL_CLAIMS,
  login: async () => LOCAL_USER,
  logout: () => {},
  register: async () => LOCAL_USER
};

const AuthContext = createContext(value);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => (
  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);
