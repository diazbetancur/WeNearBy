/**
 * Nearby Screen Test
 *
 * Interactive test screen for NearbyScreen component
 * Tests:
 * - Location handling
 * - Filters
 * - List/Map toggle
 * - Pull-to-refresh
 * - Pagination
 * - Performance with 50 items
 */

import { Stack } from 'expo-router';
import React from 'react';
import { LocationProvider } from '../../src/context/LocationProvider';
import NearbyScreen from '../../src/screens/NearbyScreen';

export default function NearbyTestScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Test: Nearby Stores',
          headerShown: true
        }}
      />
      <LocationProvider>
        <NearbyScreen />
      </LocationProvider>
    </>
  );
}
