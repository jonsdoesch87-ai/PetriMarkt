import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketIO = (io: Server) => {
  // Authentifizierungs-Middleware für Socket.io
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentifizierung fehlgeschlagen'));
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET ist nicht gesetzt');
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentifizierung fehlgeschlagen'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`User ${userId} verbunden`);

    // User zu einem Raum hinzufügen (für Chat pro Inserat)
    socket.on('join-chat', async (inseratId: string) => {
      socket.join(`inserat-${inseratId}`);
      console.log(`User ${userId} ist Chat für Inserat ${inseratId} beigetreten`);
    });

    // Nachricht senden
    socket.on('send-message', async (data: {
      inseratId: string;
      receiverId: string;
      content: string;
    }) => {
      try {
        const { inseratId, receiverId, content } = data;

        // Nachricht in Datenbank speichern
        const message = await prisma.message.create({
          data: {
            content,
            inseratId,
            senderId: userId,
            receiverId,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
              },
            },
            receiver: {
              select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
              },
            },
            inserat: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });

        // Nachricht an beide Teilnehmer senden
        io.to(`inserat-${inseratId}`).emit('new-message', message);

        // Benachrichtigung an Empfänger senden (falls nicht im Chat)
        io.to(`user-${receiverId}`).emit('message-notification', {
          inseratId,
          inseratTitle: message.inserat.title,
          senderName: message.sender.name || message.sender.email,
        });
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        socket.emit('message-error', { message: 'Fehler beim Senden der Nachricht' });
      }
    });

    // User-Raum für Benachrichtigungen
    socket.join(`user-${userId}`);

    // Verbindung trennen
    socket.on('disconnect', () => {
      console.log(`User ${userId} getrennt`);
    });
  });
};


