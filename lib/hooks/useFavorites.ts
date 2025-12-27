'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFavorites(userId: string | null | undefined) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setFavorites(new Set());
      return;
    }

    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        favIds.add(data.listingId);
      });
      setFavorites(favIds);
    }, (error) => {
      console.error('Error fetching favorites:', error);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleFavorite = async (listingId: string) => {
    if (!userId) return;

    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef, 
        where('userId', '==', userId),
        where('listingId', '==', listingId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Add to favorites
        await addDoc(favoritesRef, {
          userId,
          listingId,
          createdAt: Timestamp.now()
        });
      } else {
        // Remove from favorites
        snapshot.docs.forEach(doc => deleteDoc(doc.ref));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (listingId: string) => {
    return favorites.has(listingId);
  };

  return { favorites, toggleFavorite, isFavorite };
}
