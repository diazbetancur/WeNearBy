import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Business, ServiceFactory, ServiceType, useApiService } from '../../src/shared/services';

/**
 * Ejemplo de componente que usa los servicios abstractos
 *
 * Este componente demuestra cómo:
 * 1. Usar el hook useApiService para obtener el servicio actual
 * 2. Cambiar entre diferentes implementaciones de servicios
 * 3. Migrar fácilmente de Firebase a Node.js
 */
export default function ApiServiceExampleScreen() {
  const apiService = useApiService();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceType>('firebase');

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getBusinesses({ limit: 10 });

      if (response.success && response.data) {
        setBusinesses(response.data);
      } else {
        Alert.alert('Error', response.error || 'Error al cargar negocios');
      }
    } catch (error: any) {
      console.error('Error loading businesses:', error);
      Alert.alert('Error', 'Error inesperado al cargar negocios');
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const switchToFirebase = () => {
    try {
      ServiceFactory.switchService('firebase');
      setCurrentService('firebase');
      Alert.alert('Servicio Cambiado', 'Ahora usando Firebase como backend', [
        { text: 'OK', onPress: loadBusinesses }
      ]);
    } catch (error: any) {
      console.error('Error switching to Firebase:', error);
      Alert.alert('Error', 'Error al cambiar a Firebase');
    }
  };

  const switchToNodeJS = () => {
    try {
      // En un caso real, esto sería tu URL de producción
      const baseUrl = 'https://api.wenearby.com';

      ServiceFactory.switchService('nodejs', { baseUrl });
      setCurrentService('nodejs');
      Alert.alert(
        'Servicio Cambiado',
        'Ahora usando Node.js backend\n\n⚠️ NOTA: Este servicio es solo un ejemplo y no está implementado aún.',
        [{ text: 'OK', onPress: loadBusinesses }]
      );
    } catch (error: any) {
      console.error('Error switching to Node.js:', error);
      Alert.alert('Error', error.message || 'Error al cambiar a Node.js');
    }
  };

  const testAuth = async () => {
    try {
      const response = await apiService.getCurrentUser();

      if (response.success) {
        Alert.alert(
          'Usuario Actual',
          response.data ? `Logueado como: ${response.data.email}` : 'No hay usuario logueado'
        );
      } else {
        Alert.alert('Error', response.error || 'Error al obtener usuario');
      }
    } catch (error: any) {
      console.error('Error testing auth:', error);
      Alert.alert('Error', 'Error al verificar autenticación');
    }
  };

  const createTestBusiness = async () => {
    try {
      const testBusiness = {
        name: 'Negocio de Prueba',
        description: 'Este es un negocio de prueba creado desde la app',
        address: 'Calle Falsa 123',
        category: 'Restaurante',
        ownerId: 'test-owner-id',
        isActive: true
      };

      const response = await apiService.createBusiness(testBusiness);

      if (response.success) {
        Alert.alert('Éxito', 'Negocio de prueba creado exitosamente', [
          { text: 'OK', onPress: loadBusinesses }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Error al crear negocio');
      }
    } catch (error: any) {
      console.error('Error creating business:', error);
      Alert.alert('Error', 'Error inesperado al crear negocio');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Servicios API Abstractos</Text>
        <Text style={styles.subtitle}>
          Servicio actual: <Text style={styles.highlight}>{currentService}</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cambiar Servicio</Text>
        <Text style={styles.description}>
          Cambia fácilmente entre Firebase y Node.js sin cambiar código
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.serviceButton, currentService === 'firebase' && styles.activeButton]}
            onPress={switchToFirebase}
          >
            <Text
              style={[styles.buttonText, currentService === 'firebase' && styles.activeButtonText]}
            >
              🔥 Firebase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.serviceButton, currentService === 'nodejs' && styles.activeButton]}
            onPress={switchToNodeJS}
          >
            <Text
              style={[styles.buttonText, currentService === 'nodejs' && styles.activeButtonText]}
            >
              🚀 Node.js
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pruebas de API</Text>

        <TouchableOpacity style={styles.testButton} onPress={testAuth}>
          <Text style={styles.buttonText}>🔐 Probar Autenticación</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={loadBusinesses} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '⏳ Cargando...' : '🏪 Cargar Negocios'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={createTestBusiness}>
          <Text style={styles.buttonText}>➕ Crear Negocio de Prueba</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Negocios ({businesses.length})</Text>
        {businesses.length === 0 ? (
          <Text style={styles.emptyText}>
            {loading ? 'Cargando negocios...' : 'No hay negocios disponibles'}
          </Text>
        ) : (
          businesses.map((business) => (
            <View key={business.id} style={styles.businessCard}>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text style={styles.businessCategory}>{business.category}</Text>
              <Text style={styles.businessAddress}>{business.address}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ventajas de esta Arquitectura</Text>
        <Text style={styles.advantage}>✅ Migración fácil entre servicios</Text>
        <Text style={styles.advantage}>✅ Código consistente y limpio</Text>
        <Text style={styles.advantage}>✅ Testing simplificado</Text>
        <Text style={styles.advantage}>✅ Escalabilidad mejorada</Text>
        <Text style={styles.advantage}>✅ Mantenimiento reducido</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  highlight: {
    fontWeight: 'bold',
    color: '#007AFF'
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  serviceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center'
  },
  activeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    marginBottom: 12
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  activeButtonText: {
    color: '#fff'
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20
  },
  businessCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  businessCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2
  },
  businessAddress: {
    fontSize: 12,
    color: '#666'
  },
  advantage: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 4,
    paddingLeft: 8
  }
});
