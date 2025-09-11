import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export type Business = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  paymentMethods?: string[];
  deliveryZones?: string[];
  products?: any[];
};

export async function getBusinesses(): Promise<Business[]> {
  const snapshot = await getDocs(collection(db, 'businesses'));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || '',
      logo: data.logo || '',
      description: data.description || '',
      paymentMethods: data.paymentMethods || [],
      deliveryZones: data.deliveryZones || [],
      products: data.products || []
    };
  });
}

export async function getBusinessById(businessId: string): Promise<Business | null> {
  const docRef = doc(db, 'businesses', businessId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || '',
    logo: data.logo || '',
    description: data.description || '',
    paymentMethods: data.paymentMethods || [],
    deliveryZones: data.deliveryZones || [],
    products: data.products || []
  };
}
