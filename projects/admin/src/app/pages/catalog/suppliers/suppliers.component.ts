import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import {
  PlatformCatalogService,
  VendorRow,
} from 'src/app/services/platform-catalog.service';
import { PlatformVendor } from '@stockpot/shared';

// ── Add Supplier Dialog ──────────────────────────────────────────────────────

@Component({
  selector: 'app-add-supplier-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Add Supplier</h2>
    <mat-dialog-content>
      <form
        [formGroup]="form"
        novalidate
        class="d-flex flex-column gap-16 p-t-8"
      >
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Business Name *</mat-label>
          <input
            matInput
            formControlName="name"
            placeholder="e.g. FreshFarms Inc."
          />
          @if (f['name'].touched && f['name'].hasError('required')) {
            <mat-error>Business name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Contact Email</mat-label>
          <input
            matInput
            type="email"
            formControlName="email"
            placeholder="supplier@example.com"
          />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button
        mat-flat-button
        color="primary"
        (click)="save()"
        [disabled]="form.invalid"
        data-test-id="admn-dialog-save-btn"
      >
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class AddSupplierDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AddSupplierDialogComponent>);

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl(''),
    phone: new FormControl(''),
  });

  get f() {
    return this.form.controls;
  }

  save(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      const now = new Date().toISOString();
      const vendor: PlatformVendor = {
        name: value.name!,
        categories: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
        ...(value.email ? { email: value.email } : {}),
        ...(value.phone ? { phone: value.phone } : {}),
      };
      this.dialogRef.close(vendor);
    }
  }
}

// ── Suppliers List Component ─────────────────────────────────────────────────

@Component({
  selector: 'app-suppliers',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './suppliers.component.html',
})
export class SuppliersComponent implements OnInit {
  private catalogService = inject(PlatformCatalogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['name', 'email', 'status', 'actions'];
  vendors = signal<VendorRow[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.catalogService.getVendors().subscribe({
      next: (rows) => {
        this.vendors.set(rows);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(AddSupplierDialogComponent, {
      width: '480px',
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: PlatformVendor | undefined) => {
      if (!result) return;
      this.catalogService
        .createVendor(result)
        .then(() =>
          this.snackBar.open('Supplier added.', 'Dismiss', { duration: 3000 }),
        )
        .catch(() =>
          this.snackBar.open('Failed to add supplier.', 'Dismiss', {
            duration: 3000,
          }),
        );
    });
  }

  deactivate(vendor: VendorRow): void {
    this.catalogService
      .deactivateVendor(vendor.id)
      .then(() =>
        this.snackBar.open('Supplier deactivated.', 'Dismiss', {
          duration: 3000,
        }),
      );
  }
}
