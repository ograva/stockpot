# Testing Documentation Index

Welcome to the Novus Flexy testing documentation. This folder contains comprehensive guides for implementing and maintaining tests across the monorepo.

## 📚 Documentation Files

### Core Testing Guides
- **[TESTING_STRATEGY.md](TESTING_STRATEGY.md)** - Overall testing philosophy and approach
- **[PLAYWRIGHT_SETUP.md](PLAYWRIGHT_SETUP.md)** - Setting up and configuring Playwright
- **[RUNNING_TESTS.md](RUNNING_TESTS.md)** - How to run, debug, and interpret test results
- **[TEST_REGISTRY.md](TEST_REGISTRY.md)** - Complete registry of all E2E tests
- **[WRITING_TESTS.md](WRITING_TESTS.md)** - Best practices for writing effective tests
- **[DATA_TEST_IDS.md](DATA_TEST_IDS.md)** - Convention for test ID attributes

## 🎯 Testing Philosophy

**Build with Testing in Mind** - Every feature is designed for testability from the start.

### Key Principles

1. **Test Data Attributes** - All interactive elements have `data-test-id` attributes
2. **User Flow Organization** - Tests organized by user journeys, not technical structure
3. **Environment Safety** - E2E tests never run on production
4. **Test Registry** - Numbered catalog of all tests for easy reference
5. **CI/CD Integration** - Automated testing in deployment pipeline

## 🚀 Quick Start

### Running Tests

```bash
# Unit tests (Jasmine/Karma)
npm test

# E2E tests - Admin app (with emulators)
npm run test:e2e:admin

# E2E tests - User app
npm run test:e2e:user

# All tests
npm run test:all
```

### Before Writing a Test

1. Check [TEST_REGISTRY.md](TEST_REGISTRY.md) for existing tests
2. Assign a test number using the numbering system
3. Ensure all elements have `data-test-id` attributes
4. Follow naming conventions in [DATA_TEST_IDS.md](DATA_TEST_IDS.md)

## 📖 Test Organization

### Unit Tests

Located alongside components:
```
projects/admin/src/app/
├── components/
│   └── user-card/
│       ├── user-card.component.ts
│       └── user-card.component.spec.ts  ← Unit test
```

### E2E Tests

Organized by user flows:
```
e2e/
├── admin/
│   └── flows/
│       ├── authentication/
│       │   ├── T001-login.spec.ts
│       │   └── T002-registration.spec.ts
│       └── user-management/
│           └── T010-create-user.spec.ts
├── user-app/
│   └── flows/
│       └── onboarding/
│           └── T500-initial-setup.spec.ts
└── shared/
    ├── fixtures/
    └── helpers/
```

## 🔢 Test Numbering System

Tests are assigned numbers for easy tracking:

| Range | Category |
|-------|----------|
| T000-T099 | Authentication & Authorization |
| T100-T199 | User Management |
| T200-T299 | Dashboard & Analytics |
| T300-T399 | Content Management |
| T400-T499 | Settings & Configuration |
| T500-T599 | User App Flows |
| T900-T999 | Edge Cases & Error Handling |

See [TEST_REGISTRY.md](TEST_REGISTRY.md) for the complete list.

## 🛡️ Environment Safety

E2E tests can only run on:
- ✅ **Local development** (with Firebase emulators)
- ✅ **Staging environment**
- ❌ **Production** (blocked by configuration)

Configuration in `playwright.config.ts` enforces this rule.

## 📝 Test Data Attributes

### Naming Convention

Format: `[page/feature]-[element-type]-[action/purpose]`

**Examples:**
```html
<!-- Good -->
<button data-test-id="login-submit-button">Login</button>
<input data-test-id="email-input" type="email" />
<div data-test-id="user-card-123">User Info</div>

<!-- Bad -->
<button>Login</button>  ❌ No test ID
<input id="email">      ❌ Using id instead of data-test-id
```

See [DATA_TEST_IDS.md](DATA_TEST_IDS.md) for complete guidelines.

## 🔧 CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Pre-deployment checks

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run firebase:emulators &
    npm run test:e2e:admin
    npm run test:e2e:user
```

## 📊 Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **E2E Tests**: All critical user flows covered
- **Test Documentation**: Every test registered and documented

## 🆘 Troubleshooting

### Common Issues

**Playwright browser not found**
```bash
npx playwright install
sudo npx playwright install-deps
```

**Tests failing with Firebase errors**
```bash
# Ensure emulators are running
npm run firebase:emulators
```

**Selector not found**
- Verify element has `data-test-id` attribute
- Check spelling and format of test ID
- Ensure element is visible when test runs

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)

## 🔄 Keeping Tests Updated

When adding features:
1. ✅ Add `data-test-id` attributes to new elements
2. ✅ Write unit tests for component logic
3. ✅ Write E2E tests for user flows
4. ✅ Update [TEST_REGISTRY.md](TEST_REGISTRY.md)
5. ✅ Document any new testing patterns

---

**Questions?** Contact the Novus Apps QA team or check the individual documentation files.
