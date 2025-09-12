import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth, firestore } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  userRoles: string[];
  currentRole: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserRoles: () => Promise<string[]>;
  addRoleToUser: (role: string) => Promise<void>;
  setCurrentRole: (role: string) => Promise<void>;
  hasRole: (role: string) => boolean;
  isCustomer: () => boolean;
  isBusiness: () => boolean;
  hasMultipleRoles: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRoleState] = useState<string>('customer');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Cargar roles del usuario desde Firestore
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const roles = userData.roles || ['customer'];
            setUserRoles(roles);

            // Establecer rol actual - prioridad: currentRole guardado > customer si existe
            const savedCurrentRole = userData.currentRole;
            if (savedCurrentRole && roles.includes(savedCurrentRole)) {
              setCurrentRoleState(savedCurrentRole);
            } else {
              setCurrentRoleState('customer');
            }
          } else {
            // Si el documento no existe, crear uno con rol customer por defecto
            await setDoc(doc(firestore, 'users', user.uid), {
              email: user.email,
              roles: ['customer'],
              currentRole: 'customer',
              createdAt: new Date(),
              updatedAt: new Date()
            });
            setUserRoles(['customer']);
            setCurrentRoleState('customer');
          }
        } catch (error) {
          console.error('Error loading user roles:', error);
          setUserRoles(['customer']); // Fallback a customer
        }
      } else {
        setUserRoles([]);
      }

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
      return (errorMessages as any)[code] || error?.message || 'Error desconocido.';
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Crear documento de usuario en Firestore con rol 'customer' por defecto
        await setDoc(doc(firestore, 'users', user.uid), {
          email: user.email,
          roles: ['customer'], // Solo rol customer inicialmente
          currentRole: 'customer', // Rol activo por defecto
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log('✅ Usuario creado con rol customer:', user.email);
      } catch (error: any) {
        throw new Error(mapAuthError(error));
      }
    },
    [mapAuthError]
  );

  const getUserRoles = useCallback(async (): Promise<string[]> => {
    if (!currentUser) {
      return [];
    }

    try {
      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.roles || ['customer'];
      }
      return ['customer'];
    } catch (error) {
      console.error('Error getting user roles:', error);
      return ['customer'];
    }
  }, [currentUser]);

  const addRoleToUser = useCallback(
    async (role: string): Promise<void> => {
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      try {
        const userDocRef = doc(firestore, 'users', currentUser.uid);

        // Verificar si el usuario ya tiene el rol
        if (!userRoles.includes(role)) {
          await updateDoc(userDocRef, {
            roles: arrayUnion(role),
            updatedAt: new Date()
          });

          // Actualizar el estado local
          setUserRoles((prevRoles) => [...prevRoles, role]);

          console.log(`✅ Rol "${role}" agregado al usuario:`, currentUser.email);
        } else {
          console.log(`ℹ️ Usuario ya tiene el rol "${role}"`);
        }
      } catch (error) {
        console.error('Error adding role to user:', error);
        throw new Error(`Error al agregar rol "${role}"`);
      }
    },
    [currentUser, userRoles]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setUserRoles([]); // Limpiar roles al cerrar sesión
    setCurrentRoleState('customer'); // Reset al rol por defecto
  }, []);

  const setCurrentRole = useCallback(
    async (role: string): Promise<void> => {
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      if (!userRoles.includes(role)) {
        throw new Error(`Usuario no tiene el rol "${role}"`);
      }

      try {
        // Actualizar en Firestore
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          currentRole: role,
          updatedAt: new Date()
        });

        // Actualizar estado local
        setCurrentRoleState(role);

        console.log(`✅ Rol actual cambiado a: ${role}`);
      } catch (error) {
        console.error('Error setting current role:', error);
        throw new Error(`Error al cambiar al rol "${role}"`);
      }
    },
    [currentUser, userRoles]
  );

  // Funciones helper para verificar roles
  const hasRole = useCallback(
    (role: string): boolean => {
      return userRoles.includes(role);
    },
    [userRoles]
  );

  const isCustomer = useCallback((): boolean => {
    return currentRole === 'customer';
  }, [currentRole]);

  const isBusiness = useCallback((): boolean => {
    return currentRole === 'business';
  }, [currentRole]);

  const hasMultipleRoles = useCallback((): boolean => {
    return userRoles.length > 1;
  }, [userRoles]);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      userRoles,
      currentRole,
      signIn,
      signUp,
      logout,
      getUserRoles,
      addRoleToUser,
      setCurrentRole,
      hasRole,
      isCustomer,
      isBusiness,
      hasMultipleRoles
    }),
    [
      currentUser,
      loading,
      userRoles,
      currentRole,
      signIn,
      signUp,
      logout,
      getUserRoles,
      addRoleToUser,
      setCurrentRole,
      hasRole,
      isCustomer,
      isBusiness,
      hasMultipleRoles
    ]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
