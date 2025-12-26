import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Inserat, User } from '../types';

export const getInserate = async (filters?: {
  category?: string;
  search?: string;
  status?: string;
}): Promise<Inserat[]> => {
  let q = query(
    collection(db, 'inserate'),
    where('status', '==', filters?.status || 'Aktiv'),
    orderBy('createdAt', 'desc')
  );
  
  if (filters?.category) {
    q = query(
      collection(db, 'inserate'),
      where('status', '==', filters.status || 'Aktiv'),
      where('category', '==', filters.category),
      orderBy('createdAt', 'desc')
    );
  }
  
  const snapshot = await getDocs(q);
  const inseratePromises = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data();
    
    // User-Daten laden
    const userDoc = await getDoc(doc(db, 'users', data.userId));
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    return {
      id: docSnap.id,
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      condition: data.condition,
      images: data.images || [],
      location: data.location,
      zipCode: data.zipCode || null,
      status: data.status,
      userId: data.userId,
      user: userData ? {
        id: data.userId,
        email: userData.email || '',
        name: userData.name || null,
        phone: userData.phone || null,
        location: userData.location || null,
        profileImage: userData.profileImage || null,
        createdAt: userData.createdAt?.toDate().toISOString() || new Date().toISOString(),
      } : {
        id: data.userId,
        email: '',
        name: null,
        phone: null,
        location: null,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    } as Inserat;
  });
  
  let inserate = await Promise.all(inseratePromises);
  
  // Client-seitige Suche (Firestore hat limitierte Suchfunktionen)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    inserate = inserate.filter(
      i => i.title.toLowerCase().includes(searchLower) ||
           i.description.toLowerCase().includes(searchLower)
    );
  }
  
  return inserate;
};

export const getInserat = async (id: string): Promise<Inserat> => {
  const docRef = doc(db, 'inserate', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Inserat nicht gefunden');
  }
  
  const data = docSnap.data();
  
  // User-Daten laden
  const userDoc = await getDoc(doc(db, 'users', data.userId));
  const userData = userDoc.exists() ? userDoc.data() : null;
  
  return {
    id: docSnap.id,
    title: data.title,
    description: data.description,
    price: data.price,
    category: data.category,
    condition: data.condition,
    images: data.images || [],
    location: data.location,
    zipCode: data.zipCode || null,
    status: data.status,
    userId: data.userId,
    user: userData ? {
      id: data.userId,
      email: userData.email || '',
      name: userData.name || null,
      phone: userData.phone || null,
      location: userData.location || null,
      profileImage: userData.profileImage || null,
      createdAt: userData.createdAt?.toDate().toISOString() || new Date().toISOString(),
    } : {
      id: data.userId,
      email: '',
      name: null,
      phone: null,
      location: null,
      profileImage: null,
      createdAt: new Date().toISOString(),
    },
    createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
  } as Inserat;
};

export const createInserat = async (
  data: Omit<Inserat, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'inserate'), {
    ...data,
    userId,
    status: 'Aktiv',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  return docRef.id;
};

export const updateInserat = async (
  id: string,
  data: Partial<Omit<Inserat, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const docRef = doc(db, 'inserate', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteInserat = async (id: string): Promise<void> => {
  const docRef = doc(db, 'inserate', id);
  await deleteDoc(docRef);
};

export const getMyInserate = async (userId: string): Promise<Inserat[]> => {
  const q = query(
    collection(db, 'inserate'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const inseratePromises = snapshot.docs.map(async (docSnap) => {
    const data = docSnap.data();
    
    // User-Daten laden
    const userDoc = await getDoc(doc(db, 'users', data.userId));
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    return {
      id: docSnap.id,
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      condition: data.condition,
      images: data.images || [],
      location: data.location,
      zipCode: data.zipCode || null,
      status: data.status,
      userId: data.userId,
      user: userData ? {
        id: data.userId,
        email: userData.email || '',
        name: userData.name || null,
        phone: userData.phone || null,
        location: userData.location || null,
        profileImage: userData.profileImage || null,
        createdAt: userData.createdAt?.toDate().toISOString() || new Date().toISOString(),
      } : {
        id: data.userId,
        email: '',
        name: null,
        phone: null,
        location: null,
        profileImage: null,
        createdAt: new Date().toISOString(),
      },
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    } as Inserat;
  });
  
  return Promise.all(inseratePromises);
};

