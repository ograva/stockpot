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
import { MaterialModule } from 'src/app/material.module';
import { PlatformCatalogService, UomRow } from 'src/app/services/platform-catalog.service';
import { PlatformUom } from '@stockpot/shared';

// ── Add UoM Dialog ───────────────────────────────────────────────────────────

@Component({
  selector: 'app-add-uom-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Add Unit of Measure</h2>
    <mat-dialog-content>
      <form [formGroup]="form" novalidate class="d-flex flex-column gap-16 p-t-8">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Name *</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Kilogram" />
          @if (f['name'].touched && f['name'].hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Symbol *</mat-label>
          <input matInput formControlName="symbol" placeholder="e.g. kg" />
          @if (f['symbol'].touched && f['symbol'].hasError('required')) {
            <mat-error>Symbol is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Category *</mat-label>
          <mat-select formControlName="category">
            <mat-option value="weight">Weight</mat-option>
            <mat-option value="volume">Volume</mat-option>
            <mat-option value="count">Count</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Base Unit Symbol *</mat-label>
          <input matInput formControlName="baseUnit" placeholder="e.g. kg" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Conversion Factor *</mat-label>
          <input matInput type="number" formControlName="conversionFactor" placeholder="1" />
          @if (f['conversionFactor'].touched && f['conversionFactor'].hasError('min')) {
            <mat-error>Must be greater than 0</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()"
        [disabled]="form.invalid" data-test-id="admn-dialog-save-btn">
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class AddUomDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AddUomDialogComponent>);

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    symbol: new FormControl('', [Validators.required]),
    category: new FormControl<PlatformUom['category']>('count', [Validators.required]),
    baseUnit: new FormControl('pcs', [Validators.required]),
    conversionFactor: new FormControl(1, [Validators.required, Validators.min(0.000001)]),
  });

  get f() {
    return this.form.controls;
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.form.getRawValue(), isActive: true });
    }
  }
}

// ── UoM List Component ───────────────────────────────────────────────────────

@Component({
  selector: 'app-uom',
  imports: [CommonModule, MaterialModule],
  templateUrl: './uom.component.html',
})
export class UomComponent implements OnInit {
  private catalogService = inject(PlatformCatalogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['name', 'symbol', 'category', 'conversionFactor', 'status', 'actions'];
  showArchived = signal(false);
  uoms = signal<UomRow[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadUoms();
  }

  loadUoms(): void {
    this.isLoading.set(true);
    this.catalogService.getUoms(this.showArchived()).subscribe({
      next: (rows) => {
        this.uoms.set(rows);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleArchived(): void {
    this.showArchived.update((v) => !v);
    this.loadUoms();
  }

  openAddDialog(): void {
    const ref = this.dialog.open(AddUomDialogComponent, {
      width: '480px',
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: PlatformUom | undefined) => {
      if (!result) return;
      this.catalogService
        .createUom(result)
        .then(() =>
          this.snackBar.open('UoM created.', 'Dismiss', { duration: 3000 }),
        )
        .catch(() =>
          this.snackBar.open('Failed to create UoM.', 'Dismiss', { duration: 3000 }),
        );
    });
  }

  archive(uom: UomRow): void {
    this.catalogService
      .archiveUom(uom.id)
      .then(() =>
        this.snackBar.open('UoM archived.', 'Dismiss', { duration: 3000 }),
      )
      .catch(() =>
        this.snackBar.open('Failed to archive UoM.', 'Dismiss', { duration: 3000 }),
      );
  }
}
