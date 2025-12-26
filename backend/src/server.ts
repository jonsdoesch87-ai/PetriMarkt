import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import inseratRoutes from './routes/inserate.js';
import chatRoutes from './routes/chat.js';
import { setupSocketIO } from './socket/socketHandler.js';
import logger from './utils/logger.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inserate', inseratRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io Setup
setupSocketIO(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server läuft' });
});

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server läuft auf Port ${PORT}`);
});

