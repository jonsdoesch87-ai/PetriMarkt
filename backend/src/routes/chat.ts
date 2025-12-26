import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { z } from 'zod';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

const sendMessageSchema = z.object({
  inseratId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1),
});

// Nachrichten für ein Inserat abrufen
router.get('/inserat/:inseratId', authenticate, async (req, res) => {
  try {
    const { inseratId } = req.params;
    const userId = req.user!.userId;

    // Prüfen ob User am Chat beteiligt ist
    const inserat = await prisma.inserat.findUnique({
      where: { id: inseratId },
      include: {
        user: true,
      },
    });

    if (!inserat) {
      return res.status(404).json({ message: 'Inserat nicht gefunden' });
    }

    // User muss entweder Verkäufer oder Käufer sein
    const isSeller = inserat.userId === userId;
    
    // Wenn User der Verkäufer ist, finde den Käufer aus den Nachrichten
    let otherUserId: string | null = null;
    if (isSeller) {
      const firstMessage = await prisma.message.findFirst({
        where: {
          inseratId,
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
      if (firstMessage) {
        otherUserId = firstMessage.senderId === userId 
          ? firstMessage.receiverId 
          : firstMessage.senderId;
      }
    }
    
    const messages = await prisma.message.findMany({
      where: {
        inseratId,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Nachrichten als gelesen markieren
    await prisma.message.updateMany({
      where: {
        inseratId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({
      messages,
      inserat: {
        id: inserat.id,
        title: inserat.title,
        seller: inserat.user,
      },
      isSeller,
      otherUserId, // Für Verkäufer: ID des Käufers
    });
  } catch (error) {
    logger.error('Fehler beim Laden der Nachrichten:', { error: (error as Error).message });
    res.status(500).json({ message: 'Fehler beim Laden der Nachrichten' });
  }
});

// Alle Chats für einen User abrufen
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Alle eindeutigen Inserate finden, für die der User Nachrichten hat
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        inserat: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Gruppiere nach Inserat
    const conversations = new Map();

    messages.forEach((message) => {
      const inseratId = message.inseratId;
      if (!conversations.has(inseratId)) {
        const otherUser = message.senderId === userId ? message.receiver : message.sender;
        conversations.set(inseratId, {
          inseratId,
          inserat: message.inserat,
          otherUser,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      const conversation = conversations.get(inseratId);
      if (message.receiverId === userId && !message.read) {
        conversation.unreadCount++;
      }
    });

    const conversationsArray = Array.from(conversations.values());

    res.json(conversationsArray);
  } catch (error) {
    logger.error('Fehler beim Laden der Konversationen:', { error: (error as Error).message });
    res.status(500).json({ message: 'Fehler beim Laden der Konversationen' });
  }
});

// Nachricht senden (REST-Fallback, hauptsächlich für Socket.io)
router.post('/message', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = sendMessageSchema.parse(req.body);

    const message = await prisma.message.create({
      data: {
        ...data,
        senderId: userId,
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

    res.status(201).json(message);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Ungültige Eingabedaten', errors: error.errors });
    }
    logger.error('Fehler beim Senden der Nachricht:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Fehler beim Senden der Nachricht' });
  }
});

export default router;

