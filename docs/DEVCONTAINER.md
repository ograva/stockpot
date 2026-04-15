# DevContainer Configuration Guide

This document explains the devcontainer setup for Novus Flexy and how to work with it in GitHub Codespaces or VS Code.

## What is a DevContainer?

A **devcontainer** (development container) is a cloud-based development environment for GitHub Codespaces that ensures:
- **Consistency** - All developers use the exact same environment
- **Reproducibility** - New team members can start coding immediately
- **Zero Setup** - No local installation required
- **Works Anywhere** - Desktop, laptop, tablet - just needs a browser
- **Cloud Resources** - Uses GitHub's servers, not your device

## Configuration Overview

The devcontainer is defined in [`.devcontainer/devcontainer.json`](../.devcontainer/devcontainer.json).

### Base Image

```json
"image": "mcr.microsoft.com/devcontainers/typescript-node:22-bookworm"
```

- **Node.js 22 LTS** - Latest long-term support version
- **Debian Bookworm** - Stable Linux base
- **TypeScript tooling** - Pre-installed TypeScript and dev tools
- **npm/yarn** - Package managers included

**Why Node 22?**
- Required for Firebase Functions v6
- Optimal performance and security patches
- Long-term support until 2027

### Installed Features

```json
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:2": {},
  "ghcr.io/devcontainers/features/github-cli:1": {},
  "ghcr.io/devcontainers/features/java:1": {
    "version": "17",
    "jdkDistro": "ms"
  },
  "ghcr.io/schlich/devcontainer-features/playwright:0": {
    "browsers": "chromium,firefox,webkit"
  }
}
```

#### Docker-in-Docker
Allows running Docker commands inside the container:
- Build Docker images for functions
- Run additional containers for databases or services
- Test multi-container setups

#### GitHub CLI (`gh`)
Pre-installed GitHub command-line tool:
```bash
gh repo clone owner/repo
gh pr create
gh issue list
```

#### Java 17 Runtime
Required for Firebase emulators:
- Firebase emulators run on Java
- Microsoft OpenJDK 17 distribution
- Pre-configured and ready to use

#### Playwright (Testing Framework)
Pre-installed Playwright with browsers:
- **Chromium** - Chrome/Edge testing
- **Firefox** - Firefox testing
- **WebKit** - Safari testing
- System dependencies installed automatically
- No manual browser installation needed

### VS Code Extensions

Automatically installed extensions:

| Extension | Purpose |
|-----------|---------|
| `angular.ng-template` | Angular template IntelliSense and syntax |
| `dbaeumer.vscode-eslint` | JavaScript/TypeScript linting |
| `esbenp.prettier-vscode` | Code formatting |
| `github.copilot` | AI pair programming |
| `github.copilot-chat` | AI chat assistant |
| `automatalabs.copilot-mcp` | Model Context Protocol for Copilot - manage MCP servers |
| `ms-edgedevtools.vscode-edge-devtools` | Edge/Chrome DevTools in VS Code - inspect runtime, debug, view logs |
| `firefox-devtools.vscode-firefox-debug` | Firefox debugger |
| `ms-playwright.playwright` | Playwright test runner and debugger |
| `toba.vsfire` | Firebase explorer and management |
| `PKief.material-icon-theme` | File icons for better navigation |

**Benefit**: All developers have the same coding experience and tooling.

### Editor Settings

```json
"settings": {
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "angular.log": "verbose"
}
```

- **Format on Save** - Automatic code formatting
- **Prettier** - Consistent code style across team
- **Workspace TypeScript** - Uses project's TypeScript version
- **Angular Logging** - Detailed logs for debugging

### Post-Create Command

```json
"postCreateCommand": "npm install -g npm@latest @angular/cli@19 firebase-tools@latest && npm install"
```

Runs automatically after container creation:

1. **Update npm** - Latest npm package manager
2. **Global Angular CLI** - `ng` commands available everywhere (pinned to v19)
3. **Firebase Tools** - Latest `firebase` CLI for emulators and deployment
4. **Install Dependencies** - Workspace and all project packages

### Port Forwarding

```json
"forwardPorts": [4200, 4400, 9099, 8080, 5001, 9199, 8085]
```

Automatically exposes application and emulator ports:

| Port | Service | Auto-Forward Behavior |
|------|---------|----------------------|
| 4200 | Admin App | Notify when opened |
| 4400 | User App | Notify when opened |
| 9099 | Firebase Auth Emulator | Silent |
| 8080 | Firebase Emulator UI | Notify when opened |
| 5001 | Firebase Functions | Silent |
| 9199 | Firebase Storage | Silent |
| 8085 | Firebase Firestore | Silent |

**In GitHub Codespaces**: Ports are automatically forwarded to your browser with HTTPS URLs.

## Using GitHub Codespaces (Recommended)

### Starting a Codespace

1. **Create Codespace**:
   - Go to your repository on GitHub
   - Click **Code** → **Codespaces** → **Create codespace on [branch]**
   - Wait 2-3 minutes for initialization

2. **What Happens Automatically**:
   - Cloud container is created with Node.js 22
   - Angular CLI and Firebase Tools are installed globally
   - All project dependencies are installed (`npm install`)
   - VS Code extensions are loaded
   - Ports are forwarded with HTTPS URLs

3. **Start Developing**:
   ```bash
   npm start                    # Launch admin app
   npm run start:user           # Launch user app
   npm run firebase:emulators   # Start backend
   ```

4. **Access Your Apps**:
   - Click the **Ports** tab in VS Code
   - Click the globe icon next to port 4200 or 4400
   - Opens app in a new browser tab with secure HTTPS URL

### Device Compatibility

**Works on**:
- ✅ **Desktop/Laptop** - Any OS (Windows, Mac, Linux)
- ✅ **Tablet with keyboard** - iPad, Android tablets, Surface
- ✅ **Chromebook** - Full VS Code experience
- ✅ **Any device with a browser** - Even your phone (limited)

**Requirements**:
- Modern web browser (Chrome, Edge, Safari, Firefox)
- Internet connection
- GitHub account

### Development on Tablet

**Perfect for**: iPad Pro, Galaxy Tab, Surface Go with keyboard

1. Open your repository on GitHub in browser
2. Create codespace
3. VS Code opens in browser - full IDE experience
4. Use keyboard shortcuts as normal
5. Terminal, debugging, everything works!

**Tips for tablet development**:
- Use external keyboard for best experience
- Safari on iPad works great
- Split screen: code + preview side-by-side
- All your changes are saved in the cloud

## Alternative: Local Development (Not Recommended)

If you prefer to develop locally without Codespaces:

### Option 1: Node.js Only (Simple)

**Prerequisites**: Node.js 22 LTS installed locally

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Start developing
npm start
npm run firebase:emulators
```

**Pros**: Simple, no Docker needed
**Cons**: 
- Manual Node.js installation
- Environment inconsistencies across team
- No automatic port forwarding

### Option 2: Docker Desktop (Advanced)

**Only recommended if**:
- You're offline frequently
- You have specific local development needs
- Your organization requires local development

**Prerequisites**:
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop) (~500MB)
- Install [VS Code](https://code.visualstudio.com/)
- Install [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

**Resource Usage**:
- Docker Desktop: ~1GB disk space
- Running container: 2-4GB RAM
- Node modules: ~500MB disk

**Setup**:
1. Open project in VS Code
2. Press `F1` → **Dev Containers: Reopen in Container**
3. Wait for container to build (5-10 minutes first time)

**Note**: This uses your laptop's resources. Codespaces is recommended instead.

## Customizing the DevContainer

### Add System Packages

If you need additional Linux tools:

```json
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:2": {},
  "ghcr.io/devcontainers/features/github-cli:1": {},
  "ghcr.io/devcontainers/features/azure-cli:1": {}  // Example
}
```

Or run commands in `postCreateCommand`:
```json
"postCreateCommand": "sudo apt-get update && sudo apt-get install -y imagemagick && npm install -g @angular/cli@19 firebase-tools && npm install"
```

### Add VS Code Extensions

```json
"extensions": [
  "angular.ng-template",
  "dbaeumer.vscode-eslint",
  "your-publisher.your-extension"  // Add here
]
```

### Change Node Version

To use a different Node version, change the image:
```json
"image": "mcr.microsoft.com/devcontainers/typescript-node:20-bookworm"  // Node 20
```

**Note**: Firebase Functions v6 requires Node 18, 20, or 22. Don't go below Node 18.

### Add Environment Variables

```json
"containerEnv": {
  "NODE_ENV": "development",
  "FIREBASE_EMULATOR_HUB": "localhost:4400"
}
```

## Troubleshooting

### Container Won't Build

**Error**: "Failed to pull image"
- **Solution**: Check Docker is running, or wait and retry in Codespaces

**Error**: "EACCES: permission denied"
- **Solution**: Make sure you're using the `node` user (default in config)

### Extensions Not Loading

- **Solution**: Rebuild container (`F1` → **Dev Containers: Rebuild Container**)

### Ports Not Accessible in Codespaces

1. Go to **Ports** tab in VS Code
2. Find the port (e.g., 4200)
3. Right-click → Change Port Visibility → **Public**
4. Click globe icon to open in browser

**On tablet**: Sometimes the forwarded URL doesn't open automatically - copy the URL from the Ports tab and paste in Safari/Chrome

### Slow Performance

- **Codespaces**: Upgrade to a more powerful machine type
- **VS Code Desktop**: Allocate more resources to Docker Desktop

## Best Practices

1. **Commit devcontainer changes** - All team members benefit from improvements
2. **Pin critical versions** - Use specific versions for Angular CLI (`@angular/cli@19`), but `@latest` is fine for supporting tools (npm, firebase-tools) to get security updates
3. **Keep it minimal** - Only install what's truly needed
4. **Document custom changes** - Update this guide when modifying the config
5. **Test in Codespaces** - Verify changes work in the cloud environment
6. **Leverage features** - Use official devcontainer features instead of manual installs (like the Playwright feature)

## Testing with Playwright

The devcontainer includes the **Playwright devcontainer feature** which:
- Pre-installs Chromium, Firefox, and WebKit browsers
- Installs all system dependencies for running tests
- Works seamlessly in Codespaces (headless mode)
- Enables test debugging with the Playwright extension

### Running E2E Tests in Codespaces

```bash
# Run all admin tests (headless)
npm run test:e2e:admin

# Run all user app tests
npm run test:e2e:user

# Interactive UI mode (may not work in browser-based Codespaces)
npm run test:e2e:ui

# Debug mode with headed browser (local only)
npm run test:e2e:headed
```

### Using Playwright VS Code Extension

The `ms-playwright.playwright` extension provides:
- **Test Explorer** - Visual test tree in sidebar
- **Run/Debug Tests** - Click-to-run individual tests
- **Test Recording** - Record interactions as test code
- **Pick Locator** - Click UI elements to generate selectors

**Access**: View → Testing (or click the beaker icon in Activity Bar)

For more details, see [Testing Documentation](testing/README.md).

## Debugging with Browser DevTools and Copilot

The devcontainer includes **Microsoft Edge Tools** and **Copilot MCP** integration for advanced debugging workflows.

### Using Edge DevTools in VS Code

The `ms-edgedevtools.vscode-edge-devtools` extension brings browser DevTools directly into VS Code:

**Features:**
- **Elements Panel** - Inspect and modify runtime HTML/CSS
- **Console** - View JavaScript logs, errors, and warnings
- **Network Panel** - Monitor HTTP requests and responses
- **Sources** - Debug JavaScript with breakpoints
- **Real-time Updates** - Changes reflect immediately in browser

**Usage:**
1. Start your app: `npm start` (admin on port 4200)
2. Press `F1` → **Edge DevTools: Open DevTools Tab**
3. Enter URL: `http://localhost:4200`
4. DevTools panel opens in VS Code

**Benefits for tablet users:**
- Debug without switching between browser and editor
- All tools in one interface
- Console logs stay visible while coding

### Copilot with Browser Logs (MCP Integration)

The `automatalabs.copilot-mcp` extension enables Model Context Protocol servers, allowing Copilot to access browser context:

**What it enables:**
- Copilot can read console errors and warnings
- Share browser logs directly in Copilot chat
- Context-aware debugging suggestions
- Automatic error analysis from browser console

**Usage:**
1. Open Edge DevTools in VS Code (see above)
2. Open Copilot Chat (`Ctrl+I` or `Cmd+I`)
3. Console errors are automatically available to Copilot
4. Ask questions like:
   - "Why is this console error occurring?"
   - "Fix the TypeError in the console"
   - "Explain this network request failure"

**Example workflow:**
```
1. See error in Edge DevTools Console: "Cannot read property 'id' of undefined"
2. Open Copilot Chat
3. Type: "@terminal explain this error" (Copilot sees console context)
4. Get immediate explanation with suggested fix
5. Apply fix without leaving VS Code
```

**MCP Server Management:**
- View → Command Palette → **MCP: Manage Servers**
- Install additional MCP servers for enhanced capabilities
- Connect external tools (databases, APIs) to Copilot context

This integration is especially valuable when debugging complex Angular applications where runtime errors need immediate analysis.

## Advanced: Multiple Devcontainers

For projects with different needs (e.g., separate backend container), create:
```
.devcontainer/
├── devcontainer.json          # Default
├── frontend/
│   └── devcontainer.json      # Frontend-specific
└── backend/
    └── devcontainer.json      # Backend-specific
```

Users can choose which to use when opening the project.

## Resources

- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces Docs](https://docs.github.com/en/codespaces)
- [DevContainer Features](https://containers.dev/features)
- [DevContainer Images](https://mcr.microsoft.com/en-us/catalog?search=devcontainers)

---

**Questions?** Contact the Novus Apps DevOps team.
