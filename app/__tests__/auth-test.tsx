/**
 * Test screen for Firebase Auth Service
 *
 * Usage: Navigate to this screen to test authentication flows
 * This is a development/testing utility screen
 */

import { getAuthService } from '@/src/services/registry';
import type { User } from '@/src/types/models';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AuthTestScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const authService = getAuthService();

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    console.log('[AuthTest]', message);
  };

  // Listen to auth state changes
  useEffect(() => {
    addLog('Setting up auth state listener...');

    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        addLog(`Auth state: User signed in - ID: ${user.id}, Email: ${user.email}`);
      } else {
        addLog('Auth state: User signed out');
      }
    });

    // Load current user on mount
    authService.getCurrentUser().then((user) => {
      if (user) {
        addLog(`Initial user loaded: ${user.email}`);
      }
    });

    return () => {
      addLog('Cleaning up auth listener...');
      unsubscribe();
    };
  }, []);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    addLog(`Attempting sign up: ${email}`);

    try {
      const user = await authService.signUpEmail(email, password);
      addLog(`✅ Sign up successful! User ID: ${user.id}`);
      Alert.alert('Éxito', `Usuario creado: ${user.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addLog(`❌ Sign up failed: ${errorMessage}`);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    addLog(`Attempting sign in: ${email}`);

    try {
      const user = await authService.signInEmail(email, password);
      addLog(`✅ Sign in successful! User ID: ${user.id}`);
      addLog(`User roles: ${user.roles.join(', ')}`);
      addLog(`Current role: ${user.currentRole}`);
      Alert.alert('Éxito', `Bienvenido ${user.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addLog(`❌ Sign in failed: ${errorMessage}`);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    addLog('Attempting sign out...');

    try {
      await authService.signOut();
      addLog('✅ Sign out successful');
      Alert.alert('Éxito', 'Sesión cerrada');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addLog(`❌ Sign out failed: ${errorMessage}`);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentUser = async () => {
    addLog('Fetching current user...');
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        addLog(`Current user: ${user.email} (ID: ${user.id})`);
        Alert.alert(
          'Usuario actual',
          `Email: ${user.email}\nID: ${user.id}\nRoles: ${user.roles.join(', ')}`
        );
      } else {
        addLog('No user currently signed in');
        Alert.alert('Usuario actual', 'No hay usuario autenticado');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addLog(`❌ Get current user failed: ${errorMessage}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Auth Service Test</Text>

      {/* Current User Status */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Estado Actual</Text>
        {currentUser ? (
          <View>
            <Text style={styles.statusText}>✅ Usuario autenticado</Text>
            <Text style={styles.infoText}>ID: {currentUser.id}</Text>
            <Text style={styles.infoText}>Email: {currentUser.email}</Text>
            <Text style={styles.infoText}>Roles: {currentUser.roles.join(', ')}</Text>
            <Text style={styles.infoText}>Rol actual: {currentUser.currentRole}</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>❌ No autenticado</Text>
        )}
      </View>

      {/* Input Form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Credenciales</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          editable={!loading}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsCard}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? '⏳ Procesando...' : '📝 Registrarse'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '⏳ Procesando...' : '🔐 Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleGetCurrentUser}
          disabled={loading}
        >
          <Text style={styles.buttonTextSecondary}>👤 Ver Usuario Actual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={handleSignOut}
          disabled={loading || !currentUser}
        >
          <Text style={styles.buttonText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Logs */}
      <View style={styles.logsCard}>
        <Text style={styles.sectionTitle}>📋 Logs (últimos 10)</Text>
        {logs.length === 0 ? (
          <Text style={styles.logEmpty}>No hay logs aún...</Text>
        ) : (
          logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
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
  statusCard: {
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
  formCard: {
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
  buttonsCard: {
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
  logsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
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
    fontSize: 16,
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 8,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa'
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
  buttonDanger: {
    backgroundColor: '#FF3B30'
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
  },
  logEntry: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#333'
  },
  logEmpty: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic'
  }
});
