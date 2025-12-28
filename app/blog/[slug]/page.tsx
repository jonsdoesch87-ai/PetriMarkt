import { Metadata } from 'next';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User as UserIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Prüfe ob db verfügbar ist
  if (!db) {
    return {
      title: 'Blog | PetriMarkt',
      description: 'Blog-Artikel auf PetriMarkt',
    };
  }
  
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const article = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Article;
      const title = `${article.title} | PetriMarkt Blog`;
      const description = article.description || `Blog-Artikel auf PetriMarkt: ${article.title}`;
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: article.imageUrls && article.imageUrls.length > 0 ? [article.imageUrls[0]] : [],
          type: 'article',
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Artikel nicht gefunden | PetriMarkt Blog',
    description: 'Der angeforderte Blog-Artikel konnte nicht gefunden werden.',
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  
  // Prüfe ob db verfügbar ist
  if (!db) {
    console.error('Firebase Firestore is not initialized');
    notFound();
  }
  
  let article: Article | null = null;
  
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      article = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Article;
    }
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }

  if (!article || article.status !== 'published') {
    notFound();
  }

  // Lade Autor-Namen aus User-Profil
  let authorDisplayName = article.author;
  if (article.authorId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', article.authorId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Format wie im Profil: displayName || email?.split('@')[0] || 'Benutzer'
        authorDisplayName = userData.displayName || userData.email?.split('@')[0] || 'Benutzer';
      }
    } catch (error) {
      console.error('Error fetching author name:', error);
    }
  }

  return (
    <div className="bg-background min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </Link>

        {/* Article Header */}
        <Card className="mb-8 border-0 shadow-md">
          {/* Hero Image (first image) */}
          {article.imageUrls && article.imageUrls.length > 0 && (
            <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-t-2xl bg-muted">
              <Image
                src={article.imageUrls[0]}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          )}
          <CardContent className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {article.title}
            </h1>
            {article.description && (
              <p className="text-lg text-muted-foreground mb-6">
                {article.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{authorDisplayName}</span>
              </div>
              {article.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(article.publishedAt.toDate(), 'dd. MMMM yyyy')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6 md:p-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-p:text-muted-foreground prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>

        {/* Image Gallery (additional images) */}
        {article.imageUrls && article.imageUrls.length > 1 && (
          <Card className="border-0 shadow-md mb-8">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Weitere Bilder</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.imageUrls.slice(1).map((imageUrl, index) => (
                  <div key={index} className="relative h-64 w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={imageUrl}
                      alt={`${article.title} - Bild ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back to Overview */}
        <div className="mt-8 text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Blog-Übersicht
          </Link>
        </div>
      </div>
    </div>
  );
}

