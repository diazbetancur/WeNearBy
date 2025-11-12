/**
 * Environment variables validation and access
 * All critical environment variables must be prefixed with EXPO_PUBLIC_ to be accessible in the client bundle
 */

interface EnvConfig {
  // Firebase
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  firebaseMeasurementId?: string;

  // Google Maps
  googleMapsApiKey: string;

  // Geocoding
  geocoderProvider: 'google' | 'nominatim';

  // Feature Flags
  useFirebase: boolean;
  featureVendorApprovalFlow: boolean;
  featureOrderIntent: boolean;

  // Defaults
  defaultCoverageKm: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Optional: Supabase
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

/**
 * Get environment variable or throw if critical and missing
 */
function getEnvVar(key: string, required: boolean = true): string | undefined {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get boolean environment variable
 */
function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue;
  return num;
}

/**
 * Load and validate environment configuration
 */
function loadEnvConfig(): EnvConfig {
  return {
    // Firebase (all required)
    firebaseApiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY', true)!,
    firebaseAuthDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', true)!,
    firebaseProjectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID', true)!,
    firebaseStorageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', true)!,
    firebaseMessagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', true)!,
    firebaseAppId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID', true)!,
    firebaseMeasurementId: getEnvVar('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID', false),

    // Google Maps (required)
    googleMapsApiKey: getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY', true)!,

    // Geocoding (required)
    geocoderProvider: (getEnvVar('EXPO_PUBLIC_GEOCODER_PROVIDER', false) || 'google') as
      | 'google'
      | 'nominatim',

    // Feature Flags
    useFirebase: getEnvBool('EXPO_PUBLIC_USE_FIREBASE', true),
    featureVendorApprovalFlow: getEnvBool('EXPO_PUBLIC_FEATURE_VENDOR_APPROVAL_FLOW', true),
    featureOrderIntent: getEnvBool('EXPO_PUBLIC_FEATURE_ORDER_INTENT', true),

    // Defaults
    defaultCoverageKm: getEnvNumber('EXPO_PUBLIC_DEFAULT_COVERAGE_KM', 5),
    logLevel: (getEnvVar('EXPO_PUBLIC_LOG_LEVEL', false) || 'info') as
      | 'debug'
      | 'info'
      | 'warn'
      | 'error',

    // Optional: Supabase
    supabaseUrl: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', false),
    supabaseAnonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', false)
  };
}

// Load and export configuration
export const env = loadEnvConfig();

// Export individual getters for convenience
export const getFirebaseConfig = () => ({
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
  measurementId: env.firebaseMeasurementId
});
