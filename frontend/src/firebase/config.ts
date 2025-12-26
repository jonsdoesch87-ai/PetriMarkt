import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCf3ieFxjZxQC7T-s4v6aix3u_HiUB9XkI",
  authDomain: "petrimarkt.firebaseapp.com",
  projectId: "petrimarkt",
  storageBucket: "petrimarkt.firebasestorage.app",
  messagingSenderId: "906170983684",
  appId: "1:906170983684:web:c73df454f608762cf61c51",
  measurementId: "G-R1ETFBVMZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics nur im Browser initialisieren
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

