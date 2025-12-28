import { Timestamp } from 'firebase/firestore';
import { Canton, Category, Condition } from './constants';

export interface User {
  uid: string;
  email: string;
  defaultCanton: Canton;
  displayName?: string;
  phoneNumber?: string;
  city?: string;
  role?: 'admin' | 'user';
  agbAccepted?: boolean;
  agbAcceptedAt?: Timestamp;
  createdAt: Timestamp;
}

export type ListingStatus = 'active' | 'reserved' | 'sold' | 'deleted' | 'expired';

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
  showPhone?: boolean;
  status?: ListingStatus;
  deletedBy?: 'admin' | 'user';
  isFeatured?: boolean;
  boostScore?: number;
  featuredUntil?: Timestamp | null;
  viewCount?: number;
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

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Timestamp;
}

export interface Report {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  createdAt: Timestamp;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content: string; // HTML or Markdown content
  imageUrls: string[]; // Array of image URLs (1 or more)
  author: string;
  authorId: string; // User ID of the author
  publishedAt: Timestamp | null; // null = draft
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  status: 'draft' | 'published';
}