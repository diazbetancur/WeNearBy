/**
 * Firebase initialization for WeNearBy
 * Configures Firebase app, Auth, Firestore, and Storage
 */

import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { getFirebaseConfig } from './env';

// Firebase app instance
let app: FirebaseApp;

// Firebase service instances
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

/**
 * Initialize Firebase services
 */
function initializeFirebase() {
  try {
    // Get configuration from environment
    const firebaseConfig = getFirebaseConfig();

    // Initialize Firebase app
    app = initializeApp(firebaseConfig);

    // Initialize Auth (persistence handled automatically by Firebase SDK)
    auth = getAuth(app);

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Storage
    storage = getStorage(app);

    console.log('[Firebase] Initialized successfully');
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    throw error;
  }
}

// Initialize immediately
initializeFirebase();

// Export Firebase services
export { app, auth, db, storage };

// Export types for convenience
export type { Auth, FirebaseApp, FirebaseStorage, Firestore };
