import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
  or,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Message, User } from '../types';

export const subscribeToMessages = (
  inseratId: string,
  userId: string,
  otherUserId: string,
  callback: (messages: Message[]) => void
) => {
  // Firestore erfordert einen Composite Index für or() mit orderBy()
  // Wir filtern client-seitig, um das zu vermeiden
  const q = query(
    collection(db, 'messages'),
    where('inseratId', '==', inseratId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    // Client-seitig filtern
    const filteredDocs = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.senderId === userId || data.receiverId === userId;
    });
    const messagesPromises = filteredDocs.map(async (docSnap) => {
      const data = docSnap.data();
      
      // Sender und Receiver Daten laden
      const [senderDoc, receiverDoc] = await Promise.all([
        getDoc(doc(db, 'users', data.senderId)),
        getDoc(doc(db, 'users', data.receiverId))
      ]);
      
      const senderData = senderDoc.exists() ? senderDoc.data() : null;
      const receiverData = receiverDoc.exists() ? receiverDoc.data() : null;
      
      return {
        id: docSnap.id,
        content: data.content,
        inseratId: data.inseratId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        read: data.read || false,
        sender: senderData ? {
          id: data.senderId,
          email: senderData.email || '',
          name: senderData.name || null,
          phone: senderData.phone || null,
          location: senderData.location || null,
          profileImage: senderData.profileImage || null,
          createdAt: senderData.createdAt?.toDate().toISOString() || new Date().toISOString(),
        } : undefined,
        receiver: receiverData ? {
          id: data.receiverId,
          email: receiverData.email || '',
          name: receiverData.name || null,
          phone: receiverData.phone || null,
          location: receiverData.location || null,
          profileImage: receiverData.profileImage || null,
          createdAt: receiverData.createdAt?.toDate().toISOString() || new Date().toISOString(),
        } : undefined,
      } as Message;
    });
    
    const messages = await Promise.all(messagesPromises);
    callback(messages);
  });
};

export const sendMessage = async (
  content: string,
  inseratId: string,
  senderId: string,
  receiverId: string
): Promise<void> => {
  await addDoc(collection(db, 'messages'), {
    content,
    inseratId,
    senderId,
    receiverId,
    read: false,
    createdAt: Timestamp.now(),
  });
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, {
    read: true,
  });
};

export const getConversations = async (userId: string) => {
  // Alle Nachrichten des Users abrufen
  // Wir müssen zwei separate Queries machen, da Firestore or() mit orderBy() einen Index benötigt
  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(query(
      collection(db, 'messages'),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    )),
    getDocs(query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc')
    ))
  ]);
  
  // Kombiniere und sortiere alle Nachrichten
  const allMessages = [
    ...sentSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      };
    }),
    ...receivedSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      };
    })
  ].sort((a, b) => {
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 
                  typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 
                  typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
  
  return allMessages;
};

