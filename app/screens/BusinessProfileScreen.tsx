import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CartContext } from '../../contexts/CartContext.js';
import { useTranslation } from '../../hooks/useTranslation';
import { getProductsByBusiness } from '../../services/firestore.js';
import { colors } from '../../theme/colors.js';

export default function BusinessProfileScreen({ route }) {
  const { businessId, businessName: navBusinessName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useContext(CartContext);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    setError('');
    getProductsByBusiness(businessId)
      .then(setProducts)
      .catch((err) => {
        setError(t('business.error_loading_products'));
        console.error('Error loading products:', err);
      })
      .finally(() => setLoading(false));
  }, [businessId, t]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loading}>{t('business.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{navBusinessName || t('business.title')}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.productImage} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>
                {t('business.price')}: ${item.price}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addItem({ ...item, quantity: 1 }, businessId)}
              >
                <Text style={styles.addButtonText}>{t('business.add_to_cart')}</Text>
              </TouchableOpacity>
            </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center'
  },
  loading: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center'
  },
  error: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 16
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: colors.background
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: colors.disabled
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4
  },
  productPrice: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 8
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 16
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
    fontSize: 16
  }
});
