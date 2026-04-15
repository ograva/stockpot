import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Auth, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CoreService } from '../../services/core.service';
import { StoreForwardService } from '../../services/store-forward.service';
import {
  UserProfileDoc,
  USER_PROFILE_SCHEMA_VERSION,
  serializeUserProfile,
  deserializeUserProfile,
} from '@stockpot/shared';

const PROFILE_KEY = 'user_profile';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
    RouterModule,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private core = inject(CoreService);
  private storeForward = inject(StoreForwardService);
  private snackBar = inject(MatSnackBar);

  readonly isOnboarding = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form = new FormGroup({
    displayName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    photoURL: new FormControl(''),
  });

  get f() {
    return this.form.controls;
  }

  get email(): string {
    return this.core.currentUser()?.email ?? '';
  }

  get role(): string {
    const cached = this.storeForward.get<UserProfileDoc>(PROFILE_KEY)();
    return cached?.role ?? 'user';
  }

  async ngOnInit(): Promise<void> {
    const onboarding = this.route.snapshot.queryParamMap.get('onboarding');
    this.isOnboarding.set(onboarding === 'true');

    // Make DisplayName required in onboarding mode (already is required by default)
    const user = this.core.currentUser();
    if (!user) return;

    // Sync Firestore profile (deserialize normalises schema version + defaults)
    const docRef = doc(this.firestore, 'users', user.uid);
    this.storeForward.sync<UserProfileDoc>(PROFILE_KEY, `users/${user.uid}`, {
      deserialize: deserializeUserProfile,
    });

    // Try cache first for fast paint, then fall back to a direct Firestore read
    const cached = this.storeForward.get<UserProfileDoc>(PROFILE_KEY)();
    if (cached) {
      this.form.patchValue({
        displayName: cached.name || user.displayName || '',
        photoURL: cached.photoURL ?? user.photoURL ?? '',
      });
    } else {
      try {
        const snap = await getDoc(docRef);
        const profile = deserializeUserProfile(snap.data());
        this.form.patchValue({
          displayName: profile.name || user.displayName || '',
          photoURL: profile.photoURL ?? user.photoURL ?? '',
        });
      } catch {
        // Fall back to Auth user values
        this.form.patchValue({
          displayName: user.displayName ?? '',
          photoURL: user.photoURL ?? '',
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.storeForward.unsync(PROFILE_KEY);
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.core.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const { displayName, photoURL } = this.form.getRawValue();
      const name = displayName!;
      // Use undefined (not null) — serializeUserProfile omits undefined optionals
      const photo = photoURL || undefined;

      // Update Firebase Auth profile — only pass photoURL when it has a value;
      // the Auth API rejects null (only strings are valid for photoURL).
      await updateProfile(user, {
        displayName: name,
        ...(photo !== undefined ? { photoURL: photo } : {}),
      });
      // Immediately refresh the CoreService signal so the header reflects
      // the new displayName/photoURL without waiting for a new auth event.
      this.core.refreshCurrentUser();

      // Build typed document — serialize() strips undefineds before Firestore write
      const profileDoc: UserProfileDoc = {
        _schemaVersion: USER_PROFILE_SCHEMA_VERSION,
        name,
        email: user.email ?? '',
        role: this.role,
        ...(photo ? { photoURL: photo } : {}),
      };

      // Store-and-Forward: write locally + serialized payload to Firestore
      this.storeForward.set(PROFILE_KEY, profileDoc, `users/${user.uid}`, {
        serialize: serializeUserProfile,
        deserialize: deserializeUserProfile,
      });

      this.snackBar.open('Profile saved.', 'Dismiss', { duration: 4000 });

      if (this.isOnboarding()) {
        this.router.navigate(['/dashboard/home']);
      }
    } catch {
      this.errorMessage.set('Failed to save profile. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
