/**
 * CoverageOverlay Component
 *
 * Renders a circle overlay on MapView showing store coverage radius
 * Uses react-native-maps Circle component
 */

import React, { memo } from 'react';
import { Circle } from 'react-native-maps';
import type { LatLng } from '../types/models';

interface CoverageOverlayProps {
  center: LatLng;
  radiusKm: number;
  strokeColor?: string;
  fillColor?: string;
}

const CoverageOverlay = memo<CoverageOverlayProps>(
  ({ center, radiusKm, strokeColor = '#007AFF', fillColor = 'rgba(0, 122, 255, 0.15)' }) => {
    return (
      <Circle
        center={{
          latitude: center.lat,
          longitude: center.lng
        }}
        radius={radiusKm * 1000} // Convert km to meters
        strokeWidth={2}
        strokeColor={strokeColor}
        fillColor={fillColor}
      />
    );
  }
);

CoverageOverlay.displayName = 'CoverageOverlay';

export default CoverageOverlay;
