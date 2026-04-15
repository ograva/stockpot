import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
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
  // by SplashComponent (or direct route), so we skip the redirect logic for it.
  private isFirstEmission = true;

  private readonly unsubscribeAuth: () => void;

  constructor() {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, async (user) => {
      // 1. Keep the Firebase User signal in sync
      this.core.setCurrentUser(user);

      // 2. Load AppUser (role) from Firestore via restaurantId custom claim
      if (user) {
        await this.core.loadAppUser(user);
      } else {
        this.core.setAppUser(null);
      }

      // 3. Skip the first emission — initial routing is already handled
      if (this.isFirstEmission) {
        this.isFirstEmission = false;
        return;
      }

      // 4. React to session transitions (login / logout / token expiry)
      const url = this.router.url;
      if (user) {
        // User just signed in — redirect away from auth pages
        if (url.startsWith('/authentication') || url === '/') {
          const role = this.core.appUser()?.role;
          // staff goes straight to kitchen; everyone else to dashboard
          const destination = role === 'staff' ? '/kitchen' : '/dashboard';
          this.router.navigate([destination]);
        }
      } else {
        // User signed out or token expired — redirect away from protected routes
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
