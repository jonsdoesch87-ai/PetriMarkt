import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConversations } from '../services/chatService';
import { useAuthStore } from '../store/authStore';
import { getInserat } from '../services/inserateService';
import { getUser } from '../services/userService';
import { Inserat, Message, User } from '../types';

interface Conversation {
  inseratId: string;
  inserat: Inserat;
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
}

const ChatList = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const messages = await getConversations(user.id);
      
      // Gruppiere Nachrichten nach inseratId
      const conversationMap = new Map<string, {
        messages: any[];
        inseratId: string;
      }>();

      for (const msg of messages) {
        const inseratId = msg.inseratId;
        if (!conversationMap.has(inseratId)) {
          conversationMap.set(inseratId, {
            inseratId,
            messages: [],
          });
        }
        conversationMap.get(inseratId)!.messages.push(msg);
      }

      // Erstelle Conversations
      const convPromises = Array.from(conversationMap.values()).map(async (conv) => {
        const inserat = await getInserat(conv.inseratId);
        const lastMsg = conv.messages[0]; // Bereits sortiert nach createdAt desc
        const otherUserId = lastMsg.senderId === user.id 
          ? lastMsg.receiverId 
          : lastMsg.senderId;
        const otherUser = await getUser(otherUserId);
        const unreadCount = conv.messages.filter(
          (m: any) => !m.read && m.receiverId === user.id
        ).length;

        return {
          inseratId: conv.inseratId,
          inserat,
          otherUser: otherUser || {
            id: otherUserId,
            email: '',
            name: null,
            phone: null,
            location: null,
            profileImage: null,
            createdAt: new Date().toISOString(),
          },
          lastMessage: {
            id: lastMsg.id,
            content: lastMsg.content,
            inseratId: lastMsg.inseratId,
            senderId: lastMsg.senderId,
            receiverId: lastMsg.receiverId,
            createdAt: lastMsg.createdAt instanceof Date 
              ? lastMsg.createdAt.toISOString() 
              : typeof lastMsg.createdAt === 'string' 
                ? lastMsg.createdAt 
                : new Date().toISOString(),
            read: lastMsg.read || false,
          },
          unreadCount,
        } as Conversation;
      });

      const convs = await Promise.all(convPromises);
      setConversations(convs.sort((a, b) => 
        new Date(b.lastMessage.createdAt).getTime() - 
        new Date(a.lastMessage.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Fehler beim Laden der Konversationen:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Lade Konversationen...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Meine Chats</h1>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Du hast noch keine Chats.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Link
              key={conversation.inseratId}
              to={`/chat/${conversation.inseratId}`}
              className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {conversation.inserat.title}
                    </h3>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    Mit {conversation.otherUser.name || conversation.otherUser.email}
                  </p>
                  <p className="text-gray-500 text-sm truncate">
                    {conversation.lastMessage.content}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500 ml-4">
                  {new Date(conversation.lastMessage.createdAt).toLocaleDateString('de-CH', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
