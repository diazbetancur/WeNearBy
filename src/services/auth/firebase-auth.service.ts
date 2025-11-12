/**
 * Firebase implementation of AuthService
 * Handles user authentication using Firebase Auth
 *
 * @example
 * ```typescript
 * import { getAuthService } from '@/services/registry';
 *
 * const authService = getAuthService();
 *
 * // Sign up new user
 * try {
 *   const user = await authService.signUpEmail('user@example.com', 'password123');
 *   console.log('User created:', user.id);
 * } catch (error) {
 *   console.error('Sign up failed:', error.message);
 * }
 *
 * // Sign in existing user
 * try {
 *   const user = await authService.signInEmail('user@example.com', 'password123');
 *   console.log('Signed in:', user.email);
 * } catch (error) {
 *   console.error('Sign in failed:', error.message);
 * }
 *
 * // Listen to auth state changes
 * const unsubscribe = authService.onAuthStateChanged((user) => {
 *   if (user) {
 *     console.log('User signed in:', user.id);
 *   } else {
 *     console.log('User signed out');
 *   }
 * });
 *
 * // Later: cleanup
 * unsubscribe();
 *
 * // Sign out
 * await authService.signOut();
 *
 * // Get current user
 * const currentUser = await authService.getCurrentUser();
 * if (currentUser) {
 *   console.log('Current user:', currentUser.email);
 * }
 * ```
 */

import {
  AuthError,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { User } from '../../types/models';
import type { AuthService } from './auth.service';

/**
 * Maps Firebase Auth errors to user-friendly messages
 */
function mapAuthError(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Este correo ya está registrado',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de red. Verifica tu conexión',
    'auth/popup-closed-by-user': 'Operación cancelada por el usuario',
    'auth/cancelled-popup-request': 'Operación cancelada'
  };

  return errorMessages[error.code] || `Error de autenticación: ${error.message}`;
}

/**
 * Converts Firebase User to our User model
 */
async function firebaseUserToUser(firebaseUser: FirebaseUser): Promise<User> {
  // Get user document from Firestore
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || data.displayName,
      roles: data.roles || ['customer'],
      currentRole: data.currentRole || 'customer',
      createdAt: data.createdAt || Date.now(),
      photoURL: firebaseUser.photoURL || data.photoURL
    };
  }

  // Fallback if no Firestore document (shouldn't happen in normal flow)
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    roles: ['customer'],
    currentRole: 'customer',
    createdAt: Date.now(),
    photoURL: firebaseUser.photoURL || undefined
  };
}

/**
 * Creates user document in Firestore with default customer role
 */
async function createUserDocument(firebaseUser: FirebaseUser): Promise<void> {
  const userDocRef = doc(db, 'users', firebaseUser.uid);

  await setDoc(userDocRef, {
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || null,
    roles: ['customer'],
    currentRole: 'customer',
    createdAt: serverTimestamp(),
    photoURL: firebaseUser.photoURL || null
  });
}

/**
 * Firebase implementation of AuthService
 */
export class FirebaseAuthService implements AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUpEmail(email: string, password: string): Promise<User> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create Firestore user document
      await createUserDocument(userCredential.user);

      // Return our User model
      return await firebaseUserToUser(userCredential.user);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(mapAuthError(authError));
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  async signInEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return await firebaseUserToUser(userCredential.user);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(mapAuthError(authError));
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(mapAuthError(authError));
    }
  }

  /**
   * Subscribe to authentication state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await firebaseUserToUser(firebaseUser);
          callback(user);
        } catch (error) {
          console.error('[FirebaseAuthService] Error converting user:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    try {
      return await firebaseUserToUser(firebaseUser);
    } catch (error) {
      console.error('[FirebaseAuthService] Error getting current user:', error);
      return null;
    }
  }
}
