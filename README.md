# Novus Flexy

A modern Angular 21 **monorepo workspace** template with Firebase backend integration, customized by **Novus Apps** for rapid full-stack application development.

## Overview

Novus Flexy is an enterprise-ready monorepo template that provides a complete foundation for building modern web applications with separate admin and user-facing frontends backed by Firebase. This workspace architecture allows teams to:

- **Develop multiple apps** with shared code and dependencies
- **Scale independently** - Admin and user apps can evolve separately
- **Share resources** - Common components, services, and Firebase backend
- **Deploy efficiently** - Independent deployments for each application
- **Maintain consistency** - Unified tooling and development environment

## Architecture

This workspace contains:

- **Admin App** (`projects/admin/`) - Feature-rich admin dashboard on port 4200
- **User App** (`projects/user-app/`) - User-facing application on port 4400
- **Firebase Functions** (`functions/`) - Serverless backend with Node.js 22
- **Shared Environments** - Unified Firebase configuration management

## Technology Stack

### Frontend

- **Angular 21** - Latest framework with standalone components and zoneless architecture
- **Angular Material 21** - Comprehensive Material Design UI component library
- **Tailwind CSS v4** - Utility-first CSS via PostCSS, synchronized with Material theme tokens
- **TypeScript 5.6** - Type-safe development with latest language features
- **SCSS** - Advanced styling with Sass preprocessor
- **ESBuild** - Lightning-fast application builder
- **Tabler Icons** - Beautiful and consistent icon library
- **ApexCharts** - Modern, interactive charting library
- **Angular Signals** - Modern reactive state management
- **Playwright** - End-to-end testing framework with browser automation

### Backend & Infrastructure

- **Firebase** - Complete backend platform (Auth, Firestore, Storage, Functions)
- **Node.js 22** - Latest LTS for Cloud Functions
- **Firebase Emulators** - Local development environment
- **GitHub Codespaces** - Cloud-based development with devcontainer
- **Model Context Protocol (MCP)** - AI-assisted debugging with Copilot integration

## Features

### Frontend

- ✅ **Monorepo Workspace** - Multiple apps in one repository with shared dependencies
- ✅ **Standalone Components** - Modern Angular architecture without NgModules
- ✅ **Hybrid Styling** - Tailwind CSS v4 for layouts + Material 21 for complex components, zero CSS drift
- ✅ **Responsive Layout** - Mobile-first design that works on all devices
- ✅ **Two Layout System** - Full layout (with sidebar) and Blank layout (for auth pages)
- ✅ **Material Design** - Comprehensive Material UI components
- ✅ **Customizable Theme** - Tailwind color tokens synchronized to Material CSS custom properties
- ✅ **Fast Builds** - ESBuild-based compilation with PostCSS/Tailwind pipeline
- ✅ **Store-and-Forward** - Two-stage offline-first data sync (LocalStorage → Firestore)

### Backend & DevOps

- ✅ **Firebase Integration** - Auth, Firestore, Storage, Functions pre-configured
- ✅ **Local Emulators** - Develop and test without cloud connectivity (Auth, Firestore, Storage, Functions)
- ✅ **Cloud Functions** - Serverless backend with TypeScript
- ✅ **DevContainer** - Node.js 22 + Java 21 environment for all developers (4-core/16GB recommended)
- ✅ **Multi-Site Hosting** - Deploy admin and user apps independently
- ✅ **E2E Testing** - Playwright with separate configs per app (`playwright.config.admin.ts` / `playwright.config.user.ts`)
- ✅ **MCP Integration** - AI-assisted debugging with browser context awareness

## Quick Start

### Using GitHub Codespaces (Recommended - Works on Any Device!)

**Perfect for**: Desktop, laptop, tablet with keyboard, even Chromebook!

1. Click **Code** → **Codespaces** → **Create codespace on main**
2. Select **4-core (16GB)** machine type — required to run both Angular dev servers + Firebase JVM emulators concurrently
3. Wait for initialization (3-5 minutes) - Node 22, Angular CLI, Java 21, and Firebase emulator JARs auto-install
4. Start coding:
   ```bash
   npm run dev            # All three processes at once (recommended)
   npm start              # Admin app only (port 4200)
   npm run start:user     # User app only (port 4400)
   ```
5. Click the globe icon in the **Ports** tab to open your app

**Zero installation required** - Everything runs in the cloud! 🚀

### Local Development (Alternative)

**Only if you prefer local development**:

#### Prerequisites

- Node.js 22 LTS
- npm (comes with Node.js)
- Firebase CLI: `npm install -g firebase-tools`

#### Installation

```bash
# Clone the repository
git clone <repository-url>
cd novus-flexy

# Install root dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### Development

```bash
# Start everything (admin + user + Firebase emulators)
npm run dev

# Start admin dashboard (http://localhost:4200)
npm start

# Start user app (http://localhost:4400)
npm run start:user

# Start both apps concurrently (without emulators)
npm run start:all

# Start Firebase emulators (in separate terminal)
npm run firebase:emulators
# Emulator UI: http://localhost:8080
```

### Building

```bash
# Build both applications
npm run build

# Build individually
npm run build:admin
npm run build:user

# Build Firebase Functions
cd functions && npm run build
```

## 📚 Documentation

Comprehensive guides are available in the [`docs/`](docs/) folder:

### Core Guides

- **[Getting Started Guide](docs/GETTING_STARTED.md)** - First steps, customization, branding
- **[DevContainer Guide](docs/DEVCONTAINER.md)** - Development environment explained
- **[Dependency Management](docs/DEPENDENCY_MANAGEMENT.md)** - Managing packages per app
- **[Firebase Emulators](docs/FIREBASE_EMULATORS.md)** - Local backend development
- **[Workspace Setup](WORKSPACE_SETUP.md)** - Architecture and technical details
- **[DataShare Service](DATASHARE_USAGE.md)** - Secure cross-component data passing patterns

### Project Context

- **[Product Requirements (PRD)](docs/context/PRD.md)** - Feature requirements and acceptance criteria
- **[Architecture Blueprint](docs/context/Architecture.md)** - System design and technical decisions
- **[Project Brief](docs/context/ProjectBrief.md)** - Executive summary and strategic goals
- **[Master Backlog](docs/context/BACKLOG.md)** - Implementation roadmap and story status
- **[Constraints](docs/context/CONSTRAINTS.md)** - Technical and business constraints

### User Stories

- **[Stories Directory](docs/stories/)** - Granular feature stories organized by epic
  - [SYS-100](docs/stories/SYS-100/) - System Foundation (Firebase, Tailwind, Emulators)
  - [AUT-200](docs/stories/AUT-200/) - Authentication & Initialization (Splash, Auth UI)
  - [TST-900](docs/stories/TST-900/) - Quality Assurance (Playwright multi-app setup)

### Testing & Debugging

- **[Testing Documentation](docs/testing/)** - Comprehensive E2E testing with Playwright
  - [Testing Strategy](docs/testing/TESTING_STRATEGY.md) - Philosophy and approach
  - [Playwright Setup](docs/testing/PLAYWRIGHT_SETUP.md) - Installation and configuration
  - [Writing Tests](docs/testing/WRITING_TESTS.md) - Best practices and patterns
  - [Test Registry](docs/testing/TEST_REGISTRY.md) - Complete test catalog
  - [Data Test IDs](docs/testing/DATA_TEST_IDS.md) - Naming conventions
- **[MCP Integration Guide](docs/MCP_INTEGRATION.md)** - AI-assisted debugging with Copilot and browser DevTools

## Project Structure

```
novus-flexy/
├── projects/
│   ├── admin/                    # Admin dashboard application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── components/   # Reusable components
│   │   │   │   ├── layouts/      # Full & Blank layouts
│   │   │   │   ├── pages/        # Page components
│   │   │   │   └── services/     # Application services
│   │   │   └── assets/           # Images, SCSS themes
│   │   └── tsconfig.app.json
│   │
│   └── user-app/                 # User-facing application
│       ├── src/
│       │   └── app/
│       └── tsconfig.app.json
│
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts             # Function definitions
│   └── package.json             # Functions dependencies
│
├── environments/                 # Shared Firebase config
│   ├── environment.local.ts      # Emulator endpoints
│   ├── environment.staging.ts
│   └── environment.prod.ts
│
├── e2e/                         # End-to-end tests
│   ├── admin/flows/             # Admin app Playwright specs
│   └── user-app/flows/          # User app Playwright specs
│
├── docs/                        # Documentation
│   ├── context/                 # PRD, Architecture, Backlog, Constraints
│   ├── stories/                 # Feature stories by epic (SYS, AUT, TST...)
│   ├── testing/                 # Testing guides and strategy
│   ├── GETTING_STARTED.md
│   ├── DEVCONTAINER.md
│   ├── DEPENDENCY_MANAGEMENT.md
│   ├── FIREBASE_EMULATORS.md
│   └── MCP_INTEGRATION.md
│
├── .devcontainer/               # Codespaces config (Node 22 + Java 21)
├── angular.json                 # Workspace configuration
├── firebase.json                # Firebase project config
├── postcss.config.mjs           # Tailwind CSS v4 PostCSS plugin
├── DATASHARE_USAGE.md           # DataShare service usage examples
└── package.json                 # Root dependencies
```

## Available Scripts

| Command                              | Description                                               |
| ------------------------------------ | --------------------------------------------------------- |
| `npm run dev`                        | Start admin + user apps + Firebase emulators (all-in-one) |
| `npm start`                          | Serve admin app on port 4200                              |
| `npm run start:user`                 | Serve user app on port 4400                               |
| `npm run start:all`                  | Serve both apps concurrently (without emulators)          |
| `npm run build`                      | Build both applications                                   |
| `npm run build:admin`                | Build admin app only                                      |
| `npm run build:user`                 | Build user app only                                       |
| `npm test`                           | Run unit tests (Jasmine/Karma)                            |
| `npm run test:e2e:admin`             | Run E2E tests for admin app                               |
| `npm run test:e2e:user`              | Run E2E tests for user app                                |
| `npm run test:e2e`                   | Run all E2E tests                                         |
| `npm run test:e2e:ui`                | Run E2E tests in interactive Playwright UI mode           |
| `npm run test:e2e:headed`            | Run E2E tests in headed browser mode                      |
| `npm run test:e2e:debug`             | Run E2E tests in debug mode                               |
| `npm run test:e2e:report`            | Open the last Playwright HTML report                      |
| `npm run firebase:emulators`         | Start Firebase emulators                                  |
| `npm run firebase:emulators:kill`    | Stop all running Firebase emulators                       |
| `npm run firebase:emulators:restart` | Restart Firebase emulators                                |
| `npm run firebase:deploy`            | Deploy to Firebase hosting + functions                    |

## Customization

### Branding Your App

See the [Getting Started Guide](docs/GETTING_STARTED.md) for step-by-step instructions on:

- Changing app title and metadata
- Updating logos and favicons
- Configuring Firebase projects
- Setting up environments

### Adding Features

```bash
# Generate component in admin app
ng generate component my-feature --project=admin

# Generate service in user app
ng generate service my-service --project=user-app

# Add Cloud Function
# Edit functions/src/index.ts
```

### Installing Dependencies

See [Dependency Management Guide](docs/DEPENDENCY_MANAGEMENT.md) for details on:

- Adding packages to specific apps
- Managing workspace vs app-level dependencies
- Handling peer dependencies

## Why Monorepo?

This template uses a **monorepo workspace** architecture for several key reasons:

1. **Code Sharing** - Share services, models, and utilities between admin and user apps
2. **Unified Tooling** - Single TypeScript config, linting rules, and build setup
3. **Atomic Changes** - Update both apps together when changing shared APIs
4. **Consistent Dependencies** - Same Angular/Material versions across all apps
5. **Simplified CI/CD** - One build pipeline for all applications
6. **Developer Experience** - Work on multiple apps without switching repos

## Firebase Integration

### Emulator Ports

| Service       | Port | URL                   |
| ------------- | ---- | --------------------- |
| Admin App     | 4200 | http://localhost:4200 |
| User App      | 4400 | http://localhost:4400 |
| Auth Emulator | 9099 | -                     |
| Firestore     | 8085 | -                     |
| Functions     | 5001 | -                     |
| Storage       | 9199 | -                     |
| Emulator UI   | 8080 | http://localhost:8080 |

### Security Rules

Default security rules are **restrictive**. Update based on your needs:

- `firestore.rules` - Database security
- `storage.rules` - File storage security

## Key Technologies

- **Angular Workspace** - Multi-application architecture
- **Firebase Platform** - Complete backend solution
- **DevContainers** - Reproducible development environments
- **TypeScript** - Type-safe full-stack development
- **Material Design** - Enterprise-grade UI components

## Support & Resources

- 📖 [Full Documentation](docs/)
- 🐛 Issues: Contact Novus Apps development team
- 💬 Questions: Reach out to your project lead

## License

This project is licensed for use by Novus Apps and its clients.

---

**Built with ❤️ by Novus Apps**

_Template Version: 3.0 - Angular 21 + Tailwind CSS v4 + Firebase Monorepo_
