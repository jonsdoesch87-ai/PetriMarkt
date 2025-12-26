'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { MapPin, Tag, MessageSquare, Calendar } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchListing = useCallback(async () => {
    try {
      const docRef = doc(db, 'listings', params.id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setListing({ id: docSnap.id, ...docSnap.data() } as Listing);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleContact = async () => {
    if (!user || !listing) {
      alert('Bitte melden Sie sich an, um den Verkäufer zu kontaktieren.');
      return;
    }

    if (user.uid === listing.sellerId) {
      alert('Sie können Ihr eigenes Inserat nicht kontaktieren.');
      return;
    }

    try {
      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      
      let existingChat = null;
      snapshot.docs.forEach(doc => {
        const chat = doc.data();
        if (
          chat.listingId === listing.id &&
          chat.participants.includes(listing.sellerId)
        ) {
          existingChat = doc.id;
        }
      });

      if (existingChat) {
        router.push(`/chat/${existingChat}`);
      } else {
        // Create new chat
        const chatData = {
          participants: [user.uid, listing.sellerId],
          listingId: listing.id,
          lastMessageAt: serverTimestamp(),
          lastMessage: '',
        };
        
        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        router.push(`/chat/${chatRef.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Fehler beim Erstellen des Chats');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lade Inserat...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Inserat nicht gefunden.</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative h-96 bg-muted rounded-lg overflow-hidden mb-4">
                {listing.imageUrls && listing.imageUrls.length > 0 ? (
                  <Image
                    src={listing.imageUrls[currentImageIndex]}
                    alt={listing.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Tag className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>

              {listing.imageUrls && listing.imageUrls.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {listing.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-24 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`${listing.title} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Info and Contact */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(listing.price)}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Kategorie:</span>
                  <span>{listing.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Zustand:</span>
                  <span className="px-2 py-1 bg-secondary rounded-md text-xs">
                    {listing.condition}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Standort:</span>
                  <span>{listing.canton}</span>
                </div>

                {listing.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Erstellt:</span>
                    <span>
                      {format(listing.createdAt.toDate(), 'dd. MMMM yyyy')}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                {user && user.uid !== listing.sellerId ? (
                  <Button onClick={handleContact} className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Verkäufer kontaktieren
                  </Button>
                ) : user?.uid === listing.sellerId ? (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    Dies ist Ihr Inserat
                  </div>
                ) : (
                  <Button onClick={handleContact} className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Verkäufer kontaktieren
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sicherheitshinweise</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Treffen Sie sich an einem öffentlichen Ort</p>
              <p>• Prüfen Sie den Artikel vor dem Kauf</p>
              <p>• Zahlen Sie nie im Voraus</p>
              <p>• Seien Sie vorsichtig bei verdächtigen Angeboten</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
