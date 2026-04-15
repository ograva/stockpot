import { Injectable, signal, computed, inject } from '@angular/core';
import { AppSettings, defaults } from '../config';
import { Auth, User } from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { AppUser, deserializeAppUser } from '@stockpot/shared';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private optionsSignal = signal<AppSettings>(defaults);

  // Auth state signal — written exclusively by AppComponent's onAuthStateChanged listener.
  // undefined = still resolving, null = unauthenticated, User = authenticated.
  private readonly _currentUser = signal<User | null | undefined>(undefined);
  readonly currentUser = this._currentUser.asReadonly();

  // App user signal — resolved from Firestore after auth resolves.
  // undefined = still loading, null = no restaurant (triggers setup wizard), AppUser = resolved.
  private readonly _appUser = signal<AppUser | null | undefined>(undefined);
  readonly appUser = this._appUser.asReadonly();

  /** Called only by AppComponent's onAuthStateChanged listener. */
  setCurrentUser(user: User | null): void {
    this._currentUser.set(user);
  }

  /** Called by AppComponent after loadAppUser resolves, or directly in tests. */
  setAppUser(appUser: AppUser | null): void {
    this._appUser.set(appUser);
  }

  /**
   * Resolves the AppUser from Firestore using the `restaurantId` custom claim
   * on the Firebase Auth token. If no claim is present, the user has not yet
   * completed the first-run setup wizard — sets appUser to null.
   *
   * Called by AppComponent's onAuthStateChanged after each sign-in.
   */
  async loadAppUser(user: User): Promise<void> {
    try {
      const tokenResult = await user.getIdTokenResult(false);
      const restaurantId = tokenResult.claims['restaurantId'] as string | undefined;
      if (!restaurantId) {
        // No restaurant claim — setup wizard (AUTH-003) not yet completed.
        this._appUser.set(null);
        return;
      }
      const userDoc = doc(this.firestore, `restaurants/${restaurantId}/users/${user.uid}`);
      const snap = await getDoc(userDoc);
      this._appUser.set(snap.exists() ? deserializeAppUser(snap.data()) : null);
    } catch {
      this._appUser.set(null);
    }
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
