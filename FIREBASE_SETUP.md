# Firebase Setup Requirements for PetriMarkt

## Firestore Security Rules

For the /browse page to work properly, Firestore needs to allow anonymous users to read the `inserate` collection. The following rules should be set in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anonymous users to read inserate
    match /inserate/{inseratId} {
      allow read: if true;  // Anyone can read listings
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read their own data and data of inserat owners
    match /users/{userId} {
      allow read: if true;  // Allow reading user profiles (for displaying inserat owners)
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat rules
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.buyerId || 
         request.auth.uid == resource.data.sellerId);
    }
    
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Firebase Authentication Setup

1. Enable **Anonymous Authentication** in Firebase Console:
   - Go to Authentication → Sign-in method
   - Enable "Anonymous" provider
   
2. This allows users to browse without signing up first

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /inserat-images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Network Access

Ensure the following Firebase domains are accessible:
- `firestore.googleapis.com`
- `identitytoolkit.googleapis.com`
- `firebaseinstallations.googleapis.com`
- `*.firebasestorage.app`

## Testing the Connection

After setting up the rules, test by:
1. Opening the app in an incognito window
2. Navigating to `/browse`
3. Checking that inserate load without errors

## Troubleshooting

If you see "Verbindungsfehler" (Connection Error) on the /browse page:

1. **Check Firestore Rules**: Ensure anonymous users can read the `inserate` and `users` collections
2. **Enable Anonymous Auth**: Make sure Anonymous authentication is enabled in Firebase Console
3. **Network Issues**: Verify Firebase domains are not blocked by firewall/proxy
4. **Browser Console**: Check for specific Firebase error codes in the console

Common error codes:
- `permission-denied`: Firestore rules are too restrictive
- `unavailable`: Firebase service is unreachable (network/firewall issue)
- `auth/network-request-failed`: Cannot reach Firebase Auth servers
