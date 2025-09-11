import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../src/shared/services/RoleContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { BusinessNavigator } from './BusinessNavigator';
import { CustomerNavigator } from './CustomerNavigator';

const AuthStack = createNativeStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
}

function MainStackScreen() {
  const { currentRole } = useRole();

  // Renderizar el navegador correspondiente al rol actual
  return currentRole === 'business' ? <BusinessNavigator /> : <CustomerNavigator />;
}

export default function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) return null; // Splash screen mientras carga la autenticación

  // Mostrar pantallas de autenticación si no hay usuario logueado
  // O mostrar el navegador principal basado en el rol del usuario
  return <>{currentUser ? <MainStackScreen /> : <AuthStackScreen />}</>;
}
