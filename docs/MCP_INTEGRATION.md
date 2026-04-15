# Model Context Protocol (MCP) Integration Guide

This guide explains how to use Model Context Protocol (MCP) integration in Novus Flexy to enhance your development workflow with GitHub Copilot.

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). In our setup, MCP enables GitHub Copilot to access real-time information from:

- Browser console logs and errors
- Network requests and responses
- Runtime application state
- Local development tools (Firebase, databases, APIs)
- File system changes
- Terminal output

This means Copilot can provide **context-aware suggestions** based on what's actually happening in your application, not just the code you've written.

## Setup in DevContainer

The devcontainer includes two key extensions for MCP integration:

### 1. Copilot MCP Extension

**Extension ID**: `automatalabs.copilot-mcp`

**What it does:**
- Manages Model Context Protocol servers
- Connects external tools to Copilot's context
- Enables context-aware code suggestions
- Provides marketplace for installing MCP servers

**Auto-installed**: Yes (included in devcontainer)

### 2. Microsoft Edge DevTools

**Extension ID**: `ms-edgedevtools.vscode-edge-devtools`

**What it does:**
- Embeds browser DevTools directly in VS Code
- Provides Elements, Console, Network, Sources panels
- Exposes browser context to MCP-enabled tools
- Enables debugging without leaving editor

**Auto-installed**: Yes (included in devcontainer)

## Getting Started

### Step 1: Open Your Application with DevTools

1. **Start your development server:**
   ```bash
   npm start              # Admin app on port 4200
   # or
   npm run start:user     # User app on port 4400
   ```

2. **Open Edge DevTools in VS Code:**
   - Press `F1` (or `Cmd+Shift+P` on Mac)
   - Type: **Edge DevTools: Open DevTools Tab**
   - Enter your app URL: `http://localhost:4200`
   - DevTools panel appears in VS Code

3. **Dock DevTools for best workflow:**
   - Drag the DevTools tab to the side panel
   - Split it with your editor
   - Now you can code and debug simultaneously

### Step 2: Enable Copilot Chat

1. **Open Copilot Chat:**
   - Press `Ctrl+I` (or `Cmd+I` on Mac)
   - Or click the chat icon in the sidebar
   - Or use the inline chat with `Ctrl+Shift+I`

2. **Verify MCP connection:**
   - In Copilot Chat, type: `@workspace what errors do you see?`
   - Copilot should reference console logs if any exist

## Common Usage Patterns

### Pattern 1: Debugging Runtime Errors

**Scenario**: You see an error in the browser console

**Workflow:**
```
1. Error appears in Edge DevTools Console:
   "TypeError: Cannot read property 'id' of undefined at user.component.ts:42"

2. Open Copilot Chat (Ctrl+I)

3. Ask context-aware question:
   "Fix the TypeError on line 42"
   
4. Copilot sees:
   - The error message from console
   - The file and line number
   - Surrounding code context
   - Stack trace if available

5. Get immediate fix:
   "The error occurs because user might be null. Use optional chaining:
    const id = user?.id ?? 'default-id';"

6. Apply fix with one click
```

**Without MCP**: You'd need to copy the error, paste it in chat, explain context
**With MCP**: Copilot already sees everything and provides contextual fixes

### Pattern 2: Network Request Debugging

**Scenario**: API call is failing

**Workflow:**
```
1. See failed request in Network panel:
   GET /api/users → 404 Not Found

2. Ask Copilot:
   "Why is the /api/users endpoint returning 404?"

3. Copilot analyzes:
   - Request URL and method
   - Response status and body
   - Request headers
   - Firebase emulator configuration

4. Get suggestion:
   "The endpoint should be /api/v1/users based on your Firebase 
    Functions configuration. Update the service file."

5. Navigate to service file and apply fix
```

### Pattern 3: Performance Issues

**Scenario**: Component is slow or causing re-renders

**Workflow:**
```
1. See console warnings:
   "Angular detected excessive change detection cycles"

2. Performance tab shows slow component

3. Ask Copilot:
   "Optimize this component's change detection"

4. Copilot sees:
   - Console performance warnings
   - Component code
   - Change detection strategy

5. Get optimization suggestions:
   - Use OnPush strategy
   - Implement trackBy functions
   - Memoize computed values
```

### Pattern 4: TypeScript Type Errors

**Scenario**: Type error in browser but IDE doesn't show it

**Workflow:**
```
1. Console shows:
   "Type '{ name: string; }' is not assignable to type 'User'"

2. Ask Copilot:
   "Fix this type mismatch"

3. Copilot sees:
   - The actual runtime type error
   - Your User interface definition
   - The problematic assignment

4. Get precise fix:
   "Your User interface is missing the 'email' property. 
    Either add it to the interface or update the object."
```

## Managing MCP Servers

### Installing Additional MCP Servers

The Copilot MCP extension provides a marketplace for MCP servers:

1. **Open MCP Manager:**
   - Press `F1` → **MCP: Manage Servers**
   - Or open Command Palette and search "MCP"

2. **Browse Available Servers:**
   - Firebase MCP Server - Firestore queries and Firebase admin
   - PostgreSQL MCP Server - Database queries
   - Filesystem MCP Server - File operations
   - Git MCP Server - Repository operations
   - Browser MCP Server - Web automation

3. **Install a Server:**
   - Click "Install" next to desired server
   - Configure connection settings
   - Restart VS Code if needed

### Recommended MCP Servers for This Project

#### 1. Firebase MCP Server

**Purpose**: Query Firestore, manage users, test Cloud Functions

**Installation:**
```bash
# Install via MCP Manager
# Or manually via npm
npm install -g @modelcontextprotocol/server-firebase
```

**Configuration:**
```json
{
  "mcpServers": {
    "firebase": {
      "command": "firebase-mcp-server",
      "args": ["--project", "your-project-id"],
      "env": {
        "FIREBASE_CONFIG": "./firebase.json"
      }
    }
  }
}
```

**Usage with Copilot:**
```
"Query users collection where role = admin"
"Create a test user in Firestore"
"Show me the schema of the orders collection"
```

#### 2. Browser Automation MCP Server

**Purpose**: Automated testing, UI interactions, screenshot capture

**Installation:**
```bash
npm install -g @modelcontextprotocol/server-browser
```

**Usage with Copilot:**
```
"Navigate to the login page and take a screenshot"
"Click the submit button and show me the response"
"Fill the form with test data and submit"
```

#### 3. Filesystem MCP Server

**Purpose**: File operations, searching codebase, analyzing structure

**Installation:**
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

**Usage with Copilot:**
```
"Find all files that import UserService"
"Show me the structure of the components folder"
"Read and summarize the testing documentation"
```

## Advanced Workflows

### Workflow 1: Test-Driven Development with MCP

```
1. Write a test in Playwright:
   test('should login successfully', async ({ page }) => {
     // Test code
   });

2. Run test and see failure in terminal

3. Ask Copilot:
   "@terminal fix the failing test"

4. Copilot sees:
   - Test code
   - Test failure output from terminal
   - Component implementation
   - Console errors from test run

5. Get comprehensive fix addressing all issues
```

### Workflow 2: Firebase Emulator Debugging

```
1. Start Firebase emulators:
   npm run firebase:emulators

2. See error in emulator logs

3. Edge DevTools shows client-side error

4. Ask Copilot:
   "Debug this Firebase authentication error"

5. Copilot analyzes:
   - Client-side error from DevTools
   - Emulator logs from terminal
   - Firebase configuration
   - Security rules

6. Get full solution including:
   - Client code fix
   - Security rule update
   - Configuration change
```

### Workflow 3: Angular Build Error Resolution

```
1. Run build:
   npm run build:admin

2. Build fails with TypeScript errors

3. Ask Copilot:
   "@terminal fix these build errors"

4. Copilot sees:
   - Build output with all errors
   - Affected files
   - Type definitions

5. Get batch fixes for all errors at once
```

## Best Practices

### 1. Keep DevTools Open While Developing

- Split your screen: Code on left, DevTools on right
- Monitor console for warnings/errors
- Watch network requests to API
- Copilot has more context = better suggestions

### 2. Use Specific Context References

Instead of:
```
"Fix this error"
```

Use:
```
"@terminal fix the TypeScript error in the terminal"
"Fix the console error in DevTools"
"@workspace explain this network failure"
```

### 3. Combine Multiple Context Sources

```
"@workspace @terminal The build is failing and there's a console 
error. What's the root cause?"
```

Copilot will analyze:
- Your workspace files
- Terminal output (build errors)
- Browser console (runtime errors)
- Provide unified solution

### 4. Leverage Chat Participants

- `@workspace` - Workspace context (files, structure)
- `@terminal` - Terminal output and commands
- `@vscode` - VS Code settings and configuration

### 5. Share Screenshots with Copilot

When visual debugging is needed:
1. Take screenshot in DevTools
2. Drag image into Copilot Chat
3. Ask: "What's wrong with this UI?"
4. Copilot analyzes visual issues

## Troubleshooting

### MCP Server Not Connecting

**Symptom**: Copilot doesn't see DevTools context

**Solutions:**
1. Restart VS Code
2. Reload window: `F1` → **Developer: Reload Window**
3. Check MCP extension is enabled: `F1` → **Extensions**
4. Verify DevTools tab is open and active

### DevTools Not Showing Console Logs

**Symptom**: Console is empty but app has errors

**Solutions:**
1. Ensure app is running: `npm start`
2. Refresh the DevTools browser view
3. Check Console filter settings (All levels selected)
4. Clear console and reproduce the issue

### Copilot Not Using Browser Context

**Symptom**: Copilot suggests generic fixes without console context

**Solutions:**
1. Make sure to mention "console" or "DevTools" in your question
2. Use `@workspace` to include broader context
3. Reference specific errors: "Fix the TypeError in console"
4. Keep DevTools panel in focus/visible

### MCP Server Installation Fails

**Symptom**: Cannot install MCP servers from marketplace

**Solutions:**
1. Check internet connection in Codespaces
2. Update npm: `npm install -g npm@latest`
3. Clear npm cache: `npm cache clean --force`
4. Install manually: `npm install -g @modelcontextprotocol/server-name`

## Performance Considerations

### MCP Server Resource Usage

- Each MCP server runs as a separate process
- Typical memory usage: 50-100MB per server
- CPU impact: Minimal during idle, moderate during queries
- Codespaces has sufficient resources for 5-10 active servers

### Optimizing Performance

1. **Only enable needed servers:**
   - Disable unused MCP servers in settings
   - Keep only 3-5 active at a time

2. **Use filtered context:**
   - Don't send entire codebase to Copilot
   - Use `@workspace /file` for specific files
   - Reference specific lines when possible

3. **Restart servers periodically:**
   - MCP servers can accumulate memory
   - Restart VS Code weekly
   - Or: `F1` → **MCP: Restart All Servers**

## Security Considerations

### Data Privacy

- **MCP servers run locally** in your Codespace/DevContainer
- Console logs stay in your environment
- No external data transmission (except to OpenAI/Anthropic for Copilot)
- Firebase emulator data never leaves your container

### Sensitive Information

⚠️ **Important**: MCP shares context with Copilot

**Best practices:**
1. Don't log sensitive data (passwords, tokens) to console
2. Use environment variables for secrets
3. Review what context you're sharing with Copilot
4. Don't paste production credentials in code

### Recommended Approach

```typescript
// ❌ BAD: Logs sensitive data
console.log('API Key:', process.env.API_KEY);

// ✅ GOOD: Logs safely
console.log('API Key configured:', !!process.env.API_KEY);
```

## Learning Resources

### Official Documentation

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [Copilot MCP Extension Docs](https://marketplace.visualstudio.com/items?itemName=automatalabs.copilot-mcp)

### Community Resources

- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)
- [Building Custom MCP Servers](https://modelcontextprotocol.io/docs/building-servers)
- [MCP Discord Community](https://discord.gg/modelcontextprotocol)

### Example MCP Servers

- [Filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [Git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)
- [Browser](https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer)
- [PostgreSQL](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)

## Summary

**MCP transforms Copilot from code autocomplete to intelligent debugging assistant:**

| Without MCP | With MCP |
|-------------|----------|
| Suggests code based on files | Suggests fixes based on runtime behavior |
| Generic error handling | Specific fix for your console error |
| Copy/paste error messages | Copilot sees errors automatically |
| Limited context window | Full app context (console, network, files) |
| Separate debugging workflow | Integrated debugging with AI assistance |

**Key takeaway**: Keep DevTools open, ask specific questions, and let Copilot's MCP integration provide context-aware solutions to your real-time development challenges.

---

**Next Steps:**
1. Start your app: `npm start`
2. Open DevTools: `F1` → **Edge DevTools: Open DevTools Tab**
3. Start coding and debugging with AI assistance! 🚀
