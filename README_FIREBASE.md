# Firebase Konfiguration

## Environment Variables

Erstellen Sie eine `.env.local` Datei im Root-Verzeichnis mit folgenden Variablen:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-your_measurement_id
```

**Hinweis:** Alle `NEXT_PUBLIC_*` Variablen sind öffentlich und werden im Client-Bundle eingebunden. Sie sind sicher zu verwenden, da Firebase Security Rules den Zugriff kontrollieren.

## Google Analytics (DSGVO/nDSG-konform)

Die Analytics-Erfassung ist standardmäßig **deaktiviert** und wird nur aktiviert, wenn der Nutzer explizit zustimmt.

### Analytics aktivieren (nach Nutzer-Zustimmung)

```typescript
import { acceptAnalytics } from '@/lib/analytics';

// Wenn Nutzer Analytics akzeptiert
await acceptAnalytics();
```

### Analytics deaktivieren

```typescript
import { rejectAnalytics } from '@/lib/analytics';

// Wenn Nutzer Analytics ablehnt
await rejectAnalytics();
```

### Events tracken

```typescript
import { trackEvent, trackPageView } from '@/lib/analytics';

// Custom Event
await trackEvent('listing_viewed', { listingId: '123' });

// Page View
await trackPageView('/listings/123');
```

## Server-Side Rendering (SSR)

Firebase wird nur clientseitig initialisiert, um Hydration-Fehler zu vermeiden. Die Hilfsfunktion `isServer()` prüft, ob Code auf dem Server läuft:

```typescript
import { isServer } from '@/lib/firebase';

if (isServer()) {
  // Server-only code
} else {
  // Client-only code
}
```

## Sicherheit

- Firebase Security Rules kontrollieren den Datenbankzugriff
- API Keys sind öffentlich, aber durch Firebase Security Rules geschützt
- Analytics sammelt keine personenbezogenen Daten ohne Zustimmung
- IP-Adressen werden standardmäßig anonymisiert (GA4 Standard)


