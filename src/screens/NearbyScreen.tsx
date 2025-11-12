/**
 * NearbyScreen - Store Discovery Screen
 *
 * Features:
 * - Header with current address and "Change Location" button
 * - Filters: isOpen (default on), hasDelivery, category
 * - FlatList of stores with pull-to-refresh and pagination
 * - Toggle between List and Map view
 * - Optimized for <200ms render with 50 items (memo, virtualization)
 *
 * Usage:
 * ```tsx
 * <NearbyScreen />
 * ```
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import CoverageOverlay from '../components/CoverageOverlay';
import StoreCard from '../components/StoreCard';
import { useLocation } from '../context/LocationProvider';
import { getStoreService } from '../services/registry';
import type { Store } from '../types/models';

interface Filters {
  isOpen: boolean;
  hasDelivery: boolean;
  categoryId: string | null;
}

type ViewMode = 'list' | 'map';

const ITEMS_PER_PAGE = 20;
const DEFAULT_RADIUS_KM = 5;

export default function NearbyScreen() {
  const { center, address, loading: locationLoading, requestLocation } = useLocation();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [filters, setFilters] = useState<Filters>({
    isOpen: true, // On by default
    hasDelivery: false,
    categoryId: null
  });

  // Get StoreService from registry
  const storeService = useMemo(() => {
    return getStoreService();
  }, []);

  /**
   * Load stores from StoreService
   */
  const loadStores = useCallback(
    async (reset = false) => {
      if (!center) return;

      const currentOffset = reset ? 0 : offset;

      try {
        if (reset) {
          setLoading(true);
          setStores([]);
        }

        const results = await storeService.listNearby({
          center,
          radiusKm: DEFAULT_RADIUS_KM,
          isOpen: filters.isOpen,
          hasDelivery: filters.hasDelivery || undefined,
          categoryId: filters.categoryId || undefined,
          limit: ITEMS_PER_PAGE,
          offset: currentOffset
        });

        if (reset) {
          setStores(results);
          setOffset(ITEMS_PER_PAGE);
        } else {
          setStores((prev) => [...prev, ...results]);
          setOffset((prev) => prev + ITEMS_PER_PAGE);
        }

        setHasMore(results.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error('Error loading stores:', error);
        Alert.alert('Error', 'No se pudieron cargar las tiendas. Intenta de nuevo.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [center, filters, offset, storeService]
  );

  /**
   * Initial load and reload when center or filters change
   */
  useEffect(() => {
    if (center) {
      loadStores(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, filters.isOpen, filters.hasDelivery, filters.categoryId]);

  /**
   * Request location on mount if not available
   */
  useEffect(() => {
    if (!center && !locationLoading) {
      requestLocation();
    }
  }, [center, locationLoading, requestLocation]);

  /**
   * Pull-to-refresh handler
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadStores(true);
  }, [loadStores]);

  /**
   * Load more (pagination)
   */
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && stores.length > 0) {
      loadStores(false);
    }
  }, [loading, hasMore, stores.length, loadStores]);

  /**
   * Toggle filter
   */
  const toggleFilter = useCallback((key: keyof Filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }));
  }, []);

  /**
   * Handle store card press
   */
  const handleStorePress = useCallback((store: Store) => {
    Alert.alert(
      store.name,
      `Dirección: ${store.address}\n\nTeléfono: ${store.contact.phone || 'No disponible'}`,
      [{ text: 'Cerrar' }]
    );
  }, []);

  /**
   * Render store card (memoized via StoreCard component)
   */
  const renderStoreCard = useCallback(
    (props: { item: Store }) => {
      if (!center) return null;

      return <StoreCard store={props.item} userLocation={center} onPress={handleStorePress} />;
    },
    [center, handleStorePress]
  );

  /**
   * Render empty state
   */
  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No hay tiendas cercanas</Text>
        <Text style={styles.emptyText}>Intenta cambiar los filtros o tu ubicación</Text>
      </View>
    );
  }, [loading]);

  /**
   * Render footer (loading indicator for pagination)
   */
  const renderFooter = useCallback(() => {
    if (!loading || stores.length === 0) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [loading, stores.length]);

  /**
   * Extract key for FlatList
   */
  const keyExtractor = useCallback((item: Store) => item.id, []);

  // Show loading if no center yet
  if (!center) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          {locationLoading ? (
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
            </>
          ) : (
            <>
              <Text style={styles.loadingTitle}>📍 Necesitamos tu ubicación</Text>
              <Text style={styles.loadingText}>
                Para mostrarte tiendas cercanas, activa tu GPS o ingresa tu dirección manualmente.
              </Text>
              <TouchableOpacity style={styles.button} onPress={requestLocation}>
                <Text style={styles.buttonText}>Activar GPS</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            📍 {address || 'Ubicación actual'}
          </Text>
          <TouchableOpacity onPress={requestLocation}>
            <Text style={styles.changeButton}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              Lista
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              Mapa
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filters.isOpen && styles.filterChipActive]}
          onPress={() => toggleFilter('isOpen')}
        >
          <Text style={[styles.filterText, filters.isOpen && styles.filterTextActive]}>
            {filters.isOpen ? '✅' : '⬜'} Solo Abierto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filters.hasDelivery && styles.filterChipActive]}
          onPress={() => toggleFilter('hasDelivery')}
        >
          <Text style={[styles.filterText, filters.hasDelivery && styles.filterTextActive]}>
            {filters.hasDelivery ? '✅' : '⬜'} Delivery
          </Text>
        </TouchableOpacity>

        <Text style={styles.resultsCount}>{stores.length} tiendas encontradas</Text>
      </View>

      {/* List or Map View */}
      {viewMode === 'list' ? (
        <FlatList
          data={stores}
          renderItem={renderStoreCard}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        />
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: center.lat,
            longitude: center.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          }}
        >
          {/* User Location Marker */}
          <Marker
            coordinate={{
              latitude: center.lat,
              longitude: center.lng
            }}
            title="Tu ubicación"
            pinColor="blue"
          />

          {/* Store Markers with Coverage Circles */}
          {stores.map((store) => (
            <React.Fragment key={store.id}>
              <Marker
                coordinate={{
                  latitude: store.geo.lat,
                  longitude: store.geo.lng
                }}
                title={store.name}
                description={store.address}
                pinColor={store.isOpen ? 'green' : 'red'}
                onCalloutPress={() => handleStorePress(store)}
              />
              <CoverageOverlay
                center={store.geo}
                radiusKm={store.coverageKm}
                strokeColor={store.isOpen ? '#4CAF50' : '#F44336'}
                fillColor={store.isOpen ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'}
              />
            </React.Fragment>
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8
  },
  changeButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600'
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF'
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666'
  },
  toggleTextActive: {
    color: '#fff'
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  filterChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3'
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666'
  },
  filterTextActive: {
    color: '#1976D2'
  },
  resultsCount: {
    fontSize: 12,
    color: '#888',
    marginLeft: 'auto'
  },
  listContent: {
    paddingBottom: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center'
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  map: {
    flex: 1
  }
});
