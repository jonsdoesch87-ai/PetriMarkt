'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    if (!db) {
      console.error('Firebase Firestore is not initialized');
      setLoading(false);
      return;
    }

    try {
      // Nur veröffentlichte Artikel anzeigen
      const q = query(
        collection(db, 'articles'),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      
      // Client-seitig sortieren: nach publishedAt (falls vorhanden), sonst nach createdAt
      articlesData.sort((a, b) => {
        const dateA = a.publishedAt?.toMillis() || a.createdAt?.toMillis() || 0;
        const dateB = b.publishedAt?.toMillis() || b.createdAt?.toMillis() || 0;
        return dateB - dateA; // Neueste zuerst
      });
      
      setArticles(articlesData);
      
      // Lade Autor-Namen aus User-Profilen
      const uniqueAuthorIds = [...new Set(articlesData.map(a => a.authorId).filter(Boolean))];
      const names: Record<string, string> = {};
      
      await Promise.all(
        uniqueAuthorIds.map(async (authorId) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', authorId));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              // Format wie im Profil: displayName || email?.split('@')[0] || 'Benutzer'
              const displayName = userData.displayName || userData.email?.split('@')[0] || 'Benutzer';
              names[authorId] = displayName;
            }
          } catch (error) {
            console.error(`Error fetching user ${authorId}:`, error);
          }
        })
      );
      
      setAuthorNames(names);
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Fallback: Alle Artikel laden und client-seitig filtern
      try {
        const allArticlesRef = collection(db, 'articles');
        const allSnapshot = await getDocs(allArticlesRef);
        const allArticles = allSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Article[];
        
        // Client-seitig filtern und sortieren
        const publishedArticles = allArticles
          .filter(a => a.status === 'published')
          .sort((a, b) => {
            const dateA = a.publishedAt?.toMillis() || a.createdAt?.toMillis() || 0;
            const dateB = b.publishedAt?.toMillis() || b.createdAt?.toMillis() || 0;
            return dateB - dateA;
          });
        
        setArticles(publishedArticles);
      } catch (fallbackError) {
        console.error('Error in fallback fetch:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Lade Artikel...</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Blog
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Wissenswertes rund ums Angeln, Tipps für den Kauf von Angelausrüstung 
            und hilfreiche Guides für Anfänger und Profis
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-lg">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Noch keine Artikel vorhanden</p>
            <p className="text-sm text-muted-foreground mt-2">
              Die ersten Blog-Artikel werden bald veröffentlicht.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-2xl overflow-hidden">
                  {article.imageUrls && article.imageUrls.length > 0 && (
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      <Image
                        src={article.imageUrls[0]}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2 text-foreground">
                      {article.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {article.description || article.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        <span>{authorNames[article.authorId] || article.author || 'Unbekannt'}</span>
                      </div>
                      {article.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(article.publishedAt.toDate(), 'dd.MM.yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

