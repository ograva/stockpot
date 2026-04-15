import { Injectable, signal, inject } from '@angular/core';
import { AppSettings, defaults } from '../config';
import { Auth, User, authState } from '@angular/fire/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private auth = inject(Auth);
  private optionsSignal = signal<AppSettings>(defaults);

  // Writable signal so that profile updates (displayName, photoURL) are
  // reflected in the header without waiting for a new auth-state event.
  // authState() only fires on sign-in / sign-out, NOT on updateProfile().
  private readonly _currentUser = signal<User | null | undefined>(undefined);
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    authState(this.auth)
      .pipe(takeUntilDestroyed())
      .subscribe((user) => this._currentUser.set(user));
  }

  /** Call after updateProfile() to immediately reflect the updated
   *  displayName / photoURL in the header and any other consumers.
   *
   *  Firebase mutates the User object in-place, so the signal would see
   *  the same object reference and skip re-renders. Setting null first
   *  forces Angular's Object.is() check to detect a real change. */
  refreshCurrentUser(): void {
    const user = this.auth.currentUser;
    this._currentUser.set(null);   // force reference break
    this._currentUser.set(user);   // restore with updated profile
  }

  readonly authStatus = (): AuthStatus => {
    const user = this.currentUser();
    if (user === undefined) return 'loading';
    return user !== null ? 'authenticated' : 'unauthenticated';
  };

  getOptions() {
    return this.optionsSignal();
  }

  setOptions(options: Partial<AppSettings>) {
    this.optionsSignal.update((current) => ({
      ...current,
      ...options,
    }));
  }
}
