import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-splash',
  imports: [],
  templateUrl: './splash.component.html',
})
export class SplashComponent {
  private router = inject(Router);
  private core = inject(CoreService);

  private minDisplayElapsed = signal(false);

  constructor() {
    // Enforce a minimum 2-second display time for branding visibility
    setTimeout(() => this.minDisplayElapsed.set(true), 2000);

    // Navigate once both the minimum display time has elapsed and the auth state
    // has been resolved by AppComponent's onAuthStateChanged listener.
    effect(() => {
      const status = this.core.authStatus();
      const elapsed = this.minDisplayElapsed();

      if (elapsed && status !== 'loading') {
        this.router.navigate(
          status === 'authenticated'
            ? ['/dashboard/home']
            : ['/authentication/login'],
        );
      }
    });
  }
}
