'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/lib/types';
import { CATEGORIES, CANTONS, CANTON_NAMES, Category, Canton } from '@/lib/constants';
import { Search, Fish as FishIcon, Package, Shirt, Ship, MoreHorizontal, Anchor } from 'lucide-react';
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

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedCanton, setSelectedCanton] = useState<Canton | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const categoryIcons: Record<string, any> = {
    'Ruten': Anchor,
    'Rollen': Package,
    'Köder': FishIcon,
    'Zubehör': Package,
    'Bekleidung': Shirt,
    'Boote': Ship,
    'Sonstiges': MoreHorizontal,
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const q = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc'),
        limit(12)
      );
      const snapshot = await getDocs(q);
      const listingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];
      setListings(listingsData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
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

      setListings(listingsData);
    } catch (error) {
      console.error('Error searching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Willkommen bei PetriMarkt
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Der Online-Marktplatz für Fischereiartikel in der Schweiz
        </p>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category | 'all')}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Alle Kategorien</span>
                  </div>
                </SelectItem>
                {CATEGORIES.map(cat => {
                  const Icon = categoryIcons[cat] || Package;
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Lade Inserate...</p>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-2xl">
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
