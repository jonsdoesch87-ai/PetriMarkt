# Blog-Artikel-Erstellung Plan

## 1. Datenstruktur (Firestore Collection: `articles`)

### Erweiterte Article-Interface:
```typescript
export interface Article {
  id: string;
  slug: string;                    // Auto-generiert aus Titel (z.B. "mein-artikel-titel")
  title: string;                    // Artikel-Titel
  description?: string;             // Kurze Beschreibung (optional, für Vorschau)
  content: string;                  // Vollständiger Artikel-Text (HTML oder Markdown)
  imageUrls: string[];              // Array von Bild-URLs (1 oder mehrere)
  author: string;                   // Autor-Name (aus userProfile.displayName oder email)
  authorId: string;                 // User ID des Autors
  publishedAt: Timestamp | null;   // Veröffentlichungsdatum (null = Entwurf)
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  status: 'draft' | 'published';   // Entwurf oder veröffentlicht
}
```

## 2. Admin-Interface für Artikel-Erstellung

### Route: `/blog/create` oder `/admin/blog/create`
- **Zugriff:** Nur für Admins (`userProfile.role === 'admin'`)
- **Formular-Felder:**
  1. **Titel** (Pflichtfeld)
  2. **Beschreibung** (optional, für Vorschau)
  3. **Text** (Textarea mit Rich-Text-Editor oder Markdown)
  4. **Bilder** (Upload, 1 oder mehrere, max. 5 Bilder)
  5. **Status** (Dropdown: "Entwurf" oder "Veröffentlichen")

### Funktionen:
- **Slug-Generierung:** Automatisch aus Titel (z.B. "Mein Artikel" → "mein-artikel")
- **Bild-Upload:** Ähnlich wie bei Inseraten (Firebase Storage)
- **Bild-Komprimierung:** Max. 1200px Breite, wie bei Inseraten
- **Vorschau:** Live-Vorschau des Artikels
- **Speichern:** In Firestore Collection `articles`

## 3. Implementierungs-Schritte

### Schritt 1: Article-Type erweitern
- `lib/types.ts` aktualisieren
- `imageUrl` → `imageUrls: string[]` ändern
- `status` und `authorId` Felder hinzufügen

### Schritt 2: Admin-Seite erstellen
- `app/blog/create/page.tsx` erstellen
- Formular mit:
  - Titel-Input
  - Beschreibung-Textarea (optional)
  - Content-Textarea (groß, für langen Text)
  - Bild-Upload (mehrere Bilder)
  - Status-Select (Entwurf/Veröffentlicht)
  - "Artikel speichern" Button

### Schritt 3: Bild-Upload implementieren
- Ähnlich wie bei Inseraten (`app/listings/create/page.tsx`)
- Firebase Storage: `blog/${userId}/${timestamp}_${index}`
- Bild-Komprimierung mit `browser-image-compression`
- Max. 5 Bilder pro Artikel

### Schritt 4: Slug-Generierung
- Funktion: `generateSlug(title: string): string`
- Konvertiert Titel zu URL-freundlichem Slug
- Beispiel: "Mein Artikel 2024!" → "mein-artikel-2024"
- Prüft auf Duplikate in Firestore

### Schritt 5: Blog-Übersichtsseite anpassen
- `app/blog/page.tsx` (umbenennen von `ratgeber`)
- Nur veröffentlichte Artikel anzeigen (`status === 'published'`)
- Sortierung nach `publishedAt` (neueste zuerst)

### Schritt 6: Blog-Detailseite anpassen
- `app/blog/[slug]/page.tsx` (umbenennen von `ratgeber/[slug]`)
- Mehrere Bilder anzeigen (Galerie)
- Artikel-Text rendern

## 4. UI/UX Features

### Artikel-Erstellung:
- **Rich-Text-Editor:** Optional (z.B. mit `react-quill` oder einfaches Textarea)
- **Bild-Vorschau:** Thumbnails der hochgeladenen Bilder
- **Bild-Reihenfolge:** Drag & Drop zum Sortieren (optional)
- **Auto-Save:** Entwürfe automatisch speichern (optional)

### Artikel-Anzeige:
- **Hero-Bild:** Erstes Bild groß oben
- **Bildergalerie:** Weitere Bilder in Grid oder Slider
- **Text-Formatierung:** HTML rendern mit Tailwind Prose
- **Autor-Info:** Name und Datum anzeigen

## 5. Sicherheit & Validierung

### Firestore Security Rules:
```javascript
match /articles/{articleId} {
  allow read: if true;  // Alle können lesen
  allow create: if request.auth != null && request.auth.token.role == 'admin';
  allow update: if request.auth != null && request.auth.token.role == 'admin';
  allow delete: if request.auth != null && request.auth.token.role == 'admin';
}
```

### Validierung:
- Titel: Min. 10 Zeichen, Max. 200 Zeichen
- Text: Min. 100 Zeichen
- Bilder: Max. 5, Max. 5MB pro Bild
- Slug: Eindeutig in Firestore

## 6. Umbenennung "Ratgeber" → "Blog"

### Dateien umbenennen:
1. `app/ratgeber/page.tsx` → `app/blog/page.tsx`
2. `app/ratgeber/[slug]/page.tsx` → `app/blog/[slug]/page.tsx`
3. `app/ratgeber/[slug]/not-found.tsx` → `app/blog/[slug]/not-found.tsx`

### Text-Änderungen:
- "Ratgeber" → "Blog" in allen Texten
- Links aktualisieren: `/ratgeber` → `/blog`
- Navigation im Header aktualisieren

## 7. Optionale Erweiterungen

### Später hinzufügen:
- **Kategorien:** Artikel in Kategorien einteilen
- **Tags:** Schlagwörter für Artikel
- **Kommentare:** Kommentar-System
- **Teilen:** Social Media Share-Buttons
- **SEO:** Meta-Tags für jeden Artikel
- **Bild-Unterschriften:** Für jedes Bild

## 8. Implementierungs-Reihenfolge

1. ✅ Article-Type erweitern
2. ✅ Admin-Seite erstellen (`/blog/create`)
3. ✅ Bild-Upload implementieren
4. ✅ Slug-Generierung
5. ✅ Umbenennung Ratgeber → Blog
6. ✅ Blog-Übersicht anpassen
7. ✅ Blog-Detailseite anpassen (mehrere Bilder)
8. ✅ Security Rules aktualisieren

## 9. Beispiel-Workflow

1. Admin öffnet `/blog/create`
2. Füllt Formular aus:
   - Titel: "Nachhaltigkeit beim Angeln"
   - Beschreibung: "Warum Second-Hand..."
   - Text: Vollständiger Artikel-Text
   - Lädt 3 Bilder hoch
   - Wählt "Veröffentlichen"
3. System generiert Slug: "nachhaltigkeit-beim-angeln"
4. Bilder werden hochgeladen → URLs gespeichert
5. Artikel wird in Firestore gespeichert
6. Artikel erscheint auf `/blog` Übersichtsseite
7. Artikel ist erreichbar unter `/blog/nachhaltigkeit-beim-angeln`

