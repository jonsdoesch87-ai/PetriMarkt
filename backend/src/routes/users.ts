import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { z } from 'zod';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  profileImage: z.string().optional(),
});

// Profil aktualisieren
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = updateUserSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        location: true,
        profileImage: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Ungültige Eingabedaten', errors: error.errors });
    }
    logger.error('Profil-Update-Fehler:', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Profils' });
  }
});

export default router;


