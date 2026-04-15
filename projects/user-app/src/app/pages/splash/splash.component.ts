import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-splash',
  imports: [],
  templateUrl: './splash.component.html',
})
export class SplashComponent {
  private router = inject(Router);
  private core = inject(CoreService);
  private firestore = inject(Firestore);

  private minDisplayElapsed = signal(false);
  // undefined = check pending, true = needs onboarding, false = profile complete
  private needsOnboarding = signal<boolean | undefined>(undefined);

  constructor() {
    // Enforce a minimum 2-second display time for branding visibility
    setTimeout(() => this.minDisplayElapsed.set(true), 2000);

    // When auth resolves to a real user, check whether they have a name in Firestore
    effect(() => {
      const user = this.core.currentUser();
      if (user === undefined || user === null) return; // wait or skip if not auth

      // Avoid triggering multiple checks
      if (this.needsOnboarding() !== undefined) return;

      getDoc(doc(this.firestore, 'users', user.uid))
        .then((snap) => {
          const data = snap.data() as { name?: string } | undefined;
          this.needsOnboarding.set(!data?.name);
        })
        .catch(() => {
          // If check fails, skip onboarding to avoid blocking the user
          this.needsOnboarding.set(false);
        });
    });

    // Navigate once BOTH minimum time has elapsed AND auth + onboarding check are resolved
    effect(() => {
      const elapsed = this.minDisplayElapsed();
      const user = this.core.currentUser();
      if (!elapsed || user === undefined) return;

      if (user === null) {
        this.router.navigate(['/authentication/login']);
        return;
      }

      // Wait for Firestore profile check to complete
      const onboarding = this.needsOnboarding();
      if (onboarding === undefined) return;

      if (onboarding) {
        this.router.navigate(['/dashboard/profile'], {
          queryParams: { onboarding: 'true' },
        });
      } else {
        this.router.navigate(['/dashboard/home']);
      }
    });
  }
}
