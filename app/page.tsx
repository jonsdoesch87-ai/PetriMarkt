'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/lib/types';
import { CATEGORIES, CANTONS, CANTON_NAMES, Category, Canton } from '@/lib/constants';
import { Search, Fish, Spline, Disc, Ship, Package, Shirt, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ListingCard from '@/components/ListingCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';

// Icon mapping for categories
const CATEGORY_ICONS: Record<Category | 'all', typeof Fish> = {
  'Ruten': Spline,
  'Rollen': Disc,
  'Köder': Fish,
  'Zubehör': Package,
  'Bekleidung': Shirt,
  'Boote': Ship,
  'Sonstiges': MoreHorizontal,
  'all': Fish,
};

export default function HomePage() {
  // Mount-Check am Anfang
  const [mounted, setMounted] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedCanton, setSelectedCanton] = useState<Canton | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // Mount-Check: Setze mounted auf true nach dem Mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchListings();
    }
  }, [mounted]);

  const fetchListings = async () => {
    // Firebase-Check: Nur ausführen wenn db definiert ist
    if (!db) {
      console.error('Firebase Firestore is not initialized');
      setLoading(false);
      return;
    }

    // Gesamter Code in try-catch Block
    try {
      const q = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      let listingsData = (snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[])
        .filter(listing => listing.status === 'active' || listing.status === undefined);
      
      // Sort by boostScore (descending), then by createdAt (descending)
      listingsData.sort((a, b) => {
        const boostA = a.boostScore || 0;
        const boostB = b.boostScore || 0;
        if (boostA !== boostB) {
          return boostB - boostA; // Higher boostScore first
        }
        // If boostScore is equal, sort by createdAt
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA; // Newer first
      });
      
      // Limit to 12 for display
      listingsData = listingsData.slice(0, 12);
      
      setListings(listingsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // Firebase-Check: Nur ausführen wenn db definiert ist
    if (!db) {
      console.error('Firebase Firestore is not initialized');
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      let listingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];

      // Client-side filtering
      // Filter by status first (only show active listings)
      listingsData = listingsData.filter(listing => 
        listing.status === 'active' || listing.status === undefined
      );

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        listingsData = listingsData.filter(listing =>
          listing.title.toLowerCase().includes(searchLower) ||
          listing.description.toLowerCase().includes(searchLower)
        );
      }

      if (selectedCategory !== 'all') {
        listingsData = listingsData.filter(listing => listing.category === selectedCategory);
      }

      if (selectedCanton !== 'all') {
        listingsData = listingsData.filter(listing => listing.canton === selectedCanton);
      }

      // Sort by boostScore (descending), then by createdAt (descending)
      listingsData.sort((a, b) => {
        const boostA = a.boostScore || 0;
        const boostB = b.boostScore || 0;
        if (boostA !== boostB) {
          return boostB - boostA; // Higher boostScore first
        }
        // If boostScore is equal, sort by createdAt
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA; // Newer first
      });

      setListings(listingsData);
    } catch (error) {
      console.error('Error searching listings:', error);
      // Error Boundary: Stelle sicher, dass loading auf false gesetzt wird
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Early return wenn nicht mounted
  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 md:mb-4 px-2">
          Willkommen bei PetriMarkt
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-2">
          Der Online-Marktplatz für Fischereiartikel in der Schweiz
        </p>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category | 'all')}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Fish className="h-4 w-4" />
                    <span>Alle Kategorien</span>
                  </div>
                </SelectItem>
                {CATEGORIES.map(cat => {
                  const Icon = CATEGORY_ICONS[cat];
                  return (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{cat}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Suche nach Artikeln..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={selectedCanton} onValueChange={(value) => setSelectedCanton(value as Canton | 'all')}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kanton" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kantone</SelectItem>
                {CANTONS.map(canton => (
                  <SelectItem key={canton} value={canton}>
                    {canton} - {CANTON_NAMES[canton]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full md:w-auto">
              Suchen
            </Button>
          </div>
        </div>
      </div>

      {/* Latest Listings */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Neueste Inserate</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">Keine Inserate gefunden.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Seien Sie der Erste und erstellen Sie ein Inserat!
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
    </div>
  );
}
