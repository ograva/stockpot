import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirm-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete User</h2>
    <mat-dialog-content data-test-id="delete-dialog-content">
      <p>
        Are you sure you want to delete this user? This action cannot be undone.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-button
        mat-dialog-close
        data-test-id="delete-dialog-cancel-button"
      >
        Cancel
      </button>
      <button
        mat-raised-button
        color="warn"
        [mat-dialog-close]="true"
        data-test-id="delete-dialog-confirm-button"
      >
        Delete
      </button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialogComponent {}
