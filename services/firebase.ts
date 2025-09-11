import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

const app = initializeApp(firebaseConfig);

// ✅ Firebase detecta AsyncStorage automáticamente en v12+
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
