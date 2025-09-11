import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function getBusinesses() {
  const snapshot = await getDocs(collection(db, 'businesses'));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getBusinessById(businessId: string) {
  const docRef = doc(db, 'businesses', businessId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}
