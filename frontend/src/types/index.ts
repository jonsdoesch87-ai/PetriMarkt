export interface User {
  id: string;
  email: string | null;
  name?: string | null;
  phone?: string | null;
  location?: string | null;
  profileImage?: string | null;
  createdAt: string;
}

export interface Inserat {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'Neu' | 'Gebraucht' | 'Selbst gebastelt';
  images: string[];
  location: string;
  zipCode?: string;
  status: 'Aktiv' | 'Verkauft';
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  inseratId: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
  sender?: User;
  receiver?: User;
  inserat?: {
    id: string;
    title: string;
  };
}

export interface Conversation {
  inseratId: string;
  inserat: Inserat;
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
}

