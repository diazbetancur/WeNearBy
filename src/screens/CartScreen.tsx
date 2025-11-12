/**
 * CartScreen - Shopping Cart
 *
 * Displays cart items with:
 * - List of products with quantity controls
 * - Subtotal and total
 * - Delivery mode selector (delivery/pickup)
 * - Customer contact input
 * - Send button (WhatsApp or OrderIntent)
 */

import * as Linking from 'expo-linking';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useCart } from '../context/CartProvider';
import { getOrderIntentService } from '../services/registry';
import type { DeliveryMode, Store } from '../types/models';

interface CartScreenProps {
  store: Store;
  onClose?: () => void;
}

/**
 * Generate WhatsApp message with order summary
 */
function generateWhatsAppMessage(
  store: Store,
  items: any[],
  deliveryMode: DeliveryMode,
  customerContact: string,
  total: number
): string {
  let message = `🛒 *Nuevo Pedido - ${store.name}*\n\n`;

  message += `📦 *Productos:*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.productName} x${item.quantity} - $${(
      item.price * item.quantity
    ).toLocaleString('es-CO')}\n`;
  });

  message += `\n💰 *Total:* $${total.toLocaleString('es-CO')}\n\n`;

  message += `🚚 *Modo de entrega:* ${
    deliveryMode === 'delivery' ? 'Domicilio' : 'Recoger en tienda'
  }\n`;

  if (customerContact) {
    message += `📞 *Contacto:* ${customerContact}\n`;
  }

  message += `\n_Pedido generado desde WeNearBy_`;

  return message;
}

export default function CartScreen({ store, onClose }: CartScreenProps) {
  const {
    items,
    deliveryMode,
    setDeliveryMode,
    itemCount,
    total,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();
  const [customerContact, setCustomerContact] = useState('');
  const [sending, setSending] = useState(false);

  /**
   * Handle send order
   */
  const handleSend = useCallback(async () => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de enviar el pedido');
      return;
    }

    setSending(true);

    try {
      // Generate WhatsApp message
      const message = generateWhatsAppMessage(store, items, deliveryMode, customerContact, total);

      if (store.contact.whatsapp) {
        // Open WhatsApp with message
        const whatsappNumber = store.contact.whatsapp.replace(/\D/g, ''); // Remove non-digits
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);

          // Create order intent for record
          const orderIntentService = getOrderIntentService();
          await orderIntentService.create({
            userId: 'guest', // TODO: Get from auth context
            storeId: store.id,
            items: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price
            })),
            deliveryMode,
            customerContact: customerContact || undefined,
            status: 'sent'
          });

          clearCart();
          Alert.alert(
            'Pedido enviado',
            'Se abrió WhatsApp con tu pedido. Completa el envío desde allí.',
            [{ text: 'OK', onPress: onClose }]
          );
        } else {
          throw new Error('No se puede abrir WhatsApp');
        }
      } else {
        // No WhatsApp, create order intent only
        const orderIntentService = getOrderIntentService();
        await orderIntentService.create({
          userId: 'guest', // TODO: Get from auth context
          storeId: store.id,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
          })),
          deliveryMode,
          customerContact: customerContact || undefined,
          status: 'sent'
        });

        clearCart();
        Alert.alert(
          'Pedido enviado',
          'Tu pedido ha sido registrado. El vendedor te contactará pronto.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      console.error('Error sending order:', error);
      Alert.alert('Error', 'No se pudo enviar el pedido. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  }, [items, store, deliveryMode, customerContact, total, clearCart, onClose]);

  /**
   * Render cart item
   */
  const renderItem = useCallback(
    ({ item }: any) => {
      return (
        <View style={styles.cartItem}>
          {/* Product Image */}
          {item.product.images.length > 0 && (
            <Image
              source={{ uri: item.product.images[0].url }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          )}

          {/* Product Info */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemPrice}>
              ${item.price.toLocaleString('es-CO')} x {item.quantity}
            </Text>
          </View>

          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.productId, item.quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Remove Button */}
          <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.productId)}>
            <Text style={styles.removeButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [updateQuantity, removeItem]
  );

  const keyExtractor = useCallback((item: any) => item.productId, []);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Carrito</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtext}>Agrega productos para comenzar</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Carrito ({itemCount})</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Cart Items */}
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />

        {/* Delivery Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modo de entrega</Text>
          <View style={styles.deliveryModes}>
            <TouchableOpacity
              style={[
                styles.deliveryMode,
                deliveryMode === 'delivery' && styles.deliveryModeActive
              ]}
              onPress={() => setDeliveryMode('delivery')}
            >
              <Text
                style={[
                  styles.deliveryModeText,
                  deliveryMode === 'delivery' && styles.deliveryModeTextActive
                ]}
              >
                🚚 Domicilio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deliveryMode, deliveryMode === 'pickup' && styles.deliveryModeActive]}
              onPress={() => setDeliveryMode('pickup')}
            >
              <Text
                style={[
                  styles.deliveryModeText,
                  deliveryMode === 'pickup' && styles.deliveryModeTextActive
                ]}
              >
                🏪 Recoger
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu contacto (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Teléfono o email"
            value={customerContact}
            onChangeText={setCustomerContact}
            keyboardType="default"
          />
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${total.toLocaleString('es-CO')}</Text>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>
            {sending
              ? 'Enviando...'
              : store.contact.whatsapp
              ? '📱 Enviar por WhatsApp'
              : '📤 Enviar Pedido'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  closeButton: {
    fontSize: 24,
    color: '#666'
  },
  content: {
    flex: 1
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    gap: 12
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4
  },
  itemPrice: {
    fontSize: 13,
    color: '#666'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF'
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    minWidth: 24,
    textAlign: 'center'
  },
  removeButton: {
    padding: 8
  },
  removeButtonText: {
    fontSize: 18
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12
  },
  deliveryModes: {
    flexDirection: 'row',
    gap: 12
  },
  deliveryMode: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center'
  },
  deliveryModeActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD'
  },
  deliveryModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  deliveryModeTextActive: {
    color: '#007AFF'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a'
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF'
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  sendButton: {
    backgroundColor: '#25D366', // WhatsApp green
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc'
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888'
  }
});
