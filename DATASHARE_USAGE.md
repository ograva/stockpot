# DataShare Service - Usage Examples

The DataShare service provides a secure way to pass data between Angular components without exposing sensitive information in URL query parameters.

## Basic Navigation with Data

### Example 1: User Profile Navigation

**Scenario:** Navigate from a user list to a user profile page, passing user details.

```typescript
// user-list.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users">
      <button (click)="viewProfile(user)">View Profile</button>
    </div>
  `
})
export class UserListComponent {
  users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
  ];

  constructor(
    private router: Router,
    private dataShare: DataShareService
  ) {}

  viewProfile(user: any) {
    // Store user data securely (consumed once by default)
    this.dataShare.set('selectedUser', user);
    
    // Navigate without query parameters
    this.router.navigate(['/profile', user.id]);
  }
}

// user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-user-profile',
  template: `
    <div *ngIf="user">
      <h1>{{ user.name }}</h1>
      <p>Email: {{ user.email }}</p>
      <p>Role: {{ user.role }}</p>
    </div>
    <div *ngIf="!user">
      <p>User not found. Please select a user from the list.</p>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  user?: User;

  constructor(
    private route: ActivatedRoute,
    private dataShare: DataShareService
  ) {}

  ngOnInit() {
    // Retrieve user data (automatically removed after this call)
    this.user = this.dataShare.get<User>('selectedUser');
    
    // If data not available (e.g., direct navigation), fetch from API
    if (!this.user) {
      const userId = this.route.snapshot.params['id'];
      this.fetchUserFromAPI(userId);
    }
  }

  fetchUserFromAPI(userId: string) {
    // Fallback: load data from API if not passed via DataShare
    console.log('Fetching user from API:', userId);
  }
}
```

### Example 2: Form Data Preservation

**Scenario:** Navigate away from a form and preserve draft data.

```typescript
// form-page.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

@Component({
  selector: 'app-form-page',
  template: `
    <form>
      <input [(ngModel)]="formData.name" placeholder="Name">
      <input [(ngModel)]="formData.email" placeholder="Email">
      <button (click)="saveAndNavigate()">Save & Continue</button>
      <button (click)="cancel()">Cancel</button>
    </form>
  `
})
export class FormPageComponent {
  formData = {
    name: '',
    email: '',
    phone: ''
  };

  constructor(
    private router: Router,
    private dataShare: DataShareService
  ) {}

  ngOnInit() {
    // Check if there's saved draft data
    const draft = this.dataShare.get('formDraft');
    if (draft) {
      this.formData = draft;
    }
  }

  saveAndNavigate() {
    // Save form data with persistence for 30 minutes
    this.dataShare.set('formDraft', this.formData, {
      persist: true,
      useLocalStorage: true,
      ttl: 30 * 60 * 1000  // 30 minutes
    });
    
    this.router.navigate(['/confirmation']);
  }

  cancel() {
    // Clear any saved draft
    this.dataShare.clear('formDraft');
    this.router.navigate(['/home']);
  }
}

// confirmation-page.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

@Component({
  selector: 'app-confirmation-page',
  template: `
    <div *ngIf="formData">
      <h2>Confirm Your Details</h2>
      <p>Name: {{ formData.name }}</p>
      <p>Email: {{ formData.email }}</p>
      <button (click)="submit()">Submit</button>
      <button (click)="goBack()">Edit</button>
    </div>
  `
})
export class ConfirmationPageComponent implements OnInit {
  formData: any;

  constructor(
    private router: Router,
    private dataShare: DataShareService
  ) {}

  ngOnInit() {
    // Peek at data without removing it (user might go back)
    this.formData = this.dataShare.peek('formDraft');
    
    if (!this.formData) {
      // No data available, redirect back
      this.router.navigate(['/form']);
    }
  }

  submit() {
    // Submit data to API
    console.log('Submitting:', this.formData);
    
    // Clear draft after successful submission
    this.dataShare.clear('formDraft');
    
    this.router.navigate(['/success']);
  }

  goBack() {
    // Data is still preserved, just navigate back
    this.router.navigate(['/form']);
  }
}
```

### Example 3: Session-like Data with TTL

**Scenario:** Store temporary session data that expires automatically.

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="login()">
      <input [(ngModel)]="username" name="username" placeholder="Username">
      <input [(ngModel)]="password" type="password" name="password" placeholder="Password">
      <button type="submit">Login</button>
    </form>
  `
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private router: Router,
    private dataShare: DataShareService
  ) {}

  login() {
    // Simulate API call
    const sessionData = {
      userId: 123,
      username: this.username,
      loginTime: new Date().toISOString(),
      tempToken: 'temp-token-abc123'
    };

    // Store session data with 1-hour TTL
    this.dataShare.set('tempSession', sessionData, {
      persist: true,
      useLocalStorage: true,
      ttl: 60 * 60 * 1000  // 1 hour
    });

    this.router.navigate(['/dashboard']);
  }
}

// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="session">
      <h1>Welcome, {{ session.username }}!</h1>
      <p>Session expires in 1 hour</p>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  session: any;

  constructor(
    private router: Router,
    private dataShare: DataShareService
  ) {}

  ngOnInit() {
    // Check if session exists and is valid
    this.session = this.dataShare.peek('tempSession');
    
    if (!this.session) {
      // Session expired or doesn't exist
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
    }
  }
}
```

### Example 4: Wizard/Multi-Step Flow

**Scenario:** Multi-step wizard where each step needs access to previous steps' data.

```typescript
// wizard-step1.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

interface WizardData {
  step1?: { firstName: string; lastName: string };
  step2?: { address: string; city: string };
  step3?: { cardNumber: string };
}

@Component({
  selector: 'app-wizard-step1',
  template: `
    <h2>Step 1: Personal Information</h2>
    <form (ngSubmit)="nextStep()">
      <input [(ngModel)]="firstName" name="firstName" placeholder="First Name" required>
      <input [(ngModel)]="lastName" name="lastName" placeholder="Last Name" required>
      <button type="submit">Next</button>
    </form>
  `
})
export class WizardStep1Component {
  firstName = '';
  lastName = '';

  constructor(
    private router: Router,
    private dataShare: DataShareService
  ) {}

  ngOnInit() {
    // Check if wizard data already exists
    const wizardData = this.dataShare.peek<WizardData>('wizardData');
    if (wizardData?.step1) {
      this.firstName = wizardData.step1.firstName;
      this.lastName = wizardData.step1.lastName;
    }
  }

  nextStep() {
    // Get existing wizard data or create new
    const wizardData = this.dataShare.peek<WizardData>('wizardData') || {};
    
    // Update step 1 data
    wizardData.step1 = {
      firstName: this.firstName,
      lastName: this.lastName
    };

    // Store with persistence (allow going back)
    this.dataShare.set<WizardData>('wizardData', wizardData, {
      persist: true,
      ttl: 30 * 60 * 1000  // 30 minutes
    });

    this.router.navigate(['/wizard/step2']);
  }
}

// wizard-step2.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

@Component({
  selector: 'app-wizard-step2',
  template: `
    <h2>Step 2: Address Information</h2>
    <p>Name: {{ wizardData?.step1?.firstName }} {{ wizardData?.step1?.lastName }}</p>
    <form (ngSubmit)="nextStep()">
      <input [(ngModel)]="address" name="address" placeholder="Address" required>
      <input [(ngModel)]="city" name="city" placeholder="City" required>
      <button type="button" (click)="previousStep()">Back</button>
      <button type="submit">Next</button>
    </form>
  `
})
export class WizardStep2Component {
  address = '';
  city = '';
  wizardData?: WizardData;

  constructor(
    private router: Router,
    private dataShare: DataShareService
  ) {}

  ngOnInit() {
    // Load wizard data
    this.wizardData = this.dataShare.peek<WizardData>('wizardData');
    
    if (!this.wizardData?.step1) {
      // Step 1 not completed, redirect
      this.router.navigate(['/wizard/step1']);
      return;
    }

    // Restore step 2 if previously filled
    if (this.wizardData.step2) {
      this.address = this.wizardData.step2.address;
      this.city = this.wizardData.step2.city;
    }
  }

  previousStep() {
    this.router.navigate(['/wizard/step1']);
  }

  nextStep() {
    // Update wizard data
    if (this.wizardData) {
      this.wizardData.step2 = {
        address: this.address,
        city: this.city
      };

      this.dataShare.set<WizardData>('wizardData', this.wizardData, {
        persist: true,
        ttl: 30 * 60 * 1000
      });

      this.router.navigate(['/wizard/step3']);
    }
  }
}

// wizard-complete.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data-share.service';

@Component({
  selector: 'app-wizard-complete',
  template: `
    <h2>Complete!</h2>
    <p>All steps completed successfully.</p>
  `
})
export class WizardCompleteComponent implements OnInit {
  constructor(
    private router: Router,
    private dataShare: DataShareService
  ) {}

  ngOnInit() {
    const wizardData = this.dataShare.get<WizardData>('wizardData');
    
    if (wizardData) {
      // Process complete wizard data
      console.log('Wizard completed:', wizardData);
      
      // Clear wizard data after completion
      this.dataShare.clear('wizardData');
    }
  }
}
```

## Advanced Patterns

### Pattern 1: Conditional Data with Default Values

```typescript
// Use default values when data might not exist
const userData = this.dataShare.get('userData', { 
  name: 'Guest', 
  role: 'visitor' 
});
```

### Pattern 2: Check Before Navigate

```typescript
// Verify data exists before navigation
navigateToDetail(item: any) {
  if (this.dataShare.has('detailData')) {
    // Clear old data
    this.dataShare.clear('detailData');
  }
  
  this.dataShare.set('detailData', item);
  this.router.navigate(['/detail']);
}
```

### Pattern 3: Cleanup on Component Destroy

```typescript
@Component({...})
export class MyComponent implements OnDestroy {
  constructor(private dataShare: DataShareService) {}
  
  ngOnDestroy() {
    // Clean up any persistent data when component is destroyed
    this.dataShare.clear('myComponentData');
  }
}
```

### Pattern 4: Global State Management

```typescript
// app-settings.service.ts
@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  constructor(private dataShare: DataShareService) {
    this.loadSettings();
  }

  loadSettings() {
    // Load settings from localStorage on app start
    const settings = this.dataShare.get('appSettings', this.defaultSettings);
    // Apply settings...
  }

  saveSettings(settings: any) {
    // Save settings to localStorage with persistence
    this.dataShare.set('appSettings', settings, {
      persist: true,
      useLocalStorage: true
    });
  }

  private defaultSettings = {
    theme: 'light',
    language: 'en'
  };
}
```

## Security Benefits

### ❌ Before (Insecure with Query Parameters)

```typescript
// INSECURE: Data visible in URL
this.router.navigate(['/profile'], { 
  queryParams: { 
    userId: 123, 
    email: 'user@example.com',
    apiToken: 'secret-token-123'  // Exposed in URL!
  } 
});

// URL: http://example.com/profile?userId=123&email=user@example.com&apiToken=secret-token-123
// Problems:
// - Visible in browser history
// - Leaked via referrer headers
// - Can be bookmarked/shared
// - Logged by servers/proxies
```

### ✅ After (Secure with DataShare)

```typescript
// SECURE: Data not exposed in URL
this.dataShare.set('userData', {
  userId: 123,
  email: 'user@example.com',
  apiToken: 'secret-token-123'  // Safe!
});
this.router.navigate(['/profile']);

// URL: http://example.com/profile
// Benefits:
// - No data in browser history
// - No referrer leakage
// - Can't be bookmarked/shared with data
// - Not logged by servers
```

## Best Practices Summary

1. **Use consume-once for navigation data** - Default behavior cleans up automatically
2. **Use persist + TTL for temporary state** - Prevent memory leaks
3. **Use localStorage for user preferences** - Survive page refresh
4. **Always check data availability** - Handle direct navigation gracefully
5. **Clear data after use** - Prevent stale data issues
6. **Use TypeScript generics** - Maintain type safety
7. **Provide default values** - Handle missing data elegantly
8. **Never store passwords** - Even with DataShare, use proper auth mechanisms

## Migration from Query Parameters

### Old Code (Query Parameters)
```typescript
// Navigate with query params
this.router.navigate(['/detail'], { 
  queryParams: { id: item.id, name: item.name } 
});

// Retrieve in target component
this.route.queryParams.subscribe(params => {
  this.id = params['id'];
  this.name = params['name'];
});
```

### New Code (DataShare)
```typescript
// Navigate with DataShare
this.dataShare.set('detailItem', item);
this.router.navigate(['/detail']);

// Retrieve in target component
const item = this.dataShare.get('detailItem');
if (item) {
  this.id = item.id;
  this.name = item.name;
}
```
