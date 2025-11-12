/**
 * Geographic utilities for distance calculations and coverage checks
 * Uses the Haversine formula for accurate distance calculations on Earth's surface
 *
 * Earth's radius: 6371 km = 6,371,000 meters
 */

import type { LatLng } from '../types/models';

/**
 * Earth's radius in meters
 * Using mean radius for Haversine formula
 */
const EARTH_RADIUS_METERS = 6371e3;

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 *
 * Formula:
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2(√a, √(1−a))
 * d = R ⋅ c
 *
 * where:
 * - φ is latitude, λ is longitude
 * - R is earth's radius (6,371,000 meters)
 *
 * @param a - First point (latitude, longitude)
 * @param b - Second point (latitude, longitude)
 * @returns Distance in meters
 *
 * @example
 * ```typescript
 * const bogota = { lat: 4.7110, lng: -74.0721 };
 * const nearby = { lat: 4.7115, lng: -74.0725 };
 * const distance = distanceMeters(bogota, nearby);
 * console.log(distance); // ~60 meters
 * ```
 */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const φ1 = toRadians(a.lat);
  const φ2 = toRadians(b.lat);
  const Δφ = toRadians(b.lat - a.lat);
  const Δλ = toRadians(b.lng - a.lng);

  const sinHalfΔφ = Math.sin(Δφ / 2);
  const sinHalfΔλ = Math.sin(Δλ / 2);

  const haversineA = sinHalfΔφ * sinHalfΔφ + Math.cos(φ1) * Math.cos(φ2) * sinHalfΔλ * sinHalfΔλ;

  const c = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Store location with coverage radius
 */
export interface StoreLocation {
  geo: LatLng;
  coverageKm: number;
}

/**
 * Check if a user location is covered by a store's service radius
 *
 * @param user - User's location
 * @param store - Store location with coverage radius in kilometers
 * @returns true if user is within store's coverage radius, false otherwise
 *
 * @example
 * ```typescript
 * const user = { lat: 4.7110, lng: -74.0721 };
 * const store = {
 *   geo: { lat: 4.7100, lng: -74.0720 },
 *   coverageKm: 2
 * };
 *
 * const covered = isCoveredByRadius(user, store);
 * if (covered) {
 *   console.log('Store delivers to this location');
 * }
 * ```
 */
export function isCoveredByRadius(user: LatLng, store: StoreLocation): boolean {
  const distanceM = distanceMeters(user, store.geo);
  const coverageM = store.coverageKm * 1000;
  return distanceM <= coverageM;
}

/**
 * Calculate the bounding box for a given point and radius
 * Useful for filtering stores by approximate distance before precise calculation
 *
 * @param center - Center point
 * @param radiusKm - Radius in kilometers
 * @returns Bounding box with min/max latitude and longitude
 *
 * @example
 * ```typescript
 * const center = { lat: 4.7110, lng: -74.0721 };
 * const bounds = getBoundingBox(center, 5);
 * // Query stores where lat >= bounds.minLat AND lat <= bounds.maxLat ...
 * ```
 */
export function getBoundingBox(
  center: LatLng,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  // Approximate degrees per kilometer
  // 1 degree latitude ≈ 111 km
  // 1 degree longitude ≈ 111 km * cos(latitude)
  const latDegreePerKm = 1 / 111;
  const lngDegreePerKm = 1 / (111 * Math.cos(toRadians(center.lat)));

  const latDelta = radiusKm * latDegreePerKm;
  const lngDelta = radiusKm * lngDegreePerKm;

  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta
  };
}

/**
 * Format distance for display
 *
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "150 m" or "2.5 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
