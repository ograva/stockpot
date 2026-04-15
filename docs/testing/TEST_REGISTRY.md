# Test Registry

This document maintains a comprehensive list of all E2E tests with their numbers, descriptions, and status.

## Test Numbering System

Tests are organized by functional area with dedicated number ranges:

| Range | Category | Description |
|-------|----------|-------------|
| T000-T099 | Authentication & Authorization | Login, logout, registration, password reset, permissions |
| T100-T199 | User Management | Create, read, update, delete users, roles, profiles |
| T200-T299 | Dashboard & Analytics | Dashboard views, charts, reports, data visualization |
| T300-T399 | Content Management | Create, edit, delete content, media management |
| T400-T499 | Settings & Configuration | App settings, preferences, system configuration |
| T500-T599 | User App Flows | User-facing application flows |
| T600-T699 | Notifications | Alerts, notifications, messaging |
| T700-T799 | Search & Filtering | Search functionality, filters, sorting |
| T800-T899 | Integration & API | Third-party integrations, API endpoints |
| T900-T999 | Edge Cases & Error Handling | Error states, boundary conditions, fallbacks |

## Test Status

- 🔴 **Not Started** - Test not yet implemented
- 🟡 **In Progress** - Test being written or debugged
- 🟢 **Completed** - Test implemented and passing
- 🔵 **Blocked** - Blocked by dependency or issue
- ⚪ **Skipped** - Intentionally skipped (temporary)

---

## Admin App Tests

### Authentication & Authorization (T000-T099)

#### T001: User Login Flow
- **Status**: 🟡 In Progress
- **Priority**: High
- **File**: `e2e/admin/flows/authentication/T001-login.spec.ts`
- **Description**: Test admin user login functionality with valid and invalid credentials

**Sub-tests**:
- T001.1: Login with valid credentials ✅
- T001.2: Login with invalid email ✅
- T001.3: Login with invalid password ✅
- T001.4: Login with empty fields ✅
- T001.5: Remember me functionality 🔴

#### T002: User Logout Flow
- **Status**: � Completed
- **Priority**: High
- **File**: `e2e/admin/flows/authentication/T002-logout.spec.ts`
- **Description**: Test logout functionality and session cleanup

**Sub-tests**:
- T002.1: Sidebar shows Logout and hides Login when authenticated ✅
- T002.2: Clicking Logout redirects to login page ✅
- T002.3: Login/Register nav items visible after logout ✅

#### T003: Admin Registration Flow
- **Status**: 🟢 Completed
- **Priority**: High
- **File**: `e2e/admin/flows/authentication/T003-register.spec.ts`
- **Description**: Test admin registration form: validation, happy path, and duplicate email handling

**Sub-tests**:
- T003.1: Registration page renders with all fields ✅
- T003.2: Validates required fields ✅
- T003.3: Validates minimum password length ✅
- T003.4: Registers new user and redirects to dashboard ✅
- T003.5: Shows error for duplicate email ✅

#### T004: Admin Registration
- **Status**: 🔴 Not Started
- **Priority**: Low
- **File**: `e2e/admin/flows/authentication/T004-registration.spec.ts`
- **Description**: Additional admin registration edge cases

**Sub-tests**:
- T004.1: Register with valid data
- T004.2: Validate required fields
- T004.3: Email uniqueness validation
- T004.4: Password strength requirements

#### T005: Role-Based Access Control
- **Status**: 🔴 Not Started
- **Priority**: High
- **File**: `e2e/admin/flows/authentication/T005-rbac.spec.ts`
- **Description**: Test different user roles and permissions

**Sub-tests**:
- T005.1: Super admin access
- T005.2: Regular admin access
- T005.3: Read-only user access
- T005.4: Unauthorized route protection

#### T010: Admin Splash Screen Transition
- **Status**: 🟢 Completed
- **Priority**: High
- **File**: `e2e/admin/flows/splash/T010-splash.spec.ts`
- **Description**: Splash screen renders correctly and routes to dashboard (authenticated) or login (unauthenticated)

**Sub-tests**:
- T010.1: Splash screen renders expected elements (logo, loader) ✅
- T010.2: Unauthenticated user redirected to login after splash ✅
- T010.3: Authenticated user redirected to dashboard after splash ✅

---

### User Management (T100-T199)

> **Note:** Tests below use T01x numbering (should be T11x per the defined range). Kept as-is to avoid breaking planned test references.

#### T010: Create New User
- **Status**: 🔴 Not Started
- **Priority**: High
- **File**: `e2e/admin/flows/user-management/T010-create-user.spec.ts`
- **Description**: Test creating new users in admin panel

**Sub-tests**:
- T010.1: Create user with all fields
- T010.2: Create user with minimum required fields
- T010.3: Validate email format
- T010.4: Assign user role
- T010.5: Upload user avatar

#### T011: Edit Existing User
- **Status**: 🔴 Not Started
- **Priority**: High
- **File**: `e2e/admin/flows/user-management/T011-edit-user.spec.ts`
- **Description**: Test editing user information

**Sub-tests**:
- T011.1: Update user profile
- T011.2: Change user role
- T011.3: Update user status (active/inactive)
- T011.4: Validation on edit

#### T012: Delete User
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/user-management/T012-delete-user.spec.ts`
- **Description**: Test user deletion with confirmation

**Sub-tests**:
- T012.1: Delete user with confirmation
- T012.2: Cancel deletion
- T012.3: Soft delete vs hard delete
- T012.4: Cannot delete self

#### T013: View User List
- **Status**: � Completed
- **Priority**: High
- **File**: `e2e/admin/flows/user-management/T013-user-list.spec.ts`
- **Description**: Test user listing and pagination

**Sub-tests**:
- T013.1: View all users ✅
- T013.2: Paginate through users 🔴
- T013.3: Sort by column 🔴
- T013.4: Filter by role 🔴
- T013.5: Search by name/email ✅

#### T014: User Profile Details
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/user-management/T014-user-profile.spec.ts`
- **Description**: Test viewing detailed user profile

**Sub-tests**:
- T014.1: View user details
- T014.2: View user activity log
- T014.3: View user permissions
- T014.4: View associated data

---

### Dashboard & Analytics (T200-T299)

#### T020: Dashboard Overview
- **Status**: 🔴 Not Started
- **Priority**: High
- **File**: `e2e/admin/flows/dashboard/T020-dashboard-overview.spec.ts`
- **Description**: Test main dashboard loading and widgets

**Sub-tests**:
- T020.1: Load dashboard successfully
- T020.2: Display key metrics
- T020.3: Load charts (ApexCharts)
- T020.4: Responsive layout

#### T021: Sales Overview Chart
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/dashboard/T021-sales-overview.spec.ts`
- **Description**: Test sales overview chart functionality

**Sub-tests**:
- T021.1: Display sales chart
- T021.2: Filter by date range
- T021.3: Chart interactivity
- T021.4: Export chart data

#### T022: Product Performance
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/dashboard/T022-product-performance.spec.ts`
- **Description**: Test product performance metrics

**Sub-tests**:
- T022.1: Display top products
- T022.2: View product trends
- T022.3: Sort by metrics
- T022.4: Drill down to details

#### T023: Daily Activities Widget
- **Status**: 🔴 Not Started
- **Priority**: Low
- **File**: `e2e/admin/flows/dashboard/T023-daily-activities.spec.ts`
- **Description**: Test daily activities feed

**Sub-tests**:
- T023.1: Display recent activities
- T023.2: Real-time updates
- T023.3: Activity filtering
- T023.4: Load more activities

---

### Content Management (T300-T399)

#### T030: Create Blog Post
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/content/T030-create-blog.spec.ts`
- **Description**: Test blog post creation

**Sub-tests**:
- T030.1: Create new blog post
- T030.2: Add featured image
- T030.3: Set publish date
- T030.4: Save as draft
- T030.5: Publish immediately

#### T031: Edit Blog Post
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/content/T031-edit-blog.spec.ts`
- **Description**: Test blog post editing

#### T032: Delete Blog Post
- **Status**: 🔴 Not Started
- **Priority**: Low
- **File**: `e2e/admin/flows/content/T032-delete-blog.spec.ts`
- **Description**: Test blog post deletion

---

### Settings & Configuration (T400-T499)

#### T040: App Settings
- **Status**: � Completed
- **Priority**: High
- **File**: `e2e/admin/flows/settings/T040-app-settings.spec.ts`
- **Description**: Test application settings configuration — Firestore read/write via `settings/global`

**Sub-tests**:
- T040.1: Load settings from Firestore on page open ✅
- T040.2: Form pre-populated with current values ✅
- T040.3: Unsaved changes banner appears on edit ✅
- T040.4: Save button disabled until form is dirty ✅
- T040.5: Save writes to Firestore successfully ✅
- T040.6: Reset reverts to last saved values ✅
- T040.7: Real-time Firestore emissions do not overwrite unsaved edits ✅

#### T041: Theme Customization
- **Status**: 🔴 Not Started
- **Priority**: Low
- **File**: `e2e/admin/flows/settings/T041-theme-customization.spec.ts`
- **Description**: Test theme switching and customization

**Sub-tests**:
- T041.1: Switch color theme
- T041.2: Toggle dark mode
- T041.3: Customize sidebar
- T041.4: Layout direction (LTR/RTL)

---

## User App Tests

### Onboarding & Setup (T500-T599)

#### T500: First Time App Load
- **Status**: � Completed
- **Priority**: High
- **File**: `e2e/user-app/flows/onboarding/T500-initial-load.spec.ts`
- **Description**: Unauthenticated user flow (splash → login redirect) + authenticated home page (USR-501)

**Sub-tests — Unauthenticated:**
- T500.1: Unauthenticated user redirected to login via splash ✅
- T500.2: Login form displayed after splash redirect ✅
- T500.3: Responsive on mobile viewport ✅
- T500.4: Responsive on tablet viewport ✅
- T500.5: No unexpected console errors on load ✅
- T500.6: Required assets loaded ✅

**Sub-tests — Authenticated Home (USR-501):**
- T500.A1: Authenticated user lands on /dashboard/home ✅
- T500.A2: Welcome card and welcome message visible ✅
- T500.A3: "My Profile" CTA navigates to /dashboard/profile ✅
- T500.A4: Header rendered with profile button and avatar ✅
- T500.A5: Sidebar "My Profile" nav item visible for authenticated user ✅

#### T501: User Onboarding Flow
- **Status**: 🟢 Completed
- **Priority**: High
- **File**: `e2e/user-app/flows/onboarding/T501-onboarding.spec.ts`
- **Description**: End-to-end new-user onboarding path (USR-503) — splash detects missing Firestore name and redirects to onboarding profile form

**Sub-tests**:
- T501.1: New user redirected to /dashboard/profile?onboarding=true via splash ✅
- T501.2: Onboarding heading shows "Complete your profile" ✅
- T501.3: onboarding-name-input and onboarding-submit-button present; photo URL and back button hidden ✅
- T501.4: Submitting empty display name shows validation error ✅
- T501.5: Completing onboarding navigates to /dashboard/home ✅
- T501.6: Returning user (Firestore name set) is NOT redirected to onboarding ✅

#### T502: User Profile Form
- **Status**: 🟢 Completed
- **Priority**: High
- **File**: `e2e/user-app/flows/profile/T502-profile-form.spec.ts`
- **Description**: Authenticated profile form: renders all fields, validates input, saves via StoreForwardService, confirms snackbar and reactive header update (USR-502)

**Sub-tests**:
- T502.1: Profile page renders with all expected elements ✅
- T502.2: Email field is read-only ✅
- T502.3: Display name field accepts text input ✅
- T502.4: Submitting form shows success snackbar ✅
- T502.5: Header reflects updated display name after save ✅
- T502.6: Back-to-home button navigates to /dashboard/home ✅

#### T503: User Login
- **Status**: 🔴 Not Started
- **Priority**: High
- **File**: `e2e/user-app/flows/authentication/T503-user-login.spec.ts`
- **Description**: Test user app login form (valid credentials, invalid credentials, validation)

---

### Navigation & UI (T600-T699)

#### T600: Navigation Menu
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/user-app/flows/navigation/T600-navigation-menu.spec.ts`
- **Description**: Test navigation functionality

**Sub-tests**:
- T600.1: Open/close menu
- T600.2: Navigate between pages
- T600.3: Active route highlighting
- T600.4: Mobile menu responsiveness

---

### Error Handling (T900-T999)

#### T900: 404 Not Found
- **Status**: 🔴 Not Started
- **Priority**: Low
- **File**: `e2e/admin/flows/errors/T900-not-found.spec.ts`
- **Description**: Test 404 error page

**Sub-tests**:
- T900.1: Navigate to invalid route
- T900.2: Display 404 page
- T900.3: Return to home link

#### T901: Network Error Handling
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/errors/T901-network-errors.spec.ts`
- **Description**: Test network failure scenarios

**Sub-tests**:
- T901.1: Offline detection
- T901.2: API timeout handling
- T901.3: Retry logic
- T901.4: Error message display

#### T902: Form Validation Errors
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/errors/T902-form-validation.spec.ts`
- **Description**: Test form validation error states

---

---

## Unit Tests

Unit tests live alongside their source files (`*.model.spec.ts`) and are run via Karma/Jasmine (`npm test`).

### Data Layer Models (DAT-302)

#### user-profile.model.spec.ts
- **Status**: 🟢 Completed
- **File**: `projects/user-app/src/app/models/user-profile.model.spec.ts`
- **Story**: DAT-302
- **Tests** (13 total):
  - `deserializeUserProfile()` — null, undefined, empty, valid snapshot, photoURL absent/empty, schema version stamping, role default (7 tests)
  - `serializeUserProfile()` — `_schemaVersion` always present, required fields, photoURL omitted when undefined/empty, included when set, no null values (5 tests)
  - round-trip — full round-trip, round-trip without photoURL (2 tests)

#### site-settings.model.spec.ts
- **Status**: 🟢 Completed
- **File**: `projects/admin/src/app/models/site-settings.model.spec.ts`
- **Story**: DAT-302
- **Tests** (13 total):
  - `deserializeSiteSettings()` — null, undefined, empty, full snapshot, `_schemaVersion` stripped, partial defaults, v0 legacy (7 tests)
  - `serializeSiteSettings()` — `_schemaVersion` always present, all fields, no null values, boolean edge cases (5 tests)
  - round-trip — full round-trip, v0→current version bump (2 tests)

---

## Test Statistics

### Overall Progress

| Category | Total Tests | Completed | In Progress | Not Started | Completion % |
|----------|-------------|-----------|-------------|-------------|--------------|
| Admin — Auth & Splash | 6 | 5 | 1 | 0 | 83% |
| Admin — User Management | 5 | 1 | 0 | 4 | 20% |
| Admin — Dashboard | 4 | 0 | 0 | 4 | 0% |
| Admin — Content | 3 | 0 | 0 | 3 | 0% |
| Admin — Settings | 2 | 1 | 0 | 1 | 50% |
| User App — Home & Onboarding | 3 | 3 | 0 | 0 | 100% |
| User App — Profile | 1 | 1 | 0 | 0 | 100% |
| User App — Auth | 1 | 0 | 0 | 1 | 0% |
| Error Handling | 3 | 0 | 0 | 3 | 0% |
| **E2E TOTAL** | **28** | **12** | **1** | **16** | **43%** |

### Unit Test Progress

| Category | Total Tests | Completed | In Progress | Not Started | Completion % |
|----------|-------------|-----------|-------------|-------------|--------------|  
| Data Models (DAT-302) | 26 | 26 | 0 | 0 | 100% |

### Priority Breakdown

- **High Priority**: 14 tests
- **Medium Priority**: 9 tests
- **Low Priority**: 5 tests

---

## Adding New Tests

When adding a new test to the registry:

1. **Choose appropriate number range** based on functional area
2. **Use next available number** in that range (e.g., T006 for next auth test)
3. **Update this registry** with:
   - Test number and title
   - Status (🔴 Not Started by default)
   - Priority (High/Medium/Low)
   - File path
   - Description
   - Sub-tests list
4. **Create test file** in appropriate folder
5. **Update statistics** section

### Example Entry

```markdown
#### T050: New Feature Test
- **Status**: 🔴 Not Started
- **Priority**: Medium
- **File**: `e2e/admin/flows/category/T050-new-feature.spec.ts`
- **Description**: Brief description of what this test covers

**Sub-tests**:
- T050.1: First scenario
- T050.2: Second scenario
- T050.3: Edge case
```

---

## Test Execution Tracking

### Last Test Run

- **Date**: Not yet executed
- **Environment**: N/A
- **Tests Run**: 0
- **Passed**: 0
- **Failed**: 0
- **Skipped**: 0
- **Duration**: N/A

### Test Coverage

- **Admin App**: 0% (0/20 implemented)
- **User App**: 0% (0/5 implemented)
- **Shared**: 0% (0/2 implemented)

---

## Maintenance

This registry should be updated:
- ✅ When a new test is added
- ✅ When a test status changes
- ✅ After each test run (update statistics)
- ✅ When tests are refactored or removed
- ✅ During sprint planning and retrospectives

**Last Updated**: 2024-01-XX (Update this date when modifying the registry)

---

## References

- [Testing Strategy](TESTING_STRATEGY.md)
- [Playwright Setup](PLAYWRIGHT_SETUP.md)
- [Writing Tests Guide](WRITING_TESTS.md)
- [Data Test IDs](DATA_TEST_IDS.md)
