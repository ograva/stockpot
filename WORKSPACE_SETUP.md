# Novus Flexy - Angular Workspace Setup

## 🏗️ Project Structure

This is an **Angular workspace** with multiple applications and Firebase backend integration.

### Applications

- **Admin App** (`projects/admin/`) - Admin dashboard on port 4200
- **User App** (`projects/user-app/`) - User-facing application on port 4400

### Firebase Functions

- **Functions** (`functions/`) - Node.js 22 Cloud Functions for Firebase

## 🚀 Getting Started

### Prerequisites

- Node.js 22 LTS
- npm or yarn
- Firebase CLI (installed automatically in devcontainer)
- Angular CLI 19

### Installation

```bash
# Install root dependencies
npm install

# Install Firebase Functions dependencies
cd functions && npm install && cd ..
```

### Development

```bash
# Start admin app (default port 4200)
npm start

# Start user app (port 4400)
npm run start:user

# Start both apps concurrently
npm run start:all

# Start Firebase emulators
npm run firebase:emulators
```

### Building

```bash
# Build both applications
npm run build

# Build admin app only
npm run build:admin

# Build user app only
npm run build:user

# Build Firebase functions
cd functions && npm run build
```

## 🔥 Firebase Setup

### Emulators

The project includes Firebase emulators for local development:

- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8085
- **Functions Emulator**: http://localhost:5001
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:8080

Start emulators:
```bash
npm run firebase:emulators
```

### Functions Development

```bash
cd functions

# Watch mode for TypeScript compilation
npm run build:watch

# Deploy functions
npm run deploy
```

## 🐳 Dev Container

This project includes a `.devcontainer` configuration optimized for:
- Node.js 22
- Angular 19
- Firebase development
- All necessary VS Code extensions

## 📦 Package Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Serve admin app (port 4200) |
| `npm run start:user` | Serve user app (port 4400) |
| `npm run start:all` | Serve both apps concurrently |
| `npm run build` | Build both apps |
| `npm run build:admin` | Build admin app only |
| `npm run build:user` | Build user app only |
| `npm test` | Run tests |
| `npm run firebase:emulators` | Start Firebase emulators |
| `npm run firebase:deploy` | Deploy to Firebase |

## 🏛️ Architecture

### Angular Workspace

- **Standalone components** (Angular 19 pattern)
- **Signals** for reactive state management
- **Material Design** components via `MaterialModule`
- **SCSS** for styling
- **Two-layout system** (Full/Blank) for admin app

### Firebase Integration

- **Cloud Functions** (Node.js 22)
- **Firestore** database
- **Firebase Authentication**
- **Firebase Storage**
- **Hosting** for both admin and user apps

## 📝 Configuration Files

- `angular.json` - Angular workspace configuration
- `firebase.json` - Firebase project configuration
- `.firebaserc` - Firebase project aliases
- `firestore.rules` - Firestore security rules
- `storage.rules` - Storage security rules
- `functions/` - Cloud Functions source code

## 🔐 Security Rules

Default security rules are restrictive. Update `firestore.rules` and `storage.rules` based on your application requirements.

## 📚 Additional Documentation

- [Angular Documentation](https://angular.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Material Design](https://material.angular.io/)
