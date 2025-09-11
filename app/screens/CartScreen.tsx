import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getBusinessById } from '../../services/businessService';
import { createOrder } from '../../services/orderService';

export default function CartScreen({ navigation }: any) {
  const { items, businessId, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState<string>('');

  useEffect(() => {
    if (businessId) {
      getBusinessById(businessId).then((b) => setBusinessName(b?.name || ''));
    } else {
      setBusinessName('');
    }
  }, [businessId]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async () => {
    if (!currentUser) {
      Alert.alert('Debes iniciar sesión para hacer un pedido');
      return;
    }
    if (items.length === 0) {
      Alert.alert('El carrito está vacío');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        customerId: currentUser.uid,
        businessId: businessId || '',
        products: items,
        total,
        status: 'pending' as const,
        paymentMethod: 'cash',
        deliveryType: 'pickup' as const
      };
      await createOrder(orderData);
      clearCart();
      Alert.alert('Pedido realizado', 'Tu pedido fue guardado correctamente.');
      navigation.navigate('BusinessList');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carrito vacío</Text>
        <Text style={styles.empty}>No hay productos en el carrito.</Text>
        <Button title="Volver" onPress={() => navigation.navigate('BusinessList')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito</Text>
      <Text style={styles.businessName}>Negocio: {businessName}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.name} x{item.quantity} - ${item.price} c/u
            </Text>
            <Text style={styles.itemText}>Subtotal: ${item.price * item.quantity}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <Button
        title={loading ? 'Procesando...' : 'Confirmar pedido'}
        onPress={handleOrder}
        disabled={loading || items.length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  businessName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
    color: '#444'
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 8
  },
  itemText: {
    fontSize: 16
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'right'
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32
  }
});
