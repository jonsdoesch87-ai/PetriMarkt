# PetriMarkt - Vercel Deployment Guide

This guide explains how to deploy the PetriMarkt application to Vercel.

## TL;DR - Quick Deploy

**For Frontend Only (without real-time chat):**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Click Deploy (all settings are pre-configured in `vercel.json`)
4. Done! Your app will be live at `https://your-app.vercel.app`

**For Full App (with real-time chat):**
1. Deploy frontend to Vercel (steps above)
2. Deploy backend to [Railway](https://railway.app) or [Render](https://render.com)
3. Add `VITE_BACKEND_URL` environment variable in Vercel pointing to your backend
4. Redeploy frontend

## Architecture Overview

PetriMarkt is a full-stack application with:
- **Frontend**: React + Vite + TypeScript (deployed on Vercel)
- **Backend**: Express + Node.js (for Socket.io real-time chat)
- **Database**: Firebase Firestore (for data storage)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage (for images)

## Important Notes

⚠️ **Socket.io Limitation**: This app uses Socket.io for real-time chat, which requires persistent WebSocket connections. Vercel's serverless functions are stateless and short-lived, making them unsuitable for Socket.io.

**Recommended Solution**: Deploy the backend separately on a platform that supports long-running processes like:
- Railway
- Render
- Fly.io
- Heroku
- AWS EC2
- DigitalOcean App Platform

## Deployment Steps

### 1. Deploy Frontend to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to your project root:
```bash
cd /path/to/PetriMarkt
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Choose your account
   - Link to existing project? **No**
   - What's your project's name? **petrimarkt** (or your preferred name)
   - In which directory is your code located? **.**
   - Want to override the settings? **No**

#### Option B: Using Vercel Dashboard (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click **"Add New Project"**

4. Import your repository

5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`

6. Add Environment Variables (see below)

7. Click **Deploy**

### 2. Configure Environment Variables

In your Vercel project settings, add the following environment variables:

#### Required Variables:
- None required for frontend (Firebase config is already in the code)

#### Optional Variables (if you deploy backend):
- `VITE_BACKEND_URL`: URL of your backend server (e.g., `https://your-backend.railway.app`)

### 3. Deploy Backend (Separate Platform)

Since Socket.io requires persistent connections, deploy the backend to a platform that supports long-running processes:

#### Example: Deploying to Railway

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Select the **backend** directory
5. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (Railway provides this)
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://petrimarkt.vercel.app`)
   - `PORT`: 5000 (or Railway's default)
   - `JWT_SECRET`: A secure random string
6. Deploy

#### Environment Variables for Backend:
```env
DATABASE_URL=postgresql://user:password@host:port/database
FRONTEND_URL=https://your-frontend.vercel.app
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### 4. Update Frontend Environment Variables

After deploying the backend, update your Vercel environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `VITE_BACKEND_URL`: Your backend URL (e.g., `https://petrimarkt-backend.railway.app`)
4. Redeploy your frontend

### 5. Database Setup

#### Firebase/Firestore (Already Configured)
The app is already configured to use Firebase:
- Authentication: Firebase Auth
- Database: Firestore
- Storage: Firebase Storage

No additional setup needed - the configuration is in `frontend/src/firebase/config.ts`

#### PostgreSQL (If using Prisma backend)
If you're using the Prisma/PostgreSQL backend:

1. Set up a PostgreSQL database (Railway, Supabase, Neon, etc.)
2. Add `DATABASE_URL` to your backend environment variables
3. Run migrations:
```bash
cd backend
npm run prisma:migrate
```

## Project Structure

```
PetriMarkt/
├── frontend/           # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vercel.json
├── backend/            # Express backend (Socket.io)
│   ├── src/
│   ├── prisma/
│   └── package.json
├── vercel.json         # Root Vercel configuration
└── README.md           # This file
```

## Testing Your Deployment

1. After deployment, visit your Vercel URL
2. Test authentication (register/login)
3. Test creating listings
4. Test real-time chat (if backend is deployed)

## Troubleshooting

### Issue: TypeScript build errors
**Solution**: The repository has some pre-existing TypeScript errors. The `build:vercel` script bypasses type checking for deployment. To fix type errors permanently, run `npm run build` locally and address the TypeScript errors shown.

### Issue: Chat not working
**Solution**: Make sure your backend is deployed separately and `VITE_BACKEND_URL` is set correctly in Vercel.

### Issue: Build fails
**Solution**: Check that all dependencies are in `package.json` and not just in `node_modules`.

### Issue: Firebase errors
**Solution**: Verify Firebase configuration in `frontend/src/firebase/config.ts` matches your Firebase project.

### Issue: CORS errors
**Solution**: Ensure `FRONTEND_URL` in backend env variables matches your Vercel URL.

## Alternative: Frontend-Only Deployment

If you don't need real-time chat (Socket.io), you can deploy just the frontend to Vercel:

1. The app will work with Firebase for all features except real-time chat
2. You can implement chat using Firebase Realtime Database or Firestore real-time listeners instead of Socket.io
3. Remove Socket.io code from `frontend/src/utils/socket.ts`

## Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render/etc (if using Socket.io)
- [ ] Environment variables configured
- [ ] Database migrations run (if using Prisma)
- [ ] Firebase project configured
- [ ] Domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test all features in production

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Check Firebase documentation: https://firebase.google.com/docs
- Check Railway documentation: https://docs.railway.app (if using Railway)

## License

[Your License Here]
