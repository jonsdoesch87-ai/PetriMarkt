'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Chat } from '@/lib/types';

/**
 * Hook to count unread chats for the current user
 * 
 * A chat is considered unread if:
 * - lastMessageAt exists
 * - lastMessageAt > lastRead[userId] (or lastRead[userId] doesn't exist)
 */
export function useUnreadChatsCount(userId: string | null | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    // Capture userId in a const for use in callback to avoid non-null assertions
    const currentUserId = userId;

    // Subscribe to chats where the user is a participant
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.filter(doc => {
        const data = doc.data() as Chat;
        
        // No messages yet
        if (!data.lastMessageAt) {
          return false;
        }
        
        // No lastRead record for this user - chat is unread
        if (!data.lastRead || !data.lastRead[currentUserId]) {
          return true;
        }
        
        // Compare timestamps: unread if lastMessageAt > lastRead[userId]
        return data.lastMessageAt.toMillis() > data.lastRead[currentUserId].toMillis();
      }).length;
      
      setUnreadCount(count);
    }, (error) => {
      console.error('Error fetching unread chats:', error);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, [userId]);

  return unreadCount;
}
