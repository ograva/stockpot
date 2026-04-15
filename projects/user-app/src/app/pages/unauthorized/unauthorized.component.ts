import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterModule, MaterialModule],
  template: `
    <div
      class="flex flex-col items-center justify-center h-screen gap-6 text-center px-4"
    >
      <mat-icon
        class="text-6xl text-warn"
        style="font-size: 64px; width: 64px; height: 64px;"
      >
        lock
      </mat-icon>
      <h1 class="mat-headline-4 m-0">Access Denied</h1>
      <p
        class="mat-body-1 text-secondary"
        data-test-id="auth-unauthorized-message"
      >
        You don't have permission to view this page.
      </p>
      <button mat-flat-button color="primary" routerLink="/dashboard">
        Go to Dashboard
      </button>
    </div>
  `,
})
export class UnauthorizedComponent {}
