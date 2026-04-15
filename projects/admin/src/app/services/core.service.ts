import { Injectable, signal, computed } from '@angular/core';
import { AppSettings, defaults } from '../config';
import { User } from '@angular/fire/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private optionsSignal = signal<AppSettings>(defaults);

  // Auth state Signal — written exclusively by AppComponent's onAuthStateChanged listener.
  // undefined = still resolving, null = unauthenticated, User = authenticated.
  private _currentUser = signal<User | null | undefined>(undefined);
  readonly currentUser = this._currentUser.asReadonly();

  readonly authStatus = computed<AuthStatus>(() => {
    const user = this._currentUser();
    if (user === undefined) return 'loading';
    return user !== null ? 'authenticated' : 'unauthenticated';
  });

  /** Called only by AppComponent's onAuthStateChanged listener. */
  setCurrentUser(user: User | null): void {
    this._currentUser.set(user);
  }

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
