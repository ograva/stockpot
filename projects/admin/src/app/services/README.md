# Services

This directory contains Angular services used throughout the application.

## Available Services

### CoreService (`core.service.ts`)
Manages application-wide settings using Angular signals for reactive state management.

### NavService (`nav.service.ts`)
Handles navigation state tracking across the application.

### DataShareService (`data-share.service.ts`)
**Secure data sharing between components without URL query parameters.**

A service for securely passing data between Angular components without exposing information in URL query parameters. This service provides a safer alternative to traditional query parameter navigation.

#### Key Features
- ✅ In-memory storage (default)
- ✅ localStorage support (optional)
- ✅ Consume-once pattern (automatic cleanup)
- ✅ Persistent storage option
- ✅ TTL (time-to-live) support
- ✅ Type-safe API with TypeScript generics
- ✅ Automatic cleanup of expired data

#### Quick Example
```typescript
// Component A - Store data
this.dataShare.set('userData', { id: 123, name: 'John' });
this.router.navigate(['/profile']);

// Component B - Retrieve data (auto-removed after retrieval)
const userData = this.dataShare.get<User>('userData');
```

#### Security Benefits
- No sensitive data in URLs
- No data exposure in browser history
- Prevents data leakage through referrer headers
- No risk of data persistence in bookmarks/shared links

#### Full Documentation
See [DATASHARE_USAGE.md](../../../DATASHARE_USAGE.md) in the project root for comprehensive examples and usage patterns.

#### Unit Tests
The service includes 43 comprehensive unit tests covering all functionality, edge cases, and error scenarios. See `data-share.service.spec.ts`.
