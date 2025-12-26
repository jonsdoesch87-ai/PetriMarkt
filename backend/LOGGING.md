# Backend Logging

Dieses Backend verwendet Winston für professionelles Logging.

## Features

- **Strukturierte Logs**: JSON-Format für einfache Verarbeitung und Analyse
- **Log-Level**: `error`, `warn`, `info`, `debug`
- **Dateibasiertes Logging**:
  - `logs/error.log` - Nur Fehler
  - `logs/combined.log` - Alle Log-Einträge
- **Konsolen-Logging**: Farbcodierte Ausgabe in der Entwicklung
- **Automatische Rotation**: Maximale Dateigröße 5MB, bis zu 5 Dateien werden gespeichert
- **Request-Logging**: Automatisches Logging aller HTTP-Anfragen mit:
  - Methode und URL
  - HTTP-Status
  - Antwortzeit
  - IP-Adresse
  - User-Agent

## Verwendung

### Logger importieren
```typescript
import logger from '../utils/logger.js';
```

### Logging-Beispiele

```typescript
// Info-Log
logger.info('Server gestartet', { port: 5000 });

// Warning-Log
logger.warn('Alte API-Version wird verwendet', { version: '1.0' });

// Error-Log mit Stack-Trace
logger.error('Datenbankfehler', { 
  error: error.message, 
  stack: error.stack 
});

// Debug-Log
logger.debug('Benutzer-Daten geladen', { userId: '123' });
```

## Konfiguration

Die Log-Level können über die Umgebungsvariable `LOG_LEVEL` angepasst werden:

```bash
LOG_LEVEL=debug npm run dev
```

Verfügbare Log-Level (von höchster zu niedrigster Priorität):
- `error` - Nur Fehler
- `warn` - Warnungen und Fehler
- `info` - Informationen, Warnungen und Fehler (Standard)
- `debug` - Alle Logs

## Produktionsumgebung

In der Produktion (`NODE_ENV=production`) werden Logs nur in Dateien geschrieben, nicht in der Konsole angezeigt.

## Log-Dateien

Die Log-Dateien befinden sich im Verzeichnis `backend/logs/` und werden automatisch rotiert, wenn sie 5MB erreichen. Es werden maximal 5 alte Dateien aufbewahrt.

**Hinweis**: Log-Dateien sind in `.gitignore` enthalten und werden nicht ins Repository committed.
