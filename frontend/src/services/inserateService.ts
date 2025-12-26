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
  try {
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
      throw new Error('Keine Verbindung zur Datenbank. Bitte überprüfen Sie Ihre Internetverbindung.');
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
  } catch (error: any) {
    console.error('Error fetching inserate:', error);
    
    // Provide more specific error messages
    if (error.code === 'unavailable') {
      throw new Error('Firebase-Dienst ist nicht erreichbar. Bitte versuchen Sie es später erneut.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Zugriff verweigert. Bitte melden Sie sich an.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Fehler beim Laden der Inserate. Bitte versuchen Sie es erneut.');
    }
  }
};

export const getInserat = async (id: string): Promise<Inserat> => {
  try {
    const docRef = doc(db, 'inserate', id);
    const docSnap = await getDoc(docRef);
    
    // Check if data is from cache (indicating offline mode)
    if (docSnap.metadata.fromCache && !docSnap.exists()) {
      throw new Error('Verbindung zur Datenbank nicht möglich. Bitte überprüfen Sie Ihre Internetverbindung.');
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
  } catch (error: any) {
    console.error('Error fetching inserat:', error);
    
    // Provide more specific error messages
    if (error.code === 'unavailable') {
      throw new Error('Firebase-Dienst ist nicht erreichbar. Bitte versuchen Sie es später erneut.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Zugriff verweigert. Bitte melden Sie sich an.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Fehler beim Laden des Inserats. Bitte versuchen Sie es erneut.');
    }
  }
};

export const createInserat = async (
  data: Omit<Inserat, 'id' | 'user' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'inserate'), {
      ...data,
      userId,
      status: 'Aktiv',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating inserat:', error);
    
    if (error.code === 'unavailable') {
      throw new Error('Firebase-Dienst ist nicht erreichbar. Bitte versuchen Sie es später erneut.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Zugriff verweigert. Bitte melden Sie sich an.');
    } else {
      throw new Error('Fehler beim Erstellen des Inserats. Bitte versuchen Sie es erneut.');
    }
  }
};

export const updateInserat = async (
  id: string,
  data: Partial<Omit<Inserat, 'id' | 'user' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'inserate', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating inserat:', error);
    
    if (error.code === 'unavailable') {
      throw new Error('Firebase-Dienst ist nicht erreichbar. Bitte versuchen Sie es später erneut.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Zugriff verweigert. Sie können nur Ihre eigenen Inserate bearbeiten.');
    } else if (error.code === 'not-found') {
      throw new Error('Inserat nicht gefunden.');
    } else {
      throw new Error('Fehler beim Aktualisieren des Inserats. Bitte versuchen Sie es erneut.');
    }
  }
};

export const deleteInserat = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'inserate', id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Error deleting inserat:', error);
    
    if (error.code === 'unavailable') {
      throw new Error('Firebase-Dienst ist nicht erreichbar. Bitte versuchen Sie es später erneut.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Zugriff verweigert. Sie können nur Ihre eigenen Inserate löschen.');
    } else if (error.code === 'not-found') {
      throw new Error('Inserat nicht gefunden.');
    } else {
      throw new Error('Fehler beim Löschen des Inserats. Bitte versuchen Sie es erneut.');
    }
  }
};

export const getMyInserate = async (userId: string): Promise<Inserat[]> => {
  try {
    const q = query(
      collection(db, 'inserate'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    
    // Check if data is from cache (indicating offline mode)
    if (snapshot.metadata.fromCache && snapshot.empty) {
      throw new Error('Keine Verbindung zur Datenbank. Bitte überprüfen Sie Ihre Internetverbindung.');
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
  } catch (error: any) {
    console.error('Error fetching my inserate:', error);
    
    // Provide more specific error messages
    if (error.code === 'unavailable') {
      throw new Error('Firebase-Dienst ist nicht erreichbar. Bitte versuchen Sie es später erneut.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Zugriff verweigert. Bitte melden Sie sich an.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Fehler beim Laden Ihrer Inserate. Bitte versuchen Sie es erneut.');
    }
  }
};

