import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, setAnalyticsCollectionEnabled, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCf3ieFxjZxQC7T-s4v6aix3u_HiUB9XkI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "petrimarkt.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "petrimarkt",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "petrimarkt.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "906170983684",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:906170983684:web:c73df454f608762cf61c51",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-R1ETFBVMZC"
};

// Sicherstellen, dass wir nicht abstürzen, wenn Variablen fehlen
if (!firebaseConfig.apiKey) {
  console.warn("Firebase API Key fehlt! Prüfe deine .env.local");
}

// Initialize Firebase app (works on both server and client)
let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Re-throw to prevent silent failures
  throw error;
}

export { app, db };

// Initialize auth and storage only on client-side
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
  try {
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Error initializing Firebase Auth/Storage:', error);
  }
}

export { auth, storage };

// Initialize Analytics only on client-side
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        // DSGVO/nDSG: Disable analytics collection by default
        // Analytics will only collect data if explicitly enabled by user consent
        setAnalyticsCollectionEnabled(analytics, false);
      } catch (error) {
        console.warn('Error initializing analytics:', error);
      }
    }
  }).catch((error) => {
    console.warn('Analytics not supported:', error);
  });
}

export { analytics };

// Helper function to check if we're on the server
export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

// Helper function to enable analytics (call this when user consents)
export const enableAnalytics = async (): Promise<void> => {
  if (isServer() || !analytics) {
    return;
  }
  
  try {
    await setAnalyticsCollectionEnabled(analytics, true);
  } catch (error) {
    console.error('Error enabling analytics:', error);
  }
};

// Helper function to disable analytics
export const disableAnalytics = async (): Promise<void> => {
  if (isServer() || !analytics) {
    return;
  }
  
  try {
    await setAnalyticsCollectionEnabled(analytics, false);
  } catch (error) {
    console.error('Error disabling analytics:', error);
  }
};
