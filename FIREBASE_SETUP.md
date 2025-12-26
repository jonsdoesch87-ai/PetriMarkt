# Firebase Setup Anleitung

Dieses Dokument beschreibt die Schritte zur Einrichtung von Firebase für PetriMarkt.

## 1. Firebase Console Setup

Die Firebase-Konfiguration ist bereits in das Projekt eingebunden (`lib/firebase.ts`). Die Zugangsdaten sind:

```javascript
{
  apiKey: "AIzaSyCf3ieFxjZxQC7T-s4v6aix3u_HiUB9XkI",
  authDomain: "petrimarkt.firebaseapp.com",
  projectId: "petrimarkt",
  storageBucket: "petrimarkt.firebasestorage.app",
  messagingSenderId: "906170983684",
  appId: "1:906170983684:web:c73df454f608762cf61c51",
  measurementId: "G-R1ETFBVMZC"
}
```

## 2. Firestore Database aktivieren

1. Öffnen Sie [Firebase Console](https://console.firebase.google.com/)
2. Wählen Sie das Projekt "petrimarkt"
3. Navigieren Sie zu **Firestore Database**
4. Klicken Sie auf **Datenbank erstellen**
5. Wählen Sie **Im Produktionsmodus starten**
6. Wählen Sie eine Region (z.B. `europe-west6` für Schweiz)

### Firestore Security Rules

Fügen Sie die folgenden Security Rules ein:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listings collection
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.sellerId;
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if request.auth != null 
        && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null 
        && request.auth.uid in resource.data.participants;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### Firestore Indexes

Für bessere Performance erstellen Sie folgende Composite Indexes:

1. **Collection**: `messages`
   - Fields: `chatId` (Ascending), `createdAt` (Ascending)
   
2. **Collection**: `listings`
   - Fields: `createdAt` (Descending)

Diese werden automatisch erstellt, wenn Sie die App zum ersten Mal nutzen und Firebase zeigt Ihnen Links zum Erstellen der Indexes.

## 3. Authentication aktivieren

1. Navigieren Sie zu **Authentication**
2. Klicken Sie auf **Get started**
3. Aktivieren Sie **Email/Password** unter "Native providers"
4. Speichern Sie die Änderungen

## 4. Storage aktivieren

1. Navigieren Sie zu **Storage**
2. Klicken Sie auf **Get started**
3. Wählen Sie **Im Produktionsmodus starten**
4. Wählen Sie die gleiche Region wie bei Firestore

### Storage Security Rules

Fügen Sie die folgenden Storage Rules ein:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Listings images
    match /listings/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024  // Max 5MB
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 5. Firestore Collections erstellen

Die Collections werden automatisch erstellt, wenn die erste Daten geschrieben werden. Hier ist die Struktur:

### users
```javascript
{
  uid: string,           // User ID (gleich wie Auth UID)
  email: string,         // E-Mail Adresse
  defaultCanton: string, // Standard-Kanton (z.B. "ZH")
  createdAt: Timestamp   // Erstellungsdatum
}
```

### listings
```javascript
{
  id: string,              // Document ID (auto-generated)
  sellerId: string,        // User ID des Verkäufers
  title: string,           // Titel des Inserats
  description: string,     // Beschreibung
  price: number,           // Preis in CHF
  condition: string,       // "Neu", "Gebraucht" oder "Defekt"
  category: string,        // Kategorie (z.B. "Ruten")
  canton: string,          // Kanton (z.B. "ZH")
  imageUrls: string[],     // Array von Bild-URLs
  createdAt: Timestamp     // Erstellungsdatum
}
```

### chats
```javascript
{
  id: string,                    // Document ID (auto-generated)
  participants: [string, string], // Array mit 2 User IDs
  listingId: string,             // Referenz zum Inserat
  lastMessageAt: Timestamp,      // Zeitstempel der letzten Nachricht
  lastMessage: string            // Text der letzten Nachricht
}
```

### messages
```javascript
{
  id: string,           // Document ID (auto-generated)
  chatId: string,       // Referenz zum Chat
  senderId: string,     // User ID des Senders
  text: string,         // Nachrichtentext
  createdAt: Timestamp  // Erstellungsdatum
}
```

## 6. Lokale Entwicklung starten

Nach dem Setup von Firebase:

```bash
npm install
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser.

## 7. Deployment auf Vercel

1. Erstellen Sie ein [Vercel Account](https://vercel.com)
2. Verbinden Sie Ihr GitHub Repository
3. Vercel erkennt automatisch das Next.js Projekt
4. Klicken Sie auf **Deploy**

Environment Variables sind nicht nötig, da die Firebase-Konfiguration direkt im Code ist.

## Wichtige Hinweise

### Sicherheit

⚠️ **WICHTIG**: Die Firebase-Konfiguration (API Keys) sind öffentlich sichtbar im Frontend-Code. Das ist normal für Firebase Web Apps. Die Sicherheit wird durch:

1. **Firestore Security Rules**: Kontrollieren Lese-/Schreibzugriff
2. **Authentication**: Nur authentifizierte Benutzer können schreiben
3. **Storage Rules**: Nur eigene Bilder können hochgeladen werden

### Kosten

Firebase bietet einen großzügigen kostenlosen Tier (Spark Plan):

- **Firestore**: 50,000 Dokument Reads/Tag
- **Authentication**: Unbegrenzte Authentifizierungen
- **Storage**: 5 GB Speicher, 1 GB Download/Tag
- **Hosting**: 10 GB/Monat

Für einen MVP ist der kostenlose Plan mehr als ausreichend.

### Monitoring

Überwachen Sie die Nutzung in der Firebase Console unter:
- **Firestore Database** → Usage
- **Authentication** → Usage
- **Storage** → Usage

## Fehlerbehebung

### "Missing or insufficient permissions"
- Überprüfen Sie die Firestore Security Rules
- Stellen Sie sicher, dass der Benutzer angemeldet ist

### "Storage unauthorized"
- Überprüfen Sie die Storage Security Rules
- Stellen Sie sicher, dass die Datei-Größe < 5MB ist
- Stellen Sie sicher, dass es ein Bild ist

### Indexes Fehler
- Firebase zeigt automatisch Links zum Erstellen benötigter Indexes
- Klicken Sie auf den Link und warten Sie 2-3 Minuten

## Support

Bei Problemen mit Firebase:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
