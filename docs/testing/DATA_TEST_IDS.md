# Data Test IDs Guide

This guide provides comprehensive conventions and best practices for using `data-test-id` attributes in the Novus Flexy project.

## Purpose

`data-test-id` attributes serve as stable selectors for E2E tests, decoupling test logic from implementation details like CSS classes or element structure.

### Benefits

- **Stability**: IDs don't change when styling changes
- **Clarity**: Explicitly marks elements intended for testing
- **Maintainability**: Easy to find and update test selectors
- **Documentation**: Self-documents interactive elements

---

## Naming Convention

### Format

```
[page/feature]-[element-type]-[action/purpose]
```

### Rules

1. **Use kebab-case** (lowercase with hyphens)
2. **Be descriptive but concise** (3-7 words max)
3. **Include context** (page/feature prefix)
4. **Specify element type** when helpful (button, input, form, card, etc.)
5. **Include dynamic IDs** when dealing with lists (`user-${user.id}`)
6. **Group related elements** with common prefixes

### Examples

✅ **Good IDs**:
```html
<button data-test-id="login-submit-button">Login</button>
<input data-test-id="login-email-input" type="email" />
<input data-test-id="login-password-input" type="password" />
<div data-test-id="login-error-message" class="error"></div>
<form data-test-id="login-form"></form>
<a data-test-id="login-forgot-password-link">Forgot Password?</a>
```

❌ **Bad IDs**:
```html
<button data-test-id="btn">Login</button>           <!-- Too generic -->
<input data-test-id="emailInput" type="email" />    <!-- camelCase -->
<div data-test-id="error" class="error"></div>      <!-- No context -->
<form data-test-id="the-login-form"></form>         <!-- Unnecessary words -->
<a data-test-id="link1">Forgot Password?</a>        <!-- Not descriptive -->
```

---

## Naming Patterns by Element Type

### Buttons

Pattern: `[feature]-[action]-button`

```html
<button data-test-id="login-submit-button">Login</button>
<button data-test-id="user-edit-button">Edit</button>
<button data-test-id="user-delete-button">Delete</button>
<button data-test-id="form-cancel-button">Cancel</button>
<button data-test-id="modal-close-button">✕</button>
<button data-test-id="sidebar-toggle-button">☰</button>
```

### Inputs

Pattern: `[feature]-[field-name]-input`

```html
<input data-test-id="login-email-input" type="email" />
<input data-test-id="login-password-input" type="password" />
<input data-test-id="user-firstname-input" type="text" />
<input data-test-id="user-lastname-input" type="text" />
<input data-test-id="profile-bio-input" type="textarea" />
<input data-test-id="search-query-input" type="search" />
```

### Dropdowns/Selects

Pattern: `[feature]-[purpose]-select` or `[feature]-[purpose]-dropdown`

```html
<select data-test-id="user-role-select">...</select>
<select data-test-id="filter-category-select">...</select>
<mat-select data-test-id="dashboard-theme-select">...</mat-select>
<div data-test-id="profile-language-dropdown">...</div>
```

### Links

Pattern: `[feature]-[destination]-link` or `nav-[destination]-link`

```html
<a data-test-id="login-forgot-password-link">Forgot Password?</a>
<a data-test-id="nav-dashboard-link" routerLink="/dashboard">Dashboard</a>
<a data-test-id="nav-users-link" routerLink="/users">Users</a>
<a data-test-id="user-profile-link-{{user.id}}">View Profile</a>
```

### Forms

Pattern: `[feature]-form`

```html
<form data-test-id="login-form">...</form>
<form data-test-id="user-create-form">...</form>
<form data-test-id="profile-edit-form">...</form>
<form data-test-id="settings-form">...</form>
```

### Messages & Alerts

Pattern: `[feature]-[type]-message` or `[feature]-[type]-alert`

```html
<div data-test-id="login-error-message">Invalid credentials</div>
<div data-test-id="user-success-message">User created successfully</div>
<mat-error data-test-id="form-validation-error">Required field</mat-error>
<div data-test-id="dashboard-welcome-message">Welcome back!</div>
<snackbar data-test-id="notification-success-alert">Saved!</snackbar>
```

### Tables

Pattern: `[feature]-table`, `[feature]-row-[id]`, `[feature]-cell-[column]`

```html
<table data-test-id="users-table">
  <thead data-test-id="users-table-header">
    <tr>
      <th data-test-id="users-table-name-header">Name</th>
      <th data-test-id="users-table-email-header">Email</th>
    </tr>
  </thead>
  <tbody data-test-id="users-table-body">
    <tr data-test-id="users-row-{{user.id}}">
      <td data-test-id="users-cell-name-{{user.id}}">{{user.name}}</td>
      <td data-test-id="users-cell-email-{{user.id}}">{{user.email}}</td>
    </tr>
  </tbody>
</table>
```

### Cards

Pattern: `[feature]-card` or `[feature]-card-[id]`

```html
<mat-card data-test-id="dashboard-stats-card">...</mat-card>
<mat-card data-test-id="user-card-{{user.id}}">
  <mat-card-header data-test-id="user-card-header-{{user.id}}">
    <mat-card-title data-test-id="user-card-title-{{user.id}}">
      {{user.name}}
    </mat-card-title>
  </mat-card-header>
</mat-card>
```

### Modals/Dialogs

Pattern: `[purpose]-modal`, `[purpose]-dialog`

```html
<div data-test-id="confirm-delete-modal">
  <h2 data-test-id="confirm-delete-modal-title">Confirm Deletion</h2>
  <p data-test-id="confirm-delete-modal-message">Are you sure?</p>
  <button data-test-id="confirm-delete-modal-cancel-button">Cancel</button>
  <button data-test-id="confirm-delete-modal-confirm-button">Delete</button>
</div>
```

### Lists

Pattern: `[feature]-list`, `[feature]-list-item-[id]`

```html
<ul data-test-id="notifications-list">
  <li data-test-id="notification-item-{{notification.id}}">
    <span data-test-id="notification-message-{{notification.id}}">
      {{notification.text}}
    </span>
  </li>
</ul>
```

### Navigation

Pattern: `nav-[location]-[element]` or `sidebar-[element]`

```html
<nav data-test-id="main-navigation">
  <a data-test-id="nav-dashboard-link">Dashboard</a>
  <a data-test-id="nav-users-link">Users</a>
</nav>

<aside data-test-id="sidebar">
  <button data-test-id="sidebar-toggle-button">☰</button>
  <ul data-test-id="sidebar-menu">
    <li data-test-id="sidebar-menu-item-dashboard">Dashboard</li>
  </ul>
</aside>

<header data-test-id="app-header">
  <div data-test-id="user-menu">
    <button data-test-id="user-menu-button">John Doe</button>
    <div data-test-id="user-menu-dropdown">
      <a data-test-id="user-menu-profile-link">Profile</a>
      <a data-test-id="user-menu-logout-link">Logout</a>
    </div>
  </div>
</header>
```

---

## Dynamic IDs

### With User/Entity IDs

Use template interpolation for dynamic content:

```html
<!-- Angular Template -->
<div *ngFor="let user of users">
  <mat-card data-test-id="user-card-{{user.id}}">
    <button data-test-id="user-edit-button-{{user.id}}">Edit</button>
    <button data-test-id="user-delete-button-{{user.id}}">Delete</button>
  </mat-card>
</div>

<!-- TypeScript Component -->
<mat-card [attr.data-test-id]="'user-card-' + user.id">
```

### In Playwright Tests

Target dynamic IDs using string interpolation:

```typescript
const userId = 123;
await page.locator(`[data-test-id="user-card-${userId}"]`).click();
await page.locator(`[data-test-id="user-edit-button-${userId}"]`).click();
```

### For Lists and Iterations

```html
<!-- Product cards -->
<div *ngFor="let product of products; let i = index">
  <div data-test-id="product-card-{{product.id}}">
    <h3 data-test-id="product-name-{{product.id}}">{{product.name}}</h3>
    <p data-test-id="product-price-{{product.id}}">{{product.price}}</p>
    <button data-test-id="product-buy-button-{{product.id}}">Buy</button>
  </div>
</div>
```

---

## Feature-Specific Conventions

### Login Page

```html
<form data-test-id="login-form">
  <h1 data-test-id="login-title">Login</h1>
  
  <input data-test-id="login-email-input" type="email" />
  <mat-error data-test-id="login-email-error">Invalid email</mat-error>
  
  <input data-test-id="login-password-input" type="password" />
  <mat-error data-test-id="login-password-error">Required</mat-error>
  
  <mat-checkbox data-test-id="login-remember-checkbox">Remember me</mat-checkbox>
  
  <button data-test-id="login-submit-button">Login</button>
  <button data-test-id="login-google-button">Login with Google</button>
  
  <a data-test-id="login-forgot-password-link">Forgot Password?</a>
  <a data-test-id="login-register-link">Create Account</a>
  
  <div data-test-id="login-error-message" *ngIf="error">{{error}}</div>
  <div data-test-id="login-success-message" *ngIf="success">{{success}}</div>
</form>
```

### User Management

```html
<!-- User List -->
<div data-test-id="user-list-container">
  <h2 data-test-id="user-list-title">Users</h2>
  
  <input data-test-id="user-search-input" type="search" />
  <select data-test-id="user-filter-role-select">...</select>
  <button data-test-id="user-create-button">Add User</button>
  
  <table data-test-id="user-table">
    <thead data-test-id="user-table-header">...</thead>
    <tbody data-test-id="user-table-body">
      <tr data-test-id="user-row-{{user.id}}">
        <td data-test-id="user-name-{{user.id}}">{{user.name}}</td>
        <td data-test-id="user-email-{{user.id}}">{{user.email}}</td>
        <td data-test-id="user-role-{{user.id}}">{{user.role}}</td>
        <td data-test-id="user-actions-{{user.id}}">
          <button data-test-id="user-edit-button-{{user.id}}">Edit</button>
          <button data-test-id="user-delete-button-{{user.id}}">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
  
  <div data-test-id="user-pagination">
    <button data-test-id="user-pagination-prev">Previous</button>
    <span data-test-id="user-pagination-info">Page 1 of 10</span>
    <button data-test-id="user-pagination-next">Next</button>
  </div>
</div>

<!-- User Create/Edit Modal -->
<div data-test-id="user-modal">
  <h3 data-test-id="user-modal-title">Create User</h3>
  <form data-test-id="user-form">
    <input data-test-id="user-firstname-input" />
    <input data-test-id="user-lastname-input" />
    <input data-test-id="user-email-input" />
    <select data-test-id="user-role-select">...</select>
    
    <button data-test-id="user-form-cancel-button">Cancel</button>
    <button data-test-id="user-form-submit-button">Save</button>
  </form>
</div>
```

### Dashboard

```html
<div data-test-id="dashboard-container">
  <h1 data-test-id="dashboard-title">Dashboard</h1>
  <p data-test-id="dashboard-welcome-message">Welcome, {{user.name}}!</p>
  
  <!-- Stats Cards -->
  <div data-test-id="dashboard-stats-grid">
    <mat-card data-test-id="dashboard-users-card">
      <span data-test-id="dashboard-users-count">1,234</span>
      <span data-test-id="dashboard-users-label">Users</span>
    </mat-card>
    
    <mat-card data-test-id="dashboard-revenue-card">
      <span data-test-id="dashboard-revenue-amount">$56,789</span>
      <span data-test-id="dashboard-revenue-label">Revenue</span>
    </mat-card>
  </div>
  
  <!-- Charts -->
  <div data-test-id="dashboard-sales-chart-container">
    <h3 data-test-id="dashboard-sales-chart-title">Sales Overview</h3>
    <apx-chart data-test-id="dashboard-sales-chart"></apx-chart>
    <select data-test-id="dashboard-sales-chart-filter">...</select>
  </div>
  
  <!-- Activity Feed -->
  <div data-test-id="dashboard-activity-container">
    <h3 data-test-id="dashboard-activity-title">Recent Activity</h3>
    <ul data-test-id="dashboard-activity-list">
      <li data-test-id="dashboard-activity-item-{{activity.id}}">
        <span data-test-id="dashboard-activity-message-{{activity.id}}">
          {{activity.message}}
        </span>
        <span data-test-id="dashboard-activity-time-{{activity.id}}">
          {{activity.time}}
        </span>
      </li>
    </ul>
  </div>
</div>
```

---

## Material Components

### Material Buttons

```html
<button mat-button data-test-id="basic-button">Basic</button>
<button mat-raised-button data-test-id="raised-button">Raised</button>
<button mat-flat-button data-test-id="flat-button">Flat</button>
<button mat-stroked-button data-test-id="stroked-button">Stroked</button>
<button mat-icon-button data-test-id="icon-button">
  <mat-icon>favorite</mat-icon>
</button>
<button mat-fab data-test-id="fab-button">
  <mat-icon>add</mat-icon>
</button>
```

### Material Form Fields

```html
<mat-form-field data-test-id="email-form-field">
  <mat-label data-test-id="email-label">Email</mat-label>
  <input matInput data-test-id="email-input" type="email" />
  <mat-error data-test-id="email-error">Invalid email</mat-error>
  <mat-hint data-test-id="email-hint">Enter your email</mat-hint>
</mat-form-field>
```

### Material Select

```html
<mat-select data-test-id="role-select">
  <mat-option data-test-id="role-option-admin" value="admin">Admin</mat-option>
  <mat-option data-test-id="role-option-user" value="user">User</mat-option>
</mat-select>
```

### Material Checkbox/Radio

```html
<mat-checkbox data-test-id="terms-checkbox">I agree</mat-checkbox>
<mat-radio-group data-test-id="gender-radio-group">
  <mat-radio-button data-test-id="gender-male-radio" value="male">
    Male
  </mat-radio-button>
  <mat-radio-button data-test-id="gender-female-radio" value="female">
    Female
  </mat-radio-button>
</mat-radio-group>
```

### Material Dialogs

```html
<h1 mat-dialog-title data-test-id="dialog-title">Delete User?</h1>
<div mat-dialog-content data-test-id="dialog-content">
  <p data-test-id="dialog-message">This action cannot be undone.</p>
</div>
<div mat-dialog-actions data-test-id="dialog-actions">
  <button mat-button data-test-id="dialog-cancel-button">Cancel</button>
  <button mat-button data-test-id="dialog-confirm-button">Delete</button>
</div>
```

---

## Best Practices

### DO ✅

1. **Add IDs to all interactive elements**
   ```html
   <button data-test-id="submit-button">Submit</button>
   ```

2. **Use descriptive, contextual names**
   ```html
   <input data-test-id="login-email-input" />
   ```

3. **Group related elements with common prefix**
   ```html
   <form data-test-id="login-form">
     <input data-test-id="login-email-input" />
     <input data-test-id="login-password-input" />
     <button data-test-id="login-submit-button" />
   </form>
   ```

4. **Include dynamic IDs for list items**
   ```html
   <div *ngFor="let user of users">
     <div data-test-id="user-card-{{user.id}}">...</div>
   </div>
   ```

5. **Add IDs to error/success messages**
   ```html
   <div data-test-id="error-message" *ngIf="error">{{error}}</div>
   ```

### DON'T ❌

1. **Don't use camelCase**
   ```html
   <!-- ❌ Wrong -->
   <button data-test-id="submitButton">Submit</button>
   
   <!-- ✅ Correct -->
   <button data-test-id="submit-button">Submit</button>
   ```

2. **Don't use generic IDs**
   ```html
   <!-- ❌ Wrong -->
   <button data-test-id="button1">Submit</button>
   
   <!-- ✅ Correct -->
   <button data-test-id="login-submit-button">Submit</button>
   ```

3. **Don't include unnecessary words**
   ```html
   <!-- ❌ Wrong -->
   <button data-test-id="the-login-submit-button">Submit</button>
   
   <!-- ✅ Correct -->
   <button data-test-id="login-submit-button">Submit</button>
   ```

4. **Don't skip IDs on containers**
   ```html
   <!-- ❌ Wrong -->
   <div class="user-list">
     <button data-test-id="create-button">Create</button>
   </div>
   
   <!-- ✅ Correct -->
   <div data-test-id="user-list-container">
     <button data-test-id="user-create-button">Create</button>
   </div>
   ```

---

## Component Development Checklist

When creating a new component:

- [ ] Identify all interactive elements (buttons, inputs, links)
- [ ] Add `data-test-id` to each interactive element
- [ ] Add `data-test-id` to container elements
- [ ] Add `data-test-id` to error/success messages
- [ ] Use dynamic IDs for list items
- [ ] Follow naming conventions (kebab-case, descriptive)
- [ ] Group related elements with common prefix
- [ ] Document any custom ID patterns in component docs

---

## Finding Elements in Tests

### Playwright Selectors

```typescript
// By data-test-id
await page.locator('[data-test-id="login-submit-button"]').click();

// With dynamic ID
const userId = 123;
await page.locator(`[data-test-id="user-card-${userId}"]`).click();

// Multiple matches - use first/last/nth
await page.locator('[data-test-id="user-card"]').first().click();
await page.locator('[data-test-id="user-card"]').nth(2).click();

// Chaining selectors
await page
  .locator('[data-test-id="user-modal"]')
  .locator('[data-test-id="submit-button"]')
  .click();

// With text content
await page
  .locator('[data-test-id="user-name"]', { hasText: 'John Doe' })
  .click();
```

---

## Maintenance

### Refactoring

When refactoring components:
1. Keep `data-test-id` values stable
2. If changing ID, update tests simultaneously
3. Search codebase for old ID before changing: `grep -r "old-test-id"`

### Documentation

Document custom ID patterns in component files:

```typescript
/**
 * User Card Component
 * 
 * Test IDs:
 * - user-card-{id} - Card container
 * - user-name-{id} - User name display
 * - user-edit-button-{id} - Edit button
 * - user-delete-button-{id} - Delete button
 */
@Component({
  selector: 'app-user-card',
  // ...
})
```

---

## Resources

- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Testing Strategy](TESTING_STRATEGY.md)
- [Test Registry](TEST_REGISTRY.md)
- [Writing Tests](WRITING_TESTS.md)
