import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';

@Component({
  selector: 'app-side-register',
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  get f() {
    return this.form.controls;
  }

  async submit() {
    if (this.form.invalid) return;
    this.errorMessage.set(null);
    this.isLoading.set(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth,
        this.f['email'].value!,
        this.f['password'].value!,
      );
      await updateProfile(credential.user, {
        displayName: this.f['name'].value!,
      });
      this.router.navigate(['/dashboard/home']);
    } catch (err: any) {
      this.errorMessage.set(this.friendlyError(err.code));
    } finally {
      this.isLoading.set(false);
    }
  }

  private friendlyError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      default:
        return 'Registration failed. Please try again.';
    }
  }
}
