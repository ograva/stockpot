# Firebase Emulators Guide

This guide covers how to work with Firebase Emulators for local development in GitHub Codespaces and VS Code.

## What Are Firebase Emulators?

Firebase Emulators are **local versions** of Firebase services that run on your development machine:

- **No cloud connection needed** - Work offline
- **No costs** - Free unlimited usage for development
- **Fast iteration** - Instant deploys, no waiting for cloud updates
- **Safe testing** - Can't accidentally affect production data
- **Real-time debugging** - Full access to logs and data

## Available Emulators

| Emulator | Port | Purpose |
|----------|------|---------|
| **Authentication** | 9099 | User sign-up, login, password reset |
| **Firestore** | 8085 | NoSQL database operations |
| **Functions** | 5001 | Cloud Functions (HTTP, triggers) |
| **Storage** | 9199 | File uploads and downloads |
| **Emulator UI** | 8080 | Web interface to manage all emulators |

## Starting Emulators

### Quick Start

```bash
# From project root
npm run firebase:emulators
```

This starts all emulators with the UI at **http://localhost:8080**.

### In GitHub Codespaces

1. **Start Emulators**:
   ```bash
   npm run firebase:emulators
   ```

2. **Access Emulator UI**:
   - VS Code will show a notification: "Your application running on port 8080 is available"
   - Click "Open in Browser"
   - Or go to **Ports** tab → Click globe icon next to port 8080

3. **Forwarded URLs**:
   - Codespaces provides HTTPS URLs like: `https://fictional-computing-machine-abc123-8080.app.github.dev`
   - These are **publicly accessible** but hard to guess
   - Use "Private" port visibility for added security

### In VS Code Desktop

```bash
npm run firebase:emulators
```

Access at **http://localhost:8080** in your browser.

### Custom Start

```bash
# Start only specific emulators
firebase emulators:start --only auth,firestore

# With imported data
firebase emulators:start --import=./emulator-data

# With auto-export on shutdown
firebase emulators:start --export-on-exit=./emulator-data
```

## Using the Emulator UI

Navigate to **http://localhost:8080** (or Codespaces URL).

### Firestore Tab

- **View collections** - Browse your database structure
- **Add documents** - Manually create test data
- **Edit data** - Modify fields inline
- **Delete data** - Remove documents
- **Query data** - Test Firestore queries

**Example**: Add test users
1. Go to Firestore tab
2. Click "Start collection"
3. Collection ID: `users`
4. Add document with fields:
   ```
   name: "Test User"
   email: "test@example.com"
   role: "admin"
   ```

### Authentication Tab

- **View users** - See all registered users
- **Create users** - Add test accounts
- **Manage tokens** - View ID tokens and claims
- **Custom claims** - Add admin roles, etc.

**Example**: Create test admin
1. Go to Authentication tab
2. Click "Add user"
3. Email: `admin@test.com`, Password: `password123`
4. Click the user → "Custom Claims" → Add: `{"admin": true}`

### Functions Tab

- **View logs** - See console.log output from functions
- **Trigger functions** - Manually invoke HTTP functions
- **Debug** - Full stack traces for errors

### Storage Tab

- **Browse buckets** - View uploaded files
- **Upload files** - Test file upload functionality
- **Download files** - Verify file accessibility
- **Delete files** - Clean up test data

## Connecting Apps to Emulators

### Admin App Configuration

**Create environment file** - `projects/admin/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  useEmulators: true,
  firebase: {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
};
```

**Initialize with emulators** - `projects/admin/src/app/app.config.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { environment } from '../environments/environment';

// Initialize Firebase
const app = initializeApp(environment.firebase);

// Connect to emulators if in development
if (environment.useEmulators) {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const functions = getFunctions(app);
  const storage = getStorage(app);

  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(firestore, 'localhost', 8085);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
  ]
};
```

### User App Configuration

Same pattern as admin app - create environment file and connect to emulators.

### Functions Configuration

Functions **automatically** connect to emulators when you run:
```bash
firebase emulators:start
```

No code changes needed! Functions use the Firebase Admin SDK which detects emulators automatically.

## Development Workflow

### Typical Development Session

1. **Terminal 1** - Start emulators:
   ```bash
   npm run firebase:emulators
   ```

2. **Terminal 2** - Start admin app:
   ```bash
   npm start
   ```

3. **Terminal 3** - Start user app (optional):
   ```bash
   npm run start:user
   ```

4. **Browser**:
   - Admin: http://localhost:4200
   - User: http://localhost:4400
   - Emulator UI: http://localhost:8080

### Iterating on Functions

**Option 1**: Hot reload (automatic)

When you run `firebase emulators:start`, changes to `functions/src/index.ts` are automatically recompiled and reloaded.

**To see changes**:
1. Edit `functions/src/index.ts`
2. Save file
3. Functions automatically rebuild
4. Test immediately (no restart needed)

**Option 2**: Watch mode

In a separate terminal:
```bash
cd functions
npm run build:watch
```

This continuously compiles TypeScript as you code.

### Testing Functions

**HTTP Functions**:
```bash
# Using curl
curl http://localhost:5001/demo-project/us-central1/helloWorld

# Using the app
// Make HTTP request from Angular
this.http.get('http://localhost:5001/demo-project/us-central1/helloWorld')
```

**Callable Functions**:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const getUserData = httpsCallable(functions, 'getUserData');

getUserData({ userId: 'abc123' })
  .then((result) => console.log(result.data))
  .catch((error) => console.error(error));
```

**Firestore Triggers**:
Add a document in the Emulator UI or from your app, and watch the function logs in the terminal.

## Seeding Test Data

### Manual (Emulator UI)

1. Open http://localhost:8080
2. Go to Firestore tab
3. Create collections and documents

### Programmatic (Recommended)

**Create seed script** - `scripts/seed-emulator.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({ projectId: 'demo-project' });
const db = getFirestore(app);
const auth = getAuth(app);

async function seedData() {
  // Create test user
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    'admin@test.com',
    'password123'
  );
  
  // Add user document
  await addDoc(collection(db, 'users'), {
    uid: userCredential.user.uid,
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
    createdAt: new Date()
  });

  console.log('Seed data created!');
}

seedData().catch(console.error);
```

Run with:
```bash
npx ts-node scripts/seed-emulator.ts
```

### Using Import/Export

**Export current data**:
```bash
firebase emulators:export ./emulator-data
```

**Import data on start**:
```bash
firebase emulators:start --import=./emulator-data
```

**Auto-export on exit**:
```bash
firebase emulators:start --export-on-exit=./emulator-data
```

Add to `package.json`:
```json
{
  "scripts": {
    "firebase:emulators": "firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data"
  }
}
```

## Debugging

### Function Logs

All `console.log()`, `console.error()` in functions appear in the terminal where you ran `firebase emulators:start`.

**Example**:
```typescript
// functions/src/index.ts
export const helloWorld = onRequest((request, response) => {
  console.log('Request received:', request.method);
  console.log('Headers:', request.headers);
  response.json({ message: 'Hello!' });
});
```

Output appears in terminal:
```
✔  functions[us-central1-helloWorld]: http function initialized
i  functions: Request received: GET
i  functions: Headers: {...}
```

### Firestore Queries

Use Emulator UI to verify queries:
1. Go to Firestore tab
2. Check if data exists
3. Verify security rules aren't blocking access

### Authentication Issues

**Common problems**:
- Not connected to emulator (check `connectAuthEmulator` call)
- Using real Firebase API key instead of `demo-api-key`
- CORS issues (emulators handle CORS automatically)

**Check in Emulator UI**:
- Go to Authentication tab
- Verify users exist
- Check custom claims

### Network Errors

**In Codespaces**:
- Use forwarded URLs, not `localhost`
- Check port visibility (Public vs Private)
- Verify firewall isn't blocking

**In VS Code Desktop**:
- Use `localhost:PORT`, not `127.0.0.1:PORT`
- Check Docker networking if using devcontainer

## Configuration Files

### firebase.json

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8085
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 8080
    },
    "singleProjectMode": true
  }
}
```

**Change ports** if conflicts exist:
```json
"auth": {
  "port": 9098  // Changed from 9099
}
```

### .firebaserc

```json
{
  "projects": {
    "default": "demo-project"
  }
}
```

For emulators, project name doesn't need to be real.

## Production vs Emulators

### Toggle with Environment

```typescript
// environments/environment.ts (development)
export const environment = {
  production: false,
  useEmulators: true,
  firebase: { /* demo config */ }
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  useEmulators: false,
  firebase: { /* real config */ }
};
```

### Build for Production

```bash
# Admin app (uses environment.prod.ts)
ng build admin --configuration=production

# User app
ng build user-app --configuration=production
```

Angular automatically uses the production environment file.

## Best Practices

1. **Always use emulators** for local development - Never point dev builds at production Firebase
2. **Commit emulator data** - Check in `emulator-data/` for consistent team experience
3. **Use demo credentials** - Don't use real API keys in development
4. **Clear data regularly** - Start fresh to test onboarding flows
5. **Test security rules** - Verify rules work in emulators before deploying

## Troubleshooting

### Emulators Won't Start

**Error**: "Port already in use"
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in firebase.json
```

**Error**: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Functions Not Hot Reloading

**Solution**: Make sure you're editing files in `functions/src/`, not `functions/lib/`.

### Can't Access Emulator UI in Codespaces

1. Go to **Ports** tab in VS Code
2. Find port 8080
3. Change visibility to **Public**
4. Click globe icon to open

### "Permission denied" Errors

**Cause**: Firestore security rules blocking access

**Solution**: Check `firestore.rules` and temporarily set to allow all:
```
match /{document=**} {
  allow read, write: if true;  // WARNING: Only for testing!
}
```

## Resources

- [Firebase Emulators Documentation](https://firebase.google.com/docs/emulator-suite)
- [Connect Your App to Emulators](https://firebase.google.com/docs/emulator-suite/connect_and_prototype)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Questions?** Reach out to the Novus Apps development team.
