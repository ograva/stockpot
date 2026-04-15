import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { RestaurantService } from 'src/app/services/restaurant.service';

@Component({
  selector: 'app-setup-wizard',
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './setup-wizard.component.html',
})
export class SetupWizardComponent {
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Step 1 — Restaurant profile
  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    currency: new FormControl('PHP', [Validators.required]),
    timezone: new FormControl('Asia/Manila', [Validators.required]),
    address: new FormControl(''),
  });

  // Step 2 — Team invites (optional)
  teamForm = new FormGroup({
    inviteEmails: new FormControl(''),
  });

  get pf() {
    return this.profileForm.controls;
  }

  async finish(): Promise<void> {
    if (this.profileForm.invalid) return;
    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    try {
      await this.restaurantService.createTenant({
        name: this.pf['name'].value ?? '',
        currency: this.pf['currency'].value ?? 'PHP',
        timezone: this.pf['timezone'].value ?? 'Asia/Manila',
        address: this.pf['address'].value ?? '',
      });
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set('Setup failed. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
