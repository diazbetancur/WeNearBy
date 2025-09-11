import React, { useContext, useEffect, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { CartContext } from '../../contexts/CartContext.js';
import { Business, getBusinessById } from '../../services/businessService';

export default function BusinessProfileScreen({ route }: any) {
  const { businessId, businessName: navBusinessName } = route.params;
  const [business, setBusiness] = useState<Business | null>(null);
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    getBusinessById(businessId).then(setBusiness);
  }, [businessId]);

  if (!business) return <Text style={styles.loading}>Cargando...</Text>;

  return (
    <View style={styles.container}>
      {business.logo ? (
        <Image source={{ uri: business.logo }} style={styles.logo} />
      ) : (
        <View style={styles.logoPlaceholder} />
      )}
      <Text style={styles.name}>{navBusinessName || business.name}</Text>
      <Text style={styles.sectionTitle}>Métodos de pago:</Text>
      <View style={styles.paymentMethods}>
        {business.paymentMethods && business.paymentMethods.length > 0 ? (
          business.paymentMethods.map((method) => (
            <Text key={method} style={styles.paymentMethod}>
              {method}
            </Text>
          ))
        ) : (
          <Text style={styles.paymentMethod}>No definidos</Text>
        )}
      </View>
      <Text style={styles.sectionTitle}>Productos:</Text>
      <FlatList
        data={business.products || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.productName}>
              {item.name} - ${item.price}
            </Text>
            <Button
              title="Agregar al carrito"
              onPress={() => addItem({ ...item, quantity: 1 }, business.id)}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  paymentMethod: {
    fontSize: 15,
    color: '#666',
    marginRight: 12
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
