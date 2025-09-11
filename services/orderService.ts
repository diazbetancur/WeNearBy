import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function createOrder(orderData: any) {
  const docRef = await addDoc(collection(db, 'orders'), orderData);
  return docRef.id;
}

export async function getOrdersByCustomer(customerId: string) {
  const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
