import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BusinessProfileScreen from '../screens/BusinessProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const BusinessStack = createNativeStackNavigator();

// Componente temporal para Dashboard hasta que se cree
const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard del Negocio</Text>
      <Text style={styles.subtitle}>Panel de control para gestionar tu negocio</Text>
      <Text style={styles.note}>
        Aquí podrás ver estadísticas, gestionar productos, revisar pedidos y más.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 10,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: 20
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const
  }
});

export const BusinessNavigator = () => {
  return (
    <BusinessStack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#28a745'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }}
    >
      <BusinessStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Panel de Control',
          headerTitleAlign: 'center'
        }}
      />
      <BusinessStack.Screen
        name="BusinessProfile"
        component={BusinessProfileScreen}
        options={{
          title: 'Mi Perfil de Negocio',
          headerBackTitle: 'Volver'
        }}
      />
      <BusinessStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
          headerBackTitle: 'Volver'
        }}
      />
      {/* Pantallas específicas de negocio */}
      {/* Futuras pantallas:
        - ProductManagement (Gestión de Productos)
        - OrderManagement (Gestión de Pedidos)
        - Analytics (Análisis y Estadísticas)
        - BusinessSettings (Configuración del Negocio)
        - CustomerReviews (Reseñas de Clientes)
        - Inventory (Inventario)
        - Promotions (Promociones y Descuentos)
      */}
    </BusinessStack.Navigator>
  );
};
