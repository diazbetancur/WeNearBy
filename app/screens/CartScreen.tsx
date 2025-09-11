import React from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../services/orderService';

export default function CartScreen({ navigation }: any) {
  const { cart, clearCart } = useCart();

  const handleOrder = async () => {
    // Aquí deberías obtener customerId, businessId, paymentMethod, deliveryType
    const orderData = {
      customerId: 'demoCustomerId',
      businessId: cart[0]?.businessId || '',
      products: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      paymentMethod: 'cash',
      deliveryType: 'pickup'
    };
    await createOrder(orderData);
    clearCart();
    navigation.navigate('OrderHistory');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Carrito</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>
            {item.name} x{item.quantity} - ${item.price * item.quantity}
          </Text>
        )}
      />
      <Button title="Realizar pedido" onPress={handleOrder} />
    </View>
  );
}
