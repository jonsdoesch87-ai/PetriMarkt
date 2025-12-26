# PetriMarkt

A marketplace application for fishing articles built with React, Firebase, and Node.js.

## Features

- 🔐 User authentication (Firebase Auth)
- 📝 Create and manage listings (Inserate)
- 💬 Real-time chat between users
- 🖼️ Image uploads (Firebase Storage)
- 🔍 Search and filter listings
- 📱 Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)
- Socket.io Client

### Backend
- Node.js
- Express
- Socket.io
- Prisma
- PostgreSQL
- JWT Authentication

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (for backend)
- Firebase project (for frontend)

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd PetriMarkt
```

2. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if needed
npm run dev
```

3. **Setup Backend** (in a new terminal)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel (Frontend Only)

```bash
npm install -g vercel
vercel
```

**Note**: For real-time chat to work in production, you need to deploy the backend separately on a platform that supports WebSocket connections (Railway, Render, Fly.io, etc.). See deployment guide for details.

## Project Structure

```
PetriMarkt/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── firebase/     # Firebase configuration
│   │   ├── store/        # Zustand state management
│   │   └── utils/        # Utility functions
│   └── package.json
├── backend/              # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── socket/       # Socket.io handlers
│   ├── prisma/           # Database schema
│   └── package.json
└── README.md
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Environment Variables

### Frontend (.env.local)
```env
VITE_BACKEND_URL=http://localhost:5000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/petrimarkt
FRONTEND_URL=http://localhost:3000
PORT=5000
JWT_SECRET=your-secret-key
```

See `.env.example` files in each directory for complete reference.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Your License Here]

## Support

For questions or issues, please open an issue in the repository.
