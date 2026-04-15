import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TenantService, TenantRow } from 'src/app/services/tenant.service';

// ── Add Tenant Dialog ────────────────────────────────────────────────────────

@Component({
  selector: 'app-add-tenant-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Add Tenant</h2>
    <mat-dialog-content>
      <form [formGroup]="form" novalidate class="d-flex flex-column gap-16 p-t-8">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Restaurant Name *</mat-label>
          <input matInput formControlName="name" data-test-id="admn-tenant-name-input" />
          @if (f['name'].touched && f['name'].hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Timezone</mat-label>
          <mat-select formControlName="timezone">
            <mat-option value="Asia/Manila">Asia/Manila (PHT)</mat-option>
            <mat-option value="Asia/Singapore">Asia/Singapore (SGT)</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Currency</mat-label>
          <mat-select formControlName="currency">
            <mat-option value="PHP">PHP — Philippine Peso</mat-option>
            <mat-option value="USD">USD — US Dollar</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()"
        [disabled]="form.invalid" data-test-id="admn-tenant-save-btn">
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class AddTenantDialogComponent {
  dialogRef = inject(MatDialogRef<AddTenantDialogComponent>);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    address: new FormControl(''),
    timezone: new FormControl('Asia/Manila'),
    currency: new FormControl('PHP'),
  });

  get f() {
    return this.form.controls;
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}

// ── Edit Tenant Dialog ───────────────────────────────────────────────────────

@Component({
  selector: 'app-edit-tenant-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Edit Tenant</h2>
    <mat-dialog-content>
      <form [formGroup]="form" novalidate class="d-flex flex-column gap-16 p-t-8">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Restaurant Name *</mat-label>
          <input matInput formControlName="name" data-test-id="admn-tenant-edit-name-input" />
          @if (f['name'].touched && f['name'].hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Timezone</mat-label>
          <mat-select formControlName="timezone">
            <mat-option value="Asia/Manila">Asia/Manila (PHT)</mat-option>
            <mat-option value="Asia/Singapore">Asia/Singapore (SGT)</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()"
        [disabled]="form.invalid" data-test-id="admn-tenant-save-btn">
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class EditTenantDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<EditTenantDialogComponent>);
  data: TenantRow = inject(MAT_DIALOG_DATA);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    address: new FormControl(''),
    timezone: new FormControl('Asia/Manila'),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.name,
      address: this.data.address,
      timezone: this.data.timezone,
    });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}

// ── Tenants List Component ───────────────────────────────────────────────────

@Component({
  selector: 'app-tenants',
  imports: [CommonModule, MaterialModule],
  templateUrl: './tenants.component.html',
})
export class TenantsComponent implements OnInit {
  private tenantService = inject(TenantService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly displayedColumns = [
    'name',
    'planTier',
    'status',
    'createdAt',
    'actions',
  ];
  readonly pageSize = 25;

  tenants = signal<TenantRow[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.tenantService.getAll().subscribe({
      next: (rows) => {
        this.tenants.set(rows);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(AddTenantDialogComponent, {
      width: '480px',
      disableClose: true,
    });
    ref
      .afterClosed()
      .subscribe(
        (result: { name: string; address: string; timezone: string; currency: string } | undefined) => {
          if (!result) return;
          const restaurantId = crypto.randomUUID();
          this.tenantService
            .createTenant(restaurantId, {
              name: result.name,
              address: result.address ?? '',
              planTier: 'starter',
              timezone: result.timezone ?? 'Asia/Manila',
              currency: result.currency ?? 'PHP',
            })
            .then(() =>
              this.snackBar.open('Tenant created.', 'Dismiss', {
                duration: 3000,
              }),
            )
            .catch(() =>
              this.snackBar.open('Failed to create tenant.', 'Dismiss', {
                duration: 3000,
              }),
            );
        },
      );
  }

  openEditDialog(tenant: TenantRow): void {
    const ref = this.dialog.open(EditTenantDialogComponent, {
      width: '480px',
      disableClose: true,
      data: tenant,
    });
    ref
      .afterClosed()
      .subscribe(
        (result: { name: string; address: string; timezone: string } | undefined) => {
          if (!result) return;
          this.tenantService
            .updateTenant(tenant.id, result)
            .then(() =>
              this.snackBar.open('Tenant updated.', 'Dismiss', {
                duration: 3000,
              }),
            )
            .catch(() =>
              this.snackBar.open('Failed to update tenant.', 'Dismiss', {
                duration: 3000,
              }),
            );
        },
      );
  }

  suspend(tenant: TenantRow): void {
    this.tenantService
      .suspendTenant(tenant.id)
      .then(() =>
        this.snackBar.open('Tenant suspended.', 'Dismiss', { duration: 3000 }),
      );
  }

  reactivate(tenant: TenantRow): void {
    this.tenantService
      .reactivateTenant(tenant.id)
      .then(() =>
        this.snackBar.open('Tenant reactivated.', 'Dismiss', {
          duration: 3000,
        }),
      );
  }
}
