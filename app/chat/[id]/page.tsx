'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Message, Chat, Listing } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to mark chat as read
  const markChatAsRead = useCallback(async () => {
    if (!user || !db) return;
    
    try {
      await updateDoc(doc(db, 'chats', params.id as string), {
        [`lastRead.${user.uid}`]: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  }, [user, params.id]);

  const fetchChatAndListing = useCallback(async () => {
    if (!user || !db) return;
    
    try {
      const chatDoc = await getDoc(doc(db, 'chats', params.id as string));
      if (!chatDoc.exists()) {
        setLoading(false);
        return;
      }

      const chatData = { id: chatDoc.id, ...chatDoc.data() } as Chat;
      
      // Verify user is participant
      if (!chatData.participants.includes(user.uid)) {
        router.push('/chat');
        return;
      }
      
      setChat(chatData);

      // Mark chat as read by updating lastRead timestamp for current user
      await markChatAsRead();

      // Fetch listing
      if (chatData.listingId && db) {
        const listingDoc = await getDoc(doc(db, 'listings', chatData.listingId));
        if (listingDoc.exists()) {
          setListing({ id: listingDoc.id, ...listingDoc.data() } as Listing);
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  }, [user, params.id, router, markChatAsRead]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchChatAndListing();
    }
  }, [user, authLoading, router, fetchChatAndListing]);

  useEffect(() => {
    if (!chat || !user || !db) return;

    // Subscribe to messages
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', params.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messagesData);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [chat, user, params.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chat || !db) return;

    try {
      const messageData = {
        chatId: params.id as string,
        senderId: user.uid,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'messages'), messageData);
      
      // Update chat with last message and mark as read for sender in a single operation
      await updateDoc(doc(db, 'chats', params.id as string), {
        lastMessage: newMessage.trim(),
        lastMessageAt: serverTimestamp(),
        [`lastRead.${user.uid}`]: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lade...</p>
      </div>
    );
  }

  if (!chat || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Chat nicht gefunden.</p>
            <Button onClick={() => router.push('/chat')} className="mt-4">
              Zurück zu Nachrichten
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/chat')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {listing?.title || 'Chat'}
              </CardTitle>
              {listing && (
                <Link
                  href={`/listings/${listing.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Inserat anzeigen
                </Link>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Noch keine Nachrichten. Schreiben Sie die erste Nachricht!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === user.uid ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.senderId === user.uid
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  {message.createdAt && (
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user.uid
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {format(message.createdAt.toDate(), 'HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nachricht schreiben..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
