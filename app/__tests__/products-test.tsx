/**
 * Products & Orders Test Screen
 *
 * Interactive test for:
 * - FirebaseProductService (create with images)
 * - StoreScreen (product listing, cart)
 * - CartScreen (WhatsApp flow)
 * - FirebaseOrderIntentService
 */

import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StoreScreen from '../../src/screens/StoreScreen';
import { getProductService, getStoreService } from '../../src/services/registry';
import type { Product, Store } from '../../src/types/models';

/**
 * Test data: Store with WhatsApp contact
 */
const TEST_STORE: Store = {
  id: 'store-test',
  vendorUserId: 'vendor-test',
  name: 'Pizzería Test',
  description: 'Tienda de prueba con productos y WhatsApp',
  address: 'Calle 72 #10-34, Bogotá',
  geo: { lat: 4.6533, lng: -74.0627 },
  coverageKm: 3,
  isOpen: true,
  hasDelivery: true,
  contact: {
    phone: '+57 310 123 4567',
    whatsapp: '+57 310 123 4567', // WhatsApp enabled for testing
    email: 'test@pizzeria.co'
  },
  categoryIds: ['restaurant', 'food'],
  featured: true,
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now()
};

/**
 * Test products (mock data with images)
 */
const TEST_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  {
    storeId: TEST_STORE.id,
    name: 'Pizza Margarita',
    description: 'Salsa de tomate, mozzarella, albahaca fresca',
    price: 25000,
    currency: 'COP',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
        alt: 'Pizza Margarita'
      }
    ],
    tags: ['pizza', 'vegetariana'],
    active: true
  },
  {
    storeId: TEST_STORE.id,
    name: 'Pizza Pepperoni',
    description: 'Salsa de tomate, mozzarella, pepperoni',
    price: 28000,
    currency: 'COP',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
        alt: 'Pizza Pepperoni'
      },
      {
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        alt: 'Pizza detalle'
      }
    ],
    tags: ['pizza'],
    active: true
  },
  {
    storeId: TEST_STORE.id,
    name: 'Lasagna Bolognesa',
    description: 'Pasta fresca, carne, salsa bechamel',
    price: 22000,
    currency: 'COP',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
        alt: 'Lasagna'
      }
    ],
    tags: ['pasta'],
    active: true
  },
  {
    storeId: TEST_STORE.id,
    name: 'Tiramisu',
    description: 'Postre italiano con café y mascarpone',
    price: 12000,
    currency: 'COP',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        alt: 'Tiramisu'
      }
    ],
    tags: ['postre'],
    active: true
  },
  {
    storeId: TEST_STORE.id,
    name: 'Producto Inactivo',
    description: 'Este producto no debería aparecer (active: false)',
    price: 99999,
    currency: 'COP',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        alt: 'Producto inactivo'
      }
    ],
    tags: ['test'],
    active: false // Should NOT appear in store
  }
];

export default function ProductsTestScreen() {
  const [productsCreated, setProductsCreated] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Seed test products to Firebase
   */
  const handleSeedProducts = async () => {
    setLoading(true);
    try {
      const productService = getProductService();
      const storeService = getStoreService();

      // Create store first
      await storeService.create({
        ...TEST_STORE,
        updatedAt: Date.now()
      });

      // Create products
      for (const product of TEST_PRODUCTS) {
        await productService.create(product);
      }

      setProductsCreated(true);
      Alert.alert(
        'Productos creados',
        `Se crearon ${TEST_PRODUCTS.length} productos de prueba (1 inactivo no debería aparecer)`
      );
    } catch (error) {
      console.error('Error seeding products:', error);
      Alert.alert('Error', 'No se pudieron crear los productos de prueba');
    } finally {
      setLoading(false);
    }
  };

  if (showStore) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Test: Store Products',
            headerShown: true,
            headerBackTitle: 'Tests'
          }}
        />
        <StoreScreen store={TEST_STORE} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Test: Products & Orders',
          headerShown: true
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>🛍️ Test de Productos y Pedidos</Text>

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Instrucciones</Text>
          <Text style={styles.instruction}>
            1. Crea productos de prueba{'\n'}
            2. Abre la tienda de prueba{'\n'}
            3. Agrega productos al carrito{'\n'}
            4. Cambia modo de entrega (delivery/pickup){'\n'}
            5. Envía pedido por WhatsApp
          </Text>
        </View>

        {/* Test Store Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏪 Tienda de Prueba</Text>
          <Text style={styles.info}>Nombre: {TEST_STORE.name}</Text>
          <Text style={styles.info}>WhatsApp: {TEST_STORE.contact.whatsapp}</Text>
          <Text style={styles.info}>Productos: {TEST_PRODUCTS.length} (4 activos, 1 inactivo)</Text>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎬 Acciones</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSeedProducts}
            disabled={loading || productsCreated}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'Creando...'
                : productsCreated
                ? '✅ Productos Creados'
                : '1. Crear Productos de Prueba'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSecondary,
              !productsCreated && styles.buttonDisabled
            ]}
            onPress={() => setShowStore(true)}
            disabled={!productsCreated}
          >
            <Text style={styles.buttonText}>2. Abrir Tienda de Prueba</Text>
          </TouchableOpacity>
        </View>

        {/* Expected Results */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ Resultados Esperados</Text>
          <Text style={styles.checkItem}>
            ✓ Solo 4 productos activos visibles (producto inactivo oculto)
          </Text>
          <Text style={styles.checkItem}>
            ✓ Tabs por categoría: Todos, pizza, pasta, postre, vegetariana
          </Text>
          <Text style={styles.checkItem}>✓ Carousel de imágenes (Pizza Pepperoni tiene 2)</Text>
          <Text style={styles.checkItem}>
            ✓ Botón carrito flotante aparece al agregar productos
          </Text>
          <Text style={styles.checkItem}>✓ Carrito muestra total y permite cambiar cantidades</Text>
          <Text style={styles.checkItem}>✓ Selector delivery/pickup funcional</Text>
          <Text style={styles.checkItem}>✓ Botón "Enviar por WhatsApp" abre wa.me con resumen</Text>
          <Text style={styles.checkItem}>
            ✓ Mensaje incluye: productos, cantidades, total, modo entrega
          </Text>
        </View>

        {/* Validation Checklist */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧪 Validación Manual</Text>
          <Text style={styles.validation}>
            [ ] Productos inactivos NO aparecen{'\n'}[ ] Carousel de imágenes funciona{'\n'}[ ]
            Agregar al carrito actualiza badge{'\n'}[ ] Cantidades se pueden cambiar (+/-){'\n'}[ ]
            Eliminar producto del carrito funciona{'\n'}[ ] Toggle delivery/pickup funciona{'\n'}[ ]
            WhatsApp se abre con mensaje correcto{'\n'}[ ] Mensaje incluye todos los items{'\n'}[ ]
            Total calculado correctamente
          </Text>
        </View>

        {/* WhatsApp Message Example */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Ejemplo de Mensaje WhatsApp</Text>
          <Text style={styles.example}>
            🛒 *Nuevo Pedido - Pizzería Test*{'\n\n'}
            📦 *Productos:*{'\n'}
            1. Pizza Margarita x2 - $50,000{'\n'}
            2. Tiramisu x1 - $12,000{'\n\n'}
            💰 *Total:* $62,000{'\n\n'}
            🚚 *Modo de entrega:* Domicilio{'\n'}
            📞 *Contacto:* +57 310 123 4567{'\n\n'}
            _Pedido generado desde WeNearBy_
          </Text>
        </View>
      </ScrollView>
    </>
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
    marginBottom: 20,
    textAlign: 'center'
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  buttonPrimary: {
    backgroundColor: '#007AFF'
  },
  buttonSecondary: {
    backgroundColor: '#34C759'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  checkItem: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 8,
    lineHeight: 20
  },
  validation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
    fontFamily: 'Courier'
  },
  example: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Courier',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8
  }
});
