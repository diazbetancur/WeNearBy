import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { getOrdersByCustomer } from '../../services/orderService';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    getOrdersByCustomer('demoCustomerId').then(setOrders);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Historial de Pedidos</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>Pedido #{item.id}</Text>
            <Text>Estado: {item.status}</Text>
            <Text>Total: ${item.total}</Text>
          </View>
        )}
      />
    </View>
  );
}
