# StockPot - AI Coding Guidelines

## Project Overview
StockPot is an **Angular 19 workspace (monorepo)** with Firebase backend integration, targeting SMB restaurants in the Philippines. It features two applications sharing a common Firebase infrastructure:
- **Admin app** (port 4200): StockPot platform operator dashboard — manages tenants, subscriptions, and platform analytics.
- **User-app** (port 4400): The subscriber product — restaurant owners and staff manage recipes, inventory, purchase orders, and cost accounting.

This architecture is designed by Novus Apps for scalable, maintainable SaaS applications.

## Why Monorepo Architecture?

This project uses a **monorepo workspace** for strategic architectural reasons:

### Technical Benefits
1. **Code Sharing** - Services, models, interfaces, and utilities shared between apps without duplication
2. **Unified Dependency Management** - Single source of truth for Angular/Material versions across all apps
3. **Atomic Changes** - Update shared APIs and all consumers in one commit
4. **Consistent Tooling** - Single TypeScript config, linting rules, and build configuration
5. **Type Safety Across Apps** - Shared TypeScript interfaces ensure consistency

### Development Benefits
1. **Single Repository** - Developers work on admin and user apps without switching repos
2. **Faster Onboarding** - One repo to clone, one `npm install`, one development environment
3. **Simplified Reviews** - Pull requests can span both apps when implementing features
4. **Reduced Context Switching** - Work on related features across apps simultaneously

### Deployment Benefits
1. **Independent Deployment** - Deploy admin and user apps separately despite shared code
2. **Coordinated Releases** - Release both apps together when features span both
3. **Shared Backend** - Single Firebase project serves both applications
4. **Simplified CI/CD** - One pipeline builds and deploys all applications

## Workspace Structure

```
stockpot/
├── projects/
│   ├── admin/              # Platform operator dashboard (port 4200)
│   │   └── src/            # Admin-specific code
│   └── user-app/           # Subscriber product — restaurant management (port 4400)
│       └── src/            # User app-specific code
├── functions/              # Firebase Cloud Functions (Node.js 22)
├── environments/           # Shared Firebase configurations
└── docs/                   # Comprehensive documentation
```

## Architecture

### Admin Application (`projects/admin/`)
- **Purpose**: StockPot platform operator dashboard — manage tenants, subscription tiers, and platform-wide settings
- **Port**: 4200
- **Layout System**: 
  - **FullComponent** (`layouts/full/`): Main authenticated layout with header, sidebar, and content area
  - **BlankComponent** (`layouts/blank/`): Minimal layout for authentication pages
  - Routes wrapped in layout components via route configuration in `app.routes.ts`
  - Responsive breakpoints: Mobile (<768px), Tablet (769-1024px), Desktop (>1024px)
- **Features**: ApexCharts integration, Material Design, comprehensive admin tools
- **Navigation**: Defined in `sidebar-data.ts` with nested menu support

### User Application (`projects/user-app/`)
- **Purpose**: Subscriber product for restaurant management — recipes, inventory, purchase orders, cost accounting
- **Port**: 4400
- **Roles**: `owner` | `franchisee` | `staff` (kitchen read-only)
- **Layout**: Lightweight, role-aware design (customize independently from admin)
- **Shared Resources**: Can import services/models from admin app via TypeScript paths

### Firebase Backend (`functions/`)
- **Runtime**: Node.js 22 (aligned with Firebase Functions v6 requirements)
- **Purpose**: Serverless backend for both apps
- **Features**: HTTP endpoints, Firestore triggers, callable functions
- **Local Development**: Firebase emulators for offline development

### Shared Environments (`environments/`)
- **Purpose**: Centralized Firebase configuration for staging and production
- **Usage**: Both apps reference shared environment files to avoid duplication
- **Pattern**: `environment.{stage}.ts` files with Firebase config objects

### State Management Pattern
Uses Angular 19 **signals** for reactive state (not RxJS Subjects):
```typescript
// Example from CoreService
private optionsSignal = signal<AppSettings>(defaults);
getOptions() { return this.optionsSignal(); }
setOptions(options: Partial<AppSettings>) {
  this.optionsSignal.update((current) => ({ ...current, ...options }));
}
```
- `NavService.currentUrl` tracks navigation via signal
- Avoid introducing traditional observables for new state

### Module Organization
- **Standalone components** (Angular 19 pattern) - no NgModules except `MaterialModule`
- `MaterialModule`: Central re-export of all Material imports (39+ modules)
- `TablerIconsModule`: Icon system using `angular-tabler-icons`
- Import `MaterialModule` in components, never individual Material modules

### Navigation Structure
Navigation defined in `sidebar-data.ts` using `NavItem` interface:
```typescript
interface NavItem {
  displayName?: string;
  iconName?: string;      // Tabler icon name
  navCap?: string;        // Category header
  route?: string;
  children?: NavItem[];   // Nested navigation
  chip?: boolean;         // PRO badge indicator
  external?: boolean;     // External link flag
}
```
- Free features route locally (e.g., `/ui-components/badge`)
- PRO features link to `https://flexy-angular-main.netlify.app/...` with `external: true`

## Development Workflows

### Commands
```bash
npm start          # Dev server (default port 4200)
npm run build      # Production build → dist/Flexy
npm run watch      # Watch mode with dev config
npm test           # Karma + Jasmine tests
```

### Build Configuration
- Production budget: 12MB (unusually high - verify if intentional)
- Output: `dist/Flexy` directory
- Netlify SPA redirect configured via `netlify.toml`

### Styling System
- **SCSS architecture** in `src/assets/scss/`:
  - `style.scss`: Root import file
  - `_variables.scss`: Global Sass variables
  - `helpers/`: Utility classes (spacing, flexbox, colors)
  - `override-component/`: Material component customizations
  - `themecolors/`: Theme definitions (default: orange_theme)
- Component styles use `styleUrls` with SCSS
- Material theme applied via `@use "@angular/material" as mat;`

## Project-Specific Conventions

### Component Creation
```typescript
// Standalone pattern (Angular 19)
@Component({
  selector: 'app-example',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent { }
```
- Always include `imports` array (no module declarations)
- Selector prefix: `app-`
- Use `ViewEncapsulation.None` only when customizing Material themes globally

### Routing Patterns
```typescript
// Lazy loading with loadChildren
{
  path: 'feature',
  loadChildren: () => import('./pages/feature/feature.routes')
    .then((m) => m.FeatureRoutes)
}
```
- Route files named `*.routes.ts` exporting `Routes` constant
- All routes nested under `FullComponent` or `BlankComponent`

### Service Injection
- All services use `providedIn: 'root'` (singleton pattern)
- No manual provider registration in components
- Example services: `CoreService` (settings), `NavService` (navigation state)

### Responsive Handling
```typescript
// BreakpointObserver pattern from FullComponent
this.breakpointObserver.observe([MOBILE_VIEW, TABLET_VIEW])
  .subscribe((state) => {
    this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
  });
```
- Use CDK `BreakpointObserver` for layout shifts
- Store breakpoint state in component properties

## Key Files Reference
- `app.config.ts`: Application providers (router, HTTP, Material, i18n)
- `material.module.ts`: Single source for all Material imports
- `sidebar-data.ts`: Navigation menu configuration
- `config.ts`: App-wide settings interface and defaults
- `angular.json`: Build configuration with CommonJS dependency allowlist

## Common Pitfalls
- **Don't** import individual Material modules - always use `MaterialModule`
- **Don't** use RxJS BehaviorSubject for new state - use Angular signals
- **Don't** create NgModules - use standalone component pattern
- **Don't** modify `allowedCommonJsDependencies` without understanding bundle impact
- **Verify** PRO features aren't implemented locally - they should link externally

## External Dependencies
- **ApexCharts** (`ng-apexcharts`): Chart library for dashboards
- **ngx-scrollbar**: Custom scrollbar styling
- **ngx-translate**: i18n support (TranslateModule configured in app.config)
- Material Design theming via Sass `@use` imports

## Testing Philosophy: Build with Testing in Mind

This project follows a **test-first mindset** where every feature is designed for testability from the ground up.

### Testing Strategy

1. **Unit Tests** - Jasmine/Karma for component and service logic
2. **E2E Tests** - Playwright for user flows and integration scenarios
3. **Test Data Attributes** - Every interactive element gets a `data-test-id` attribute
4. **Environment Safety** - E2E tests run only on emulators and staging, never production

### Test Data Attributes Convention

**ALWAYS add `data-test-id` attributes to HTML elements for Playwright targeting:**

```html
<!-- ✅ CORRECT: Testable elements -->
<button data-test-id="login-submit-button" (click)="login()">Login</button>
<input data-test-id="email-input" type="email" [(ngModel)]="email" />
<div data-test-id="user-profile-card" class="card">...</div>
<mat-select data-test-id="role-selector" [(value)]="selectedRole">...</mat-select>
<a data-test-id="nav-dashboard-link" routerLink="/dashboard">Dashboard</a>

<!-- ❌ INCORRECT: No test ID -->
<button (click)="login()">Login</button>
<input type="email" [(ngModel)]="email" />
```

### Test ID Naming Convention

Format: `[page/feature]-[element-type]-[action/purpose]`

**Examples:**
- `login-submit-button` - Login page submit button
- `user-list-table` - User listing table
- `sidebar-nav-dashboard` - Dashboard navigation in sidebar
- `profile-edit-form` - Profile editing form
- `alert-success-message` - Success alert message
- `product-card-123` - Product card with ID 123

**Guidelines:**
- Use kebab-case (lowercase with hyphens)
- Be descriptive but concise
- Include dynamic IDs when needed (`user-card-${user.id}`)
- Group related elements with common prefix (`cart-item-`, `cart-total-`, `cart-checkout-`)

### Component Development Pattern

When creating components, add test IDs immediately:

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <mat-card data-test-id="user-card-{{user.id}}">
      <mat-card-header data-test-id="user-card-header">
        <mat-card-title data-test-id="user-name">{{user.name}}</mat-card-title>
      </mat-card-header>
      <mat-card-actions>
        <button 
          data-test-id="user-edit-button-{{user.id}}"
          (click)="editUser()">
          Edit
        </button>
        <button 
          data-test-id="user-delete-button-{{user.id}}"
          (click)="deleteUser()">
          Delete
        </button>
      </mat-card-actions>
    </mat-card>
  `
})
export class UserCardComponent {
  @Input() user!: User;
}
```

### E2E Test Organization

Tests are organized by **user flows** in the `e2e/` folder:

```
e2e/
├── flows/
│   ├── authentication/
│   │   ├── T001-login.spec.ts
│   │   └── T002-registration.spec.ts
│   ├── user-management/
│   │   ├── T010-create-user.spec.ts
│   │   └── T011-edit-user.spec.ts
│   └── dashboard/
│       └── T020-dashboard-overview.spec.ts
├── fixtures/
│   └── test-data.json
└── playwright.config.ts
```

### Test Numbering System

- **T000-T099**: Authentication & Authorization flows
- **T100-T199**: User Management flows
- **T200-T299**: Dashboard & Analytics flows
- **T300-T399**: Content Management flows
- **T400-T499**: Settings & Configuration flows
- **T900-T999**: Edge cases & Error handling

**Sub-numbering**: Use sequential numbers within each category (T001, T002, T003...)

### Testing Environment Rules

```typescript
// playwright.config.ts - Environment detection
const baseURL = process.env.TEST_ENV === 'production' 
  ? throw new Error('E2E tests cannot run on production!') 
  : process.env.TEST_ENV === 'staging'
    ? 'https://staging.example.com'
    : 'http://localhost:4200'; // Defaults to emulators
```

**Allowed environments:**
- ✅ **Local with Firebase Emulators** (default)
- ✅ **Staging environment**
- ❌ **Production** (blocked by configuration)

### Writing Playwright Tests

```typescript
// e2e/flows/authentication/T001-login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('T001: User Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('T001.1: should login with valid credentials', async ({ page }) => {
    // Use data-test-id selectors
    await page.locator('[data-test-id="login-email-input"]').fill('admin@test.com');
    await page.locator('[data-test-id="login-password-input"]').fill('password123');
    await page.locator('[data-test-id="login-submit-button"]').click();
    
    // Verify navigation
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-test-id="dashboard-welcome-message"]')).toBeVisible();
  });

  test('T001.2: should show error for invalid credentials', async ({ page }) => {
    await page.locator('[data-test-id="login-email-input"]').fill('wrong@test.com');
    await page.locator('[data-test-id="login-password-input"]').fill('wrong');
    await page.locator('[data-test-id="login-submit-button"]').click();
    
    await expect(page.locator('[data-test-id="login-error-message"]')).toBeVisible();
  });
});
```

### Unit Testing

- Keep unit tests (`*.spec.ts`) alongside components
- Test component logic, not implementation details
- Mock Firebase services in unit tests

```typescript
// user-card.component.spec.ts
describe('UserCardComponent', () => {
  it('should emit edit event when edit button clicked', () => {
    const fixture = TestBed.createComponent(UserCardComponent);
    const compiled = fixture.nativeElement;
    
    const editButton = compiled.querySelector('[data-test-id="user-edit-button"]');
    // Test logic...
  });
});
```

### Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **E2E Tests**: Cover all critical user flows
- **Test Registry**: Maintain up-to-date test documentation

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: |
    npm run firebase:emulators &
    npm run test:e2e:admin
    npm run test:e2e:user
  env:
    TEST_ENV: emulators
```

## Testing Documentation

See [`docs/testing/`](../docs/testing/) for comprehensive testing guides:
- Test strategy and philosophy
- Playwright setup and configuration
- Test registry and numbering system
- Writing effective tests
- CI/CD integration
