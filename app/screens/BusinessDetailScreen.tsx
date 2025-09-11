import React, { useContext, useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { CartContext } from '../../contexts/CartContext';
import { Business, getBusinessById, getProductsByBusiness } from '../../services/businessService';

export default function BusinessDetailScreen({ route }: any) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    getBusinessById(businessId).then(setBusiness);
    getProductsByBusiness(businessId).then(setProducts);
  }, [businessId]);

  if (!business) return <Text style={styles.loading}>Cargando...</Text>;

  return (
    <View style={styles.container}>
      {business.logo ? (
        <Image source={{ uri: business.logo }} style={styles.logo} />
      ) : (
        <View style={styles.logoPlaceholder} />
      )}
      <Text style={styles.name}>{business.name}</Text>
      <Text style={styles.description}>{business.description}</Text>
      <Text style={styles.sectionTitle}>Productos</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.productName}>
              {item.name} - ${item.price}
            </Text>
            <Button
              title="Agregar al carrito"
              onPress={() => addItem({ ...item, quantity: 1, businessId })}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
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
  loading: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 18
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#eee'
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#eee'
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8
  },
  productItem: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fafafa'
  },
  productName: {
    fontSize: 16,
    marginBottom: 8
  }
});
