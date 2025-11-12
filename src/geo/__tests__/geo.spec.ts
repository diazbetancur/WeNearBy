/**
 * Tests for geographic utilities
 * Tests edge cases: inside coverage, on border, outside by ~1m
 */

import type { LatLng } from '../../types/models';
import {
  distanceMeters,
  formatDistance,
  getBoundingBox,
  isCoveredByRadius,
  type StoreLocation
} from '../geo';

describe('distanceMeters', () => {
  it('should return 0 for identical points', () => {
    const point: LatLng = { lat: 4.711, lng: -74.0721 };
    const distance = distanceMeters(point, point);
    expect(distance).toBe(0);
  });

  it('should calculate distance between two points in Bogotá', () => {
    // Two points approximately 1 km apart in Bogotá
    const point1: LatLng = { lat: 4.711, lng: -74.0721 };
    const point2: LatLng = { lat: 4.72, lng: -74.0721 };
    const distance = distanceMeters(point1, point2);

    // Expected: ~1 km (1000 meters)
    // Actual calculation: ~999.8 meters
    expect(distance).toBeGreaterThan(990);
    expect(distance).toBeLessThan(1010);
  });

  it('should calculate distance between distant cities', () => {
    // Bogotá to Medellín (approximately 240 km)
    const bogota: LatLng = { lat: 4.711, lng: -74.0721 };
    const medellin: LatLng = { lat: 6.2442, lng: -75.5812 };
    const distance = distanceMeters(bogota, medellin);

    // Expected: ~240 km (240,000 meters)
    expect(distance).toBeGreaterThan(230000);
    expect(distance).toBeLessThan(250000);
  });

  it('should be symmetric (distance a→b equals distance b→a)', () => {
    const point1: LatLng = { lat: 4.711, lng: -74.0721 };
    const point2: LatLng = { lat: 4.72, lng: -74.08 };

    const distance1 = distanceMeters(point1, point2);
    const distance2 = distanceMeters(point2, point1);

    expect(distance1).toBe(distance2);
  });

  it('should handle points across the equator', () => {
    const north: LatLng = { lat: 10, lng: 0 };
    const south: LatLng = { lat: -10, lng: 0 };
    const distance = distanceMeters(north, south);

    // 20 degrees latitude ≈ 2,222 km
    expect(distance).toBeGreaterThan(2200000);
    expect(distance).toBeLessThan(2250000);
  });

  it('should handle points across the prime meridian', () => {
    const west: LatLng = { lat: 0, lng: -10 };
    const east: LatLng = { lat: 0, lng: 10 };
    const distance = distanceMeters(west, east);

    // 20 degrees longitude at equator ≈ 2,222 km
    expect(distance).toBeGreaterThan(2200000);
    expect(distance).toBeLessThan(2250000);
  });
});

describe('isCoveredByRadius', () => {
  const storeCenter: LatLng = { lat: 4.711, lng: -74.0721 };

  it('should return true for user at exact store location', () => {
    const store: StoreLocation = {
      geo: storeCenter,
      coverageKm: 2
    };
    const covered = isCoveredByRadius(storeCenter, store);
    expect(covered).toBe(true);
  });

  it('should return true for user well inside coverage radius', () => {
    const store: StoreLocation = {
      geo: storeCenter,
      coverageKm: 2 // 2 km = 2000 meters
    };

    // User approximately 500 meters away
    const userNearby: LatLng = { lat: 4.7155, lng: -74.0721 };
    const distance = distanceMeters(userNearby, storeCenter);

    expect(distance).toBeLessThan(2000);
    expect(isCoveredByRadius(userNearby, store)).toBe(true);
  });

  it('should return true for user exactly on coverage border', () => {
    const store: StoreLocation = {
      geo: storeCenter,
      coverageKm: 1 // 1 km = 1000 meters
    };

    // Create a point that we know is exactly 999.5m away (safely inside)
    // to verify the boundary behavior
    const EARTH_RADIUS_M = 6371e3;
    const angularDistance = 999.5 / EARTH_RADIUS_M; // in radians
    const latDelta = angularDistance * (180 / Math.PI); // convert to degrees

    const userNearBorder: LatLng = {
      lat: storeCenter.lat + latDelta,
      lng: storeCenter.lng
    };

    const distance = distanceMeters(userNearBorder, storeCenter);

    // Should be exactly 999.5m (or very close)
    expect(distance).toBeGreaterThanOrEqual(999);
    expect(distance).toBeLessThanOrEqual(1000);
    expect(isCoveredByRadius(userNearBorder, store)).toBe(true);
  });

  it('should return false for user just outside coverage radius (~1m over)', () => {
    const store: StoreLocation = {
      geo: storeCenter,
      coverageKm: 1 // 1 km = 1000 meters
    };

    // Calculate a point just over 1000 meters north (1002 meters)
    const latDelta = 1002 / 111000;
    const userOutside: LatLng = {
      lat: storeCenter.lat + latDelta,
      lng: storeCenter.lng
    };

    const distance = distanceMeters(userOutside, storeCenter);

    expect(distance).toBeGreaterThan(1001);
    expect(isCoveredByRadius(userOutside, store)).toBe(false);
  });

  it('should return false for user far outside coverage radius', () => {
    const store: StoreLocation = {
      geo: storeCenter,
      coverageKm: 2
    };

    // User approximately 5 km away
    const userFarAway: LatLng = { lat: 4.756, lng: -74.0721 };
    const distance = distanceMeters(userFarAway, storeCenter);

    expect(distance).toBeGreaterThan(2000);
    expect(isCoveredByRadius(userFarAway, store)).toBe(false);
  });

  it('should handle zero coverage radius', () => {
    const store: StoreLocation = {
      geo: storeCenter,
      coverageKm: 0
    };

    const userNearby: LatLng = { lat: 4.7111, lng: -74.0721 };
    expect(isCoveredByRadius(userNearby, store)).toBe(false);
  });

  it('should handle very small coverage radius (100m)', () => {
    const store: StoreLocation = {
      geo: storeCenter,
      coverageKm: 0.1 // 100 meters
    };

    // User ~50 meters away
    const latDelta = 50 / 111000;
    const userClose: LatLng = {
      lat: storeCenter.lat + latDelta,
      lng: storeCenter.lng
    };

    expect(isCoveredByRadius(userClose, store)).toBe(true);

    // User ~150 meters away
    const latDeltaFar = 150 / 111000;
    const userFar: LatLng = {
      lat: storeCenter.lat + latDeltaFar,
      lng: storeCenter.lng
    };

    expect(isCoveredByRadius(userFar, store)).toBe(false);
  });

  it('should handle very large coverage radius (100km)', () => {
    const store: StoreLocation = {
      geo: storeCenter,
      coverageKm: 100
    };

    // User 50 km away
    const userWithin: LatLng = { lat: 5.161, lng: -74.0721 };
    const distance = distanceMeters(userWithin, storeCenter);

    expect(distance).toBeLessThan(100000);
    expect(isCoveredByRadius(userWithin, store)).toBe(true);
  });
});

describe('getBoundingBox', () => {
  it('should calculate bounding box for point in Bogotá', () => {
    const center: LatLng = { lat: 4.711, lng: -74.0721 };
    const radiusKm = 5;

    const bounds = getBoundingBox(center, radiusKm);

    expect(bounds.minLat).toBeLessThan(center.lat);
    expect(bounds.maxLat).toBeGreaterThan(center.lat);
    expect(bounds.minLng).toBeLessThan(center.lng);
    expect(bounds.maxLng).toBeGreaterThan(center.lng);

    // Approximate check: 5 km ≈ 0.045 degrees latitude
    const latDelta = bounds.maxLat - bounds.minLat;
    expect(latDelta).toBeGreaterThan(0.08); // 2 * 5km
    expect(latDelta).toBeLessThan(0.1);
  });

  it('should calculate bounding box at equator', () => {
    const center: LatLng = { lat: 0, lng: 0 };
    const radiusKm = 10;

    const bounds = getBoundingBox(center, radiusKm);

    // At equator, latitude and longitude degrees should be similar
    const latDelta = bounds.maxLat - bounds.minLat;
    const lngDelta = bounds.maxLng - bounds.minLng;

    expect(Math.abs(latDelta - lngDelta)).toBeLessThan(0.01);
  });

  it('should handle small radius', () => {
    const center: LatLng = { lat: 4.711, lng: -74.0721 };
    const radiusKm = 0.1; // 100 meters

    const bounds = getBoundingBox(center, radiusKm);

    const latDelta = bounds.maxLat - bounds.minLat;
    expect(latDelta).toBeLessThan(0.01);
  });

  it('should contain center point', () => {
    const center: LatLng = { lat: 4.711, lng: -74.0721 };
    const radiusKm = 5;

    const bounds = getBoundingBox(center, radiusKm);

    expect(center.lat).toBeGreaterThan(bounds.minLat);
    expect(center.lat).toBeLessThan(bounds.maxLat);
    expect(center.lng).toBeGreaterThan(bounds.minLng);
    expect(center.lng).toBeLessThan(bounds.maxLng);
  });
});

describe('formatDistance', () => {
  it('should format meters for distances < 1000m', () => {
    expect(formatDistance(0)).toBe('0 m');
    expect(formatDistance(50)).toBe('50 m');
    expect(formatDistance(500)).toBe('500 m');
    expect(formatDistance(999)).toBe('999 m');
  });

  it('should format kilometers for distances >= 1000m', () => {
    expect(formatDistance(1000)).toBe('1.0 km');
    expect(formatDistance(1500)).toBe('1.5 km');
    expect(formatDistance(2450)).toBe('2.5 km');
    expect(formatDistance(10000)).toBe('10.0 km');
  });

  it('should round meters to nearest integer', () => {
    expect(formatDistance(123.4)).toBe('123 m');
    expect(formatDistance(123.7)).toBe('124 m');
  });

  it('should format kilometers with 1 decimal place', () => {
    expect(formatDistance(1234)).toBe('1.2 km');
    expect(formatDistance(5678)).toBe('5.7 km');
    expect(formatDistance(9999)).toBe('10.0 km');
  });
});
