# PetriMarkt - Online-Marktplatz für Fischereiartikel

Ein moderner Online-Marktplatz für gebrauchte, selbstgemachte und neue Fischereiartikel in der Schweiz.

## Features

- **Authentifizierung**: Email/Passwort basierte Anmeldung mit Firebase Auth
- **Benutzerprofile**: Standard-Kanton Auswahl für schnelleres Erstellen von Inseraten
- **Inserate**: Erstellen, Ansehen und Suchen von Inseraten
  - Bis zu 3 Bilder pro Inserat
  - Kategorien: Ruten, Rollen, Köder, Zubehör, Bekleidung, Boote, Sonstiges
  - Zustand: Neu, Gebraucht, Defekt
  - Standort nach Schweizer Kantonen
- **Suche & Filter**: Volltextsuche mit Filterung nach Kategorie und Kanton
- **In-App Chat**: Echtzeit-Messaging zwischen Käufer und Verkäufer
- **Responsive Design**: Mobile-First Design mit Blau/Braun Farbschema (Wasser & Natur)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui inspirierte Komponenten
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Firebase Konfiguration

Die Firebase-Konfiguration ist bereits in `/lib/firebase.ts` eingerichtet mit den folgenden Diensten:

- **Firestore**: Datenbank für Benutzer, Inserate, Chats und Nachrichten
- **Authentication**: Email/Passwort Authentifizierung
- **Storage**: Bild-Upload für Inserate

### Firestore Collections

```
users: { 
  uid: string
  email: string
  defaultCanton: Canton
  createdAt: Timestamp 
}

listings: { 
  id: string
  sellerId: string
  title: string
  description: string
  price: number
  condition: 'Neu' | 'Gebraucht' | 'Defekt'
  category: 'Ruten' | 'Rollen' | 'Köder' | 'Zubehör' | 'Bekleidung' | 'Boote' | 'Sonstiges'
  canton: Canton (Swiss cantons)
  imageUrls: string[]
  createdAt: Timestamp 
}

chats: { 
  id: string
  participants: [uid1, uid2]
  listingId: string
  lastMessageAt: Timestamp
  lastMessage: string
}

messages: { 
  id: string
  chatId: string
  senderId: string
  text: string
  createdAt: Timestamp 
}
```

### Firestore Security Rules

Fügen Sie diese Regeln in Firebase Console hinzu:

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
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.sellerId;
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid in resource.data.participants;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Installation & Setup

1. **Dependencies installieren**:
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

3. **Öffnen Sie den Browser**:
   ```
   http://localhost:3000
   ```

## Projektstruktur

```
/app
  /chat                 # Chat-Übersicht und einzelne Chats
  /listings            
    /create            # Inserat erstellen
    /[id]              # Inserat Details
  /profile             # Benutzerprofil
  globals.css          # Globale Styles mit Farbschema
  layout.tsx           # Root Layout mit AuthProvider
  page.tsx             # Landing Page mit Suche

/components
  /ui                  # Wiederverwendbare UI-Komponenten
  AuthDialog.tsx       # Login/Registrierung Dialog
  Header.tsx           # Navigation Header
  ListingCard.tsx      # Inserat Karte für Listen

/contexts
  AuthContext.tsx      # Authentifizierungs Context

/lib
  constants.ts         # Konstanten (Kantone, Kategorien, etc.)
  firebase.ts          # Firebase Konfiguration
  types.ts             # TypeScript Typen
  utils.ts             # Hilfsfunktionen
```

## Wichtige Seiten

1. **Landing Page** (`/`): 
   - Suchleiste
   - Kategorie-Buttons
   - Neueste Inserate

2. **Inserat erstellen** (`/listings/create`):
   - Nur für angemeldete Benutzer
   - Formular mit Bild-Upload (max. 3)
   - Standard-Kanton aus Profil

3. **Inserat Details** (`/listings/[id]`):
   - Bildergalerie
   - Vollständige Beschreibung
   - "Verkäufer kontaktieren" Button

4. **Chat Interface** (`/chat`, `/chat/[id]`):
   - Echtzeit-Nachrichten
   - Chat-Übersicht
   - Referenz zum Inserat

5. **Profil** (`/profile`):
   - Standard-Kanton ändern
   - E-Mail anzeigen

## Deployment auf Vercel

1. Repository auf GitHub pushen
2. Mit Vercel verbinden
3. Environment Variables sind nicht nötig, da Firebase Config direkt im Code ist
4. Deployen

## Design

- **Farbschema**: 
  - Primär: Gedecktes Blau (Wasser) - `hsl(203 87% 45%)`
  - Sekundär: Braun/Beige (Natur) - `hsl(30 25% 65%)`
- **Typography**: Inter Font
- **Layout**: Clean, viel Weißraum, mobile-first responsive

## Nächste Schritte

- Firebase Authentifizierung in der Console aktivieren
- Firestore Datenbank erstellen
- Storage aktivieren
- Security Rules hinzufügen
- Eigenes Logo/Favicon hinzufügen
- Analytics konfigurieren (optional)

## Lizenz

Privates Projekt
