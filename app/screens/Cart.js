import { addDoc, collection } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext.js';
import { db } from '../../services/firebase';

export default function Cart({ navigation }) {
  const { items, businessId, clearCart } = useContext(CartContext);
  const { currentUser } = useAuth ? useAuth() : { currentUser: null };
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirm = async () => {
    if (!currentUser) {
      Alert.alert('Debes iniciar sesión para confirmar el pedido');
      return;
    }
    if (!businessId || items.length === 0) {
      Alert.alert('El carrito está vacío');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        businessId,
        customerId: currentUser.uid,
        products: items,
        total,
        status: 'pending'
      });
      clearCart();
      Alert.alert('Pedido confirmado', 'Tu pedido ha sido registrado exitosamente.');
      if (navigation) navigation.navigate('BusinessList');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carrito vacío</Text>
        <Text style={styles.empty}>No hay productos en el carrito.</Text>
        <Button title="Volver" onPress={() => navigation && navigation.navigate('BusinessList')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito</Text>
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
    marginTop: 32,
    fontSize: 16
  }
});
