# PetriMarkt - Projekt Übersicht

## ✅ Implementierter Funktionsumfang

### Authentifizierung & Benutzer
- [x] Email/Passwort Registrierung und Login via Firebase Auth
- [x] User-Profil mit Standard-Kanton Speicherung
- [x] Besucher können alle Inserate sehen (ohne Login)
- [x] Geschützte Bereiche für eingeloggte User

### Inserate
- [x] Inserat erstellen mit allen Pflichtfeldern
- [x] Bild-Upload (max. 3 Bilder) zu Firebase Storage
- [x] Kategorien: Ruten, Rollen, Köder, Zubehör, Bekleidung, Boote, Sonstiges
- [x] Zustand: Neu, Gebraucht, Defekt
- [x] Kanton-Auswahl mit automatischer Vorauswahl
- [x] Detailansicht mit Bildergalerie
- [x] Responsive Kartenansicht

### Suche & Filter
- [x] Volltextsuche nach Titel und Beschreibung
- [x] Filter nach Kategorie
- [x] Filter nach Kanton
- [x] Neueste Inserate auf der Startseite

### Messaging System
- [x] In-App Chat zwischen Käufer und Verkäufer
- [x] Echtzeit-Messaging via Firestore Listeners
- [x] Chat-Übersicht mit allen laufenden Unterhaltungen
- [x] "Verkäufer kontaktieren" Button auf Inserat-Details
- [x] Automatische Chat-Erstellung oder Navigation zu bestehendem Chat

### Design
- [x] Farbschema: Blau (Wasser) und Braun (Natur)
- [x] Mobile-First responsive Design
- [x] Lucide-React Icons
- [x] Clean, modernes Layout mit viel Weißraum
- [x] Shadcn/ui inspirierte Komponenten

## 📁 Projektstruktur

```
/PetriMarkt
├── app/
│   ├── chat/                      # Chat-System
│   │   ├── [id]/page.tsx         # Einzelner Chat
│   │   └── page.tsx              # Chat-Übersicht
│   ├── listings/
│   │   ├── [id]/page.tsx         # Inserat-Details
│   │   └── create/page.tsx       # Inserat erstellen
│   ├── profile/page.tsx          # Benutzerprofil
│   ├── layout.tsx                # Root Layout
│   ├── page.tsx                  # Landing Page
│   └── globals.css               # Globale Styles
├── components/
│   ├── ui/                       # Wiederverwendbare UI-Komponenten
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── AuthDialog.tsx            # Login/Registrierung Dialog
│   ├── Header.tsx                # Navigation
│   └── ListingCard.tsx           # Inserat-Karte
├── contexts/
│   └── AuthContext.tsx           # Authentifizierungs-Context
├── lib/
│   ├── constants.ts              # Kantone, Kategorien, Zustände
│   ├── firebase.ts               # Firebase Konfiguration
│   ├── types.ts                  # TypeScript Typen
│   └── utils.ts                  # Hilfsfunktionen
├── FIREBASE_SETUP.md             # Firebase Setup Anleitung
├── README.md                     # Projekt Dokumentation
└── package.json                  # Dependencies
```

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Entwicklung
```bash
npm run dev
```
Öffnen: http://localhost:3000

### Build
```bash
npm run build
```

### Production Start
```bash
npm start
```

## 🔥 Firebase Konfiguration

Die Firebase-Konfiguration ist bereits eingerichtet in `lib/firebase.ts`. 

**Wichtige nächste Schritte:**
1. Firebase Console öffnen: https://console.firebase.google.com/
2. Projekt "petrimarkt" auswählen
3. Firestore Database aktivieren (siehe FIREBASE_SETUP.md)
4. Authentication aktivieren (Email/Password)
5. Storage aktivieren
6. Security Rules hinzufügen (siehe FIREBASE_SETUP.md)

Detaillierte Anleitung: Siehe **FIREBASE_SETUP.md**

## 📦 Verwendete Technologien

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom (Shadcn/ui inspiriert)
- **Icons**: Lucide React
- **Backend**: Firebase
  - Firestore (Database)
  - Authentication
  - Storage (Bilder)
- **Deployment**: Vercel (empfohlen)

## 🎨 Design System

### Farben
- **Primary**: `hsl(203 87% 45%)` - Gedecktes Blau (Wasser)
- **Secondary**: `hsl(30 25% 65%)` - Braun/Beige (Natur)
- **Background**: `hsl(0 0% 100%)` - Weiß
- **Muted**: `hsl(210 40% 96%)` - Hellgrau

### Typography
- System Fonts (Fallback für lokale Entwicklung ohne Internet)
- Sans-serif Font Stack

### Breakpoints (Tailwind Standard)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 📱 Seiten Übersicht

### 1. Landing Page (`/`)
- Hero mit Suchleiste
- Kategorie-Buttons
- Neueste Inserate in Grid-Layout
- Für alle Besucher zugänglich

### 2. Inserat erstellen (`/listings/create`)
- Nur für eingeloggte Benutzer
- Formular mit Validierung
- Bild-Upload mit Vorschau
- Standard-Kanton aus Profil

### 3. Inserat Details (`/listings/[id]`)
- Bildergalerie mit Thumbnail-Navigation
- Vollständige Beschreibung
- "Verkäufer kontaktieren" Button
- Standort und Kategorie Informationen

### 4. Chat Übersicht (`/chat`)
- Liste aller laufenden Unterhaltungen
- Letzte Nachricht Vorschau
- Referenz zum Inserat
- Sortiert nach Aktualität

### 5. Chat Interface (`/chat/[id]`)
- Echtzeit-Nachrichten
- Scroll zu neuesten Nachrichten
- Link zum Inserat
- Senden/Empfangen von Nachrichten

### 6. Profil (`/profile`)
- E-Mail Anzeige
- Standard-Kanton Bearbeitung
- Nur für eingeloggte Benutzer

## 🔐 Sicherheit

### Firebase Security Rules
- **Firestore**: Benutzer können nur eigene Daten ändern
- **Storage**: Benutzer können nur eigene Bilder hochladen (max 5MB)
- **Authentication**: Email/Passwort mit Firebase Validierung

### Best Practices
- Keine sensiblen Daten im Frontend
- Server-side Timestamps für Konsistenz
- Input Validierung auf Client und Server

## 🚢 Deployment

### Vercel (Empfohlen)
1. GitHub Repository verbinden
2. Vercel erkennt automatisch Next.js
3. Klicken auf "Deploy"
4. Fertig!

Keine Environment Variables nötig - Firebase Config ist im Code.

### Alternative: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📈 Nächste Schritte (Optional)

- [ ] Benutzer-Bewertungssystem
- [ ] Favoritenliste/Merkliste
- [ ] Email-Benachrichtigungen
- [ ] Erweiterte Suchfilter (Preis-Range)
- [ ] Admin-Panel
- [ ] Statistiken für Verkäufer
- [ ] Share-Funktionalität
- [ ] PWA Support

## 🐛 Bekannte Limitierungen

1. **Bilder**: Maximal 3 Bilder pro Inserat
2. **Suche**: Client-side Filterung (für große Datenmengen Firestore Queries verwenden)
3. **Chat**: Nur Text-Nachrichten (keine Bilder/Dateien)
4. **Benachrichtigungen**: Keine Push-Benachrichtigungen

## 📝 Lizenz

Privates Projekt - Alle Rechte vorbehalten

## 👨‍💻 Support

Bei Fragen oder Problemen:
1. Siehe README.md für Dokumentation
2. Siehe FIREBASE_SETUP.md für Firebase Hilfe
3. Überprüfen Sie die Firebase Console für Fehler
4. Überprüfen Sie Browser Console für Client-Fehler

---

**Viel Erfolg mit PetriMarkt!** 🎣
