/**
 * VendorGuard
 *
 * Guard component that checks vendor approval status.
 * - Redirects to pending screen if status='pending'
 * - Redirects to request screen if no vendor profile
 * - Allows access if status='approved'
 *
 * @example
 * ```tsx
 * <VendorGuard>
 *   <VendorDashboard />
 * </VendorGuard>
 * ```
 */

import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRole } from '../context/RoleContextProvider';
import VendorPendingScreen from '../screens/VendorPendingScreen';
import VendorRequestScreen from '../screens/VendorRequestScreen';

interface VendorGuardProps {
  children: ReactNode;
}

export default function VendorGuard({ children }: VendorGuardProps) {
  const { status, loading } = useRole();

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Verificando permisos...</Text>
      </View>
    );
  }

  // Anonymous user (not signed in)
  if (status === 'anonymous') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Acceso Restringido</Text>
        <Text style={styles.message}>
          Debes iniciar sesión para acceder al panel de vendedores.
        </Text>
      </View>
    );
  }

  // User signed in but no vendor profile (needs to request)
  if (status === undefined) {
    return <VendorRequestScreen />;
  }

  // Vendor request pending approval
  if (status === 'pending') {
    return <VendorPendingScreen />;
  }

  // Vendor request rejected
  if (status === 'rejected') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>❌ Solicitud Rechazada</Text>
        <Text style={styles.message}>
          Tu solicitud para ser vendedor fue rechazada. Por favor contacta a soporte para más
          información.
        </Text>
      </View>
    );
  }

  // Approved vendor - render children
  if (status === 'approved') {
    return <>{children}</>;
  }

  // Fallback for unexpected states
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Estado Desconocido</Text>
      <Text style={styles.message}>No se pudo determinar tu estado de vendedor.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  }
});
