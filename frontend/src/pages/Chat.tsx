import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Message, Inserat, User } from '../types';
import { getInserat } from '../services/inserateService';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import { useAuthStore } from '../store/authStore';

const Chat = () => {
  const { inseratId } = useParams();
  const { user } = useAuthStore();
  const [inserat, setInserat] = useState<Inserat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!inseratId || !user) return;

    fetchInserat();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [inseratId, user]);

  useEffect(() => {
    if (inserat && user) {
      // Bestimme den anderen User (Verkäufer)
      const otherUserId = inserat.userId;
      
      // Firestore Listener für Nachrichten
      const unsubscribe = subscribeToMessages(
        inseratId!,
        user.id,
        otherUserId,
        (newMessages) => {
          setMessages(newMessages);
          scrollToBottom();
        }
      );
      
      unsubscribeRef.current = unsubscribe;
      setLoading(false);
    }
  }, [inserat, user, inseratId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchInserat = async () => {
    if (!inseratId) return;
    try {
      setLoading(true);
      const data = await getInserat(inseratId);
      setInserat(data);
    } catch (error) {
      console.error('Fehler beim Laden des Inserats:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !inserat || !user) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Empfänger ist der Verkäufer (Inserat-Besitzer)
      const receiverId = inserat.userId;
      
      if (receiverId === user.id) {
        throw new Error('Du kannst nicht mit dir selbst chatten');
      }

      await sendMessage(messageContent, inseratId!, user.id, receiverId);
    } catch (error: any) {
      console.error('Fehler beim Senden der Nachricht:', error);
      setNewMessage(messageContent); // Nachricht wiederherstellen bei Fehler
      alert(error.message || 'Fehler beim Senden der Nachricht');
    } finally {
      setSending(false);
    }
  };

  if (loading || !inserat) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Lade Chat...</div>
      </div>
    );
  }

  // Bestimme den anderen User im Chat (immer der Verkäufer)
  const otherUser = inserat.user;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="bg-primary-600 text-white p-4">
          <Link
            to={`/inserat/${inseratId}`}
            className="text-sm hover:underline mb-1 block"
          >
            ← Zurück zum Inserat
          </Link>
          <h2 className="text-xl font-semibold">{inserat.title}</h2>
          <p className="text-sm opacity-90">
            Chat mit {otherUser?.name || otherUser?.email}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Noch keine Nachrichten. Starte die Unterhaltung!
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('de-CH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nachricht schreiben..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {sending ? '...' : 'Senden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;

