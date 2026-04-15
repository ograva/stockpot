import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Auth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from '@angular/fire/auth';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-admin-profile',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class AdminProfileComponent implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private core = inject(CoreService);
  private snackBar = inject(MatSnackBar);

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

  isSavingProfile = false;
  isChangingPassword = false;

  ngOnInit(): void {
    const user = this.core.currentUser();
    if (user?.displayName) {
      this.profileForm.patchValue({ displayName: user.displayName });
    }
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;
    const user = this.core.currentUser();
    if (!user) return;
    this.isSavingProfile = true;
    const displayName = this.profileForm.value.displayName!;
    try {
      await updateDoc(doc(this.firestore, `platform_admins/${user.uid}`), {
        displayName,
      });
      this.snackBar.open('Profile updated.', 'Dismiss', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to update profile.', 'Dismiss', {
        duration: 3000,
      });
    } finally {
      this.isSavingProfile = false;
    }
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) return;
    const user = this.auth.currentUser;
    if (!user?.email) return;
    this.isChangingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword!,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword!);
      this.snackBar.open('Password updated.', 'Dismiss', { duration: 3000 });
      this.passwordForm.reset();
    } catch {
      this.snackBar.open('Incorrect current password.', 'Dismiss', {
        duration: 3000,
      });
    } finally {
      this.isChangingPassword = false;
    }
  }
}
