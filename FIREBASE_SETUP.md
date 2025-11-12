# Firebase & Environment Setup

## ✅ Completed

### Files Created

1. **`src/lib/env.ts`**
   - Validates and loads all environment variables
   - Exports `env` object with typed configuration
   - Exports `getFirebaseConfig()` helper
   - Throws errors for missing critical variables

2. **`src/lib/firebase.ts`**
   - Initializes Firebase app, Auth, Firestore, Storage
   - Uses Firebase JS SDK (compatible with Expo)
   - Auto-persistence handled by Firebase SDK
   - Exports: `app`, `auth`, `db`, `storage`

3. **`src/lib/index.ts`**
   - Central re-export for all lib utilities
   - Clean imports: `import { db, auth, env } from '@/src/lib';`

4. **`.env.example`**
   - Template with all required variables
   - Firebase config (API key, project ID, etc.)
   - Google Maps API key
   - Feature flags
   - Geocoder provider selection

5. **`.gitignore`**
   - Updated to ignore `.env` files

## Usage

### 1. Setup Environment

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your Firebase credentials
# Get from Firebase Console > Project Settings
```

### 2. Import Firebase Services

```typescript
// Import from lib
import { db, auth, storage } from '@/src/lib/firebase';

// Or from index
import { db, auth, env } from '@/src/lib';

// Use in code
const usersRef = collection(db, 'users');
const currentUser = auth.currentUser;
```

### 3. Access Environment Config

```typescript
import { env, getFirebaseConfig } from '@/src/lib/env';

console.log('Using Firebase:', env.useFirebase);
console.log('Coverage:', env.defaultCoverageKm, 'km');
console.log('Geocoder:', env.geocoderProvider);
```

## Environment Variables

### Required

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### Optional

- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `EXPO_PUBLIC_GEOCODER_PROVIDER` (default: "google")
- `EXPO_PUBLIC_USE_FIREBASE` (default: true)
- `EXPO_PUBLIC_FEATURE_VENDOR_APPROVAL_FLOW` (default: true)
- `EXPO_PUBLIC_FEATURE_ORDER_INTENT` (default: true)
- `EXPO_PUBLIC_DEFAULT_COVERAGE_KM` (default: 5)
- `EXPO_PUBLIC_LOG_LEVEL` (default: "info")
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Verification

The setup includes a verification helper:

```typescript
import { verifyFirebaseInitialization } from '@/src/lib/__verify__';

const status = verifyFirebaseInitialization();
console.log('Initialized:', status.initialized);
```

## Next Steps

1. Copy `.env.example` to `.env`
2. Fill in Firebase credentials
3. Add Google Maps API key
4. Import and use `db`, `auth` in your services
5. Wire Firebase implementations in `src/services/registry.ts`

## Notes

- All client-side env vars MUST use `EXPO_PUBLIC_` prefix
- Firebase JS SDK handles persistence automatically
- Environment validation happens at app startup
- Missing critical variables will throw errors immediately
