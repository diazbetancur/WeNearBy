import { roleUtils, useRole } from '@shared/services';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const RoleSwitcher: React.FC = () => {
  const { currentRole, isLoading, switchToCustomer, switchToBusiness, switchRole } = useRole();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando rol...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Rol de Usuario</Text>

      <View style={styles.currentRoleContainer}>
        <Text style={styles.currentRoleLabel}>Rol Actual:</Text>
        <Text style={styles.currentRoleText}>{roleUtils.getRoleDisplayName(currentRole)}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.roleButton, roleUtils.isCustomer(currentRole) && styles.activeButton]}
          onPress={switchToCustomer}
          disabled={roleUtils.isCustomer(currentRole)}
        >
          <Text
            style={[
              styles.buttonText,
              roleUtils.isCustomer(currentRole) && styles.activeButtonText
            ]}
          >
            👥 Cliente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, roleUtils.isBusiness(currentRole) && styles.activeButton]}
          onPress={switchToBusiness}
          disabled={roleUtils.isBusiness(currentRole)}
        >
          <Text
            style={[
              styles.buttonText,
              roleUtils.isBusiness(currentRole) && styles.activeButtonText
            ]}
          >
            🏪 Comercio
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickSwitchContainer}>
        <Text style={styles.quickSwitchLabel}>Cambio rápido:</Text>
        <TouchableOpacity
          style={styles.quickSwitchButton}
          onPress={() => switchRole(roleUtils.getOppositeRole(currentRole))}
        >
          <Text style={styles.quickSwitchText}>
            Cambiar a {roleUtils.getRoleDisplayName(roleUtils.getOppositeRole(currentRole))}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>💾 El rol se guarda automáticamente en el dispositivo</Text>
        <Text style={styles.infoText}>🔄 La app se adapta según el rol seleccionado</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  currentRoleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8
  },
  currentRoleLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8
  },
  currentRoleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  roleButton: {
    flex: 1,
    padding: 16,
    marginHorizontal: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center'
  },
  activeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  activeButtonText: {
    color: '#fff'
  },
  quickSwitchContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  quickSwitchLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  quickSwitchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#28a745',
    borderRadius: 6
  },
  quickSwitchText: {
    color: '#fff',
    fontWeight: '600'
  },
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4
  }
});
