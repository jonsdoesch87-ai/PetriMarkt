'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
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
import { Upload, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function CreateListingPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<Condition>('Gebraucht');
  const [category, setCategory] = useState<Category>('Sonstiges');
  const [canton, setCanton] = useState<Canton>('ZH');
  const [showPhone, setShowPhone] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (userProfile?.defaultCanton) {
      setCanton(userProfile.defaultCanton);
    }
  }, [userProfile]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
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

      setImages([...images, ...compressedFiles]);
      
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

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!storage || !user) {
      throw new Error('Storage oder User nicht verfügbar');
    }
    
    const firebaseStorage = storage;
    const uploadPromises = images.map(async (image, index) => {
      const storageRef = ref(firebaseStorage, `listings/${user.uid}/${Date.now()}_${index}`);
      await uploadBytes(storageRef, image);
      return getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    
    // Validation
    if (!price || parseFloat(price) <= 0) {
      setError('Bitte geben Sie einen gültigen Preis ein.');
      return;
    }

    if (images.length === 0) {
      setError('Bitte laden Sie mindestens ein Bild hoch.');
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      let imageUrls: string[] = [];
      try {
        imageUrls = await uploadImages();
      } catch (uploadErr) {
        console.error('Error uploading images:', uploadErr);
        throw new Error('Fehler beim Hochladen der Bilder. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
      }

      // Create listing document only after successful upload
      try {
        const listingData = {
          sellerId: user.uid,
          title,
          description,
          price: parseFloat(price),
          condition,
          category,
          canton,
          imageUrls,
          showPhone,
          status: 'active' as const,
          isFeatured: false,
          boostScore: 0,
          featuredUntil: null,
          viewCount: 0,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'listings'), listingData);
        router.push(`/listings/${docRef.id}`);
      } catch (dbErr) {
        console.error('Error creating listing in database:', dbErr);
        throw new Error('Fehler beim Speichern des Inserats in der Datenbank. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  };

  if (authLoading) {
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Neues Inserat erstellen</CardTitle>
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
              <Label>Bilder (max. 3)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 3}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center ${
                    images.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {images.length >= 3
                      ? 'Maximale Anzahl erreicht'
                      : 'Klicken Sie hier, um Bilder hochzuladen'}
                  </p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Wird erstellt...' : 'Inserat erstellen'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
