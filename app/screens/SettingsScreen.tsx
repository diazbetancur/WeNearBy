import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RoleSwitcher } from '../../src/shared/components/RoleSwitcher';
import { useRole } from '../../src/shared/services/RoleContext';

export default function SettingsScreen() {
  const { currentRole } = useRole();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración de Rol</Text>
        <Text style={styles.description}>
          Cambia entre modo Cliente y modo Comercio para acceder a diferentes funciones de la
          aplicación.
        </Text>
        <Text style={styles.currentRole}>
          Rol actual: {currentRole === 'customer' ? 'Cliente' : 'Comercio'}
        </Text>
      </View>

      <View style={styles.section}>
        <RoleSwitcher />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de los Roles</Text>
        <Text style={styles.roleDescription}>
          <Text style={styles.roleTitle}>👥 Modo Cliente:</Text>
          {'\n'}• Buscar negocios cercanos{'\n'}• Ver detalles y productos{'\n'}• Realizar pedidos
          {'\n'}• Gestionar carrito de compras{'\n'}
        </Text>
        <Text style={styles.roleDescription}>
          <Text style={styles.roleTitle}>🏪 Modo Comercio:</Text>
          {'\n'}• Panel de control del negocio{'\n'}• Gestionar perfil del negocio{'\n'}• Ver
          estadísticas y análisis{'\n'}• Administrar productos y pedidos{'\n'}
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
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
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
    lineHeight: 20,
    marginBottom: 12
  },
  currentRole: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center'
  },
  roleDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12
  },
  roleTitle: {
    fontWeight: 'bold',
    color: '#333'
  }
});
