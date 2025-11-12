/**
 * Interactive test screen for LocationProvider
 * Tests GPS permissions, manual address entry, and reverse geocoding
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LocationProvider, useLocation } from '../../../src/context/LocationProvider';

/**
 * Inner component that uses LocationProvider
 */
function LocationTestContent() {
  const {
    center,
    method,
    address,
    permissionStatus,
    loading,
    error,
    setLocationByAddress,
    requestLocation,
    clearLocation
  } = useLocation();

  const [addressInput, setAddressInput] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  const handleRequestGPS = async () => {
    try {
      await requestLocation();
    } catch (err) {
      Alert.alert('Error', 'No se pudo obtener la ubicación GPS');
    }
  };

  const handleGeocodeAddress = async () => {
    if (!addressInput.trim()) {
      Alert.alert('Error', 'Por favor ingresa una dirección');
      return;
    }

    setGeocoding(true);
    try {
      await setLocationByAddress(addressInput);
      Alert.alert('Éxito', 'Dirección geocodificada correctamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al geocodificar';
      Alert.alert('Error', errorMsg);
    } finally {
      setGeocoding(false);
    }
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Text style={styles.badgeGranted}>✓ Permisos Otorgados</Text>;
      case 'denied':
        return <Text style={styles.badgeDenied}>✗ Permisos Denegados</Text>;
      case 'undetermined':
        return <Text style={styles.badgeUndetermined}>? No Solicitados</Text>;
    }
  };

  const getMethodBadge = () => {
    if (!method) return null;

    if (method === 'gps') {
      return <Text style={styles.badgeGPS}>📍 GPS</Text>;
    } else {
      return <Text style={styles.badgeAddress}>📝 Dirección Manual</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Location Provider Test</Text>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Instrucciones</Text>
        <Text style={styles.instructions}>
          1. Haz clic en &quot;Solicitar Ubicación GPS&quot;{'\n'}
          2. Si se niegan permisos, ingresa dirección manual{'\n'}
          3. Verifica que center y address se actualizan{'\n'}
          4. Prueba reverse geocoding con GPS
        </Text>
      </View>

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Estado Actual</Text>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Permisos:</Text>
          {getPermissionBadge()}
        </View>

        {method && (
          <View style={styles.statusRow}>
            <Text style={styles.label}>Método:</Text>
            {getMethodBadge()}
          </View>
        )}

        {center && (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Coordenadas:</Text>
              <Text style={styles.value}>
                {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
              </Text>
            </View>

            {address && (
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>Dirección:</Text>
                <Text style={styles.addressText}>{address}</Text>
              </View>
            )}
          </>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#007AFF" />
            <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}
      </View>

      {/* GPS Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Ubicación GPS</Text>
        <Text style={styles.instructions}>Solicita permisos y obtiene ubicación por GPS</Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleRequestGPS}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Solicitar Ubicación GPS</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Manual Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Dirección Manual</Text>
        <Text style={styles.instructions}>Ingresa una dirección para geocodificar</Text>

        <Text style={styles.label}>Dirección:</Text>
        <TextInput
          style={styles.input}
          value={addressInput}
          onChangeText={setAddressInput}
          placeholder="Ej: Calle 72 #10-34, Bogotá"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleGeocodeAddress}
          disabled={geocoding || loading}
        >
          {geocoding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Geocodificar Dirección</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          💡 Ejemplos:{'\n'}• Calle 72 #10-34, Bogotá{'\n'}• Carrera 7 #32-16, Bogotá, Colombia
          {'\n'}• Plaza de Bolívar, Bogotá
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Acciones</Text>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearLocation}
          disabled={!center}
        >
          <Text style={styles.buttonText}>Limpiar Ubicación</Text>
        </TouchableOpacity>
      </View>

      {/* Permission Help */}
      {permissionStatus === 'denied' && (
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>🔒 Permisos Denegados</Text>
          <Text style={styles.helpText}>
            Los permisos de ubicación fueron denegados. Para habilitarlos:{'\n\n'}
            1. Abre Configuración del dispositivo{'\n'}
            2. Busca esta aplicación{'\n'}
            3. Habilita permisos de ubicación{'\n\n'}O ingresa tu dirección manualmente arriba.
          </Text>
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

/**
 * Main test screen with LocationProvider wrapper
 */
export default function LocationTestScreen() {
  return (
    <LocationProvider>
      <LocationTestContent />
    </LocationProvider>
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    color: '#333',
    minWidth: 90
  },
  value: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  badgeGranted: {
    backgroundColor: '#28a745',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  badgeDenied: {
    backgroundColor: '#dc3545',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  badgeUndetermined: {
    backgroundColor: '#6c757d',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  badgeGPS: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  badgeAddress: {
    backgroundColor: '#17a2b8',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  addressBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 12,
    marginTop: 8
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    marginTop: 8
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF'
  },
  errorBox: {
    backgroundColor: '#fee',
    borderRadius: 4,
    padding: 12,
    marginTop: 8
  },
  errorText: {
    color: '#c00',
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginBottom: 8
  },
  primaryButton: {
    backgroundColor: '#007AFF'
  },
  secondaryButton: {
    backgroundColor: '#17a2b8'
  },
  dangerButton: {
    backgroundColor: '#dc3545'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18
  },
  helpBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffc107'
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8
  },
  helpText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20
  },
  spacer: {
    height: 32
  }
});
