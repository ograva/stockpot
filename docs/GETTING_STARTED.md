# Getting Started with Novus Flexy

This guide will walk you through customizing and branding your new Novus Flexy application.

## 💻 Development Environment

**This project is designed for GitHub Codespaces** - develop from any device:
- Desktop or laptop (any OS)
- Tablet with keyboard (iPad, Android, Surface)
- Chromebook
- Any device with a web browser

**No local installation required!** Everything runs in the cloud.

### Start Your Codespace

1. Go to your GitHub repository
2. Click **Code** → **Codespaces** → **Create codespace**
3. Wait 2-3 minutes for setup
4. Start coding immediately!

See [DEVCONTAINER.md](DEVCONTAINER.md) for details.

## 🎯 First Steps

When you start a new project from this template, follow these steps to make it your own:

### 1. Update Project Names

#### Update `package.json`
```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  // ... rest of config
}
```

#### Update `angular.json`
Search for "NovusFlexy" and replace with your project name throughout the file.

### 2. Brand Your Applications

#### Admin App

**Update Title and Metadata** - [`projects/admin/src/index.html`](../projects/admin/src/index.html):
```html
<head>
  <meta charset="utf-8">
  <title>Your Admin Dashboard</title>
  <meta name="description" content="Your application description">
  // ... update favicon reference
</head>
```

**Replace Logos** - `projects/admin/src/assets/images/logos/`:
- `dark-logo.svg` - Logo for light themes
- `light-logo.svg` - Logo for dark themes
- `favicon.ico` - Browser tab icon

**Update App Title** - [`projects/admin/src/app/layouts/full/header/header.component.html`](../projects/admin/src/app/layouts/full/header/header.component.html):
Update the logo and brand text in the header component.

#### User App

**Update Title and Metadata** - [`projects/user-app/src/index.html`](../projects/user-app/src/index.html):
```html
<head>
  <meta charset="utf-8">
  <title>Your Application Name</title>
  <meta name="description" content="Your application description">
</head>
```

**Add Your Logo** - `projects/user-app/src/assets/images/`:
Create your own branding assets for the user-facing app.

### 3. Configure Firebase

#### Create Firebase Projects

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Add two web apps:
   - **Admin Dashboard** (for admin app)
   - **User Application** (for user-app)

#### Setup Environments Folder

Create **`environments/`** folder in the workspace root:

```typescript
// environments/environment.staging.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-staging-api-key",
    authDomain: "your-project-staging.firebaseapp.com",
    projectId: "your-project-staging",
    storageBucket: "your-project-staging.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
};
```

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  firebase: {
    apiKey: "your-production-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-prod",
    storageBucket: "your-project-prod.appspot.com",
    messagingSenderId: "987654321",
    appId: "1:987654321:web:xyzabc"
  }
};
```

#### Link Environments to Apps

**Admin App** - Create `projects/admin/src/environments/environment.ts`:
```typescript
export { environment } from '../../../environments/environment.staging';
```

**User App** - Create `projects/user-app/src/environments/environment.ts`:
```typescript
export { environment } from '../../../environments/environment.staging';
```

For production builds, Angular will use the production environment file.

#### Update `.firebaserc`

```json
{
  "projects": {
    "staging": "your-project-staging",
    "production": "your-project-prod",
    "default": "your-project-staging"
  },
  "targets": {
    "your-project-staging": {
      "hosting": {
        "admin": ["your-project-admin-staging"],
        "user-app": ["your-project-user-staging"]
      }
    },
    "your-project-prod": {
      "hosting": {
        "admin": ["your-project-admin-prod"],
        "user-app": ["your-project-user-prod"]
      }
    }
  }
}
```

### 4. Initialize Firebase in Your Apps

**Install Firebase SDK** (already in dependencies):
```bash
npm install
```

**Initialize in Admin App** - `projects/admin/src/app/app.config.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';

// In providers array:
{
  provide: APP_INITIALIZER,
  useFactory: () => () => initializeApp(environment.firebase),
  multi: true
}
```

**Initialize in User App** - `projects/user-app/src/app/app.config.ts`:
Same pattern as admin app.

### 5. Customize Theme Colors

**Admin App Theme** - [`projects/admin/src/assets/scss/themecolors/_themecolors.scss`](../projects/admin/src/assets/scss/themecolors/_themecolors.scss):

Change the primary color theme by editing or adding a new theme file:
```scss
// Example: blue_theme.scss
$primary: #1976d2;
$accent: #ff4081;
$warn: #f44336;

// Import Material theme
@use '@angular/material' as mat;
```

Then import in [`projects/admin/src/assets/scss/style.scss`](../projects/admin/src/assets/scss/style.scss):
```scss
@use 'themecolors/blue_theme';
```

### 6. Update Navigation Menu

**Admin Sidebar** - [`projects/admin/src/app/layouts/full/sidebar/sidebar-data.ts`](../projects/admin/src/app/layouts/full/sidebar/sidebar-data.ts):

```typescript
export const navItems: NavItem[] = [
  {
    navCap: 'Dashboard',
  },
  {
    displayName: 'Home',
    iconName: 'layout-dashboard',
    route: '/dashboard',
  },
  {
    displayName: 'Your Feature',
    iconName: 'aperture',
    route: '/your-feature',
  },
  // Add your menu items
];
```

### 7. Setup Security Rules

**Firestore Rules** - [`firestore.rules`](../firestore.rules):
Update based on your data model and security requirements:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Example: Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Example: Public read, authenticated write
    match /posts/{postId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

**Storage Rules** - [`storage.rules`](../storage.rules):
Similar pattern for file uploads.

## 🚀 Next Steps

### Development Workflow

1. **Start Development**:
   ```bash
   npm run start:all          # Both apps
   npm run firebase:emulators # Backend
   ```

2. **Create Features**:
   ```bash
   ng generate component my-feature --project=admin
   ng generate service data --project=admin
   ```

3. **Add Cloud Functions**:
   Edit `functions/src/index.ts` and add new functions.

### Testing Locally

- **Admin App**: http://localhost:4200
- **User App**: http://localhost:4400
- **Emulator UI**: http://localhost:8080

Test authentication, database operations, and functions using the emulators before deploying to production.

### Deployment

See the main [README.md](../README.md) for deployment instructions.

## 📚 Additional Resources

- [DevContainer Guide](DEVCONTAINER.md) - Development environment
- [Dependency Management](DEPENDENCY_MANAGEMENT.md) - Adding packages
- [Firebase Emulators Guide](FIREBASE_EMULATORS.md) - Local development
- [Workspace Setup](../WORKSPACE_SETUP.md) - Architecture details

## ⚠️ Important Reminders

1. **Never commit** Firebase config with real API keys to public repos
2. **Update security rules** before going to production
3. **Test with emulators** first before deploying functions
4. **Keep dependencies** in sync between admin and user apps
5. **Use environment files** to manage staging vs production configs

---

**Need Help?** Contact the Novus Apps development team.
