import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firestore as db } from './firebase';

export type Order = {
  id?: string;
  customerId: string;
  businessId: string;
  products: any[];
  total: number;
  status: 'pending' | 'confirmed' | 'completed';
  paymentMethod: string;
  deliveryType: 'pickup' | 'delivery';
};

export async function createOrder(orderData: Order): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), orderData);
  return docRef.id;
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      customerId: data.customerId,
      businessId: data.businessId,
      products: data.products || [],
      total: data.total || 0,
      status: data.status || 'pending',
      paymentMethod: data.paymentMethod || '',
      deliveryType: data.deliveryType || 'pickup'
    };
  });
}
