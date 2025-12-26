import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

export const register = async (email: string, password: string, name?: string): Promise<User> => {
  // User in Firebase Auth erstellen
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  // Zusätzliche Daten in Firestore speichern
  const userData: Omit<User, 'id' | 'createdAt'> = {
    email,
    name: name || null,
    phone: null,
    location: null,
    profileImage: null,
  };
  
  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: serverTimestamp(),
  });
  
  return {
    id: firebaseUser.uid,
    ...userData,
    createdAt: new Date().toISOString(),
  };
};

export const login = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const loginAnonymously = async (): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;
    
    // Create user document in Firestore for anonymous user if it doesn't exist
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: null,
        name: 'Gast',
        phone: null,
        location: null,
        profileImage: null,
        createdAt: serverTimestamp(),
      });
    }
    
    return firebaseUser;
  } catch (error: any) {
    console.error('Anonymous login error:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase-Dienst ist nicht erreichbar.');
    }
    
    throw error;
  }
};

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getUserData = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    return null;
  }
  
  const data = userDoc.data();
  return {
    id: userDoc.id,
    email: data.email,
    name: data.name || null,
    phone: data.phone || null,
    location: data.location || null,
    profileImage: data.profileImage || null,
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
  };
};

