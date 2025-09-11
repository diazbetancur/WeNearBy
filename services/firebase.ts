import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// Inicializa Firebase App
const app = initializeApp(firebaseConfig);

// Inicializa Auth y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
