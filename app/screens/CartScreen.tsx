import React, { useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../services/orderService';

export default function CartScreen({ navigation }: any) {
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async () => {
    if (!currentUser) {
      Alert.alert('Debes iniciar sesión para hacer un pedido');
      return;
    }
    if (cart.length === 0) {
      Alert.alert('El carrito está vacío');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        customerId: currentUser.uid,
        businessId: cart[0]?.businessId || '',
        products: cart,
        total,
        status: 'pending',
        paymentMethod: 'cash', // Puedes permitir elegir método
        deliveryType: 'pickup' // Puedes permitir elegir tipo
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.name} x{item.quantity} - ${item.price * item.quantity}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay productos en el carrito.</Text>}
      />
      <Text style={styles.total}>Total: ${total}</Text>
      <Button
        title={loading ? 'Procesando...' : 'Realizar pedido'}
        onPress={handleOrder}
        disabled={loading || cart.length === 0}
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
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee'
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
