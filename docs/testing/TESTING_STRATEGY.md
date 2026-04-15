# Testing Strategy

This document outlines the comprehensive testing strategy for the Novus Flexy monorepo.

## Philosophy: Build with Testing in Mind

Every feature in this project is developed with **testability as a first-class concern**. This means:

1. **Design for Testability** - Components are structured to be easily testable
2. **Test Data Attributes** - All interactive elements include `data-test-id` attributes
3. **Automated Testing** - Tests run automatically in CI/CD pipelines
4. **Environment Safety** - Production is protected from test execution
5. **Living Documentation** - Tests serve as executable documentation

## Testing Pyramid

```
        /\
       /  \
      /E2E \    ← Few, high-value user flow tests
     /------\
    /        \
   / Integration\ ← API and service integration tests
  /------------\
 /              \
/__Unit Tests___\ ← Many, fast, focused tests
```

### Test Types

| Type | Tool | Scope | Speed | Count |
|------|------|-------|-------|-------|
| **Unit** | Jasmine/Karma | Single component/service | Fast | Many (70%) |
| **Integration** | Jasmine | Multiple services | Medium | Some (20%) |
| **E2E** | Playwright | Full user flows | Slow | Few (10%) |

## Unit Testing Strategy

### What to Unit Test

✅ **DO test:**
- Component logic (methods, calculations)
- Service functions and state management
- Pipes and utility functions
- Form validation logic
- Angular signals and reactive state

❌ **DON'T test:**
- Angular framework features (routing, HTTP client)
- Third-party library internals
- CSS styling (use visual regression instead)
- Simple getters/setters with no logic

### Unit Test Structure

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch user by ID', () => {
    const mockUser = { id: '123', name: 'Test User' };
    
    service.getUser('123').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/users/123');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### Mocking Firebase Services

```typescript
// Mock Firestore
const mockFirestore = {
  collection: jasmine.createSpy('collection').and.returnValue({
    doc: jasmine.createSpy('doc').and.returnValue({
      get: () => Promise.resolve({ data: () => mockData })
    })
  })
};

TestBed.configureTestingModule({
  providers: [
    { provide: Firestore, useValue: mockFirestore }
  ]
});
```

## E2E Testing Strategy

### What to E2E Test

✅ **DO test:**
- Critical user journeys (login, checkout, etc.)
- Cross-page workflows
- Authentication flows
- Data persistence across sessions
- Integration with Firebase backend

❌ **DON'T test:**
- Every possible UI variation
- Unit-level logic (covered by unit tests)
- CSS styling details
- Individual form field validation (test at unit level)

### E2E Test Organization

Tests are organized by **user flows**, not by technical structure:

```
e2e/
├── admin/
│   └── flows/
│       ├── authentication/
│       │   ├── T001-login.spec.ts
│       │   ├── T002-logout.spec.ts
│       │   └── T003-password-reset.spec.ts
│       ├── user-management/
│       │   ├── T010-create-user.spec.ts
│       │   ├── T011-edit-user.spec.ts
│       │   └── T012-delete-user.spec.ts
│       └── dashboard/
│           └── T020-view-dashboard.spec.ts
└── user-app/
    └── flows/
        ├── onboarding/
        │   └── T500-first-time-setup.spec.ts
        └── profile/
            └── T510-edit-profile.spec.ts
```

### E2E Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('T001: User Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
  });

  test('T001.1: should login with valid credentials', async ({ page }) => {
    // Arrange - Use test data attributes
    await page.locator('[data-test-id="email-input"]').fill('admin@test.com');
    await page.locator('[data-test-id="password-input"]').fill('password123');
    
    // Act
    await page.locator('[data-test-id="login-submit-button"]').click();
    
    // Assert
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-test-id="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-test-id="user-name"]')).toContainText('Admin User');
  });

  test('T001.2: should show error for invalid credentials', async ({ page }) => {
    await page.locator('[data-test-id="email-input"]').fill('wrong@test.com');
    await page.locator('[data-test-id="password-input"]').fill('wrongpass');
    await page.locator('[data-test-id="login-submit-button"]').click();
    
    await expect(page.locator('[data-test-id="error-message"]')).toBeVisible();
    await expect(page.locator('[data-test-id="error-message"]'))
      .toContainText('Invalid credentials');
  });

  test('T001.3: should validate required fields', async ({ page }) => {
    await page.locator('[data-test-id="login-submit-button"]').click();
    
    await expect(page.locator('[data-test-id="email-error"]')).toBeVisible();
    await expect(page.locator('[data-test-id="password-error"]')).toBeVisible();
  });
});
```

## Test Data Attributes

### Mandatory Convention

**EVERY interactive element MUST have a `data-test-id` attribute:**

```typescript
@Component({
  template: `
    <form data-test-id="login-form">
      <mat-form-field>
        <input 
          data-test-id="email-input"
          matInput 
          type="email" 
          [(ngModel)]="email"
          required>
      </mat-form-field>
      
      <mat-form-field>
        <input 
          data-test-id="password-input"
          matInput 
          type="password" 
          [(ngModel)]="password"
          required>
      </mat-form-field>
      
      <button 
        data-test-id="login-submit-button"
        mat-raised-button 
        (click)="login()">
        Login
      </button>
      
      <div 
        *ngIf="errorMessage" 
        data-test-id="error-message">
        {{ errorMessage }}
      </div>
    </form>
  `
})
export class LoginComponent { }
```

### Naming Convention

See [DATA_TEST_IDS.md](DATA_TEST_IDS.md) for complete guidelines.

## Environment Safety

### Configuration Enforcement

E2E tests are configured to **never run on production**:

```typescript
// playwright.config.ts
const TEST_ENV = process.env.TEST_ENV || 'local';

if (TEST_ENV === 'production') {
  throw new Error(
    '❌ E2E tests cannot run on production environment!\n' +
    'Use TEST_ENV=local or TEST_ENV=staging instead.'
  );
}

const baseURL = {
  local: 'http://localhost:4200',
  staging: 'https://staging.example.com',
}[TEST_ENV];
```

### Environment Variables

```bash
# Local development (default)
TEST_ENV=local npm run test:e2e

# Staging environment
TEST_ENV=staging npm run test:e2e

# Production (will throw error)
TEST_ENV=production npm run test:e2e  # ❌ Blocked!
```

## Test Data Management

### Fixtures

Store reusable test data in fixtures:

```typescript
// e2e/shared/fixtures/users.json
{
  "admin": {
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  },
  "user": {
    "email": "user@test.com",
    "password": "password123",
    "role": "user"
  }
}
```

Usage:
```typescript
import users from '../shared/fixtures/users.json';

test('should login as admin', async ({ page }) => {
  await page.locator('[data-test-id="email-input"]').fill(users.admin.email);
  await page.locator('[data-test-id="password-input"]').fill(users.admin.password);
  // ...
});
```

### Test Database Seeding

For Firebase emulator tests:

```typescript
// e2e/shared/helpers/seed-data.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export async function seedTestData() {
  const app = initializeApp({ projectId: 'demo-project' });
  const db = getFirestore(app);
  
  // Add test users
  await addDoc(collection(db, 'users'), {
    email: 'admin@test.com',
    role: 'admin',
    name: 'Admin User'
  });
  
  // Add test data...
}
```

## Coverage Goals

### Target Metrics

- **Unit Test Coverage**: 80%+ overall, 90%+ for critical services
- **E2E Test Coverage**: 100% of critical user flows
- **Branch Coverage**: 75%+ for complex logic

### Measuring Coverage

```bash
# Generate coverage report
npm test -- --code-coverage

# View report
open coverage/index.html
```

### Coverage Thresholds

```json
// karma.conf.js
coverageReporter: {
  type: 'html',
  dir: require('path').join(__dirname, './coverage/'),
  check: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm test -- --watch=false --browsers=ChromeHeadless

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Start Firebase Emulators
        run: npm run firebase:emulators &
      - name: Run E2E Tests
        run: npm run test:e2e
        env:
          TEST_ENV: local
```

## Test Maintenance

### Regular Tasks

- **Weekly**: Review failing tests, update selectors if UI changed
- **Monthly**: Review test coverage, identify gaps
- **Quarterly**: Audit test suite performance, remove redundant tests

### Updating Tests for UI Changes

When UI changes:
1. Update `data-test-id` attributes if elements are renamed
2. Run tests locally to verify
3. Update [TEST_REGISTRY.md](TEST_REGISTRY.md) if test changes

### Handling Flaky Tests

If a test is flaky:
1. Add explicit waits for async operations
2. Use `waitFor` assertions instead of fixed timeouts
3. Check for race conditions
4. If still flaky, mark with `.skip()` and file a bug

## Best Practices

### DO:
- ✅ Write tests before or alongside features
- ✅ Use `data-test-id` for all selectors
- ✅ Make tests independent (no test depends on another)
- ✅ Clean up test data after each test
- ✅ Use descriptive test names
- ✅ Test one thing per test

### DON'T:
- ❌ Use CSS classes or IDs for selectors (they change)
- ❌ Hard-code timeouts (use `waitFor` instead)
- ❌ Test implementation details (test behavior)
- ❌ Share state between tests
- ❌ Run E2E tests on production
- ❌ Skip writing tests ("I'll add them later")

## Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Test Numbering System](TEST_REGISTRY.md)
- [Test Data ID Convention](DATA_TEST_IDS.md)

---

**Remember**: Every line of code you write should be testable. If it's hard to test, it's probably hard to maintain.
