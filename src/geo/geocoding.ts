/**
 * Geocoding service for WeNearBy
 * Supports multiple providers: Google Maps API and OpenStreetMap Nominatim
 *
 * Provider selection via environment variable:
 * - EXPO_PUBLIC_GEOCODING_PROVIDER="google" - Google Maps Geocoding API
 * - EXPO_PUBLIC_GEOCODING_PROVIDER="nominatim" - OpenStreetMap Nominatim (free)
 *
 * For Google Maps, also set:
 * - EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="your-api-key"
 */

import type { LatLng } from '../types/models';

/**
 * Geocoding provider type
 */
type GeocodingProvider = 'google' | 'nominatim';

/**
 * Get configured geocoding provider
 */
function getGeocodingProvider(): GeocodingProvider {
  const provider = process.env.EXPO_PUBLIC_GEOCODING_PROVIDER || 'nominatim';
  if (provider !== 'google' && provider !== 'nominatim') {
    console.warn(`Invalid geocoding provider: ${provider}. Using nominatim.`);
    return 'nominatim';
  }
  return provider as GeocodingProvider;
}

/**
 * Get Google Maps API key from environment
 */
function getGoogleMapsApiKey(): string {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error(
      'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY not configured. ' +
        'Set it in .env or switch to nominatim provider.'
    );
  }
  return apiKey;
}

/**
 * Geocode an address to coordinates using Google Maps API
 *
 * @param address - Address string to geocode
 * @returns Promise with LatLng coordinates
 * @throws Error if geocoding fails or API key missing
 */
async function geocodeAddressGoogle(address: string): Promise<LatLng> {
  const apiKey = getGoogleMapsApiKey();
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Geocoding failed: ${data.status}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error('No se encontraron resultados para la dirección');
  }

  const location = data.results[0].geometry.location;
  return {
    lat: location.lat,
    lng: location.lng
  };
}

/**
 * Geocode an address to coordinates using Nominatim (OpenStreetMap)
 * Free service, no API key required
 *
 * @param address - Address string to geocode
 * @returns Promise with LatLng coordinates
 * @throws Error if geocoding fails
 */
async function geocodeAddressNominatim(address: string): Promise<LatLng> {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WeNearBy/1.0' // Nominatim requires User-Agent
    }
  });

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error('No se encontraron resultados para la dirección');
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

/**
 * Convert address string to geographic coordinates
 *
 * Uses provider specified in EXPO_PUBLIC_GEOCODING_PROVIDER:
 * - "google" - Google Maps Geocoding API (requires API key)
 * - "nominatim" - OpenStreetMap Nominatim (free, no key required)
 *
 * @param address - Address to geocode (e.g., "Calle 72 #10-34, Bogotá")
 * @returns Promise with LatLng coordinates
 *
 * @throws Error if address cannot be geocoded or provider not configured
 *
 * @example
 * ```typescript
 * const coords = await geocodeAddress("Calle 72 #10-34, Bogotá, Colombia");
 * console.log(coords); // { lat: 4.6533, lng: -74.0627 }
 * ```
 */
export async function geocodeAddress(address: string): Promise<LatLng> {
  if (!address || address.trim().length === 0) {
    throw new Error('La dirección no puede estar vacía');
  }

  const provider = getGeocodingProvider();

  try {
    if (provider === 'google') {
      return await geocodeAddressGoogle(address);
    } else {
      return await geocodeAddressNominatim(address);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al geocodificar la dirección');
  }
}

/**
 * Reverse geocode coordinates to address using Google Maps API
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with formatted address string
 * @throws Error if reverse geocoding fails
 */
async function reverseGeocodeGoogle(lat: number, lng: number): Promise<string> {
  const apiKey = getGoogleMapsApiKey();
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Reverse Geocoding failed: ${data.status}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error('No se encontró dirección para las coordenadas');
  }

  return data.results[0].formatted_address;
}

/**
 * Reverse geocode coordinates to address using Nominatim
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with formatted address string
 * @throws Error if reverse geocoding fails
 */
async function reverseGeocodeNominatim(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WeNearBy/1.0'
    }
  });

  const data = await response.json();

  if (!data || !data.display_name) {
    throw new Error('No se encontró dirección para las coordenadas');
  }

  return data.display_name;
}

/**
 * Convert geographic coordinates to human-readable address
 *
 * Uses provider specified in EXPO_PUBLIC_GEOCODING_PROVIDER:
 * - "google" - Google Maps Geocoding API (requires API key)
 * - "nominatim" - OpenStreetMap Nominatim (free, no key required)
 *
 * @param lat - Latitude (-90 to 90)
 * @param lng - Longitude (-180 to 180)
 * @returns Promise with formatted address string
 *
 * @throws Error if coordinates are invalid or reverse geocoding fails
 *
 * @example
 * ```typescript
 * const address = await reverseGeocode(4.6533, -74.0627);
 * console.log(address); // "Calle 72 #10-34, Chapinero, Bogotá, Colombia"
 * ```
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Validate coordinates
  if (lat < -90 || lat > 90) {
    throw new Error('Latitud inválida (debe estar entre -90 y 90)');
  }
  if (lng < -180 || lng > 180) {
    throw new Error('Longitud inválida (debe estar entre -180 y 180)');
  }

  const provider = getGeocodingProvider();

  try {
    if (provider === 'google') {
      return await reverseGeocodeGoogle(lat, lng);
    } else {
      return await reverseGeocodeNominatim(lat, lng);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al obtener la dirección');
  }
}

/**
 * Check if geocoding is properly configured
 *
 * @returns Object with configuration status
 */
export function getGeocodingConfig(): {
  provider: GeocodingProvider;
  configured: boolean;
  requiresApiKey: boolean;
} {
  const provider = getGeocodingProvider();
  const requiresApiKey = provider === 'google';

  let configured = true;
  if (requiresApiKey) {
    try {
      getGoogleMapsApiKey();
    } catch {
      configured = false;
    }
  }

  return {
    provider,
    configured,
    requiresApiKey
  };
}
