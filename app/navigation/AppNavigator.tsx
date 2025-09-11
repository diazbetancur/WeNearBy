import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BusinessListScreen from '../screens/BusinessListScreen';
import BusinessProfileScreen from '../screens/BusinessProfileScreen';
import CartScreen from '../screens/CartScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

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
  return (
    <MainStack.Navigator initialRouteName="BusinessList">
      <MainStack.Screen name="BusinessList" component={BusinessListScreen} />
      <MainStack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <MainStack.Screen name="Cart" component={CartScreen} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) return null; // Puedes mostrar un SplashScreen aquí

  return (
    <NavigationContainer>
      {currentUser ? <MainStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  );
}
