'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, orderBy, getDocs, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Article, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User as UserIcon, Eye, CheckCircle2, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export default function AdminBlogPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || userProfile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    if (user && userProfile?.role === 'admin') {
      fetchArticles();
    }
  }, [user, userProfile]);

  const fetchArticles = async () => {
    if (!db) {
      console.error('Firebase Firestore is not initialized');
      setLoading(false);
      return;
    }

    try {
      // Alle Artikel laden (Entwürfe und veröffentlichte)
      const q = query(
        collection(db, 'articles'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
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
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (articleId: string) => {
    if (!db || !user) return;

    setPublishing(articleId);
    try {
      const articleRef = doc(db, 'articles', articleId);
      await updateDoc(articleRef, {
        status: 'published',
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Artikel-Liste aktualisieren
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, status: 'published', publishedAt: serverTimestamp() as unknown }
          : article
      ));
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Fehler beim Veröffentlichen des Artikels');
    } finally {
      setPublishing(null);
    }
  };

  const handleUnpublish = async (articleId: string) => {
    if (!db || !user) return;

    if (!confirm('Möchten Sie diesen Artikel wirklich zurückziehen?')) {
      return;
    }

    try {
      const articleRef = doc(db, 'articles', articleId);
      await updateDoc(articleRef, {
        status: 'draft',
        updatedAt: serverTimestamp(),
      });
      
      // Artikel-Liste aktualisieren
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, status: 'draft' }
          : article
      ));
    } catch (error) {
      console.error('Error unpublishing article:', error);
      alert('Fehler beim Zurückziehen des Artikels');
    }
  };

  if (authLoading || loading) {
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

  const draftArticles = articles.filter(a => a.status === 'draft');
  const publishedArticles = articles.filter(a => a.status === 'published');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Blog-Verwaltung</h1>
        <Link href="/blog/create">
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Neuer Artikel
          </Button>
        </Link>
      </div>

      {/* Entwürfe */}
      {draftArticles.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Entwürfe ({draftArticles.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftArticles.map((article) => (
              <Card key={article.id} className="h-full flex flex-col border-2 border-amber-200">
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
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      Entwurf
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {article.description || article.title}
                  </p>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserIcon className="h-3 w-3" />
                      <span>{authorNames[article.authorId] || article.author || 'Unbekannt'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {article.createdAt ? format(article.createdAt.toDate(), 'dd.MM.yyyy') : 'Unbekannt'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePublish(article.id)}
                        disabled={publishing === article.id}
                      >
                        {publishing === article.id ? (
                          'Wird veröffentlicht...'
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Veröffentlichen
                          </>
                        )}
                      </Button>
                      <Link href={`/blog/${article.slug}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="h-3 w-3 mr-1" />
                          Ansehen
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Veröffentlichte Artikel */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">Veröffentlicht ({publishedArticles.length})</h2>
        {publishedArticles.length === 0 ? (
          <p className="text-muted-foreground">Noch keine veröffentlichten Artikel.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedArticles.map((article) => (
              <Card key={article.id} className="h-full flex flex-col">
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
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      Veröffentlicht
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {article.description || article.title}
                  </p>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserIcon className="h-3 w-3" />
                      <span>{authorNames[article.authorId] || article.author || 'Unbekannt'}</span>
                    </div>
                    {article.publishedAt && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(article.publishedAt.toDate(), 'dd.MM.yyyy')}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Link href={`/blog/${article.slug}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="h-3 w-3 mr-1" />
                          Ansehen
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleUnpublish(article.id)}
                      >
                        Zurückziehen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

