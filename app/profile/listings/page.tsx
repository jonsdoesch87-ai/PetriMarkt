'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Listing, ListingStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle2, Trash2, Pencil, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Condition } from '@/lib/constants';

// Color mapping for condition badges
const getConditionBadgeStyles = (condition: Condition): string => {
  switch (condition) {
    case 'Neu':
      return 'bg-[#A3B18A] text-white border-transparent';
    case 'Gebraucht':
      return 'bg-amber-700 text-white border-transparent';
    case 'Selbst hergestellt':
      return 'bg-blue-700 text-white border-transparent';
    case 'Defekt':
      return 'bg-gray-600 text-white border-transparent';
    default:
      return 'bg-secondary text-secondary-foreground border-transparent';
  }
};

export default function MyListingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (!user) return;

    // Subscribe to user's listings in real-time
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('sellerId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const listingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Listing[];
        
        // Sort by creation date (newest first)
        listingsData.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });
        
        setListings(listingsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  const updateListingStatus = async (listingId: string, status: ListingStatus) => {
    setUpdating(listingId);
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        status,
      });
    } catch (error) {
      console.error('Error updating listing status:', error);
      alert('Fehler beim Aktualisieren des Status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Inserat löschen möchten?')) {
      return;
    }
    await updateListingStatus(listingId, 'deleted');
  };

  const handleSold = async (listingId: string) => {
    await updateListingStatus(listingId, 'sold');
  };

  const handleReactivate = async (listingId: string) => {
    await updateListingStatus(listingId, 'active');
  };

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

  const activeListings = listings.filter(l => l.status === 'active' || l.status === undefined);
  const soldListings = listings.filter(l => l.status === 'sold');
  const deletedListings = listings.filter(l => l.status === 'deleted');
  const otherListings = listings.filter(l => 
    l.status && l.status !== 'active' && l.status !== 'sold' && l.status !== 'deleted'
  );

  const renderListingCard = (listing: Listing, showActions: boolean = true) => {
    const isDeleted = listing.status === 'deleted';
    const isSold = listing.status === 'sold';
    const imageUrl = listing.imageUrls?.[0] || '/placeholder-fish.jpg';

    return (
      <Card className={cn(
        "h-full w-full border border-gray-200 shadow-sm rounded-2xl relative flex flex-col overflow-hidden"
      )}>
        {/* Overlay for deleted listings with centered label */}
        {isDeleted && (
          <div className="absolute inset-0 bg-gray-500/30 z-30 rounded-2xl pointer-events-none flex items-center justify-center">
            <Badge className="bg-gray-700 text-white px-4 py-2 text-sm font-semibold rounded-md">
              Gelöscht
            </Badge>
          </div>
        )}
        
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-muted">
          {listing.imageUrls?.[0] ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Status Badge */}
          {isSold && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground z-10 rounded-md">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verkauft
            </Badge>
          )}
          
          {/* Action Icons - only on "Meine Inserate" page */}
          {showActions && !isDeleted && (
            <div className="absolute top-2 right-2 flex gap-2 z-20">
              {/* Edit Icon */}
              <Link href={`/listings/edit/${listing.id}`}>
                <button
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-md flex items-center justify-center transition-all hover:scale-110"
                  onClick={(e) => e.stopPropagation()}
                  disabled={updating === listing.id}
                >
                  <Pencil className="h-4 w-4 text-primary" />
                </button>
              </Link>
              
              {/* Delete Icon */}
              <button
                className="w-8 h-8 rounded-full bg-red-100/90 hover:bg-red-200/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-all hover:scale-110"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(listing.id);
                }}
                disabled={updating === listing.id}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          )}
        </div>
        
        <CardContent className="pt-4 flex-1">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2">{listing.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {listing.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>{listing.canton}</span>
            <span className="mx-2">•</span>
            <span>{listing.category}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <Badge className={cn('text-xs px-2 py-1 rounded-md', getConditionBadgeStyles(listing.condition))}>
              {listing.condition}
            </Badge>
          </div>
          
          {/* View Count - Only visible to seller */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{listing.viewCount || 0} {listing.viewCount === 1 ? 'Aufruf' : 'Aufrufe'}</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-0">
          <div className="w-full px-6 pb-4 pt-2">
            <div className="text-2xl font-bold text-primary mb-3">
              {formatPrice(listing.price)}
            </div>
            
            {/* Sold/Reactivate Button - always visible except for deleted */}
            {!isDeleted && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isSold) {
                    handleReactivate(listing.id);
                  } else {
                    handleSold(listing.id);
                  }
                }}
                disabled={updating === listing.id}
                className={cn(
                  "w-full",
                  isSold 
                    ? "bg-gray-200 hover:bg-gray-300 text-gray-700" 
                    : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                )}
              >
                {isSold ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Wieder aktivieren
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verkauft
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="bg-[#f5f5f0] border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              Meine Inserate
            </CardTitle>
            <Link href="/listings/create">
              <Button className="bg-primary hover:bg-primary/90">
                Neues Inserat erstellen
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Active Listings */}
          {activeListings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Aktive Inserate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {activeListings.map((listing) => (
                  <div key={listing.id}>
                    {renderListingCard(listing, true)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sold Listings */}
          {soldListings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Verkaufte Inserate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {soldListings.map((listing) => (
                  <div key={listing.id}>
                    {renderListingCard(listing, false)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Listings */}
          {deletedListings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Gelöschte Inserate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {deletedListings.map((listing) => (
                  <div key={listing.id}>
                    {renderListingCard(listing, false)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Listings */}
          {otherListings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Andere Inserate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {otherListings.map((listing) => (
                  <div key={listing.id}>
                    {renderListingCard(listing, false)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {listings.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Noch keine Inserate vorhanden</p>
              <p className="text-sm text-muted-foreground mt-2">
                Erstellen Sie Ihr erstes Inserat, um zu beginnen
              </p>
              <Link href="/listings/create">
                <Button className="mt-4 bg-primary hover:bg-primary/90">
                  Inserat erstellen
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
