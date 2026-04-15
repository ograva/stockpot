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
import {
  PlatformCatalogService,
  IngredientRow,
  UomRow,
} from 'src/app/services/platform-catalog.service';
import { PlatformIngredient } from '@stockpot/shared';

// ── Add Ingredient Dialog ────────────────────────────────────────────────────

@Component({
  selector: 'app-add-ingredient-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Add Ingredient</h2>
    <mat-dialog-content>
      <form [formGroup]="form" novalidate class="d-flex flex-column gap-16 p-t-8">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Name *</mat-label>
          <input matInput formControlName="name" placeholder="e.g. All-Purpose Flour" />
          @if (f['name'].touched && f['name'].hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Category</mat-label>
          <input matInput formControlName="category" placeholder="e.g. Dry Goods" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Default UoM *</mat-label>
          <mat-select formControlName="defaultUnit">
            @for (uom of uoms; track uom.id) {
              <mat-option [value]="uom.symbol">{{ uom.name }} ({{ uom.symbol }})</mat-option>
            }
          </mat-select>
          @if (f['defaultUnit'].touched && f['defaultUnit'].hasError('required')) {
            <mat-error>Default UoM is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
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
export class AddIngredientDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<AddIngredientDialogComponent>);
  private catalogService = inject(PlatformCatalogService);

  uoms: UomRow[] = [];

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl(''),
    defaultUnit: new FormControl('kg', [Validators.required]),
    description: new FormControl(''),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.catalogService.getUoms(false).subscribe({
      next: (rows) => (this.uoms = rows),
    });
  }

  save(): void {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      const ingredient: PlatformIngredient = {
        name: value.name!,
        category: value.category ?? '',
        defaultUnit: value.defaultUnit ?? 'kg',
        isActive: true,
        ...(value.description ? { description: value.description } : {}),
      };
      this.dialogRef.close(ingredient);
    }
  }
}

// ── Ingredients List Component ───────────────────────────────────────────────

@Component({
  selector: 'app-ingredients',
  imports: [CommonModule, MaterialModule],
  templateUrl: './ingredients.component.html',
})
export class IngredientsComponent implements OnInit {
  private catalogService = inject(PlatformCatalogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['name', 'category', 'defaultUnit', 'status', 'actions'];
  showArchived = signal(false);
  ingredients = signal<IngredientRow[]>([]);
  isLoading = signal(true);
  filterText = signal('');

  filteredIngredients = () =>
    this.ingredients().filter((i) =>
      i.name.toLowerCase().includes(this.filterText().toLowerCase()),
    );

  ngOnInit(): void {
    this.loadIngredients();
  }

  loadIngredients(): void {
    this.isLoading.set(true);
    this.catalogService.getIngredients(this.showArchived()).subscribe({
      next: (rows) => {
        this.ingredients.set(rows);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleArchived(): void {
    this.showArchived.update((v) => !v);
    this.loadIngredients();
  }

  onFilter(value: string): void {
    this.filterText.set(value);
  }

  openAddDialog(): void {
    const ref = this.dialog.open(AddIngredientDialogComponent, {
      width: '480px',
      disableClose: true,
    });
    ref.afterClosed().subscribe((result: PlatformIngredient | undefined) => {
      if (!result) return;
      this.catalogService
        .createIngredient(result)
        .then(() =>
          this.snackBar.open('Ingredient created.', 'Dismiss', { duration: 3000 }),
        )
        .catch(() =>
          this.snackBar.open('Failed to create ingredient.', 'Dismiss', { duration: 3000 }),
        );
    });
  }

  archive(ingredient: IngredientRow): void {
    this.catalogService
      .archiveIngredient(ingredient.id)
      .then(() =>
        this.snackBar.open('Ingredient archived.', 'Dismiss', { duration: 3000 }),
      )
      .catch(() =>
        this.snackBar.open('Failed to archive ingredient.', 'Dismiss', { duration: 3000 }),
      );
  }
}
