'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Listing } from '@/lib/types';
import { Condition } from '@/lib/constants';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { MapPin, Tag, Heart, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const imageUrl = listing.imageUrls?.[0] || '/placeholder-fish.jpg';

  // Check if listing is favorited
  useEffect(() => {
    if (!user) {
      setIsFavorite(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.uid),
          where('listingId', '==', listing.id)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setIsFavorite(true);
          setFavoriteId(snapshot.docs[0].id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavorite();
  }, [user, listing.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        // Remove favorite
        await deleteDoc(doc(db, 'favorites', favoriteId));
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        // Add favorite
        const favoriteRef = await addDoc(collection(db, 'favorites'), {
          userId: user.uid,
          listingId: listing.id,
          createdAt: serverTimestamp(),
        });
        setIsFavorite(true);
        setFavoriteId(favoriteRef.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isSold = listing.status === 'sold';
  const isReserved = listing.status === 'reserved';
  const isFeatured = listing.isFeatured === true;

  return (
    <Link href={`/listings/${listing.id}`} className="h-full flex">
      <Card className={cn(
        "hover:shadow-md transition-shadow cursor-pointer h-full w-full border shadow-md rounded-2xl relative flex flex-col",
        isSold && "opacity-60",
        isFeatured && "border-2 border-amber-400 shadow-amber-200/50 shadow-lg"
      )}>
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
              <Tag className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          {/* Favorite Button */}
          {user && (
            <button
              onClick={toggleFavorite}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm z-10"
              aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 hover:text-red-500'
                } transition-colors`}
              />
            </button>
          )}
          {/* Featured Badge */}
          {isFeatured && (
            <Badge className="absolute top-2 left-2 bg-amber-400 text-amber-900 z-10 font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              Highlight
            </Badge>
          )}
          
          {/* Status Badge */}
          {isSold && !isFeatured && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground z-10">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verkauft
            </Badge>
          )}
          {isReserved && !isFeatured && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground z-10">
              Reserviert
            </Badge>
          )}
        </div>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2">{listing.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {listing.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>{listing.location || listing.canton}</span>
            <span className="mx-2">•</span>
            <span>{listing.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge className={cn('text-xs px-2 py-1 rounded-md', getConditionBadgeStyles(listing.condition))}>
              {listing.condition}
            </Badge>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-2xl font-bold text-primary">
            {formatPrice(listing.price)}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
