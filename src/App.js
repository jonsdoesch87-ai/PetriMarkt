import React, { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig"; // Importiere die Firebase Konfiguration
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

function App() {
  // Lokales State-Management für Benutzerinformationen
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Funktion zur anonymen Anmeldung
    const signIn = async () => {
      try {
        await signInAnonymously(auth); // Melde den Benutzer anonym an
        console.log("Anonymer Benutzer erfolgreich angemeldet");
      } catch (error) {
        console.error("Fehler bei der anonymen Anmeldung:", error);
      }
    };

    // Den Anmeldeprozess starten
    signIn();

    // Den Anmeldestatus überwachen
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Benutzer erfolgreich authentifiziert:", currentUser);
        setUser(currentUser); // Setze die Benutzerinformationen (UID, etc.)
      } else {
        console.log("Kein Benutzer eingeloggt");
        setUser(null);
      }
      setIsAuthLoading(false); // Ladezustand beenden
    });

    // Cleanup (die Verbindung zur Firebase-Überwachung trennen)
    return () => unsubscribe();
  }, []);

  // Ladezustand anzeigen, bis Firebase fertig geladen ist
  if (isAuthLoading) {
    return <p>Lade Authentifizierung...</p>;
  }

  return (
    <div>
      <h1>PetriMarkt App</h1>
      <p>Ist Firebase erfolgreich konfiguriert?</p>
      {user ? (
        <div>
          <h2>Herzlich willkommen!</h2>
          <p>Du bist anonym eingeloggt.</p>
          <p>Deine UID: <strong>{user.uid}</strong></p>
        </div>
      ) : (
        <div>
          <p>Du bist nicht angemeldet.</p>
        </div>
      )}
    </div>
  );
}

export default App;
