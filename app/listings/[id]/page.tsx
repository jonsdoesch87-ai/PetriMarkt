'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { MapPin, Tag, MessageSquare, Calendar, Phone, Trash2, Flag, TrendingUp, Sparkles, Eye } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerProfile, setSellerProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const isAdmin = userProfile?.role === 'admin';

  const fetchListing = useCallback(async () => {
    try {
      const docRef = doc(db, 'listings', params.id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const listingData = { id: docSnap.id, ...docSnap.data() } as Listing;
        setListing(listingData);
        
        // Fetch seller profile
        if (listingData.sellerId) {
          const sellerDoc = await getDoc(doc(db, 'users', listingData.sellerId));
          if (sellerDoc.exists()) {
            const sellerData = sellerDoc.data();
            setSellerProfile({ 
              uid: sellerDoc.id,
              ...sellerData 
            } as User);
          }
        }
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

  // Track view count with LocalStorage protection against spam
  useEffect(() => {
    if (!listing || !params.id) return;

    // Don't count views for the seller themselves
    if (user?.uid === listing.sellerId) return;

    const listingId = params.id as string;
    const storageKey = `listing_view_${listingId}`;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    // Check if this browser has viewed this listing in the last hour
    const lastViewTime = localStorage.getItem(storageKey);
    const now = Date.now();

    if (lastViewTime) {
      const timeSinceLastView = now - parseInt(lastViewTime, 10);
      if (timeSinceLastView < oneHour) {
        // Already viewed in the last hour, don't increment
        return;
      }
    }

    // Increment view count
    const incrementViewCount = async () => {
      try {
        await updateDoc(doc(db, 'listings', listingId), {
          viewCount: increment(1),
        });
        // Store the current timestamp in LocalStorage
        localStorage.setItem(storageKey, now.toString());
        // Refresh listing to show updated view count
        await fetchListing();
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    };

    incrementViewCount();
  }, [listing, params.id, user, fetchListing]);

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

  const handleDeleteListing = async () => {
    if (!isAdmin || !listing) return;
    
    if (!confirm('Sind Sie sicher, dass Sie dieses Inserat löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'listings', listing.id), {
        status: 'deleted',
        deletedBy: 'admin',
      });
      alert('Inserat erfolgreich gelöscht.');
      router.push('/');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Fehler beim Löschen des Inserats');
    }
  };

  const handleBoostListing = async () => {
    if (!isAdmin || !listing) return;

    try {
      const currentBoost = listing.boostScore || 0;
      await updateDoc(doc(db, 'listings', listing.id), {
        boostScore: currentBoost + 1,
      });
      await fetchListing(); // Refresh listing data
      alert('Boost erfolgreich erhöht!');
    } catch (error) {
      console.error('Error boosting listing:', error);
      alert('Fehler beim Boosten des Inserats');
    }
  };

  const handleFeatureListing = async () => {
    if (!isAdmin || !listing) return;

    try {
      const isCurrentlyFeatured = listing.isFeatured === true;
      await updateDoc(doc(db, 'listings', listing.id), {
        isFeatured: !isCurrentlyFeatured,
        featuredUntil: !isCurrentlyFeatured ? null : null, // Can be extended with actual expiry date
      });
      await fetchListing(); // Refresh listing data
      alert(isCurrentlyFeatured ? 'Hervorhebung entfernt.' : 'Inserat hervorgehoben!');
    } catch (error) {
      console.error('Error featuring listing:', error);
      alert('Fehler beim Hervorheben des Inserats');
    }
  };

  const handleReportListing = async () => {
    if (!user || !listing || !reportReason.trim()) return;

    setReporting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        listingId: listing.id,
        reporterId: user.uid,
        reason: reportReason.trim(),
        createdAt: serverTimestamp(),
      });
      alert('Inserat erfolgreich gemeldet. Vielen Dank für Ihre Meldung.');
      setShowReportDialog(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting listing:', error);
      alert('Fehler beim Melden des Inserats');
    } finally {
      setReporting(false);
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

  // Check if listing is active (only show active or reserved listings to non-owners)
  const isOwner = user?.uid === listing.sellerId;
  const isActive = listing.status === 'active' || listing.status === undefined || listing.status === 'reserved';
  const showInactiveWarning = !isOwner && !isActive;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {showInactiveWarning && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              ⚠️ Dieses Inserat ist nicht mehr verfügbar.
            </p>
          </CardContent>
        </Card>
      )}
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

          {/* Admin Controls */}
          {isAdmin && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-lg">Admin-Funktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleBoostListing}
                  variant="outline"
                  className="w-full gap-2 border-primary text-primary hover:bg-primary/10"
                >
                  <TrendingUp className="h-4 w-4" />
                  Boost +1
                </Button>
                <Button
                  onClick={handleFeatureListing}
                  variant="outline"
                  className="w-full gap-2 border-amber-400 text-amber-700 hover:bg-amber-100"
                >
                  <Sparkles className="h-4 w-4" />
                  {listing.isFeatured ? 'Hervorhebung entfernen' : 'Hervorheben'}
                </Button>
                <div className="pt-2 border-t">
                  <Button
                    onClick={handleDeleteListing}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Inserat löschen
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                  <p>Boost Score: {listing.boostScore || 0}</p>
                  <p>Featured: {listing.isFeatured ? 'Ja' : 'Nein'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Button */}
          {user && user.uid !== listing.sellerId && !isAdmin && (
            <Card className="border-t">
              <CardContent className="pt-6">
                <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-destructive">
                      <Flag className="h-4 w-4" />
                      Inserat melden
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Inserat melden</DialogTitle>
                      <DialogDescription>
                        Bitte beschreiben Sie den Grund für die Meldung dieses Inserats.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reportReason">Grund der Meldung</Label>
                        <Textarea
                          id="reportReason"
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          placeholder="z.B. Betrug, unangemessene Inhalte, Spam..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReportDialog(false);
                          setReportReason('');
                        }}
                      >
                        Abbrechen
                      </Button>
                      <Button
                        onClick={handleReportListing}
                        disabled={!reportReason.trim() || reporting}
                        variant="destructive"
                      >
                        {reporting ? 'Wird gemeldet...' : 'Melden'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
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

                {listing.showPhone && sellerProfile?.phoneNumber && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Telefon:</span>
                    <a
                      href={`tel:${sellerProfile.phoneNumber}`}
                      className="text-primary hover:underline"
                    >
                      {sellerProfile.phoneNumber}
                    </a>
                  </div>
                )}
              </div>

              {/* View Count - Only visible to seller */}
              {user?.uid === listing.sellerId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <Eye className="h-4 w-4" />
                  <span>
                    {listing.viewCount || 0} {listing.viewCount === 1 ? 'Person hat' : 'Personen haben'} dieses Inserat gesehen
                  </span>
                </div>
              )}

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
