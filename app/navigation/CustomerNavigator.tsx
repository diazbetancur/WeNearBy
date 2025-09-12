import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BusinessDashboardScreen from '../business/screens/BusinessDashboardScreen';
import CreateBusinessScreen from '../business/screens/CreateBusinessScreen';
import BusinessDetailScreen from '../screens/BusinessDetailScreen';
import BusinessListScreen from '../screens/BusinessListScreen';
import CartScreen from '../screens/CartScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import RoleTestScreen from '../screens/RoleTestScreen';
import SettingsScreen from '../screens/SettingsScreen';

const CustomerStack = createNativeStackNavigator();

export const CustomerNavigator = () => {
  return (
    <CustomerStack.Navigator
      initialRouteName="BusinessList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }}
    >
      <CustomerStack.Screen
        name="BusinessList"
        component={BusinessListScreen}
        options={{
          title: 'Negocios Cercanos',
          headerTitleAlign: 'center'
        }}
      />
      <CustomerStack.Screen
        name="BusinessDetail"
        component={BusinessDetailScreen}
        options={{
          title: 'Detalles del Negocio',
          headerBackTitle: 'Volver'
        }}
      />
      <CustomerStack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Mi Carrito',
          headerBackTitle: 'Volver'
        }}
      />
      <CustomerStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
          headerBackTitle: 'Volver'
        }}
      />
      <CustomerStack.Screen
        name="RoleTest"
        component={RoleTestScreen}
        options={{
          title: 'Prueba de Roles',
          headerBackTitle: 'Volver'
        }}
      />
      <CustomerStack.Screen
        name="CreateBusiness"
        component={CreateBusinessScreen}
        options={{
          title: 'Crear Negocio',
          headerBackTitle: 'Volver'
        }}
      />
      <CustomerStack.Screen
        name="BusinessDashboard"
        component={BusinessDashboardScreen}
        options={{
          title: 'Dashboard de Negocios',
          headerBackTitle: 'Volver'
        }}
      />
      <CustomerStack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{
          title: 'Seleccionar Modo',
          headerBackTitle: 'Volver'
        }}
      />
      {/* Pantallas específicas de cliente */}
      {/* Futuras pantallas:
        - UserProfile (Perfil del Cliente)
        - OrderHistory (Historial de Pedidos)
        - Favorites (Favoritos)
        - Search (Búsqueda)
        - Notifications (Notificaciones)
      */}
    </CustomerStack.Navigator>
  );
};
