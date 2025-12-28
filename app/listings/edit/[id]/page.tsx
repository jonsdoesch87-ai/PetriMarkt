'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Listing } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CATEGORIES, CANTONS, CANTON_NAMES, CONDITIONS, Category, Canton, Condition } from '@/lib/constants';
import { Upload, X, ArrowLeft } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import Link from 'next/link';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<Condition>('Gebraucht');
  const [category, setCategory] = useState<Category>('Sonstiges');
  const [canton, setCanton] = useState<Canton>('ZH');
  const [showPhone, setShowPhone] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToAdd, setImagesToAdd] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (!user || !listingId) return;

    const fetchListing = async () => {
      try {
        const listingDoc = await getDoc(doc(db, 'listings', listingId));
        
        if (!listingDoc.exists()) {
          setError('Inserat nicht gefunden');
          setLoading(false);
          return;
        }

        const listingData = { id: listingDoc.id, ...listingDoc.data() } as Listing;
        
        // Prüfe Berechtigung: Nur Besitzer oder Admin
        if (listingData.sellerId !== user.uid && userProfile?.role !== 'admin') {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        setListing(listingData);
        setTitle(listingData.title);
        setDescription(listingData.description);
        setPrice(listingData.price.toString());
        setCondition(listingData.condition);
        setCategory(listingData.category);
        setCanton(listingData.canton);
        setShowPhone(listingData.showPhone || false);
        setExistingImages(listingData.imageUrls || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Fehler beim Laden des Inserats');
        setLoading(false);
      }
    };

    fetchListing();
  }, [user, userProfile, listingId, authLoading, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length - imagesToDelete.length + imagesToAdd.length + files.length;
    
    if (totalImages > 3) {
      setError('Maximal 3 Bilder erlaubt');
      return;
    }

    // Compress and resize images
    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        files.map(file => imageCompression(file, compressionOptions))
      );

      setImagesToAdd([...imagesToAdd, ...compressedFiles]);
      
      // Create previews
      compressedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error compressing images:', error);
      setError('Fehler beim Verarbeiten der Bilder');
    }
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter(img => img !== imageUrl));
    setImagesToDelete([...imagesToDelete, imageUrl]);
  };

  const removeNewImage = (index: number) => {
    setImagesToAdd(imagesToAdd.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (imagesToAdd.length === 0) return [];
    
    const uploadPromises = imagesToAdd.map(async (image, index) => {
      const storageRef = ref(storage, `listings/${user!.uid}/${Date.now()}_${index}`);
      await uploadBytes(storageRef, image);
      return getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
  };

  const deleteOldImages = async () => {
    if (imagesToDelete.length === 0) return;
    
    const deletePromises = imagesToDelete.map(async (imageUrl) => {
      try {
        // Extract path from URL
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
        // Continue even if deletion fails
      }
    });

    await Promise.all(deletePromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;

    setError('');
    
    // Validation
    if (!price || parseFloat(price) <= 0) {
      setError('Bitte geben Sie einen gültigen Preis ein.');
      return;
    }

    const finalImages = existingImages.filter(img => !imagesToDelete.includes(img));
    if (finalImages.length + imagesToAdd.length === 0) {
      setError('Bitte behalten Sie mindestens ein Bild oder fügen Sie ein neues hinzu.');
      return;
    }

    setSaving(true);

    try {
      // Upload new images
      const newImageUrls = await uploadNewImages();
      
      // Combine existing (not deleted) and new images
      const allImageUrls = [...finalImages, ...newImageUrls];

      // Delete old images from storage
      await deleteOldImages();

      // Update listing document
      await updateDoc(doc(db, 'listings', listingId), {
        title,
        description,
        price: parseFloat(price),
        condition,
        category,
        canton,
        imageUrls: allImageUrls,
        showPhone,
      });

      router.push(`/listings/${listingId}`);
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Inserats');
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lade...</p>
      </div>
    );
  }

  if (!user || unauthorized) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Zugriff verweigert</h2>
              <p className="text-muted-foreground mb-4">
                Sie haben keine Berechtigung, dieses Inserat zu bearbeiten.
              </p>
              <Link href="/profile/listings">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zu Meine Inserate
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Inserat nicht gefunden</h2>
              <Link href="/profile/listings">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zu Meine Inserate
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalImages = existingImages.length - imagesToDelete.length + imagesToAdd.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">Inserat bearbeiten</CardTitle>
            <Link href={`/listings/${listingId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="z.B. Angelrute Shimano"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Beschreiben Sie Ihren Artikel..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preis (CHF) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Zustand *</Label>
                <Select value={condition} onValueChange={(value) => setCondition(value as Condition)}>
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="canton">Kanton *</Label>
                <Select value={canton} onValueChange={(value) => setCanton(value as Canton)}>
                  <SelectTrigger id="canton">
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
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-[#f5f5f0]">
                <div className="space-y-0.5">
                  <Label htmlFor="showPhone" className="text-base">
                    Telefonnummer im Inserat anzeigen
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Ihre Telefonnummer wird im Inserat angezeigt, wenn aktiviert
                  </p>
                </div>
                <Switch
                  id="showPhone"
                  checked={showPhone}
                  onCheckedChange={setShowPhone}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bilder (max. 3, aktuell: {totalImages})</Label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={`Bild ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {!imagesToDelete.includes(imageUrl) && (
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* New Images Preview */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Neues Bild ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload New Images */}
              {totalImages < 3 && (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Klicken Sie hier, um weitere Bilder hinzuzufügen
                    </p>
                  </label>
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
              </Button>
              <Link href={`/listings/${listingId}`}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                >
                  Abbrechen
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


