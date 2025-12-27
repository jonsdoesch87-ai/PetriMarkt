import { Timestamp } from 'firebase/firestore';
import { Canton, Category, Condition } from './constants';

export interface User {
  uid: string;
  email: string;
  defaultCanton: Canton;
  createdAt: Timestamp;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  category: Category;
  canton: Canton;
  imageUrls: string[];
  createdAt: Timestamp;
}

export interface Chat {
  id: string;
  participants: [string, string];
  listingId: string;
  lastMessageAt: Timestamp;
  lastMessage?: string;
  lastRead?: { [userId: string]: Timestamp };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}
