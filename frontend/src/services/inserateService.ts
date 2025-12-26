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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Inserat } from '../types';

export const getInserate = async (filters?: {
  category?: string;
  search?: string;
  status?: string;
}): Promise<Inserat[]> => {
  let q;
  
  if (filters?.category) {
    // When filtering by category, use both status and category
    q = query(
      collection(db, 'inserate'),
      where('status', '==', filters?.status || 'Aktiv'),
      where('category', '==', filters.category)
    );
  } else {
    // When not filtering by category, only filter by status
    q = query(
      collection(db, 'inserate'),
      where('status', '==', filters?.status || 'Aktiv')
    );
  }
  
  const snapshot = await getDocs(q);
  
  // Check if data is from cache (indicating offline mode)
  if (snapshot.metadata.fromCache && snapshot.empty) {
    throw new Error('Offline: Unable to connect to database');
  }
  
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
  
  // Client-side sorting by creation date (descending)
  inserate.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
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
  
  // Check if data is from cache (indicating offline mode)
  if (docSnap.metadata.fromCache && !docSnap.exists()) {
    throw new Error('Offline: Unable to connect to database');
  }
  
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
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  
  // Check if data is from cache (indicating offline mode)
  if (snapshot.metadata.fromCache && snapshot.empty) {
    throw new Error('Offline: Unable to connect to database');
  }
  
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
  
  // Client-side sorting by creation date (descending)
  inserate.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return inserate;
};

