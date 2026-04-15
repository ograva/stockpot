# Documentation Index

Welcome to the Novus Flexy documentation. This folder contains comprehensive guides for working with the Angular monorepo workspace and Firebase backend.

## 📖 Documentation Files

### Getting Started
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - First-time setup, branding, and customization guide
  - Update project names and titles
  - Replace logos and favicons
  - Configure Firebase projects
  - Setup shared environments
  - Customize theme colors
  - Update navigation menus

### Development Environment
- **[DEVCONTAINER.md](DEVCONTAINER.md)** - DevContainer configuration explained
  - What is a devcontainer and why use it
  - Node.js 22 environment setup
  - VS Code extensions and settings
  - Port forwarding configuration
  - Using with GitHub Codespaces
  - Customizing the devcontainer

### Dependency Management
- **[DEPENDENCY_MANAGEMENT.md](DEPENDENCY_MANAGEMENT.md)** - Managing npm packages in the monorepo
  - Understanding workspace dependencies
  - Installing packages for frontend apps
  - Installing packages for Firebase Functions
  - Handling peer dependencies
  - Sharing code between apps
  - Troubleshooting package issues

### Firebase Development
- **[FIREBASE_EMULATORS.md](FIREBASE_EMULATORS.md)** - Local backend development with emulators
  - Starting and using Firebase emulators
  - Emulator UI walkthrough
  - Connecting apps to emulators
  - Seeding test data
  - Debugging functions locally
  - Production vs emulator configuration

## 🏗️ Architecture Documentation

### Workspace Structure
See [WORKSPACE_SETUP.md](../WORKSPACE_SETUP.md) in the project root for:
- Angular workspace architecture
- Multi-app project structure
- Firebase integration details
- Build and deployment configurations

### Environments
See [environments/README.md](../environments/README.md) for:
- Shared Firebase configuration
- Environment file structure
- Switching between environments
- Security best practices

## 🚀 Quick Navigation

### For New Developers
1. Read [GETTING_STARTED.md](GETTING_STARTED.md) first
2. Understand the [DEVCONTAINER.md](DEVCONTAINER.md) setup
3. Learn [FIREBASE_EMULATORS.md](FIREBASE_EMULATORS.md) for backend development

### For Package Management
- Installing dependencies: [DEPENDENCY_MANAGEMENT.md](DEPENDENCY_MANAGEMENT.md)
- Understanding workspace structure: [WORKSPACE_SETUP.md](../WORKSPACE_SETUP.md)

### For Firebase Development
1. Setup environments: [environments/README.md](../environments/README.md)
2. Use emulators: [FIREBASE_EMULATORS.md](FIREBASE_EMULATORS.md)
3. Customize your app: [GETTING_STARTED.md](GETTING_STARTED.md)

## 📚 Additional Resources

### Project Files
- [README.md](../README.md) - Main project README with quick start
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - AI coding guidelines
- [angular.json](../angular.json) - Workspace configuration
- [firebase.json](../firebase.json) - Firebase project configuration
- [package.json](../package.json) - Root dependencies and scripts

### External Documentation
- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces](https://docs.github.com/en/codespaces)

## 🆘 Getting Help

If you encounter issues not covered in these guides:

1. **Check the troubleshooting sections** in each guide
2. **Search the documentation** - Use Ctrl+F to find keywords
3. **Review example code** in the guides
4. **Contact the Novus Apps team** - Reach out to your project lead

## 🔄 Keeping Documentation Updated

This documentation should evolve with the project. When you:
- Add new features or tools
- Change configuration or architecture
- Discover better practices
- Fix common issues

**Please update the relevant documentation files** so the next developer benefits from your experience.

## 📝 Documentation Guidelines

When updating docs:
- Use clear, concise language
- Include code examples
- Add troubleshooting sections
- Link between related documents
- Keep formatting consistent
- Test instructions by following them

---

**Built with ❤️ by Novus Apps**
