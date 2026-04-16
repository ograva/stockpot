import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Auth,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  setPersistence,
} from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-login',
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  private auth = inject(Auth);

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  async submit() {
    if (this.form.invalid) return;
    this.errorMessage.set(null);
    this.isLoading.set(true);
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      await signInWithEmailAndPassword(
        this.auth,
        this.f['email'].value!,
        this.f['password'].value!,
      );
      // Navigation is handled by AppComponent's onAuthStateChanged listener.
    } catch (err: any) {
      this.errorMessage.set(this.friendlyError(err.code));
    } finally {
      this.isLoading.set(false);
    }
  }

  private friendlyError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Sign in failed. Please try again.';
    }
  }
}
