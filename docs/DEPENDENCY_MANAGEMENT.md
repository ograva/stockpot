# Dependency Management in Angular Workspace

This guide explains how to manage npm packages in a monorepo with multiple applications.

## Understanding Workspace Dependencies

Novus Flexy uses an **Angular workspace** (monorepo) architecture with:
- **Root `package.json`** - Shared dependencies for all apps
- **Functions `package.json`** - Backend-specific dependencies
- **No app-specific package.json files** - Apps share root dependencies

## Dependency Locations

### Root Dependencies (`/package.json`)

**Used by**: Admin app, User app, and build tooling

```json
{
  "dependencies": {
    "@angular/core": "^19.0.0",        // Both apps
    "@angular/material": "^19.0.0",    // Both apps
    "firebase": "^11.1.0",              // Both apps
    "apexcharts": "^3.49.0"            // Admin only (but available to both)
  },
  "devDependencies": {
    "@angular/cli": "~19.0.1",         // Build tool
    "typescript": "~5.6.3",             // Shared compiler
    "concurrently": "^9.1.0"           // Dev script helper
  }
}
```

**Key Points**:
- All Angular apps in the workspace share these dependencies
- There's only **one** `node_modules` folder at the root
- Both apps use the same versions of Angular, Material, etc.

### Functions Dependencies (`/functions/package.json`)

**Used by**: Firebase Cloud Functions only

```json
{
  "dependencies": {
    "firebase-admin": "^13.0.1",       // Backend SDK
    "firebase-functions": "^6.1.1"     // Functions runtime
  },
  "devDependencies": {
    "typescript": "~5.6.3",             // Must match root
    "eslint": "^9.17.0"                // Linting for functions
  },
  "engines": {
    "node": "22"                        // Runtime requirement
  }
}
```

**Key Points**:
- Completely separate from frontend dependencies
- Has its own `node_modules` folder
- Deployed independently to Firebase

## Installing Packages

### For Frontend Apps (Admin or User)

**Always install at the root level**:

```bash
# Navigate to project root
cd /workspaces/novus-flexy

# Install production dependency
npm install some-library

# Install dev dependency
npm install --save-dev some-dev-tool
```

**Examples**:

```bash
# Add a date library
npm install date-fns

# Add form validation
npm install @angular/forms

# Add HTTP client
npm install @angular/common

# Add chart library
npm install chart.js ng2-charts
```

Then use in either app:
```typescript
// projects/admin/src/app/some-component.ts
import { formatDate } from 'date-fns';

// projects/user-app/src/app/some-component.ts
import { formatDate } from 'date-fns'; // Same import works!
```

### For Backend Functions

**Install in the functions folder**:

```bash
# Navigate to functions directory
cd /workspaces/novus-flexy/functions

# Install dependency
npm install some-backend-library

# Example: Add SendGrid for emails
npm install @sendgrid/mail

# Example: Add Stripe for payments
npm install stripe
```

Then use in functions:
```typescript
// functions/src/index.ts
import * as sgMail from '@sendgrid/mail';
import Stripe from 'stripe';
```

## Common Scenarios

### Scenario 1: Adding Angular Material Components

You already have Material, just import the modules:

```typescript
// projects/admin/src/app/material.module.ts
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Add to imports array
```

No `npm install` needed - Material is already installed at root.

### Scenario 2: Adding a Library to Admin App Only

Even if only the admin app uses it, **install at root**:

```bash
npm install ngx-quill  # Rich text editor for admin
```

The user app won't include it in its bundle if it doesn't import it (tree-shaking).

### Scenario 3: Different Versions for Different Apps

**Not supported** in Angular workspace. Both apps must use the same version.

**Workaround**: If you absolutely need different versions:
1. Consider if the requirement is valid (usually isn't)
2. Use dynamic imports or microfrontend architecture
3. Keep apps in separate repositories (defeats monorepo purpose)

**Best practice**: Keep apps on the same versions. Update together.

### Scenario 4: Adding Firebase SDK Features

```bash
# Root level
npm install firebase

# Then use in apps
```

```typescript
// projects/admin/src/app/services/auth.service.ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// projects/user-app/src/app/services/auth.service.ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
```

Same Firebase instance, same authentication state.

### Scenario 5: TypeScript Definitions

```bash
# Add type definitions at root
npm install --save-dev @types/lodash

# Now use in any app with full TypeScript support
```

### Scenario 6: Build Tools or CLI Packages

```bash
# Dev dependencies at root
npm install --save-dev prettier
npm install --save-dev eslint-config-airbnb

# Global CLI tools (in devcontainer)
npm install -g @angular/cli
npm install -g firebase-tools
```

## Checking Dependencies

### View All Root Dependencies

```bash
npm list --depth=0
```

### View Functions Dependencies

```bash
cd functions && npm list --depth=0
```

### Check for Outdated Packages

```bash
# Root dependencies
npm outdated

# Functions dependencies
cd functions && npm outdated
```

### Check for Security Vulnerabilities

```bash
# Root dependencies
npm audit

# Functions dependencies
cd functions && npm audit
```

## Updating Dependencies

### Update All Packages

```bash
# Root dependencies
npm update

# Functions dependencies
cd functions && npm update
```

### Update Specific Package

```bash
# Root
npm install @angular/core@latest

# Functions
cd functions && npm install firebase-functions@latest
```

### Update Angular Workspace

Use Angular CLI migration tool:

```bash
ng update @angular/cli @angular/core @angular/material
```

This updates all Angular packages together with migrations.

## Peer Dependencies

### What Are Peer Dependencies?

Some packages require other packages to be installed:
```
Package A requires Angular 19 (peer dependency)
```

### Resolving Peer Dependency Warnings

**Option 1**: Install the required peer dependency:
```bash
npm install required-peer-package
```

**Option 2**: Use `--legacy-peer-deps` flag (not recommended):
```bash
npm install --legacy-peer-deps some-package
```

**Option 3**: Wait for package update or find alternative

## Troubleshooting

### "Cannot find module" Error

**Cause**: Package not installed or wrong location

**Solution**:
```bash
# Make sure you're at the root
cd /workspaces/novus-flexy
npm install

# Check if package is in package.json
cat package.json | grep package-name

# If not there, install it
npm install package-name
```

### Conflicting Versions

**Error**: "found multiple versions of package X"

**Solution**:
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For functions
cd functions
rm -rf node_modules package-lock.json
npm install
```

### Module Not Found in Functions

**Cause**: Trying to import frontend package in backend

**Solution**: Install the package in `functions/package.json`:
```bash
cd functions
npm install the-package
```

**Note**: `firebase-admin` is for backend, `firebase` is for frontend.

### TypeScript Cannot Find Types

**Solution**: Install type definitions:
```bash
npm install --save-dev @types/package-name
```

### Workspace Build Fails After Adding Package

**Check**:
1. Is the package compatible with Angular 19?
2. Does it have peer dependencies you haven't installed?
3. Try clearing cache: `npm cache clean --force`

## Best Practices

### 1. Keep Versions Consistent

Both admin and user apps should use the same versions:
- Same Angular version
- Same Material version  
- Same TypeScript version

### 2. Use Exact Versions for Functions

```json
// functions/package.json
{
  "dependencies": {
    "firebase-admin": "13.0.1",  // Exact, not ^13.0.1
    "firebase-functions": "6.1.1"
  }
}
```

Prevents unexpected changes in production.

### 3. Review Before Installing

- Check package size: [bundlephobia.com](https://bundlephobia.com)
- Check last updated date: Look for maintained packages
- Read the README: Ensure compatibility with Angular 19

### 4. Document Why You Installed

Add comments in `package.json`:
```json
{
  "dependencies": {
    "@angular/core": "^19.0.0",
    "date-fns": "^2.30.0",  // Date formatting in admin dashboard
    "lodash": "^4.17.21"    // Utility functions for data processing
  }
}
```

### 5. Lock Files Matter

- **Commit** `package-lock.json` to git
- **Commit** `functions/package-lock.json` to git
- This ensures exact versions for all developers

### 6. Separate Frontend and Backend

**Never**:
- Import `firebase-admin` in frontend
- Import `@angular/core` in functions
- Mix frontend and backend packages

## Sharing Code Between Apps

### Option 1: Create Shared Library

```bash
ng generate library shared
```

Creates `projects/shared/` that both apps can import:
```typescript
// projects/admin/src/app/component.ts
import { SharedService } from 'shared';

// projects/user-app/src/app/component.ts
import { SharedService } from 'shared';
```

### Option 2: TypeScript Path Mapping

Configure `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["projects/shared/src/lib/*"]
    }
  }
}
```

Import anywhere:
```typescript
import { MyService } from '@shared/services/my-service';
```

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Angular Workspace Config](https://angular.io/guide/file-structure)
- [Node.js Package Management](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager)

---

**Questions?** Reach out to the Novus Apps development team.
