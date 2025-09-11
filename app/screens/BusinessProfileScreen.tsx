import React, { useContext, useEffect, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { CartContext } from '../../contexts/CartContext.js';
import { useTranslation } from '../../hooks/useTranslation';
import { getBusinessById, getProductsByBusiness } from '../../services/firestore.js';
import { colors } from '../../theme/colors.js';

export default function BusinessProfileScreen({ route }) {
  const { businessId, businessName: navBusinessName } = route.params;
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const { addItem } = useContext(CartContext);
  const { t } = useTranslation();

  useEffect(() => {
    getBusinessById(businessId).then(setBusiness);
    getProductsByBusiness(businessId).then(setProducts);
  }, [businessId]);

  if (!business) return <Text style={styles.loading}>{t('business.loading')}</Text>;

  return (
    <View style={styles.container}>
      {business.logo ? (
        <Image source={{ uri: business.logo }} style={styles.logo} />
      ) : (
        <View style={styles.logoPlaceholder} />
      )}
      <Text style={styles.name}>{navBusinessName || business.name}</Text>
      <Text style={styles.sectionTitle}>{t('business.payment_methods')}</Text>
      <View style={styles.paymentMethods}>
        {business.paymentMethods && business.paymentMethods.length > 0 ? (
          business.paymentMethods.map((method) => (
            <Text key={method} style={styles.paymentMethod}>
              {method}
            </Text>
          ))
        ) : (
          <Text style={styles.paymentMethod}>{t('business.no_payment_methods')}</Text>
        )}
      </View>
      <Text style={styles.sectionTitle}>{t('business.products')}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.productName}>
              {item.name} - ${item.price}
            </Text>
            <Button
              title={t('business.add_to_cart')}
              onPress={() => addItem({ ...item, quantity: 1 }, business.id)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>{t('business.no_products')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background
  },
  loading: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 18,
    color: colors.textSecondary
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: colors.surface
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: colors.surface
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.primary
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: colors.secondary
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  paymentMethod: {
    fontSize: 15,
    color: colors.textSecondary,
    marginRight: 12
  },
  productItem: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  productName: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
    fontSize: 16
  }
});
