import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import {
  PlatformCatalogService,
  CatalogItemRow,
  IngredientRow,
} from 'src/app/services/platform-catalog.service';
import { VendorCatalogItem } from '@stockpot/shared';

// ── Add Product Dialog ───────────────────────────────────────────────────────

@Component({
  selector: 'app-add-product-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Add Product to Catalog</h2>
    <mat-dialog-content>
      <form
        [formGroup]="form"
        novalidate
        class="d-flex flex-column gap-16 p-t-8"
      >
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Ingredient *</mat-label>
          <mat-select
            formControlName="platformIngredientRef"
            data-test-id="admn-supplier-ing-select"
          >
            @for (ing of ingredients; track ing.id) {
              <mat-option [value]="ing.id"
                >{{ ing.name }} ({{ ing.defaultUnit }})</mat-option
              >
            }
          </mat-select>
          @if (
            f['platformIngredientRef'].touched &&
            f['platformIngredientRef'].hasError('required')
          ) {
            <mat-error>Ingredient is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Product Name *</mat-label>
          <input
            matInput
            formControlName="name"
            placeholder="e.g. All-Purpose Flour 25kg bag"
          />
          @if (f['name'].touched && f['name'].hasError('required')) {
            <mat-error>Product name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>UoM *</mat-label>
          <input matInput formControlName="unit" placeholder="e.g. bag" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Price per Unit (PHP) *</mat-label>
          <input
            matInput
            type="number"
            formControlName="pricePerUnit"
            data-test-id="admn-supplier-price-input"
          />
          @if (f['pricePerUnit'].touched && f['pricePerUnit'].hasError('min')) {
            <mat-error>Price must be ≥ 0</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>SKU (optional)</mat-label>
          <input matInput formControlName="sku" />
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
        data-test-id="admn-supplier-product-save-btn"
      >
        Add Product
      </button>
    </mat-dialog-actions>
  `,
})
export class AddProductDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<AddProductDialogComponent>);
  private catalogService = inject(PlatformCatalogService);

  ingredients: IngredientRow[] = [];

  form = new FormGroup({
    platformIngredientRef: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    unit: new FormControl('kg', [Validators.required]),
    pricePerUnit: new FormControl(0, [Validators.required, Validators.min(0)]),
    sku: new FormControl(''),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.catalogService.getIngredients(false).subscribe({
      next: (rows) => (this.ingredients = rows),
    });
  }

  save(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      const now = new Date().toISOString();
      const item: VendorCatalogItem = {
        name: value.name!,
        unit: value.unit ?? 'kg',
        pricePerUnit: value.pricePerUnit ?? 0,
        isAvailable: true,
        priceUpdatedAt: now,
        createdAt: now,
        ...(value.platformIngredientRef
          ? { platformIngredientRef: value.platformIngredientRef }
          : {}),
        ...(value.sku ? { sku: value.sku } : {}),
      };
      this.dialogRef.close(item);
    }
  }
}

// ── Supplier Detail Component ────────────────────────────────────────────────

@Component({
  selector: 'app-supplier-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './supplier-detail.component.html',
})
export class SupplierDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogService = inject(PlatformCatalogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  vendorId = signal('');
  catalogItems = signal<CatalogItemRow[]>([]);
  isLoading = signal(true);

  readonly displayedColumns = [
    'name',
    'unit',
    'pricePerUnit',
    'priceUpdatedAt',
    'availability',
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('vendorId') ?? '';
    this.vendorId.set(id);
    this.catalogService.getVendorCatalog(id).subscribe({
      next: (items) => {
        this.catalogItems.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAddProductDialog(): void {
    const ref = this.dialog.open(AddProductDialogComponent, {
      width: '520px',
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: VendorCatalogItem | undefined) => {
      if (!result) return;
      this.catalogService
        .addProductToSupplier(this.vendorId(), this.catalogItems(), result)
        .then(() =>
          this.snackBar.open('Product added.', 'Dismiss', { duration: 3000 }),
        )
        .catch((err: Error) =>
          this.snackBar.open(err.message, 'Dismiss', { duration: 5000 }),
        );
    });
  }
}
