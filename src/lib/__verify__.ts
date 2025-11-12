/**
 * Quick verification that Firebase and env can be imported
 * Usage: import { db, auth } from '@/src/lib/firebase';
 */

import { env } from './env';
import { app, auth, db, storage } from './firebase';

// Simple verification function
export function verifyFirebaseInitialization() {
  console.log('[Verify] Firebase services:', {
    app: !!app,
    auth: !!auth,
    db: !!db,
    storage: !!storage
  });

  console.log('[Verify] Environment:', {
    useFirebase: env.useFirebase,
    projectId: env.firebaseProjectId
  });

  return {
    initialized: !!(app && auth && db && storage),
    config: env
  };
}
