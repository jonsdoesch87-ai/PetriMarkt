'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
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
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { generateSlug } from '@/lib/utils';

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
    if (!authLoading && userProfile?.role !== 'admin') {
      router.push('/');
    }
  }, [user, userProfile, authLoading, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      setError('Maximal 5 Bilder erlaubt');
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
    if (!user || !storage) {
      throw new Error('User oder Storage nicht verfügbar');
    }

    const uploadPromises = images.map(async (image, index) => {
      const storageRef = ref(storage, `blog/${user.uid}/${Date.now()}_${index}`);
      await uploadBytes(storageRef, image);
      return getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
  };

  const checkSlugUnique = async (slug: string): Promise<boolean> => {
    if (!db) return true;
    
    try {
      const articlesRef = collection(db, 'articles');
      const q = query(articlesRef, where('slug', '==', slug));
      const snapshot = await getDocs(q);
      return snapshot.empty;
    } catch (error) {
      console.error('Error checking slug:', error);
      return true;
    }
  };

  const generateUniqueSlug = async (title: string): Promise<string> => {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (!(await checkSlugUnique(slug))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setError('');
    
    // Validation
    if (!title || title.length < 10) {
      setError('Bitte geben Sie einen Titel ein (mindestens 10 Zeichen).');
      return;
    }

    if (!content || content.length < 100) {
      setError('Bitte geben Sie einen Artikel-Text ein (mindestens 100 Zeichen).');
      return;
    }

    if (images.length === 0) {
      setError('Bitte laden Sie mindestens ein Bild hoch.');
      return;
    }

    setLoading(true);

    try {
      // Generate unique slug
      const slug = await generateUniqueSlug(title);

      // Upload images first
      let imageUrls: string[] = [];
      try {
        imageUrls = await uploadImages();
      } catch (uploadErr) {
        console.error('Error uploading images:', uploadErr);
        throw new Error('Fehler beim Hochladen der Bilder. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
      }

      // Create article document
      try {
        const authorName = userProfile?.displayName || user.email || 'Unbekannt';
        const articleData = {
          slug,
          title,
          description: description || null,
          content,
          imageUrls,
          author: authorName,
          authorId: user.uid,
          publishedAt: status === 'published' ? serverTimestamp() : null,
          status,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'articles'), articleData);
        router.push(`/blog/${slug}`);
      } catch (dbErr) {
        console.error('Error creating article in database:', dbErr);
        throw new Error('Fehler beim Speichern des Artikels in der Datenbank. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      console.error('Error creating article:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Lade...</p>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Zugriff verweigert. Nur für Admins.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Neuen Blog-Artikel erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Nachhaltigkeit beim Angeln"
                required
                minLength={10}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mindestens 10, maximal 200 Zeichen
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kurze Beschreibung für die Vorschau..."
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Wird in der Blog-Übersicht angezeigt
              </p>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Artikel-Text *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Schreiben Sie hier Ihren Artikel-Text..."
                rows={20}
                required
                minLength={100}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mindestens 100 Zeichen. HTML wird unterstützt.
              </p>
            </div>

            {/* Images */}
            <div>
              <Label>Bilder *</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Bilder hochladen (max. 5)
                </Label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={300}
                        height={128}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Mindestens 1, maximal 5 Bilder. Bilder werden automatisch auf 1200px Breite komprimiert.
              </p>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published')}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="published">Veröffentlichen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Wird erstellt...' : 'Artikel speichern'}
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

