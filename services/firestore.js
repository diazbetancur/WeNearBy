import { addDoc, collection, getDocs } from 'firebase/firestore';
import { firestore as db } from './firebase';

export async function addDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

export async function getProductsByBusiness(businessId) {
  const productsRef = collection(db, 'businesses', businessId, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
