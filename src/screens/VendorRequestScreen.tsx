/**
 * VendorRequestScreen
 *
 * Screen for users who don't have a vendor profile yet.
 * Allows them to request vendor role.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useRole } from '../context/RoleContextProvider';

export default function VendorRequestScreen() {
  const { requestVendorRole } = useRole();
  const [loading, setLoading] = useState(false);
  const [legalName, setLegalName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async () => {
    // Basic validation
    if (!legalName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre legal de tu negocio');
      return;
    }

    if (!contactEmail.trim()) {
      Alert.alert('Error', 'Por favor ingresa un email de contacto');
      return;
    }

    setLoading(true);
    try {
      await requestVendorRole();
      Alert.alert(
        'Solicitud Enviada',
        'Tu solicitud para ser vendedor ha sido enviada. Te notificaremos cuando sea aprobada.'
      );
    } catch (error) {
      console.error('Error requesting vendor role:', error);
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🏪 Conviértete en Vendedor</Text>
        <Text style={styles.subtitle}>
          Completa el formulario para solicitar acceso al panel de vendedores
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre Legal del Negocio *</Text>
          <TextInput
            style={styles.input}
            value={legalName}
            onChangeText={setLegalName}
            placeholder="Ej: Pizzería Don José S.A.S"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <Text style={styles.label}>Email de Contacto *</Text>
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <Text style={styles.label}>Teléfono (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+57 310 123 4567"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Requisitos</Text>
          <Text style={styles.infoText}>
            • Información de contacto válida{'\n'}• Negocio legalmente constituido{'\n'}• Cumplir
            con términos y condiciones
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>✅ Qué obtendrás</Text>
          <Text style={styles.infoText}>
            • Panel para gestionar tu tienda{'\n'}• Crear y editar productos{'\n'}• Recibir pedidos
            de clientes{'\n'}• Gestionar inventario y categorías
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar Solicitud</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * Tu solicitud será revisada por nuestro equipo. Recibirás una notificación cuando sea
          aprobada.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff'
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic'
  }
});
