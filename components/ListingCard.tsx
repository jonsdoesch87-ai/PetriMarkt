'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { MapPin, Tag, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/lib/hooks/useFavorites';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.imageUrls?.[0] || '/placeholder-fish.jpg';
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(user?.uid);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(listing.id);
    }
  };

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border border-gray-200 shadow-md rounded-2xl relative">
        {user && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            aria-label="Zu Favoriten hinzufügen"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite(listing.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
              }`}
            />
          </button>
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
              <Tag className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="pt-4">
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
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-md">
              {listing.condition}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-2xl font-bold text-price-accent">
            {formatPrice(listing.price)}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
