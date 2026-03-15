# Firestore Rules For MewBattle

If you see `FirebaseError: Missing or insufficient permissions`, your Firestore security rules are blocking the client.

Use these development-friendly rules while building the app:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    match /cards/{cardId} {
      allow read: if true;
      allow write: if false;
    }

    match /user_profiles/{userId} {
      allow read, create, update, delete: if isOwner(userId);
    }

    match /user_cards/{docId} {
      allow read, create, update, delete: if isOwner(request.resource.data.userId)
        || isOwner(resource.data.userId);
    }

    match /decks/{deckId} {
      allow read, create, update, delete: if isOwner(request.resource.data.userId)
        || isOwner(resource.data.userId);
    }

    match /battles/{battleId} {
      allow create: if isOwner(request.resource.data.player1Id);
      allow read: if isSignedIn();
      allow update, delete: if false;
    }

    match /games/{gameId} {
      allow read, create, update, delete: if isOwner(request.resource.data.userId)
        || isOwner(resource.data.userId);
    }
  }
}
```

Notes:

- In production, tighten `battles` read access and validate payload fields more strictly.
- If `cards` is empty, the app now falls back to local starter cards, so writes to `/cards` are not required on client.
- `user_profiles` is required for coins/balance/win-streak economy.
