import { useNavigation } from '@react-navigation/native';
import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { firestore } from '../../../services/firebase';

/**
 * Pantalla para crear un nuevo negocio
 *
 * Funcionalidades:
 * 1. Formulario completo para crear negocio
 * 2. Agrega rol 'business' al usuario actual
 * 3. Crea documento en colección 'businesses'
 * 4. Navega al dashboard de negocio
 *
 * Restricciones:
 * - Solo usuarios verificados pueden crear negocios (pendiente implementar)
 */
export default function CreateBusinessScreen() {
  const navigation = useNavigation();
  const { currentUser, addRoleToUser, setCurrentRole } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    openingHours: '',
    tags: ''
  });

  // Lista de categorías disponibles
  const categories = [
    'Restaurante',
    'Tienda',
    'Servicios',
    'Salud y Belleza',
    'Educación',
    'Entretenimiento',
    'Tecnología',
    'Construcción',
    'Transporte',
    'Otros'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del negocio es obligatorio');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Selecciona una categoría');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'El teléfono es obligatorio');
      return false;
    }
    return true;
  };

  const handleCreateBusiness = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes estar autenticado para crear un negocio');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Crear documento del negocio en Firestore
      const businessId = `business_${currentUser.uid}_${Date.now()}`;
      const businessData = {
        id: businessId,
        ownerId: currentUser.uid,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || currentUser.email,
        website: formData.website.trim(),
        logo: formData.logo.trim(),
        openingHours: formData.openingHours.trim(),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        status: 'active',
        verified: false, // Pendiente de verificación
        rating: 0,
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Crear documento del negocio
      await setDoc(doc(firestore, 'businesses', businessId), businessData);
      console.log('✅ Negocio creado:', businessData.name);

      // 2. Agregar rol 'business' al usuario actual
      await addRoleToUser('business');

      // 3. Cambiar al rol business automáticamente
      await setCurrentRole('business');

      // 4. Actualizar información adicional del usuario
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        businessIds: arrayUnion(businessId),
        lastBusinessCreated: new Date(),
        hasBusinesses: true
      });

      // 5. Mostrar confirmación y navegar
      Alert.alert(
        '🎉 ¡Negocio Creado!',
        `Tu negocio "${formData.name}" ha sido creado exitosamente.\n\nHas cambiado automáticamente al modo negocio.`,
        [
          {
            text: 'Ir al Dashboard',
            style: 'default',
            onPress: () => {
              navigation.navigate('BusinessDashboard');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creando negocio:', error);
      Alert.alert('Error', 'Hubo un problema al crear tu negocio. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.label}>Categoría *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              formData.category === category && styles.categoryChipSelected
            ]}
            onPress={() => handleInputChange('category', category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                formData.category === category && styles.categoryChipTextSelected
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Negocio</Text>
            <Text style={styles.subtitle}>Completa la información para registrar tu negocio</Text>
          </View>

          {/* Información Básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Información Básica</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre del Negocio *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Mi Restaurante"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                maxLength={100}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu negocio, productos o servicios..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {renderCategorySelector()}
          </View>

          {/* Información de Contacto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 Información de Contacto</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dirección *</Text>
              <TextInput
                style={styles.input}
                placeholder="Calle, número, ciudad"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                maxLength={200}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono *</Text>
              <TextInput
                style={styles.input}
                placeholder="+57 123 456 7890"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder={currentUser?.email || 'contacto@negocio.com'}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sitio Web</Text>
              <TextInput
                style={styles.input}
                placeholder="https://www.minegocio.com"
                value={formData.website}
                onChangeText={(value) => handleInputChange('website', value)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Información Adicional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Información Adicional</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Horarios de Atención</Text>
              <TextInput
                style={styles.input}
                placeholder="Lun-Vie: 8:00-18:00, Sáb: 9:00-14:00"
                value={formData.openingHours}
                onChangeText={(value) => handleInputChange('openingHours', value)}
                maxLength={100}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>URL del Logo</Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/logo.png"
                value={formData.logo}
                onChangeText={(value) => handleInputChange('logo', value)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Etiquetas (separadas por comas)</Text>
              <TextInput
                style={styles.input}
                placeholder="comida, delivery, orgánico"
                value={formData.tags}
                onChangeText={(value) => handleInputChange('tags', value)}
                maxLength={200}
              />
            </View>
          </View>

          {/* Botones de Acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleCreateBusiness}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? 'Creando...' : 'Crear Negocio'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nota de Verificación */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              📝 Nota: Tu negocio será revisado por nuestro equipo antes de aparecer públicamente.
              Recibirás una notificación una vez que sea aprobado.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: 20,
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
    fontSize: 16,
    color: '#e1f0ff',
    textAlign: 'center'
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  sectionContainer: {
    marginBottom: 16
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  categoryScrollView: {
    marginTop: 8
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333'
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '500'
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666'
  },
  createButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  createButtonDisabled: {
    backgroundColor: '#ccc'
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  noteContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20
  }
});
