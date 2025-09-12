import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../src/shared/services/RoleContext';

/**
 * Pantalla de prueba para demostrar el sistema de roles
 *
 * Esta pantalla muestra:
 * 1. Información del usuario actual
 * 2. Roles asignados en Firestore
 * 3. Rol actual del RoleContext
 * 4. Restricciones basadas en roles
 */
export default function RoleTestScreen() {
  const navigation = useNavigation();
  const { currentUser, userRoles, isCustomer, isBusiness, hasRole } = useAuth();
  const { currentRole, switchToCustomer, switchToBusiness } = useRole();
  const [canAccessBusiness, setCanAccessBusiness] = useState(false);

  useEffect(() => {
    // Verificar si el usuario puede acceder al panel de negocios
    const checkBusinessAccess = () => {
      const hasBusinessRole = hasRole('business');
      setCanAccessBusiness(hasBusinessRole);
    };

    checkBusinessAccess();
  }, [userRoles, hasRole]);

  const attemptBusinessAccess = () => {
    if (canAccessBusiness) {
      switchToBusiness();
      Alert.alert('✅ Acceso Permitido', 'Tienes permisos para acceder al panel de negocios');
    } else {
      Alert.alert(
        '🚫 Acceso Denegado',
        'No tienes permisos para acceder al panel de negocios.\n\nSolo usuarios con rol "business" pueden acceder.',
        [
          { text: 'Entendido', style: 'default' },
          {
            text: 'Solicitar Acceso',
            style: 'default',
            onPress: () =>
              Alert.alert(
                '📧 Solicitud Enviada',
                'Tu solicitud de acceso al panel de negocios ha sido enviada para revisión.'
              )
          }
        ]
      );
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer':
        return '#007AFF';
      case 'business':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer':
        return '👥';
      case 'business':
        return '🏪';
      default:
        return '👤';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sistema de Roles</Text>
        <Text style={styles.subtitle}>Información de usuario y permisos</Text>
      </View>

      {/* Información del Usuario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Usuario Actual</Text>
        {currentUser ? (
          <>
            <Text style={styles.userInfo}>📧 Email: {currentUser.email}</Text>
            <Text style={styles.userInfo}>🆔 ID: {currentUser.uid}</Text>
            <Text style={styles.userInfo}>
              ✅ Verificado: {currentUser.emailVerified ? 'Sí' : 'No'}
            </Text>
          </>
        ) : (
          <Text style={styles.noUser}>No hay usuario logueado</Text>
        )}
      </View>

      {/* Roles en Firestore */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗂️ Roles Asignados (Firestore)</Text>
        {userRoles.length > 0 ? (
          <View style={styles.rolesContainer}>
            {userRoles.map((role, index) => (
              <View key={index} style={[styles.roleChip, { backgroundColor: getRoleColor(role) }]}>
                <Text style={styles.roleText}>
                  {getRoleIcon(role)} {role.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noRoles}>No hay roles asignados</Text>
        )}
      </View>

      {/* Rol Actual del Context */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎭 Rol Actual (Context)</Text>
        <View style={[styles.currentRoleChip, { backgroundColor: getRoleColor(currentRole) }]}>
          <Text style={styles.currentRoleText}>
            {getRoleIcon(currentRole)} {currentRole.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Verificaciones de Permisos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Verificaciones de Permisos</Text>

        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Es Cliente:</Text>
          <Text style={[styles.permissionValue, { color: isCustomer() ? '#28a745' : '#dc3545' }]}>
            {isCustomer() ? '✅ Sí' : '❌ No'}
          </Text>
        </View>

        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Es Negocio:</Text>
          <Text style={[styles.permissionValue, { color: isBusiness() ? '#28a745' : '#dc3545' }]}>
            {isBusiness() ? '✅ Sí' : '❌ No'}
          </Text>
        </View>

        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Puede acceder a panel business:</Text>
          <Text
            style={[styles.permissionValue, { color: canAccessBusiness ? '#28a745' : '#dc3545' }]}
          >
            {canAccessBusiness ? '✅ Sí' : '❌ No'}
          </Text>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Pruebas de Acceso</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.customerButton]}
          onPress={switchToCustomer}
        >
          <Text style={styles.buttonText}>👥 Cambiar a Cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            canAccessBusiness ? styles.businessButton : styles.disabledButton
          ]}
          onPress={attemptBusinessAccess}
        >
          <Text style={[styles.buttonText, { color: canAccessBusiness ? '#fff' : '#999' }]}>
            🏪 Intentar Acceso a Negocio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.createBusinessButton]}
          onPress={() => navigation.navigate('CreateBusiness' as never)}
        >
          <Text style={styles.buttonText}>🏗️ Crear Mi Negocio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.roleSelectionButton]}
          onPress={() => navigation.navigate('RoleSelection' as never)}
        >
          <Text style={styles.buttonText}>🔄 Cambiar Modo</Text>
        </TouchableOpacity>
      </View>

      {/* Información del Sistema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Información del Sistema</Text>
        <Text style={styles.infoText}>
          • Los nuevos usuarios se registran solo con rol "customer"
        </Text>
        <Text style={styles.infoText}>
          • El acceso al panel de negocios requiere rol "business"
        </Text>
        <Text style={styles.infoText}>
          • Los roles se almacenan en Firestore en /users/{`{userId}`}
        </Text>
        <Text style={styles.infoText}>• El RoleContext maneja el rol activo de la interfaz</Text>
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
  userInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    paddingLeft: 8
  },
  noUser: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic'
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  noRoles: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic'
  },
  currentRoleChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  currentRoleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  permissionLabel: {
    fontSize: 14,
    color: '#555',
    flex: 1
  },
  permissionValue: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center'
  },
  customerButton: {
    backgroundColor: '#007AFF'
  },
  businessButton: {
    backgroundColor: '#28a745'
  },
  createBusinessButton: {
    backgroundColor: '#ff6b35'
  },
  roleSelectionButton: {
    backgroundColor: '#6f42c1'
  },
  disabledButton: {
    backgroundColor: '#e9ecef'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8
  }
});
