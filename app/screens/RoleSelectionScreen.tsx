import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Pantalla de selección de rol
 *
 * Se muestra cuando:
 * 1. Usuario hace login y tiene múltiples roles
 * 2. Usuario quiere cambiar entre roles disponibles
 *
 * Funcionalidades:
 * - Muestra roles disponibles del usuario
 * - Permite seleccionar rol activo
 * - Navega a la pantalla correspondiente según el rol
 */
export default function RoleSelectionScreen() {
  const navigation = useNavigation();
  const { currentUser, userRoles, currentRole, setCurrentRole, hasMultipleRoles } = useAuth();

  const handleRoleSelection = async (selectedRole: string) => {
    try {
      await setCurrentRole(selectedRole);

      // Navegar según el rol seleccionado
      if (selectedRole === 'customer') {
        // Navegar al flujo de cliente
        navigation.navigate('CustomerTab' as never);
      } else if (selectedRole === 'business') {
        // Navegar al dashboard de negocios
        navigation.navigate('BusinessDashboard' as never);
      }

      Alert.alert(
        '✅ Rol Seleccionado',
        `Has cambiado al modo: ${selectedRole === 'customer' ? 'Cliente' : 'Negocio'}`
      );
    } catch (error) {
      console.error('Error selecting role:', error);
      Alert.alert('Error', 'No se pudo cambiar el rol. Intenta nuevamente.');
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'customer':
        return 'Cliente';
      case 'business':
        return 'Negocio';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string): string => {
    switch (role) {
      case 'customer':
        return 'Buscar y comprar en negocios locales';
      case 'business':
        return 'Gestionar tu negocio y productos';
      default:
        return '';
    }
  };

  const getRoleIcon = (role: string): string => {
    switch (role) {
      case 'customer':
        return '🛒';
      case 'business':
        return '🏪';
      default:
        return '👤';
    }
  };

  // Si el usuario no tiene múltiples roles, navegar automáticamente
  if (!hasMultipleRoles()) {
    const singleRole = userRoles[0] || 'customer';
    if (currentRole !== singleRole) {
      setCurrentRole(singleRole);
    }

    // Auto-navegar si solo tiene un rol
    React.useEffect(() => {
      if (singleRole === 'customer') {
        navigation.navigate('CustomerTab' as never);
      } else if (singleRole === 'business') {
        navigation.navigate('BusinessDashboard' as never);
      }
    }, []);

    return null; // No renderizar nada mientras navega
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecciona tu Modo</Text>
        <Text style={styles.subtitle}>Hola, {currentUser?.email?.split('@')[0]}</Text>
        <Text style={styles.description}>
          Tienes acceso a múltiples funcionalidades. Elige cómo quieres usar la app:
        </Text>
      </View>

      <View style={styles.rolesContainer}>
        {userRoles.map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.roleCard, currentRole === role && styles.activeRoleCard]}
            onPress={() => handleRoleSelection(role)}
          >
            <View style={styles.roleHeader}>
              <Text style={styles.roleIcon}>{getRoleIcon(role)}</Text>
              <View style={styles.roleInfo}>
                <Text style={[styles.roleName, currentRole === role && styles.activeRoleName]}>
                  {getRoleDisplayName(role)}
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    currentRole === role && styles.activeRoleDescription
                  ]}
                >
                  {getRoleDescription(role)}
                </Text>
              </View>
            </View>

            {currentRole === role && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Modo Actual</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Puedes cambiar de modo en cualquier momento desde tu perfil
        </Text>
      </View>

      {/* Botón para continuar con rol actual */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => handleRoleSelection(currentRole)}
      >
        <Text style={styles.continueButtonText}>
          Continuar como {getRoleDisplayName(currentRole)}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    padding: 24,
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
    fontSize: 18,
    color: '#e1f0ff',
    marginBottom: 12
  },
  description: {
    fontSize: 16,
    color: '#e1f0ff',
    textAlign: 'center',
    lineHeight: 22
  },
  rolesContainer: {
    padding: 20,
    gap: 16
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  activeRoleCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff'
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  roleIcon: {
    fontSize: 40,
    marginRight: 16
  },
  roleInfo: {
    flex: 1
  },
  roleName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  activeRoleName: {
    color: '#007AFF'
  },
  roleDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22
  },
  activeRoleDescription: {
    color: '#0056b3'
  },
  currentBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff'
  },
  footer: {
    padding: 20,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  },
  continueButton: {
    margin: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  }
});
