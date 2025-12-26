import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Prefer environment variables (for local/dev) but fall back to the deployed Firebase app
// configuration so the static build continues to work even if env vars are missing.
// Note: Firebase client config values are public; access is controlled via Firebase security rules.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCf3ieFxjZxQC7T-s4v6aix3u_HiUB9XkI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'petrimarkt.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'petrimarkt',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'petrimarkt.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '906170983684',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:906170983684:web:c73df454f608762cf61c51',
  // measurementId is optional - only needed for Google Analytics
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-R1ETFBVMZC'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable network for Firestore to ensure proper connection
if (typeof window !== 'undefined') {
  enableNetwork(db)
    .then(() => {
      console.log('Firestore network enabled');
    })
    .catch((error) => {
      console.error('Error enabling Firestore network:', error);
      // Network will be retried automatically by Firebase
    });
}

// Analytics nur im Browser initialisieren
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

