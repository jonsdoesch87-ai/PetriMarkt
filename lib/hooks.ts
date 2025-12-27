'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Chat } from '@/lib/types';

/**
 * Hook to count unread chats for the current user
 * 
 * Current implementation: Counts all chats with messages as unread.
 * 
 * Future enhancement: Track when each user last viewed each chat
 * by adding a `lastViewedAt` field per participant in the chat document,
 * then compare with `lastMessageAt` to determine truly unread chats.
 * Example structure: { participants: ['user1', 'user2'], lastViewedAt: { user1: Timestamp, user2: Timestamp } }
 */
export function useUnreadChatsCount(userId: string | null | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    // Subscribe to chats where the user is a participant
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Current simplified implementation: Count all chats with messages
      // Future: Compare lastMessageAt with user's lastViewedAt per chat
      const count = snapshot.docs.filter(doc => {
        const data = doc.data() as Chat;
        return data.lastMessageAt !== null && data.lastMessageAt !== undefined;
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
