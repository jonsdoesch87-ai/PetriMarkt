'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Chat, Listing } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWithDetails extends Chat {
  listing?: Listing;
  otherUserEmail?: string;
}

export default function ChatListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<ChatWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    
    if (!user) return;

    // Subscribe to chats in real-time
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const chatsData = await Promise.all(
          snapshot.docs.map(async (chatDoc) => {
            const chatData = { id: chatDoc.id, ...chatDoc.data() } as Chat;
            
            // Fetch listing details
            let listing: Listing | undefined;
            if (chatData.listingId) {
              const listingDoc = await getDoc(doc(db, 'listings', chatData.listingId));
              if (listingDoc.exists()) {
                listing = { id: listingDoc.id, ...listingDoc.data() } as Listing;
              }
            }
            
            // Get other user's email
            const otherUserId = chatData.participants.find(id => id !== user.uid);
            let otherUserEmail = 'Unbekannt';
            if (otherUserId) {
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              if (userDoc.exists()) {
                otherUserEmail = userDoc.data().email;
              }
            }
            
            return {
              ...chatData,
              listing,
              otherUserEmail,
            };
          })
        );
        
        // Sort by last message time
        chatsData.sort((a, b) => {
          const timeA = a.lastMessageAt?.toMillis() || 0;
          const timeB = b.lastMessageAt?.toMillis() || 0;
          return timeB - timeA;
        });
        
        setChats(chatsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lade...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Meine Nachrichten</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Lade Nachrichten...</p>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Keine Nachrichten vorhanden</p>
              <p className="text-sm text-muted-foreground mt-2">
                Starten Sie eine Unterhaltung, indem Sie einen Verkäufer kontaktieren
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">
                        {chat.listing?.title || 'Unbekanntes Inserat'}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Mit: {chat.otherUserEmail}
                      </div>
                      {chat.lastMessage && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {chat.lastMessage}
                        </div>
                      )}
                    </div>
                    {chat.lastMessageAt && (
                      <div className="text-xs text-muted-foreground ml-4">
                        {format(chat.lastMessageAt.toDate(), 'dd.MM.yy HH:mm')}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
