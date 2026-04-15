# Shared Environments Folder

This folder contains **shared Firebase configuration** used by both the admin and user applications.

## Purpose

Instead of duplicating Firebase configuration in each app, we centralize it here:
- **Single source of truth** - Update Firebase config in one place
- **Consistency** - Both apps use the same Firebase project
- **Easy management** - Switch between environments (local, staging, production)

## Files

| File | Purpose | When Used |
|------|---------|-----------|
| `environment.local.ts` | Local development with emulators | Default for `ng serve` |
| `environment.staging.ts` | Staging Firebase project | Testing before production |
| `environment.prod.ts` | Production Firebase project | Production builds |

## How It Works

### Admin App

**Reference in app** - `projects/admin/src/environments/environment.ts`:
```typescript
export { environment } from '../../../environments/environment.local';
```

For production:
```typescript
export { environment } from '../../../environments/environment.prod';
```

Or use Angular's file replacement in `angular.json`:
```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "projects/admin/src/environments/environment.ts",
        "with": "environments/environment.prod.ts"
      }
    ]
  },
  "staging": {
    "fileReplacements": [
      {
        "replace": "projects/admin/src/environments/environment.ts",
        "with": "environments/environment.staging.ts"
      }
    ]
  }
}
```

### User App

Same pattern as admin app - reference the shared environment files.

## Setup Instructions

### 1. Get Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new)
3. Click ⚙️ → Project settings
4. Scroll to "Your apps" → Select web app (or add one)
5. Copy the `firebaseConfig` object

### 2. Update Environment Files

**Staging** - `environments/environment.staging.ts`:
```typescript
export const environment = {
  production: false,
  useEmulators: false,  // Use real Firebase
  firebase: {
    apiKey: "paste-your-staging-api-key",
    authDomain: "your-project-staging.firebaseapp.com",
    projectId: "your-project-staging",
    storageBucket: "your-project-staging.appspot.com",
    messagingSenderId: "your-staging-sender-id",
    appId: "your-staging-app-id"
  }
};
```

**Production** - `environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  useEmulators: false,  // Never use emulators in prod
  firebase: {
    apiKey: "paste-your-production-api-key",
    authDomain: "your-project-prod.firebaseapp.com",
    projectId: "your-project-prod",
    storageBucket: "your-project-prod.appspot.com",
    messagingSenderId: "your-prod-sender-id",
    appId: "your-prod-app-id"
  }
};
```

**Local** - `environments/environment.local.ts`:
The `projectId` must match the Firebase project in `.firebaserc` (`novus-flexy`).
See the [Project ID and Emulators](#project-id-and-emulators) section below for details.

### 3. Link Apps to Environments

**Create environment.ts in each app**:

`projects/admin/src/environments/environment.ts`:
```typescript
// Development (uses emulators)
export { environment } from '../../../environments/environment.local';
```

`projects/user-app/src/environments/environment.ts`:
```typescript
// Development (uses emulators)
export { environment } from '../../../environments/environment.local';
```

### 4. Initialize Firebase in Apps

**Admin app** - `projects/admin/src/app/app.config.ts`:
```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { environment } from '../environments/environment';

// Initialize Firebase
const app = initializeApp(environment.firebase);

// Connect to emulators in development
if (environment.useEmulators) {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8085);
}

export const appConfig: ApplicationConfig = {
  providers: [
    // ... your other providers
  ]
};
```

**User app** - Same pattern in `projects/user-app/src/app/app.config.ts`.

## Usage

### Development (Emulators)

```bash
# Start emulators
npm run firebase:emulators

# Start apps (uses environment.local.ts → projectId: "novus-flexy")
npm start
npm run start:user
```

Uses local emulators — no real Firebase connection or `firebase login` required.
The `projectId` must match `.firebaserc` so the app reads from the correct emulator namespace.

### Staging

Build with staging configuration:
```bash
ng build admin --configuration=staging
ng build user-app --configuration=staging
```

### Production

Build with production configuration:
```bash
ng build admin --configuration=production
ng build user-app --configuration=production
```

## Security Best Practices

### 1. Never Commit Real Credentials

Add to `.gitignore` if you store real credentials here:
```gitignore
# .gitignore
environments/environment.prod.ts
environments/environment.staging.ts
```

But keep template files:
```gitignore
!environments/environment.prod.ts.template
!environments/environment.staging.ts.template
```

### 2. Use Environment Variables

For CI/CD, inject secrets:
```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  firebase: {
    apiKey: process.env['FIREBASE_API_KEY'],
    projectId: process.env['FIREBASE_PROJECT_ID'],
    // ...
  }
};
```

### 3. Restrict API Keys

In Firebase Console:
1. Go to APIs & Services → Credentials (Google Cloud)
2. Select your API key
3. Add application restrictions (HTTP referrers)
4. Add API restrictions (only enable needed APIs)

### 4. Security Rules

Always use strict security rules in production:
- `firestore.rules` - Database access
- `storage.rules` - File access

## Troubleshooting

### "Firebase config not found"

**Cause**: Environment file not exported correctly

**Solution**: Check the export in `projects/[app]/src/environments/environment.ts`:
```typescript
export { environment } from '../../../environments/environment.local';
```

### "Cannot connect to emulator"

**Cause**: Emulators not running or wrong URL

**Solution**:
1. Start emulators: `npm run firebase:emulators`
2. Check `useEmulators: true` in environment file
3. Verify emulator connection code runs

### Different Firebase Projects Per App

If admin and user need separate Firebase projects:

**Admin**: `projects/admin/src/environments/environment.ts`
```typescript
export const environment = {
  firebase: {
    projectId: "admin-project",
    // ... admin Firebase config
  }
};
```

**User**: `projects/user-app/src/environments/environment.ts`
```typescript
export const environment = {
  firebase: {
    projectId: "user-project",
    // ... user Firebase config
  }
};
```

Don't use shared environments folder in this case.

## Project ID and Emulators

### The Rule: `projectId` must always match `.firebaserc`

The Firebase emulator stores data in namespaces keyed by `projectId`. Our emulator data
(in `emulator-data/`) was exported under the `novus-flexy` namespace — matching the
project in `.firebaserc`. **If the app uses a different `projectId`, it reads from and
writes to a completely separate empty namespace**, and none of the seeded data will be
visible.

`environment.local.ts` must always have:
```typescript
projectId: "novus-flexy"
```

### Do I need to be logged into Firebase CLI to use the emulator?

**No.** The emulator is fully local. You do not need `firebase login` or an active
internet connection. The `projectId` is just a namespace string — the emulator doesn't
validate it against real Firebase. 

### What about `demo-*` project IDs?

Firebase has a special convention: any `projectId` starting with `demo-` tells the
Firebase SDK to **never fall through to real Firebase**, even if the emulator is
unreachable. This is useful for:

- **Pure offline / CI environments** where you want a hard guarantee no real Firebase
  calls are made
- **Starting fresh** with no imported emulator data

However, `demo-*` IDs have a trade-off: **you cannot use exported emulator data that
was saved under a real project ID**. If you want to use `demo-project`, you must also
re-seed the emulator under that namespace.

### When to use each approach

| Scenario | `projectId` to use | Notes |
|---|---|---|
| Local dev with `emulator-data/` seed | `novus-flexy` | Data loads correctly |
| Firebase CLI logged in, emulator running | `novus-flexy` | Same namespace, no conflict |
| Pure offline / CI, no seeded data | `demo-novus-flexy` | Guarantees no real Firebase calls |
| Staging (emulator + real project) | `novus-flexy` | `useEmulators: true` routes locally |
| Production | real project ID | `useEmulators: false` |

> **Note:** If you ever switch to a `demo-*` project ID for local dev, remember to
> re-export the emulator data under that namespace first, or re-seed it using
> `firestore.seed.json`.

## Related Documentation

- [Getting Started Guide](GETTING_STARTED.md) - Initial setup
- [Firebase Emulators Guide](FIREBASE_EMULATORS.md) - Local development
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Questions?** Contact the Novus Apps development team.
