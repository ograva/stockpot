import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Auth,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../material.module';
import { CoreService } from '../../services/core.service';
import { AppUser, serializeAppUser } from '@stockpot/shared';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private core = inject(CoreService);
  private snackBar = inject(MatSnackBar);

  readonly isSavingProfile = signal(false);
  readonly isChangingPassword = signal(false);
  readonly profileError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);

  profileForm = new FormGroup({
    displayName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  get pf() {
    return this.profileForm.controls;
  }

  get pwf() {
    return this.passwordForm.controls;
  }

  get email(): string {
    return this.core.currentUser()?.email ?? '';
  }

  get role(): string {
    return this.core.appUser()?.role ?? '';
  }

  ngOnInit(): void {
    // Populate form from CoreService signal — no direct Firestore read needed
    const appUser = this.core.appUser();
    this.profileForm.patchValue({
      displayName: appUser?.name || this.core.currentUser()?.displayName || '',
    });
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const user = this.core.currentUser();
    const appUser = this.core.appUser();
    if (!user || !appUser) return;

    this.profileError.set(null);
    this.isSavingProfile.set(true);
    try {
      const newName = this.pf['displayName'].value!;

      // 1. Update Firebase Auth displayName
      await updateProfile(user, { displayName: newName });
      this.core.refreshCurrentUser();

      // 2. Write updated AppUserDoc to Firestore
      const updatedAppUser: AppUser = { ...appUser, name: newName };
      await setDoc(
        doc(
          this.firestore,
          `restaurants/${appUser.restaurantId}/users/${user.uid}`,
        ),
        serializeAppUser(updatedAppUser),
        { merge: true },
      );

      // 3. Reflect change immediately in CoreService signal
      this.core.setAppUser(updatedAppUser);

      this.snackBar.open('Profile updated.', 'Dismiss', { duration: 3000 });
    } catch {
      this.profileError.set('Failed to update profile. Please try again.');
    } finally {
      this.isSavingProfile.set(false);
    }
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const user = this.core.currentUser();
    if (!user || !user.email) return;

    this.passwordError.set(null);
    this.isChangingPassword.set(true);
    try {
      const { currentPassword, newPassword } = this.passwordForm.getRawValue();

      // Firebase requires recent login before password change — re-auth first
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword!,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword!);

      this.passwordForm.reset();
      this.snackBar.open('Password changed successfully.', 'Dismiss', {
        duration: 3000,
      });
    } catch (err: any) {
      if (
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential'
      ) {
        this.passwordError.set('Incorrect current password.');
      } else {
        this.passwordError.set('Failed to change password. Please try again.');
      }
    } finally {
      this.isChangingPassword.set(false);
    }
  }
}
