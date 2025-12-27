'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites } = useFavorites(user?.uid);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (!user || favorites.size === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      try {
        const favoriteIds = Array.from(favorites);
        const listingsRef = collection(db, 'listings');
        
        // Fetch listings in batches (Firestore 'in' query limit is 10)
        const batchSize = 10;
        const allListings: Listing[] = [];
        
        // Process batches concurrently for better performance
        const batches: string[][] = [];
        for (let i = 0; i < favoriteIds.length; i += batchSize) {
          batches.push(favoriteIds.slice(i, i + batchSize));
        }
        
        const batchResults = await Promise.all(
          batches.map(async (batch) => {
            const q = query(listingsRef, where('__name__', 'in', batch));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Listing[];
          })
        );
        
        // Flatten results
        batchResults.forEach(batchListings => {
          allListings.push(...batchListings);
        });
        
        setListings(allListings);
      } catch (error) {
        console.error('Error fetching favorite listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteListings();
  }, [user, favorites]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Meine Favoriten</h1>
          <p className="text-muted-foreground">
            Bitte melden Sie sich an, um Ihre Favoriten zu sehen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          Meine Favoriten
        </h1>
        <p className="text-muted-foreground">
          {favorites.size} {favorites.size === 1 ? 'Inserat' : 'Inserate'} gespeichert
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Lade Favoriten...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-2xl">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg mb-2">
            Noch keine Favoriten gespeichert.
          </p>
          <p className="text-sm text-muted-foreground">
            Klicken Sie auf das Herz-Symbol auf Inseraten, um sie hier zu speichern.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
