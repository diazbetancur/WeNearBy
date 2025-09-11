import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext.js';
import { useTranslation } from '../../hooks/useTranslation';
import { db } from '../../services/firebase';

import { colors } from '../../theme/colors.js';

export default function Cart({ navigation }) {
  const { items, businessId, clearCart } = useContext(CartContext);
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirm = async () => {
    if (!currentUser) {
      Alert.alert(t('cart.login_required'));
      return;
    }
    if (!businessId || items.length === 0) {
      Alert.alert(t('cart.empty'));
      return;
    }
    setLoading(true);
    try {
      const orderRef = doc(db, 'orders', `${Date.now()}_${currentUser.uid}`);
      await setDoc(orderRef, {
        businessId,
        customerId: currentUser.uid,
        products: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        total,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      clearCart();
      Alert.alert(t('cart.success_title'), t('cart.success_message'));
      if (navigation) navigation.navigate('BusinessList');
    } catch (e) {
      console.error('Error saving order:', e);
      Alert.alert(t('cart.error_title'), t('cart.error_message'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.title}>{t('cart.processing')}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('cart.empty_title')}</Text>
        <Text style={styles.empty}>{t('cart.empty')}</Text>
        <Button
          title={t('cart.back_button')}
          onPress={() => navigation && navigation.navigate('BusinessList')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('cart.title')}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.name} x{item.quantity} - ${item.price} {t('cart.unit')}
            </Text>
            <Text style={styles.itemText}>
              {t('cart.subtotal')}: ${item.price * item.quantity}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>{t('cart.empty')}</Text>}
      />
      <Text style={styles.total}>
        {t('cart.total')}: ${total.toFixed(2)}
      </Text>
      <Button
        title={loading ? t('cart.processing') : t('cart.confirm_button')}
        onPress={handleConfirm}
        disabled={loading || items.length === 0}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: colors.primary
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8
  },
  itemText: {
    fontSize: 16,
    color: colors.text
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'right',
    color: colors.secondary
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
    fontSize: 16
  }
});
