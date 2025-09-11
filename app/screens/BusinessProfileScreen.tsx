import React, { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { getBusinessById } from '../../services/businessService';

export default function BusinessProfileScreen({ route }: any) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState<any>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    getBusinessById(businessId).then(setBusiness);
  }, [businessId]);

  if (!business) return <Text>Cargando...</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>{business.name}</Text>
      <Text>{business.description}</Text>
      <FlatList
        data={business.products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>
              {item.name} - ${item.price}
            </Text>
            <Button
              title="Agregar al carrito"
              onPress={() => addToCart({ ...item, quantity: 1 })}
            />
          </View>
        )}
      />
    </View>
  );
}
