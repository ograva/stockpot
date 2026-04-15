import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  Auth,
  onAuthStateChanged,
  signOut,
  getIdTokenResult,
} from '@angular/fire/auth';
import { CoreService } from './services/core.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);
  private core = inject(CoreService);

  // Tracks whether this is the very first emission from Firebase.
  // The first emission happens at app boot and initial routing is handled
  // by SplashComponent, so we skip the redirect logic for it.
  private isFirstEmission = true;

  private readonly unsubscribeAuth: () => void;

  constructor() {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Verify the platform_admin custom claim before granting access.
        // Always force-refresh the token to catch claim revocations.
        const tokenResult = await getIdTokenResult(user, true);
        if (!tokenResult.claims['platform_admin']) {
          // Sign out non-admin users and redirect to login with access-denied flag.
          await signOut(this.auth);
          this.core.setCurrentUser(null);
          this.router.navigate(['/authentication/login'], {
            queryParams: { error: 'access_denied' },
          });
          return;
        }
      }

      // 1. Keep the shared signal in sync
      this.core.setCurrentUser(user);

      // 2. Skip the first emission — SplashComponent drives initial navigation
      if (this.isFirstEmission) {
        this.isFirstEmission = false;
        return;
      }

      // 3. React to session transitions
      const url = this.router.url;
      if (user) {
        // User just logged in — leave dashboard routes alone, redirect from auth pages
        if (url.startsWith('/authentication') || url === '/splash') {
          this.router.navigate(['/dashboard/home']);
        }
      } else {
        // User logged out or token expired — redirect away from protected routes
        if (!url.startsWith('/authentication')) {
          this.router.navigate(['/authentication/login']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAuth();
  }
}
