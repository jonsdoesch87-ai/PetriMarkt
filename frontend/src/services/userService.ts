import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';

export const updateUser = async (
  userId: string,
  data: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

export const getUser = async (userId: string): Promise<User | null> => {
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

