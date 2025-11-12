/**
 * Test screen for Role Service and RoleProvider
 *
 * Usage: Navigate to this screen to test vendor role flows
 * Wrap this in RoleProvider to test the context
 */

import { RoleProvider, useRole } from '@/src/context/RoleContextProvider';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Inner component that uses the RoleProvider
 */
function RoleTestContent() {
  const {
    status,
    isVendorApproved,
    vendorProfile,
    user,
    loading,
    requestVendorRole,
    refreshProfile
  } = useRole();

  const handleRequestVendorRole = async () => {
    try {
      await requestVendorRole();
      Alert.alert('Éxito', 'Solicitud de vendedor enviada. Estado: pending');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      await refreshProfile();
      Alert.alert('Actualizado', 'Perfil actualizado');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⏳ Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎭 Role Service Test</Text>

      {/* User Status */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Usuario</Text>
        {user ? (
          <View>
            <Text style={styles.infoText}>✅ Autenticado</Text>
            <Text style={styles.infoText}>Email: {user.email}</Text>
            <Text style={styles.infoText}>ID: {user.id}</Text>
          </View>
        ) : (
          <Text style={styles.infoText}>❌ No autenticado</Text>
        )}
      </View>

      {/* Vendor Status */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Estado de Vendedor</Text>

        {status === 'anonymous' && (
          <View>
            <Text style={styles.statusText}>🚫 Anónimo</Text>
            <Text style={styles.helperText}>Inicia sesión para solicitar rol de vendedor</Text>
          </View>
        )}

        {status === undefined && user && (
          <View>
            <Text style={styles.statusText}>❓ Sin solicitud</Text>
            <Text style={styles.helperText}>No has solicitado el rol de vendedor</Text>
          </View>
        )}

        {status === 'pending' && (
          <View>
            <Text style={styles.statusText}>⏳ Pendiente</Text>
            <Text style={styles.helperText}>Tu solicitud está pendiente de aprobación</Text>
          </View>
        )}

        {status === 'approved' && (
          <View>
            <Text style={styles.statusText}>✅ Aprobado</Text>
            <Text style={styles.helperText}>Eres un vendedor aprobado</Text>
          </View>
        )}

        {status === 'rejected' && (
          <View>
            <Text style={styles.statusText}>❌ Rechazado</Text>
            <Text style={styles.helperText}>Tu solicitud fue rechazada</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.infoLabel}>isVendorApproved:</Text>
        <Text style={styles.infoValue}>{isVendorApproved ? '✅ true' : '❌ false'}</Text>
      </View>

      {/* Vendor Profile Details */}
      {vendorProfile && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalles del Perfil</Text>
          <Text style={styles.infoText}>ID: {vendorProfile.id}</Text>
          <Text style={styles.infoText}>User ID: {vendorProfile.userId}</Text>
          <Text style={styles.infoText}>Legal Name: {vendorProfile.legalName}</Text>
          <Text style={styles.infoText}>Email: {vendorProfile.contactEmail}</Text>
          {vendorProfile.phone && <Text style={styles.infoText}>Phone: {vendorProfile.phone}</Text>}
          <Text style={styles.infoText}>Status: {vendorProfile.status}</Text>
          <Text style={styles.infoText}>Approved: {vendorProfile.approved ? 'Sí' : 'No'}</Text>
          <Text style={styles.infoText}>
            Created: {new Date(vendorProfile.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.infoText}>
            Updated: {new Date(vendorProfile.updatedAt).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Acciones</Text>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonPrimary,
            (!user || status === 'approved') && styles.buttonDisabled
          ]}
          onPress={handleRequestVendorRole}
          disabled={!user || status === 'approved'}
        >
          <Text style={styles.buttonText}>
            {status === 'approved'
              ? '✅ Ya Aprobado'
              : status === 'pending'
              ? '📝 Re-solicitar Rol'
              : status === 'rejected'
              ? '🔄 Solicitar Nuevamente'
              : '📝 Solicitar Rol de Vendedor'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleRefreshProfile}
          disabled={!user}
        >
          <Text style={styles.buttonTextSecondary}>🔄 Actualizar Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>💡 Instrucciones</Text>
        <Text style={styles.helperText}>
          1. Inicia sesión en la pantalla de Auth Test{'\n'}
          2. Solicita el rol de vendedor aquí{'\n'}
          3. El estado cambiará a "pending"{'\n'}
          4. Usa la consola de Firebase para aprobar/rechazar{'\n'}
          5. El estado se actualizará automáticamente
        </Text>
      </View>

      {/* Firestore Instructions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🔧 Aprobar Manualmente</Text>
        <Text style={styles.helperText}>
          En Firebase Console:{'\n'}
          Firestore → vendor_profiles → [tu_user_id]{'\n'}
          {'\n'}
          Cambia el campo "status":{'\n'}• "approved" → Usuario aprobado como vendedor{'\n'}•
          "rejected" → Solicitud rechazada{'\n'}• "pending" → Solicitud pendiente{'\n'}
          {'\n'}
          El cambio se reflejará automáticamente en la app.
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * Main component wrapped with RoleProvider
 */
export default function RoleTestScreen() {
  return (
    <RoleProvider>
      <RoleTestContent />
    </RoleProvider>
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
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    marginTop: 4
  },
  helperText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12
  },
  button: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center'
  },
  buttonPrimary: {
    backgroundColor: '#007AFF'
  },
  buttonSecondary: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonTextSecondary: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  }
});
