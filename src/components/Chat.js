import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";
import { ArrowLeft, Send } from "lucide-react";

const Chat = ({ activeChat, currentUser, setView }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!activeChat) return;

    const messagesRef = collection(firestore, "chats", activeChat.id, "messages");

    const unsubscribe = onSnapshot(messagesRef, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
    });

    return () => unsubscribe();
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      text: newMessage,
      senderId: currentUser.uid,
      timestamp: Date.now(),
    };

    try {
      const messagesRef = collection(firestore, "chats", activeChat.id, "messages");
      await addDoc(messagesRef, message);
      setNewMessage("");
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div className="flex items-center mb-4">
        <button onClick={() => setView("detail")} className="text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div className="ml-4">
          <p className="text-lg font-medium">{activeChat?.adTitle}</p>
          <p className="text-sm text-gray-500">Verkäufer: {activeChat?.sellerName}</p>
        </div>
      </div>
      <div className="overflow-y-auto h-64 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 p-2 rounded-lg text-sm ${
              m.senderId === currentUser.uid
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Nachricht schreiben..."
        />
        <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded-lg">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
