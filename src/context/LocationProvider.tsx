/**
 * LocationProvider - Context for managing user location
 *
 * Features:
 * - Requests GPS permissions via expo-location
 * - Falls back to manual address entry if GPS denied
 * - Provides current location and method (GPS or address)
 * - Supports reverse geocoding to show current address
 *
 * Usage:
 * ```tsx
 * <LocationProvider>
 *   <App />
 * </LocationProvider>
 *
 * // In any component:
 * const { center, method, setCenter, address, requestLocation } = useLocation();
 * ```
 */

import * as ExpoLocation from 'expo-location';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { geocodeAddress, reverseGeocode } from '../geo/geocoding';
import type { LatLng } from '../types/models';

/**
 * Location method: how the location was obtained
 */
export type LocationMethod = 'gps' | 'address' | null;

/**
 * Location permission status
 */
export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Location context value
 */
interface LocationContextValue {
  /** Current center coordinates (null if not set) */
  center: LatLng | null;

  /** How the location was obtained */
  method: LocationMethod;

  /** Human-readable address for current location (if available) */
  address: string | null;

  /** Permission status */
  permissionStatus: LocationPermissionStatus;

  /** Whether location is being fetched */
  loading: boolean;

  /** Error message if location fetch failed */
  error: string | null;

  /** Set location manually by coordinates */
  setCenter: (coords: LatLng, method: LocationMethod) => void;

  /** Set location by address (will geocode) */
  setLocationByAddress: (address: string) => Promise<void>;

  /** Request GPS location (asks for permissions) */
  requestLocation: () => Promise<void>;

  /** Clear current location */
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

/**
 * LocationProvider props
 */
interface LocationProviderProps {
  children: ReactNode;
  /** Whether to auto-request GPS on mount (default: false) */
  autoRequest?: boolean;
}

/**
 * LocationProvider component
 * Manages user location with GPS and manual address fallback
 */
export function LocationProvider({ children, autoRequest = false }: LocationProviderProps) {
  const [center, setCenter] = useState<LatLng | null>(null);
  const [method, setMethod] = useState<LocationMethod>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>('undetermined');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check current permission status
   */
  const checkPermissions = useCallback(async () => {
    const { status } = await ExpoLocation.getForegroundPermissionsAsync();

    if (status === 'granted') {
      setPermissionStatus('granted');
    } else if (status === 'denied') {
      setPermissionStatus('denied');
    } else {
      setPermissionStatus('undetermined');
    }

    return status === 'granted';
  }, []);

  /**
   * Request GPS location with permissions
   */
  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if permissions already granted
      const hasPermission = await checkPermissions();

      // Request permissions if not granted
      if (!hasPermission) {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setPermissionStatus('denied');
          setError('Permisos de ubicación denegados. Por favor, ingresa tu dirección manualmente.');
          setLoading(false);
          return;
        }

        setPermissionStatus('granted');
      }

      // Get current position
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced
      });

      const coords: LatLng = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };

      setCenter(coords);
      setMethod('gps');

      // Reverse geocode to get address
      try {
        const addressText = await reverseGeocode(coords.lat, coords.lng);
        setAddress(addressText);
      } catch {
        // Ignore reverse geocoding errors
        setAddress(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener ubicación GPS';
      setError(errorMessage);
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  }, [checkPermissions]);

  /**
   * Set location by geocoding an address
   */
  const setLocationByAddress = useCallback(async (addressText: string) => {
    setLoading(true);
    setError(null);

    try {
      const coords = await geocodeAddress(addressText);
      setCenter(coords);
      setMethod('address');
      setAddress(addressText);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al geocodificar la dirección';
      setError(errorMessage);
      throw err; // Re-throw so caller can handle
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Set location manually with coordinates
   */
  const handleSetCenter = useCallback((coords: LatLng, locationMethod: LocationMethod) => {
    setCenter(coords);
    setMethod(locationMethod);
    setError(null);

    // Optionally reverse geocode to get address
    reverseGeocode(coords.lat, coords.lng)
      .then(setAddress)
      .catch(() => setAddress(null));
  }, []);

  /**
   * Clear current location
   */
  const clearLocation = useCallback(() => {
    setCenter(null);
    setMethod(null);
    setAddress(null);
    setError(null);
  }, []);

  /**
   * Check permissions on mount
   */
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  /**
   * Auto-request location on mount if enabled
   */
  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  const value = useMemo<LocationContextValue>(
    () => ({
      center,
      method,
      address,
      permissionStatus,
      loading,
      error,
      setCenter: handleSetCenter,
      setLocationByAddress,
      requestLocation,
      clearLocation
    }),
    [
      center,
      method,
      address,
      permissionStatus,
      loading,
      error,
      handleSetCenter,
      setLocationByAddress,
      requestLocation,
      clearLocation
    ]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

/**
 * Hook to access location context
 *
 * @throws Error if used outside LocationProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { center, method, requestLocation } = useLocation();
 *
 *   if (!center) {
 *     return <Button onPress={requestLocation}>Enable Location</Button>;
 *   }
 *
 *   return <Text>Your location: {center.lat}, {center.lng}</Text>;
 * }
 * ```
 */
export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext);

  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }

  return context;
}
