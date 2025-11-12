/**
 * Quick Integration Example - Firebase Auth Service
 * Shows how to integrate FirebaseAuthService into existing code
 */

// ==========================================
// BEFORE (Direct Firebase usage)
// ==========================================

/*
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}
*/

// ==========================================
// AFTER (Using AuthService)
// ==========================================

import { getAuthService } from '@/src/services/registry';

const authService = getAuthService();

async function login(email: string, password: string) {
  // Returns normalized User model with roles
  const user = await authService.signInEmail(email, password);
  return user; // { id, email, roles, currentRole, ... }
}

// ==========================================
// React Component Example
// ==========================================

/*
import React, { useState, useEffect } from 'react';
import { getAuthService } from '@/src/services/registry';
import type { User } from '@/src/types/models';

export function AuthExample() {
  const [user, setUser] = useState<User | null>(null);
  const authService = getAuthService();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const user = await authService.signInEmail(email, password);
      console.log('Signed in:', user.email);
    } catch (error) {
      console.error('Error:', error.message); // Spanish error message
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      const user = await authService.signUpEmail(email, password);
      console.log('User created:', user.id);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
  };

  return (
    <View>
      {user ? (
        <>
          <Text>Welcome {user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        <>
          <Button title="Sign In" onPress={() => handleSignIn('test@test.com', 'test123')} />
          <Button title="Sign Up" onPress={() => handleSignUp('new@test.com', 'test123')} />
        </>
      )}
    </View>
  );
}
*/

// ==========================================
// AuthContext Integration Example
// ==========================================

/*
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuthService } from '@/src/services/registry';
import type { User } from '@/src/types/models';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authService = getAuthService();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signInEmail(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authService.signUpEmail(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
*/

// ==========================================
// Testing Without Firebase (Mock Mode)
// ==========================================

/*
// In .env
EXPO_PUBLIC_USE_FIREBASE=false

// Registry will return stub (for now) or MockAuthService (when implemented)
const authService = getAuthService();

// All same API, but no Firebase calls
await authService.signInEmail('test@test.com', 'test123');
*/
