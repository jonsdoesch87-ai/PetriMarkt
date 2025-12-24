import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { ArrowLeft, Send } from 'lucide-react';

const Chat = ({ activeChat, user, setView }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    if (!activeChat || !user) return;

    const msgRef = collection(firestore, 'chats', activeChat.id, 'messages');
    const unsubscribe = onSnapshot(
      msgRef,
      (querySnapshot) => {
        const msgs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // Nachrichten nach Timestamp sortieren
        setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
        // Automatisch zu den neuesten Nachrichten scrollen
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      },
      (error) => console.error('Fehler beim Sync der Nachrichten:', error)
    );

    return () => unsubscribe();
  }, [activeChat, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      text: newMessage,
      senderId: user.uid,
      timestamp: Date.now(),
    };

    try {
      const msgRef = collection(firestore, 'chats', activeChat.id, 'messages');
      await addDoc(msgRef, msg);
      setNewMessage('');
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-[2rem] border border-gray-100 shadow-2xl flex flex-col h-[70vh] overflow-hidden">
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={() => setView('my-chats')} aria-label="Zurück">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="font-black text-sm">{activeChat?.adTitle || 'Chat'}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {activeChat?.sellerName || 'Unbekannt'}
          </p>
        </div>
      </div>
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`p-3 px-4 rounded-2xl text-sm font-medium shadow-sm max-w-[80%] ${
                m.senderId === user.uid
                  ? 'bg-[#576574] text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form className="p-4 border-t bg-white flex gap-2" onSubmit={handleSendMessage}>
        <input
          name="msg"
          autoComplete="off"
          placeholder="Nachricht..."
          className="flex-1 bg-gray-50 p-3 rounded-xl outline-none font-medium"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="bg-[#222f3e] text-white p-3 rounded-xl" aria-label="Senden">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
