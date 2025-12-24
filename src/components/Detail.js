import React from "react";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

const Detail = ({ ad, currentUser, setActiveChat }) => {
  const handleStartChat = async () => {
    if (!currentUser) {
      alert("Bitte zuerst einloggen!");
      return;
    }

    try {
      // Eindeutige Chat-ID generieren: Basierend auf Benutzer- und Anzeigen-IDs
      const chatId = [currentUser.uid, ad.sellerId, ad.id].sort().join("_");

      // Chat-Referenz in Firestore
      const chatRef = doc(firestore, "chats", chatId);

      // Chat-Daten erstellen oder aktualisieren
      await setDoc(chatRef, {
        adId: ad.id,
        adTitle: ad.title,
        buyerId: currentUser.uid,
        buyerName: currentUser.name,
        sellerId: ad.sellerId,
        sellerName: ad.sellerName,
        createdAt: Date.now(),
      }, { merge: true });

      // Aktiven Chat setzen und Chatansicht öffnen
      setActiveChat({ id: chatId, adTitle: ad.title, sellerName: ad.sellerName });
    } catch (error) {
      console.error("Fehler beim Starten des Chats:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-3xl font-bold mb-2">{ad.title}</h2>
      <p className="text-xl font-semibold text-gray-700">Preis: CHF {ad.price}</p>
      <p className="text-gray-600">{ad.description}</p>
      <p className="text-gray-500">Kanton: {ad.kanton}</p>
      <button
        onClick={handleStartChat}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600"
      >
        Nachricht
      </button>
    </div>
  );
};

export default Detail;
