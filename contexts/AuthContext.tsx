'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/types';
import { Canton } from '@/lib/constants';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, defaultCanton: Canton) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as User);
        } else {
          // Create base user document if it doesn't exist (e.g., for existing users)
          const baseUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            defaultCanton: 'ZH', // Default canton
            createdAt: serverTimestamp() as unknown as Timestamp,
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), baseUser, { merge: true });
          setUserProfile(baseUser);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Auth nicht verfügbar');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, defaultCanton: Canton) => {
    if (!auth || !db) throw new Error('Auth oder DB nicht verfügbar');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      defaultCanton,
      agbAccepted: true,
      agbAcceptedAt: serverTimestamp() as unknown as Timestamp,
      createdAt: serverTimestamp() as unknown as Timestamp,
    };
    
    // Create user profile
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    setUserProfile(newUser);

    // Create welcome email document for Firebase Trigger Email Extension
    // This should not block the registration process if it fails
    try {
      await addDoc(collection(db, 'mail'), {
        to: email,
        message: {
          subject: 'Willkommen bei PetriMarkt – Dein Marktplatz für Angelbedarf!',
          html: '<h1>Petri Heil!</h1><p>Vielen Dank für deine Registrierung bei PetriMarkt. Wir freuen uns, dich in unserer Community zu haben.</p><p>Du kannst ab sofort Inserate erstellen und mit anderen Fischern Kontakt aufnehmen.</p><p>Beste Grüsse,<br>Jonas von PetriMarkt</p>',
        },
      });
    } catch (emailError) {
      // Log error but don't block registration
      console.error('Error creating welcome email document:', emailError);
      // Registration continues successfully even if email creation fails
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Auth nicht verfügbar');
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
