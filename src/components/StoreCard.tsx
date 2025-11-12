/**
 * StoreCard Component
 *
 * Displays a store card with:
 * - Store name and description
 * - Distance from user
 * - Status chips (Open/Closed, Delivery available)
 * - Category badges
 * - Tap to view details
 */

import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { distanceMeters, formatDistance } from '../geo/geo';
import type { LatLng, Store } from '../types/models';

interface StoreCardProps {
  store: Store;
  userLocation: LatLng;
  onPress?: (store: Store) => void;
}

const StoreCard = memo<StoreCardProps>(({ store, userLocation, onPress }) => {
  const meters = distanceMeters(userLocation, store.geo);
  const distance = formatDistance(meters);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(store)} activeOpacity={0.7}>
      {/* Header: Name and Distance */}
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {store.name}
        </Text>
        <Text style={styles.distance}>{distance}</Text>
      </View>

      {/* Description */}
      {store.description && (
        <Text style={styles.description} numberOfLines={2}>
          {store.description}
        </Text>
      )}

      {/* Address */}
      <Text style={styles.address} numberOfLines={1}>
        📍 {store.address}
      </Text>

      {/* Status Chips */}
      <View style={styles.chipsContainer}>
        {/* Open/Closed Chip */}
        <View style={[styles.chip, store.isOpen ? styles.chipOpen : styles.chipClosed]}>
          <Text
            style={[styles.chipText, store.isOpen ? styles.chipTextOpen : styles.chipTextClosed]}
          >
            {store.isOpen ? '🟢 Abierto' : '🔴 Cerrado'}
          </Text>
        </View>

        {/* Delivery Chip */}
        {store.hasDelivery && (
          <View style={[styles.chip, styles.chipDelivery]}>
            <Text style={styles.chipText}>🚚 Delivery</Text>
          </View>
        )}

        {/* Coverage Chip */}
        <View style={[styles.chip, styles.chipCoverage]}>
          <Text style={styles.chipText}>📡 {store.coverageKm} km</Text>
        </View>
      </View>

      {/* Operating Hours (if available) */}
      {store.operatingHours && (
        <Text style={styles.hours}>
          🕐 {store.operatingHours.open} - {store.operatingHours.close}
        </Text>
      )}
    </TouchableOpacity>
  );
});

StoreCard.displayName = 'StoreCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20
  },
  address: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1
  },
  chipOpen: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50'
  },
  chipClosed: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336'
  },
  chipDelivery: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3'
  },
  chipCoverage: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0'
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  chipTextOpen: {
    color: '#2E7D32'
  },
  chipTextClosed: {
    color: '#C62828'
  },
  hours: {
    fontSize: 12,
    color: '#888',
    marginTop: 8
  }
});

export default StoreCard;
