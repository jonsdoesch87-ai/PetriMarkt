import React, { useState, useEffect } from "react";
import Detail from "./components/Detail"; // Import der Detail-Komponente für Anzeigen-Details
import Chat from "./components/Chat"; // Import der Chat-Komponente für Nachrichten
import { auth } from "./firebase/firebaseConfig"; // Firebase Auth-Setup
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null); // Zustand für den angemeldeten Benutzer
  const [view, setView] = useState("detail"); // Zustand für die aktuelle Ansicht: "detail" oder "chat"
  const [activeChat, setActiveChat] = useState(null); // Zustand für den aktiven Chat

  // Nutzer-Anmeldung überwachen (Firebase Authentication)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Nutzer automatisch anonym anmelden, falls nicht eingeloggt
  useEffect(() => {
    if (!user) {
      signInAnonymously(auth).catch((error) => {
        console.error("Fehler beim anonymen Anmelden:", error);
      });
    }
  }, [user]);

  return (
    <div>
      {/* Kontrolle des Login-Status */}
      {user ? (
        <>
          {/* Detail-Seite */}
          {view === "detail" && (
            <Detail
              ad={{
                id: "ad-id-123", // Test-Anzeigen-Daten
                title: "Shimano Angelrolle",
                price: 50,
                description: "Fast wie neu mit Zubehör.",
                kanton: "Bern",
                sellerId: "seller-id-456",
                sellerName: "Hans Fischer",
              }}
              currentUser={user}
              setActiveChat={(chat) => {
                setActiveChat(chat); // Setze den aktuellen Chat
                setView("chat"); // Wechsel zur Chat-Ansicht
              }}
            />
          )}

          {/* Chat-Seite */}
          {view === "chat" && (
            <Chat
              activeChat={activeChat} // Infos zum aktiven Chat
              currentUser={user} // Aktuell eingeloggter Benutzer
              setView={setView} // Zurück zur Detail-Seite wechseln
            />
          )}
        </>
      ) : (
        <p>Bitte logge dich ein, um die App zu verwenden.</p>
      )}
    </div>
  );
}

export default App;
