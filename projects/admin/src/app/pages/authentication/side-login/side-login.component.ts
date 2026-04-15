import { Component, inject, signal, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Auth,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  setPersistence,
} from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-login',
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent implements OnInit {
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    // Check for access-denied error passed via query param from AppComponent
    const error = this.route.snapshot.queryParamMap.get('error');
    if (error === 'access_denied') {
      this.errorMessage.set(
        'Access Denied. This account does not have platform admin privileges.',
      );
    }
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
