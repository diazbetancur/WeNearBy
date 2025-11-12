/**
 * Firebase implementation of OrderIntentService
 * Manages order intents in Firestore (lightweight, for WhatsApp flow)
 */

import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { OrderIntent } from '../../types/models';
import type { OrderIntentService } from './order-intent.service';

const ORDER_INTENTS_COLLECTION = 'order_intents';

/**
 * Convert Firestore document to OrderIntent
 */
function firestoreToOrderIntent(id: string, data: any): OrderIntent {
  return {
    id,
    userId: data.userId,
    storeId: data.storeId,
    items: data.items,
    deliveryMode: data.deliveryMode,
    message: data.message,
    customerContact: data.customerContact,
    createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
    status: data.status || 'draft'
  };
}

/**
 * Convert OrderIntent to Firestore document
 */
function orderIntentToFirestore(intent: Omit<OrderIntent, 'id' | 'createdAt'>) {
  return {
    userId: intent.userId,
    storeId: intent.storeId,
    items: intent.items,
    deliveryMode: intent.deliveryMode,
    message: intent.message || null,
    customerContact: intent.customerContact || null,
    status: intent.status,
    createdAt: serverTimestamp()
  };
}

/**
 * Firebase implementation of OrderIntentService
 *
 * Features:
 * - Create order intent with delivery mode and customer contact
 * - Automatic timestamps with serverTimestamp()
 * - Status tracking (draft, sent, cancelled)
 *
 * @example
 * ```typescript
 * const orderIntentService = new FirebaseOrderIntentService();
 *
 * // Create order intent
 * const intent = await orderIntentService.create({
 *   userId: 'user-1',
 *   storeId: 'store-1',
 *   items: [
 *     { productId: 'p1', productName: 'Pizza', quantity: 2, price: 25000 }
 *   ],
 *   deliveryMode: 'delivery',
 *   customerContact: '+57 310 123 4567',
 *   status: 'sent'
 * });
 * ```
 */
export class FirebaseOrderIntentService implements OrderIntentService {
  /**
   * Create a new order intent
   *
   * @param intent Order intent data without id and timestamps
   * @returns Promise with the created OrderIntent
   */
  async create(intent: Omit<OrderIntent, 'id' | 'createdAt'>): Promise<OrderIntent> {
    // Validate items
    if (!intent.items || intent.items.length === 0) {
      throw new Error('El pedido debe tener al menos un producto');
    }

    // Validate delivery mode
    if (intent.deliveryMode !== 'delivery' && intent.deliveryMode !== 'pickup') {
      throw new Error('El modo de entrega debe ser "delivery" o "pickup"');
    }

    const orderIntentsRef = collection(db, ORDER_INTENTS_COLLECTION);
    const newDocRef = doc(orderIntentsRef);

    const firestoreData = orderIntentToFirestore(intent);

    await setDoc(newDocRef, firestoreData);

    // Read back the created document
    const snapshot = await getDoc(newDocRef);
    if (!snapshot.exists()) {
      throw new Error('Error al crear la intención de pedido');
    }

    return firestoreToOrderIntent(snapshot.id, snapshot.data());
  }
}
