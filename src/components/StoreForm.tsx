/**
 * StoreForm
 *
 * Form component for creating/editing stores.
 * Includes all required fields: name, description, address, geo picker,
 * coverage, isOpen toggle, hasDelivery toggle, contact info.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import type { LatLng, Store, StoreContact } from '../types/models';

interface StoreFormProps {
  store?: Store; // If provided, form is in edit mode
  vendorUserId: string;
  onSubmit: (storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel?: () => void;
}

export default function StoreForm({ store, vendorUserId, onSubmit, onCancel }: StoreFormProps) {
  // Form state
  const [name, setName] = useState(store?.name || '');
  const [description, setDescription] = useState(store?.description || '');
  const [address, setAddress] = useState(store?.address || '');
  const [geo, setGeo] = useState<LatLng>(store?.geo || { lat: 4.6097, lng: -74.0817 }); // Bogotá center
  const [coverageKm, setCoverageKm] = useState(store?.coverageKm.toString() || '3');
  const [isOpen, setIsOpen] = useState(store?.isOpen ?? true);
  const [hasDelivery, setHasDelivery] = useState(store?.hasDelivery ?? true);
  const [phone, setPhone] = useState(store?.contact.phone || '');
  const [whatsapp, setWhatsapp] = useState(store?.contact.whatsapp || '');
  const [email, setEmail] = useState(store?.contact.email || '');
  const [loading, setLoading] = useState(false);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setGeo({ lat: latitude, lng: longitude });
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre de la tienda');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Por favor ingresa la dirección');
      return;
    }

    const coverageNum = parseFloat(coverageKm);
    if (isNaN(coverageNum) || coverageNum <= 0 || coverageNum > 50) {
      Alert.alert('Error', 'La cobertura debe ser entre 0 y 50 km');
      return;
    }

    if (!email.trim() && !phone.trim() && !whatsapp.trim()) {
      Alert.alert('Error', 'Debes proporcionar al menos un medio de contacto');
      return;
    }

    setLoading(true);
    try {
      const contact: StoreContact = {};
      if (phone.trim()) contact.phone = phone.trim();
      if (whatsapp.trim()) contact.whatsapp = whatsapp.trim();
      if (email.trim()) contact.email = email.trim();

      const storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'> = {
        vendorUserId,
        name: name.trim(),
        description: description.trim() || undefined,
        address: address.trim(),
        geo,
        coverageKm: coverageNum,
        isOpen,
        hasDelivery,
        contact,
        categoryIds: store?.categoryIds,
        featured: store?.featured
      };

      await onSubmit(storeData);
    } catch (error) {
      console.error('Error submitting store:', error);
      Alert.alert('Error', 'No se pudo guardar la tienda');
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
        <Text style={styles.title}>{store ? 'Editar Tienda' : 'Crear Tienda'}</Text>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <Text style={styles.label}>Nombre de la Tienda *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Pizzería Don José"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe tu tienda y lo que ofreces"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>

          <Text style={styles.label}>Dirección *</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: Calle 72 #10-34, Bogotá"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <Text style={styles.label}>Ubicación en el Mapa *</Text>
          <Text style={styles.helpText}>Toca el mapa para seleccionar la ubicación exacta</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: geo.lat,
                longitude: geo.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
              }}
              onPress={handleMapPress}
            >
              <Marker
                coordinate={{ latitude: geo.lat, longitude: geo.lng }}
                title={name || 'Tu tienda'}
              />
              <Circle
                center={{ latitude: geo.lat, longitude: geo.lng }}
                radius={parseFloat(coverageKm) * 1000}
                fillColor="rgba(0, 122, 255, 0.1)"
                strokeColor="rgba(0, 122, 255, 0.5)"
                strokeWidth={2}
              />
            </MapView>
          </View>

          <Text style={styles.label}>Cobertura (km) *</Text>
          <TextInput
            style={styles.input}
            value={coverageKm}
            onChangeText={setCoverageKm}
            placeholder="3"
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
            editable={!loading}
          />
          <Text style={styles.helpText}>Radio de cobertura para entregas a domicilio</Text>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>¿Está abierta la tienda?</Text>
              <Text style={styles.toggleDesc}>Los clientes verán si estás disponible</Text>
            </View>
            <Switch
              value={isOpen}
              onValueChange={setIsOpen}
              disabled={loading}
              trackColor={{ false: '#ccc', true: '#34C759' }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>¿Ofreces domicilio?</Text>
              <Text style={styles.toggleDesc}>Entregas dentro del radio de cobertura</Text>
            </View>
            <Switch
              value={hasDelivery}
              onValueChange={setHasDelivery}
              disabled={loading}
              trackColor={{ false: '#ccc', true: '#34C759' }}
            />
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          <Text style={styles.helpText}>Al menos un medio de contacto es requerido</Text>

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+57 310 123 4567"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            style={styles.input}
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="+57 310 123 4567"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            editable={!loading}
          />
          <Text style={styles.helpText}>Los clientes pueden enviarte pedidos por WhatsApp</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonPrimaryText}>
                {store ? 'Guardar Cambios' : 'Crear Tienda'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginBottom: 8
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 12
  },
  map: {
    flex: 1
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4
  },
  toggleDesc: {
    fontSize: 12,
    color: '#666'
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center'
  },
  buttonPrimary: {
    backgroundColor: '#007AFF'
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonSecondaryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  }
});
