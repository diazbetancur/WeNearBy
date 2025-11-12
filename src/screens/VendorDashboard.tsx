/**
 * VendorDashboard
 *
 * Main dashboard for approved vendors.
 * Displays store summary and navigation to manage products, categories, orders.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useRole } from '../context/RoleContextProvider';
import { getStoreService } from '../services/registry';
import type { Store } from '../types/models';

interface DashboardProps {
  onNavigateToProducts?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToStore?: () => void;
}

export default function VendorDashboard({
  onNavigateToProducts,
  onNavigateToOrders,
  onNavigateToStore
}: DashboardProps) {
  const { user, vendorProfile } = useRole();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const storeService = getStoreService();

  const loadStore = useCallback(async () => {
    if (!user) return;

    try {
      const stores = await storeService.listByVendor(user.id);
      if (stores.length > 0) {
        setStore(stores[0]); // For MVP, one store per vendor
      }
    } catch (error) {
      console.error('Error loading store:', error);
      Alert.alert('Error', 'No se pudo cargar la información de tu tienda');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, storeService]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStore();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando panel...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Vendedor</Text>
        <Text style={styles.subtitle}>
          ¡Bienvenido, {vendorProfile?.legalName || user?.displayName || 'Vendedor'}!
        </Text>
      </View>

      {/* Store Status Card */}
      {store ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏪 {store.name}</Text>
            <View style={[styles.badge, store.isOpen ? styles.badgeOpen : styles.badgeClosed]}>
              <Text style={styles.badgeText}>{store.isOpen ? 'Abierto' : 'Cerrado'}</Text>
            </View>
          </View>

          <Text style={styles.storeDescription}>{store.description}</Text>

          <View style={styles.storeInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📍 Dirección</Text>
              <Text style={styles.infoValue}>{store.address}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📏 Cobertura</Text>
              <Text style={styles.infoValue}>{store.coverageKm} km</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>🚚 Domicilio</Text>
              <Text style={styles.infoValue}>{store.hasDelivery ? 'Sí' : 'No'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={onNavigateToStore}>
            <Text style={styles.editButtonText}>Editar Tienda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.noStoreTitle}>📋 Crea tu Tienda</Text>
          <Text style={styles.noStoreText}>
            Aún no tienes una tienda configurada. Crea tu tienda para empezar a vender.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onNavigateToStore}>
            <Text style={styles.primaryButtonText}>Crear Mi Tienda</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, !store && styles.actionCardDisabled]}
          onPress={onNavigateToProducts}
          disabled={!store}
        >
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionTitle}>Productos</Text>
          <Text style={styles.actionDesc}>Gestionar catálogo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, !store && styles.actionCardDisabled]}
          onPress={onNavigateToOrders}
          disabled={!store}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionTitle}>Pedidos</Text>
          <Text style={styles.actionDesc}>Ver pedidos recibidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, !store && styles.actionCardDisabled]}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
          disabled={!store}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionTitle}>Estadísticas</Text>
          <Text style={styles.actionDesc}>Ver métricas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, !store && styles.actionCardDisabled]}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
          disabled={!store}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionTitle}>Configuración</Text>
          <Text style={styles.actionDesc}>Ajustes de tienda</Text>
        </TouchableOpacity>
      </View>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Consejos</Text>
        <Text style={styles.tipsText}>
          • Mantén tu catálogo actualizado{'\n'}• Responde rápido a los pedidos por WhatsApp{'\n'}•
          Usa fotos de alta calidad para tus productos{'\n'}• Define bien las categorías para
          facilitar la búsqueda
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeOpen: {
    backgroundColor: '#E8F5E9'
  },
  badgeClosed: {
    backgroundColor: '#FFEBEE'
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20
  },
  storeInfo: {
    marginBottom: 16
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600'
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a'
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  noStoreTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center'
  },
  noStoreText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  actionCardDisabled: {
    opacity: 0.5
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center'
  },
  actionDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  tipsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 8
  },
  tipsText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22
  }
});
