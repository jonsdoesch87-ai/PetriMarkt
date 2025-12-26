import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { z } from 'zod';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

const createInseratSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string(),
  condition: z.enum(['Neu', 'Gebraucht', 'Selbst gebastelt']),
  images: z.array(z.string()).default([]),
  location: z.string().min(1),
  zipCode: z.string().optional(),
});

// Alle Inserate abrufen (mit Filter)
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;

    const where: any = {};
    
    if (category) {
      where.category = category as string;
    }
    
    if (status) {
      where.status = status as string;
    } else {
      where.status = 'Aktiv'; // Nur aktive Inserate standardmäßig
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const inserate = await prisma.inserat.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            location: true,
            profileImage: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(inserate);
  } catch (error) {
    logger.error('Fehler beim Laden der Inserate:', { error: (error as Error).message });
    res.status(500).json({ message: 'Fehler beim Laden der Inserate' });
  }
});

// Einzelnes Inserat abrufen
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const inserat = await prisma.inserat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            location: true,
            profileImage: true,
            createdAt: true,
          },
        },
      },
    });

    if (!inserat) {
      return res.status(404).json({ message: 'Inserat nicht gefunden' });
    }

    res.json(inserat);
  } catch (error) {
    logger.error('Fehler beim Laden des Inserats:', { error: (error as Error).message });
    res.status(500).json({ message: 'Fehler beim Laden des Inserats' });
  }
});

// Neues Inserat erstellen
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = createInseratSchema.parse(req.body);

    const inserat = await prisma.inserat.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            location: true,
            profileImage: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(201).json(inserat);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Ungültige Eingabedaten', errors: error.errors });
    }
    logger.error('Fehler beim Erstellen des Inserats:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Fehler beim Erstellen des Inserats' });
  }
});

// Inserat aktualisieren
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data = createInseratSchema.partial().parse(req.body);

    // Prüfen ob Inserat dem User gehört
    const inserat = await prisma.inserat.findUnique({
      where: { id },
    });

    if (!inserat) {
      return res.status(404).json({ message: 'Inserat nicht gefunden' });
    }

    if (inserat.userId !== userId) {
      return res.status(403).json({ message: 'Nicht berechtigt' });
    }

    const updatedInserat = await prisma.inserat.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            location: true,
            profileImage: true,
            createdAt: true,
          },
        },
      },
    });

    res.json(updatedInserat);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Ungültige Eingabedaten', errors: error.errors });
    }
    logger.error('Fehler beim Aktualisieren des Inserats:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Inserats' });
  }
});

// Inserat löschen
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Prüfen ob Inserat dem User gehört
    const inserat = await prisma.inserat.findUnique({
      where: { id },
    });

    if (!inserat) {
      return res.status(404).json({ message: 'Inserat nicht gefunden' });
    }

    if (inserat.userId !== userId) {
      return res.status(403).json({ message: 'Nicht berechtigt' });
    }

    await prisma.inserat.delete({
      where: { id },
    });

    res.json({ message: 'Inserat gelöscht' });
  } catch (error) {
    logger.error('Fehler beim Löschen des Inserats:', { error: (error as Error).message });
    res.status(500).json({ message: 'Fehler beim Löschen des Inserats' });
  }
});

// Eigene Inserate abrufen
router.get('/my', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const inserate = await prisma.inserat.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            location: true,
            profileImage: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(inserate);
  } catch (error) {
    logger.error('Fehler beim Laden der eigenen Inserate:', { error: (error as Error).message });
    res.status(500).json({ message: 'Fehler beim Laden der Inserate' });
  }
});

export default router;


