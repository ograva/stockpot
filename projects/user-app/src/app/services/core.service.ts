import { Injectable, signal, computed, inject } from '@angular/core';
import { AppSettings, defaults } from '../config';
import { Auth, User } from '@angular/fire/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private auth = inject(Auth);
  private optionsSignal = signal<AppSettings>(defaults);

  // Auth state signal — written exclusively by AppComponent's onAuthStateChanged listener.
  // undefined = still resolving, null = unauthenticated, User = authenticated.
  private readonly _currentUser = signal<User | null | undefined>(undefined);
  readonly currentUser = this._currentUser.asReadonly();

  /** Called only by AppComponent's onAuthStateChanged listener. */
  setCurrentUser(user: User | null): void {
    this._currentUser.set(user);
  }

  /** Call after updateProfile() to immediately reflect the updated displayName / photoURL.
   *  Firebase mutates the User object in-place, so the signal needs a null-then-user
   *  assignment to break the object reference and force Signal re-evaluation. */
  refreshCurrentUser(): void {
    const user = this.auth.currentUser;
    this._currentUser.set(null);
    this._currentUser.set(user);
  }

  readonly authStatus = computed<AuthStatus>(() => {
    const user = this._currentUser();
    if (user === undefined) return 'loading';
    return user !== null ? 'authenticated' : 'unauthenticated';
  });

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
