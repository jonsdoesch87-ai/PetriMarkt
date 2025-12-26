# Wie kann ich einen Backend Log machen?

## ✅ Lösung implementiert!

Das Backend verfügt jetzt über ein professionelles Logging-System mit Winston.

## Was wurde implementiert?

### 1. Logger-Utility (`backend/src/utils/logger.ts`)
- Strukturierte Logs im JSON-Format
- Separate Dateien für Fehler und alle Logs
- Automatische Log-Rotation (max. 5MB pro Datei)
- Farbcodierte Konsolen-Ausgabe für Entwicklung

### 2. Request-Logging-Middleware (`backend/src/middleware/requestLogger.ts`)
- Automatisches Logging aller HTTP-Anfragen
- Erfasst: Methode, URL, Status, Antwortzeit, IP, User-Agent

### 3. Logger überall integriert
- Alle `console.log` und `console.error` wurden durch Winston-Logger ersetzt
- In allen Routes: auth, inserate, chat, users
- Im Socket.IO Handler
- Im Server-Startup

## Wie benutzt man das Logging?

### Logger importieren:
```typescript
import logger from '../utils/logger.js';
```

### Logs schreiben:
```typescript
// Info-Log
logger.info('Benutzer angemeldet', { userId: '123' });

// Warnung
logger.warn('Alte API-Version', { version: '1.0' });

// Fehler mit Stack-Trace
logger.error('Datenbankfehler', { 
  error: error.message, 
  stack: error.stack 
});

// Debug (nur wenn LOG_LEVEL=debug)
logger.debug('Debug-Information', { data: someData });
```

## Log-Dateien finden

Die Logs werden automatisch gespeichert in:
- `backend/logs/combined.log` - Alle Logs
- `backend/logs/error.log` - Nur Fehler

### Logs anzeigen:
```bash
# Alle Logs
cat backend/logs/combined.log

# Nur Fehler
cat backend/logs/error.log

# Live-Logs verfolgen
tail -f backend/logs/combined.log
```

## Konfiguration

### Log-Level ändern:
```bash
# Entwicklung (alle Logs einschließlich Debug)
LOG_LEVEL=debug npm run dev

# Produktion (nur Warnungen und Fehler)
LOG_LEVEL=warn npm start

# Standard (Info, Warnungen und Fehler)
npm run dev
```

## Was wird automatisch geloggt?

✅ **Alle HTTP-Anfragen** mit Details (Methode, URL, Status, Dauer)
✅ **Server-Start** mit Port-Information
✅ **Socket.IO Verbindungen** (Connect/Disconnect)
✅ **Alle Fehler** mit Stack-Traces
✅ **Datenbank-Operationen** (via Prisma)

## Beispiel-Output

### In der Konsole (Entwicklung):
```
2025-12-26 19:13:37 [info]: 🚀 Server läuft auf Port 5000
2025-12-26 19:13:40 [info]: HTTP Request {"method":"GET","url":"/api/health","status":200,"duration":"5ms"}
2025-12-26 19:13:45 [error]: Login-Fehler {"error":"Ungültiges Passwort"}
```

### In der Log-Datei (JSON):
```json
{"level":"info","message":"🚀 Server läuft auf Port 5000","service":"petrimarkt-backend","timestamp":"2025-12-26 19:13:37"}
{"level":"info","message":"HTTP Request","method":"GET","url":"/api/health","status":200,"duration":"5ms","timestamp":"2025-12-26 19:13:40"}
{"level":"error","message":"Login-Fehler","error":"Ungültiges Passwort","timestamp":"2025-12-26 19:13:45"}
```

## Vorteile

✅ Professionelles Logging für Debugging und Monitoring
✅ Persistente Log-Speicherung in Dateien
✅ Automatische Rotation verhindert zu große Dateien
✅ JSON-Format ermöglicht einfaches Parsing und Analyse
✅ Anpassbare Log-Levels für verschiedene Umgebungen
✅ Request-Tracking für Performance-Analyse
✅ Stack-Traces für besseres Debugging

## Weitere Dokumentation

- [LOGGING.md](./LOGGING.md) - Vollständige Dokumentation
- [LOGGING_EXAMPLES.md](./LOGGING_EXAMPLES.md) - Praktische Beispiele

---

**Status**: ✅ Vollständig implementiert und getestet
