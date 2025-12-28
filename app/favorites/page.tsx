'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Listing, Favorite } from '@/lib/types';
import ListingCard from '@/components/ListingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (!user) return;

    // Subscribe to favorites in real-time
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const favoritesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Favorite[];

        setFavorites(favoritesData);

        // Fetch listing details for each favorite
        const listingsData = await Promise.all(
          favoritesData.map(async (favorite) => {
            const listingDoc = await getDoc(doc(db, 'listings', favorite.listingId));
            if (listingDoc.exists()) {
              return { id: listingDoc.id, ...listingDoc.data() } as Listing;
            }
            return null;
          })
        );

        // Filter out null values (listings that might have been deleted)
        setListings(listingsData.filter((listing): listing is Listing => listing !== null));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lade...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            Meine Favoriten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Noch keine Favoriten vorhanden</p>
              <p className="text-sm text-muted-foreground mt-2">
                Markieren Sie Inserate mit dem Herz-Icon, um sie zu Ihren Favoriten hinzuzufügen
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


