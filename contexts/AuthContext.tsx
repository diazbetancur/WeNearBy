import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const errorMessages = useMemo(
    () => ({
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El correo ya está en uso',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/user-disabled': 'Cuenta deshabilitada',
      'auth/invalid-api-key': 'Clave API inválida',
      'auth/configuration-not-found':
        'Configuración de Firebase no encontrada. Verifica tu proyecto.'
    }),
    []
  );

  const mapAuthError = useCallback(
    (error: any): string => {
      const code = error?.code || '';
      return errorMessages[code] || error?.message || 'Error desconocido.';
    },
    [errorMessages]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        throw new Error(mapAuthError(error));
      }
    },
    [mapAuthError]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        throw new Error(mapAuthError(error));
      }
    },
    [mapAuthError]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({ currentUser, loading, signIn, signUp, logout }),
    [currentUser, loading, signIn, signUp, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
