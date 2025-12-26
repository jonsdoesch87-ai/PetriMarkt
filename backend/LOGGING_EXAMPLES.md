# Backend Logging - Beispielverwendung

Dieses Dokument zeigt praktische Beispiele für die Verwendung des Logging-Systems.

## Setup abgeschlossen ✓

Das Backend-Logging-System ist nun vollständig implementiert und einsatzbereit.

## Beispiel 1: Basis-Logging in einer Route

```typescript
import logger from '../utils/logger.js';

router.post('/api/beispiel', async (req, res) => {
  logger.info('Neue Anfrage erhalten', { 
    userId: req.user?.userId,
    endpoint: '/api/beispiel' 
  });

  try {
    // Ihre Logik hier
    const result = await processData();
    
    logger.info('Verarbeitung erfolgreich', { 
      resultId: result.id 
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Fehler bei der Verarbeitung', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });
    
    res.status(500).json({ message: 'Serverfehler' });
  }
});
```

## Beispiel 2: Socket.IO Events loggen

```typescript
socket.on('custom-event', async (data) => {
  logger.info('Custom event empfangen', {
    userId,
    eventData: data
  });
  
  try {
    // Event-Logik
    await handleEvent(data);
    
    logger.debug('Event erfolgreich verarbeitet', {
      userId,
      eventType: data.type
    });
  } catch (error) {
    logger.error('Event-Fehler', {
      error: error.message,
      userId,
      eventType: data.type
    });
  }
});
```

## Beispiel 3: Performance-Logging

```typescript
router.get('/api/slow-operation', async (req, res) => {
  const startTime = Date.now();
  
  logger.info('Starte langsame Operation', { userId: req.user?.userId });
  
  try {
    const result = await slowDatabaseQuery();
    
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      logger.warn('Langsame Query erkannt', {
        duration: `${duration}ms`,
        query: 'slowDatabaseQuery'
      });
    }
    
    logger.info('Operation abgeschlossen', {
      duration: `${duration}ms`
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Fehler bei langsamer Operation', {
      error: error.message,
      duration: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ message: 'Fehler' });
  }
});
```

## Log-Dateien anzeigen

```bash
# Alle Logs anzeigen
cat backend/logs/combined.log

# Nur Fehler anzeigen
cat backend/logs/error.log

# Live-Logs verfolgen
tail -f backend/logs/combined.log

# Letzte 50 Zeilen
tail -n 50 backend/logs/combined.log

# Nach bestimmtem Text suchen
grep "Fehler" backend/logs/combined.log
```

## Log-Levels verwenden

```bash
# Development (alle Logs)
LOG_LEVEL=debug npm run dev

# Production (nur wichtige Logs)
LOG_LEVEL=warn npm start

# Standard (info und höher)
npm run dev
```

## Vorteile des Systems

✅ **Strukturierte Logs**: JSON-Format ermöglicht einfaches Parsing
✅ **Persistente Speicherung**: Logs werden in Dateien gespeichert
✅ **Automatische Rotation**: Verhindert zu große Log-Dateien
✅ **Request-Tracking**: Alle HTTP-Anfragen werden automatisch geloggt
✅ **Fehler-Tracking**: Stack-Traces werden automatisch erfasst
✅ **Development-Friendly**: Farbcodierte Konsolen-Ausgabe
✅ **Production-Ready**: Keine Konsolen-Ausgabe in Produktion

## Weitere Informationen

Siehe [LOGGING.md](./LOGGING.md) für detaillierte Dokumentation.
