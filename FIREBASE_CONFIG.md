# Firebase Configuration Setup

This document explains how to properly configure Firebase for the PetriMarkt application.

## Initial Setup

### 1. Copy Environment Variables

Copy the example environment file to create your local configuration:

```bash
cd frontend
cp .env.example .env.local
```

### 2. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon ⚙️ and select "Project settings"
4. Scroll down to "Your apps" section
5. Click on the web app (</>) icon
6. Copy the configuration values

### 3. Update Environment Variables

Edit `frontend/.env.local` and replace the placeholder values with your actual Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Configuration Structure

### Environment Variables (Vite)

The application uses Vite's environment variable system. All variables must be prefixed with `VITE_` to be accessible in the client-side code.

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase authentication domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase analytics measurement ID

### Firebase Config File

The Firebase configuration is located in `frontend/src/firebase/config.ts`. This file:
- Imports environment variables
- Initializes Firebase app
- Exports Firebase services (auth, db, storage, analytics)

**Do not hardcode credentials in this file!** Always use environment variables.

## Security Best Practices

### ✅ Do's
- Keep `.env.local` in `.gitignore` (already configured)
- Use environment variables for all sensitive configuration
- Share `.env.example` with the team for documentation
- Set up Firebase Security Rules for production

### ❌ Don'ts
- Never commit `.env.local` or `.env` files to Git
- Never hardcode API keys directly in source code
- Never share your Firebase credentials in public repositories

## Firebase Services Used

The application uses the following Firebase services:

1. **Authentication** (`auth`)
   - Email/Password authentication
   - Anonymous authentication for browsing

2. **Firestore Database** (`db`)
   - Real-time database for inserate, users, messages
   - See `FIREBASE_SETUP.md` for security rules

3. **Storage** (`storage`)
   - Image storage for inserate and profile pictures

4. **Analytics** (`analytics`)
   - Usage analytics and insights

## Deployment

When deploying to production (e.g., Vercel):

1. Add environment variables in your hosting platform's dashboard
2. Use the same variable names with `VITE_` prefix
3. Ensure Firebase Security Rules are properly configured
4. Enable required authentication methods in Firebase Console

## Troubleshooting

### Error: "Firebase configuration is undefined"
- Check that `.env.local` exists in the `frontend` directory
- Verify all required environment variables are set
- Restart the development server after changing `.env.local`

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verify the `VITE_FIREBASE_API_KEY` is correct
- Check for extra spaces or quotes in the `.env.local` file

### Error: "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Verify Firebase services are not blocked by firewall
- See `FIREBASE_SETUP.md` for required domains

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- Project-specific setup: See `FIREBASE_SETUP.md`
