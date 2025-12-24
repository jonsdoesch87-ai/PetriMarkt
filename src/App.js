import React, { useEffect, useState } from "react";
import { auth } from "./firebase/firebaseConfig";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const signIn = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Anonymer Benutzer erfolgreich angemeldet");
      } catch (error) {
        console.error("Fehler bei der anonymen Anmeldung:", error);
      }
    };

    signIn();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthLoading) {
    return <p>Lade Authentifizierung...</p>;
  }

  return (
    <div>
      <h1>PetriMarkt</h1>
      {user ? (
        <p>Du bist anonym eingeloggt! UID: {user.uid}</p>
      ) : (
        <p>Du bist nicht eingeloggt.</p>
      )}
    </div>
  );
}

export default App;
