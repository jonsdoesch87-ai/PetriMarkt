'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, serverTimestamp, getDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CANTONS, CANTON_NAMES, Canton } from '@/lib/constants';
import { Mail, Phone, MapPin, Edit2, X, Check, Package, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [canton, setCanton] = useState<Canton>('ZH');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load data from userProfile into local state
  const loadProfileData = () => {
    if (userProfile) {
      setCanton(userProfile.defaultCanton || 'ZH');
      setDisplayName(userProfile.displayName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setCity(userProfile.city || '');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadProfileData();
  }, [userProfile]);

  // Reset to view mode and reload data when canceling
  const handleCancel = () => {
    loadProfileData();
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user || !db) return;

    setLoading(true);
    setSuccess(false);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(
        userDocRef,
        {
          uid: user.uid,
          email: user.email,
          defaultCanton: canton,
          displayName: displayName.trim() || null,
          phoneNumber: phoneNumber.trim() || null,
          city: city.trim() || null,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      
      // Reload profile data from Firestore to ensure sync
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const updatedProfile = userDoc.data();
        setCanton(updatedProfile.defaultCanton || 'ZH');
        setDisplayName(updatedProfile.displayName || '');
        setPhoneNumber(updatedProfile.phoneNumber || '');
        setCity(updatedProfile.city || '');
      }
      
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Fehler beim Speichern des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !db || !auth) return;

    const confirmMessage = 'Sind Sie sicher, dass Sie Ihr Konto löschen möchten?\n\n' +
      'Diese Aktion kann nicht rückgängig gemacht werden und löscht:\n' +
      '• Ihr Profil\n' +
      '• Alle Ihre Inserate\n' +
      '• Alle Ihre Chats\n' +
      '• Alle Ihre Favoriten\n' +
      '• Alle Ihre Meldungen\n\n' +
      'Geben Sie "LÖSCHEN" ein, um zu bestätigen:';

    const userInput = prompt(confirmMessage);
    if (userInput !== 'LÖSCHEN') {
      return;
    }

    if (!confirm('Letzte Bestätigung: Möchten Sie Ihr Konto wirklich unwiderruflich löschen?')) {
      return;
    }

    setLoading(true);

    try {
      // Safety check: ensure db is available
      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }

      const batch = writeBatch(db);

      // 1. Delete all user's listings
      const listingsQuery = query(collection(db, 'listings'), where('sellerId', '==', user.uid));
      const listingsSnapshot = await getDocs(listingsQuery);
      listingsSnapshot.docs.forEach((docItem) => {
        batch.delete(docItem.ref);
      });

      // 2. Delete all chats where user is a participant
      const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
      const chatsSnapshot = await getDocs(chatsQuery);
      chatsSnapshot.docs.forEach((docItem) => {
        batch.delete(docItem.ref);
      });

      // 3. Delete all favorites
      const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      favoritesSnapshot.docs.forEach((docItem) => {
        batch.delete(docItem.ref);
      });

      // 4. Delete all reports by user
      const reportsQuery = query(collection(db, 'reports'), where('reporterId', '==', user.uid));
      const reportsSnapshot = await getDocs(reportsQuery);
      reportsSnapshot.docs.forEach((docItem) => {
        batch.delete(docItem.ref);
      });

      // 5. Delete user profile
      const userDocRef = doc(db, 'users', user.uid);
      batch.delete(userDocRef);

      // Execute all deletions
      await batch.commit();

      // 6. Delete Firebase Auth account
      await deleteUser(auth.currentUser!);

      alert('Ihr Konto wurde erfolgreich gelöscht.');
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Fehler beim Löschen des Kontos. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lade...</p>
      </div>
    );
  }

  const displayNameToShow = displayName || user.email?.split('@')[0] || 'Benutzer';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="bg-[#f5f5f0] border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl">Mein Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
              Profil erfolgreich aktualisiert!
            </div>
          )}

          {!isEditing ? (
            // View Mode
            <>
              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6">
                    {displayNameToShow}
                  </h2>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">E-Mail</div>
                      <div className="text-sm font-medium">{user.email}</div>
                    </div>
                  </div>

                  {phoneNumber && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Telefonnummer</div>
                        <a
                          href={`tel:${phoneNumber}`}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {(city || canton) && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Standort</div>
                        <div className="text-sm font-medium">
                          {city && `${city}, `}
                          {canton} - {CANTON_NAMES[canton]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Link href="/profile/listings" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/10"
                    size="lg"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Meine Inserate
                  </Button>
                </Link>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Profil bearbeiten
                </Button>
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Konto löschen (GDPR/nDSG)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Löscht alle Ihre Daten unwiderruflich
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Edit Mode
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Anzeigename</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ihr Name"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefonnummer</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+41 XX XXX XX XX"
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground">
                  Ihre Telefonnummer kann in Inseraten angezeigt werden, wenn Sie dies wünschen
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="z.B. Zürich"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canton">Standard-Kanton</Label>
                <Select value={canton} onValueChange={(value) => setCanton(value as Canton)}>
                  <SelectTrigger id="canton" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANTONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c} - {CANTON_NAMES[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Dieser Kanton wird beim Erstellen neuer Inserate vorausgewählt
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {loading ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
