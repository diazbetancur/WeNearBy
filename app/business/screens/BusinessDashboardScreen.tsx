import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { firestore } from '../../../services/firebase';

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  status: string;
  verified: boolean;
  ownerId: string;
}

/**
 * Dashboard principal para propietarios de negocios
 *
 * Funcionalidades:
 * 1. Resumen de negocios del usuario
 * 2. Estadísticas básicas
 * 3. Acciones rápidas
 * 4. Navegación a gestión de negocios
 */
export default function BusinessDashboardScreen() {
  const { currentUser, isBusiness } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    pendingBusinesses: 0
  });

  useEffect(() => {
    loadUserBusinesses();
  }, [currentUser]);

  const loadUserBusinesses = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const businessesQuery = query(
        collection(firestore, 'businesses'),
        where('ownerId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(businessesQuery);
      const userBusinesses: Business[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data()
          } as Business)
      );

      setBusinesses(userBusinesses);

      // Calcular estadísticas
      const totalBusinesses = userBusinesses.length;
      const activeBusinesses = userBusinesses.filter((b) => b.status === 'active').length;
      const pendingBusinesses = userBusinesses.filter((b) => !b.verified).length;

      setStats({
        totalBusinesses,
        activeBusinesses,
        pendingBusinesses
      });
    } catch (error) {
      console.error('Error cargando negocios:', error);
      Alert.alert('Error', 'No se pudieron cargar tus negocios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewBusiness = () => {
    // Navegar a crear negocio
    Alert.alert('Crear Nuevo Negocio', '¿Deseas crear un nuevo negocio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí, crear',
        onPress: () => {
          Alert.alert('Info', 'Función en desarrollo');
        }
      }
    ]);
  };

  const handleManageBusiness = (business: Business) => {
    Alert.alert(`Gestionar: ${business.name}`, 'Selecciona una acción:', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Editar Información', onPress: () => Alert.alert('Info', 'Función en desarrollo') },
      { text: 'Ver Productos', onPress: () => Alert.alert('Info', 'Función en desarrollo') },
      { text: 'Estadísticas', onPress: () => Alert.alert('Info', 'Función en desarrollo') }
    ]);
  };

  if (!isBusiness()) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.noAccessTitle}>🚫 Acceso Denegado</Text>
        <Text style={styles.noAccessText}>
          No tienes permisos para acceder al dashboard de negocios.
          {'\n\n'}Para obtener acceso, crea tu primer negocio desde la pantalla principal.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏪 Dashboard de Negocios</Text>
        <Text style={styles.subtitle}>Bienvenido, {currentUser?.email?.split('@')[0]}</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalBusinesses}</Text>
          <Text style={styles.statLabel}>Total Negocios</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeBusinesses}</Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingBusinesses}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleCreateNewBusiness}>
          <Text style={styles.actionButtonText}>➕ Crear Nuevo Negocio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => Alert.alert('Info', 'Función en desarrollo')}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            📊 Ver Todas las Estadísticas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Negocios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏬 Mis Negocios</Text>

        {loading ? (
          <Text style={styles.loadingText}>Cargando negocios...</Text>
        ) : businesses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>📭 Aún no tienes negocios registrados</Text>
            <Text style={styles.emptyStateSubtext}>Crea tu primer negocio para comenzar</Text>
            <TouchableOpacity
              style={styles.createFirstBusinessButton}
              onPress={handleCreateNewBusiness}
            >
              <Text style={styles.createFirstBusinessButtonText}>🚀 Crear Mi Primer Negocio</Text>
            </TouchableOpacity>
          </View>
        ) : (
          businesses.map((business) => (
            <TouchableOpacity
              key={business.id}
              style={styles.businessCard}
              onPress={() => handleManageBusiness(business)}
            >
              <View style={styles.businessCardHeader}>
                <Text style={styles.businessName}>{business.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    business.verified ? styles.verifiedBadge : styles.pendingBadge
                  ]}
                >
                  <Text style={styles.statusText}>
                    {business.verified ? 'Verificado' : 'Pendiente'}
                  </Text>
                </View>
              </View>

              <Text style={styles.businessCategory}>{business.category}</Text>
              <Text style={styles.businessDescription} numberOfLines={2}>
                {business.description}
              </Text>

              <View style={styles.businessFooter}>
                <Text style={styles.businessAddress}>📍 {business.address}</Text>
                <Text style={styles.manageText}>Tocar para gestionar →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#e1f0ff'
  },
  noAccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center'
  },
  noAccessText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  secondaryButtonText: {
    color: '#007AFF'
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20
  },
  createFirstBusinessButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25
  },
  createFirstBusinessButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  businessCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  businessCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  verifiedBadge: {
    backgroundColor: '#28a745'
  },
  pendingBadge: {
    backgroundColor: '#ffc107'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff'
  },
  businessCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4
  },
  businessDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  businessAddress: {
    fontSize: 12,
    color: '#999',
    flex: 1
  },
  manageText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500'
  }
});
