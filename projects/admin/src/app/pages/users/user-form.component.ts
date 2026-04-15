import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateCurrentUser,
} from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { UsersService } from '../../services/users.service';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  private usersService = inject(UsersService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private editUid = signal<string | null>(null);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    role: new FormControl<'admin' | 'user'>('user', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEditMode.set(true);
      this.editUid.set(idParam);
      this.f['password'].removeValidators(Validators.required);
      this.f['password'].updateValueAndValidity();

      const user = this.usersService.getById(idParam);
      if (user) {
        this.form.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
        });
      }
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { name, email, password, role } = this.form.getRawValue();

      if (!this.isEditMode()) {
        // Create mode: create Firebase Auth user and Firestore document
        const adminUser = this.auth.currentUser;
        const credential = await createUserWithEmailAndPassword(
          this.auth,
          email!,
          password!,
        );
        const newUid = credential.user.uid;

        // Restore admin session before any navigation
        if (adminUser) {
          await updateCurrentUser(this.auth, adminUser);
        }

        await this.usersService.create(newUid, {
          name: name!,
          email: email!,
          role: role!,
          createdAt: Timestamp.now(),
        });

        this.snackBar.open('User created successfully.', 'Dismiss', {
          duration: 4000,
        });
      } else {
        // Edit mode: update Firestore document only
        await this.usersService.update(this.editUid()!, {
          name: name!,
          role: role!,
        });

        this.snackBar.open('User updated successfully.', 'Dismiss', {
          duration: 4000,
        });
      }

      this.router.navigate(['/dashboard/users']);
    } catch (err: any) {
      this.errorMessage.set(this.friendlyError(err.code ?? ''));
    } finally {
      this.isLoading.set(false);
    }
  }

  async confirmDelete(): Promise<void> {
    const uid = this.editUid();
    if (!uid) return;

    const ref = this.dialog.open(DeleteConfirmDialogComponent);
    const confirmed = await ref.afterClosed().toPromise();
    if (!confirmed) return;

    this.isLoading.set(true);
    try {
      await this.usersService.delete(uid);
      this.snackBar.open('User deleted.', 'Dismiss', { duration: 4000 });
      this.router.navigate(['/dashboard/users']);
    } catch {
      this.errorMessage.set('Failed to delete user. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/users']);
  }

  private friendlyError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
