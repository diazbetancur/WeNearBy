import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyChdRy7fR7WHpmRB1hHA6Gxx-VtZxuyynI',
  authDomain: 'wenearbyapp.firebaseapp.com',
  projectId: 'wenearbyapp',
  storageBucket: 'wenearbyapp.firebasestorage.app',
  messagingSenderId: '174639491380',
  appId: '1:174639491380:web:ae20b5f6f5fbfbbef99d61',
  measurementId: 'G-5RHW0D3E6G'
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };
