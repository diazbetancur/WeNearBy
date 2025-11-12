/**
 * Index file for lib utilities
 * Re-exports Firebase services and environment configuration
 */

export type { FirebaseApp } from 'firebase/app';
export type { Auth } from 'firebase/auth';
export type { Firestore } from 'firebase/firestore';
export type { FirebaseStorage } from 'firebase/storage';
export { env, getFirebaseConfig } from './env';
export { app, auth, db, storage } from './firebase';
