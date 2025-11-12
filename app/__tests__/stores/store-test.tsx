/**
 * Interactive test screen for StoreService
 * Tests listNearby functionality with MockStoreService
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { MockStoreService } from '../../../src/services/stores/mock-store.service';
import type { LatLng, Store } from '../../../src/types/models';

const storeService = new MockStoreService();

export default function StoreTestScreen() {
  // Default center: Bogotá center (Zona T)
  const [center, setCenter] = useState<LatLng>({ lat: 4.6753, lng: -74.0501 });
  const [latInput, setLatInput] = useState('4.6753');
  const [lngInput, setLngInput] = useState('-74.0501');
  const [isOpen, setIsOpen] = useState(true);
  const [hasDelivery, setHasDelivery] = useState<boolean | undefined>(undefined);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQueryTime, setLastQueryTime] = useState<number | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const lat = parseFloat(latInput);
      const lng = parseFloat(lngInput);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Coordenadas inválidas');
      }

      const searchCenter = { lat, lng };
      setCenter(searchCenter);

      const results = await storeService.listNearby({
        center: searchCenter,
        isOpen,
        hasDelivery,
        limit,
        offset
      });

      setStores(results);
      setLastQueryTime(Date.now() - startTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLatInput('4.6753');
    setLngInput('-74.0501');
    setIsOpen(true);
    setHasDelivery(undefined);
    setLimit(10);
    setOffset(0);
    setStores([]);
    setError(null);
    setLastQueryTime(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Store Service Test</Text>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Instrucciones</Text>
        <Text style={styles.instructions}>
          1. Ingresa coordenadas de búsqueda (lat, lng){'\n'}
          2. Configura filtros (isOpen, hasDelivery){'\n'}
          3. Haz clic en "Buscar Tiendas"{'\n'}
          4. Verifica resultados ordenados por distancia
        </Text>
        <Text style={styles.instructions}>
          📌 Coordenadas de prueba:{'\n'}• Zona T: 4.6753, -74.0501{'\n'}• Usaquén: 4.7110, -74.0310
          {'\n'}• Chapinero: 4.6533, -74.0627
        </Text>
      </View>

      {/* Search Parameters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Parámetros de Búsqueda</Text>

        <Text style={styles.label}>Latitud:</Text>
        <TextInput
          style={styles.input}
          value={latInput}
          onChangeText={setLatInput}
          placeholder="4.6753"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Longitud:</Text>
        <TextInput
          style={styles.input}
          value={lngInput}
          onChangeText={setLngInput}
          placeholder="-74.0501"
          keyboardType="numeric"
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, isOpen && styles.filterButtonActive]}
            onPress={() => setIsOpen(!isOpen)}
          >
            <Text style={styles.filterButtonText}>Solo Abiertas {isOpen ? '✓' : ''}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, hasDelivery && styles.filterButtonActive]}
            onPress={() => setHasDelivery(hasDelivery === undefined ? true : undefined)}
          >
            <Text style={styles.filterButtonText}>Con Delivery {hasDelivery ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paginationRow}>
          <View style={styles.paginationInput}>
            <Text style={styles.label}>Límite:</Text>
            <TextInput
              style={styles.smallInput}
              value={String(limit)}
              onChangeText={(text) => setLimit(parseInt(text) || 10)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.paginationInput}>
            <Text style={styles.label}>Offset:</Text>
            <TextInput
              style={styles.smallInput}
              value={String(offset)}
              onChangeText={(text) => setOffset(parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Buscar Tiendas</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {/* Results Summary */}
      {stores.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Resultados</Text>
          <Text style={styles.resultInfo}>{stores.length} tienda(s) encontrada(s)</Text>
          {lastQueryTime !== null && (
            <Text style={styles.resultInfo}>⏱️ Tiempo de consulta: {lastQueryTime}ms</Text>
          )}
          <Text style={styles.resultInfo}>
            📍 Centro: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Store List */}
      {stores.map((store, index) => (
        <View key={store.id} style={styles.storeCard}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>
              {index + 1}. {store.name}
            </Text>
            <View style={styles.badges}>
              {store.isOpen && <Text style={styles.badgeOpen}>Abierto</Text>}
              {!store.isOpen && <Text style={styles.badgeClosed}>Cerrado</Text>}
              {store.hasDelivery && <Text style={styles.badgeDelivery}>Delivery</Text>}
              {store.featured && <Text style={styles.badgeFeatured}>⭐</Text>}
            </View>
          </View>

          <Text style={styles.storeDescription}>{store.description}</Text>
          <Text style={styles.storeAddress}>📍 {store.address}</Text>

          <View style={styles.storeDetails}>
            <Text style={styles.detailText}>📏 Cobertura: {store.coverageKm} km</Text>
            <Text style={styles.detailText}>
              📞 {store.contact.phone || store.contact.email || 'Sin contacto'}
            </Text>
          </View>

          {store.operatingHours && (
            <Text style={styles.hours}>
              🕒 {store.operatingHours.open} - {store.operatingHours.close}
            </Text>
          )}
        </View>
      ))}

      {/* Empty State */}
      {!loading && stores.length === 0 && !error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            🔍 No se encontraron tiendas{'\n'}
            Intenta con otras coordenadas o filtros
          </Text>
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  paginationRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12
  },
  paginationInput: {
    flex: 1
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50
  },
  primaryButton: {
    backgroundColor: '#007AFF'
  },
  secondaryButton: {
    backgroundColor: '#6c757d'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  errorBox: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  errorText: {
    color: '#c00',
    fontSize: 14
  },
  resultInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  badges: {
    flexDirection: 'row',
    gap: 4
  },
  badgeOpen: {
    backgroundColor: '#28a745',
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeClosed: {
    backgroundColor: '#dc3545',
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeDelivery: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeFeatured: {
    fontSize: 14
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  storeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  detailText: {
    fontSize: 13,
    color: '#666'
  },
  hours: {
    fontSize: 13,
    color: '#666',
    marginTop: 4
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24
  },
  spacer: {
    height: 32
  }
});
