import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { RouterModule } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  RawMaterial,
  RAW_MATERIAL_DEFAULTS,
  PlatformIngredient,
  deserializePlatformIngredient,
} from '@stockpot/shared';
import { CoreService } from '../../../services/core.service';
import {
  RawMaterialService,
  RawMaterialRow,
} from '../../../services/raw-material.service';
import {
  SupplierService,
  SupplierRow,
} from '../../../services/supplier.service';

// ─── Add Platform Material Dialog ────────────────────────────────────────────

interface PlatformIngredientRow extends PlatformIngredient {
  id: string;
}

@Component({
  selector: 'app-add-platform-material-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Add Raw Material from Catalog</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
        <mat-form-field>
          <mat-label>Platform Ingredient</mat-label>
          <mat-select
            formControlName="platformIngredientId"
            data-test-id="mstr-platform-ing-select"
          >
            @for (ing of data.platformIngredients; track ing.id) {
              <mat-option [value]="ing.id"
                >{{ ing.name }} ({{ ing.defaultUnit }})</mat-option
              >
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Display Name</mat-label>
          <input
            matInput
            formControlName="name"
            data-test-id="mstr-material-name-input"
          />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Unit</mat-label>
          <input matInput formControlName="unit" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Unit Cost</mat-label>
          <input matInput type="number" formControlName="unitCost" />
          <span matSuffix>{{ data.currency }}</span>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Category (optional)</mat-label>
          <input matInput formControlName="category" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        data-test-id="mstr-material-save-btn"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        Add
      </button>
    </mat-dialog-actions>
  `,
})
export class AddPlatformMaterialDialogComponent {
  data = inject<{
    platformIngredients: PlatformIngredientRow[];
    currency: string;
  }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<AddPlatformMaterialDialogComponent>);
  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    platformIngredientId: ['', Validators.required],
    name: ['', Validators.required],
    unit: ['kg', Validators.required],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    category: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const material: RawMaterial = {
      ...RAW_MATERIAL_DEFAULTS,
      name: v.name,
      unit: v.unit,
      unitCost: v.unitCost,
      platformIngredientRef: v.platformIngredientId,
      ...(v.category ? { category: v.category } : {}),
    };
    this.dialogRef.close(material);
  }
}

// ─── Add Custom Material Dialog ───────────────────────────────────────────────

@Component({
  selector: 'app-add-custom-material-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Add Custom Raw Material</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input
            matInput
            formControlName="name"
            data-test-id="mstr-material-custom-name-input"
          />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Unit</mat-label>
          <input matInput formControlName="unit" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Unit Cost</mat-label>
          <input matInput type="number" formControlName="unitCost" />
          <span matSuffix>{{ data.currency }}</span>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Category (optional)</mat-label>
          <input matInput formControlName="category" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        Add
      </button>
    </mat-dialog-actions>
  `,
})
export class AddCustomMaterialDialogComponent {
  data = inject<{ currency: string }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<AddCustomMaterialDialogComponent>);
  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    unit: ['kg', Validators.required],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    category: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const material: RawMaterial = {
      ...RAW_MATERIAL_DEFAULTS,
      name: v.name,
      unit: v.unit,
      unitCost: v.unitCost,
      ...(v.category ? { category: v.category } : {}),
    };
    this.dialogRef.close(material);
  }
}

// ─── Edit Material Dialog (includes supplier link — MSTR-004) ────────────────

@Component({
  selector: 'app-edit-material-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Edit Raw Material</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Unit</mat-label>
          <input matInput formControlName="unit" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Unit Cost</mat-label>
          <input matInput type="number" formControlName="unitCost" />
          <span matSuffix>{{ data.currency }}</span>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Current Stock</mat-label>
          <input matInput type="number" formControlName="currentStock" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Par Level</mat-label>
          <input matInput type="number" formControlName="parLevel" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Preferred Supplier</mat-label>
          <mat-select
            formControlName="vendorId"
            data-test-id="mstr-material-supplier-select"
          >
            <mat-option value="">— None —</mat-option>
            @for (s of data.suppliers; track s.id) {
              <mat-option [value]="s.id">
                {{ s.name }}
                @if (!s.isCustom) {
                  <span class="text-xs text-blue-500 ml-1">[Platform]</span>
                }
              </mat-option>
            }
          </mat-select>
          <mat-hint>MSTR-004 — link to restaurant supplier</mat-hint>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Category (optional)</mat-label>
          <input matInput formControlName="category" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class EditMaterialDialogComponent {
  data = inject<{
    material: RawMaterialRow;
    suppliers: SupplierRow[];
    currency: string;
  }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<EditMaterialDialogComponent>);
  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: [this.data.material.name, Validators.required],
    unit: [this.data.material.unit, Validators.required],
    unitCost: [
      this.data.material.unitCost,
      [Validators.required, Validators.min(0)],
    ],
    currentStock: [this.data.material.currentStock ?? 0],
    parLevel: [this.data.material.parLevel ?? 0],
    vendorId: [this.data.material.vendorId ?? ''],
    category: [this.data.material.category ?? ''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const changes: Partial<RawMaterial> = {
      name: v.name,
      unit: v.unit,
      unitCost: v.unitCost,
      currentStock: v.currentStock,
      parLevel: v.parLevel,
      ...(v.vendorId ? { vendorId: v.vendorId } : {}),
      ...(v.category ? { category: v.category } : {}),
    };
    this.dialogRef.close(changes);
  }
}

// ─── Raw Materials Page ───────────────────────────────────────────────────────

@Component({
  selector: 'app-raw-materials',
  imports: [CommonModule, MaterialModule, RouterModule, ReactiveFormsModule],
  templateUrl: './raw-materials.component.html',
})
export class RawMaterialsComponent implements OnInit {
  private firestore = inject(Firestore);
  private core = inject(CoreService);
  private rawMaterialService = inject(RawMaterialService);
  private supplierService = inject(SupplierService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = [
    'name',
    'unit',
    'unitCost',
    'currentStock',
    'parLevel',
    'supplier',
    'type',
    'actions',
  ];
  searchQuery = signal('');
  loading = signal(false);

  private allMaterials = signal<RawMaterialRow[]>([]);
  private allSuppliers = signal<SupplierRow[]>([]);

  private platformIngredients = toSignal(
    collectionData(
      query(
        collection(this.firestore, 'platform_ingredients'),
        where('isActive', '==', true),
        orderBy('name'),
      ),
      { idField: 'id' },
    ).pipe(
      map((docs) =>
        docs.map((d) => ({
          id: (d as { id: string }).id,
          ...deserializePlatformIngredient(d),
        })),
      ),
    ),
    { initialValue: [] as PlatformIngredientRow[] },
  );

  materials = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.allMaterials();
    return this.allMaterials().filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.category ?? '').toLowerCase().includes(q),
    );
  });

  get restaurantId(): string | undefined {
    return this.core.appUser()?.restaurantId;
  }

  get currency(): string {
    return 'PHP';
  }

  ngOnInit(): void {
    const rid = this.restaurantId;
    if (!rid) return;
    this.rawMaterialService.getAll(rid).subscribe((mats) => {
      this.allMaterials.set(mats);
    });
    this.supplierService.getAll(rid).subscribe((sups) => {
      this.allSuppliers.set(sups);
    });
  }

  supplierName(vendorId: string | undefined): string {
    if (!vendorId) return '—';
    return this.allSuppliers().find((s) => s.id === vendorId)?.name ?? vendorId;
  }

  openAddPlatformDialog(): void {
    const ref = this.dialog.open(AddPlatformMaterialDialogComponent, {
      width: '480px',
      data: {
        platformIngredients: this.platformIngredients(),
        currency: this.currency,
      },
    });
    ref.afterClosed().subscribe(async (material: RawMaterial | undefined) => {
      if (!material) return;
      const rid = this.restaurantId;
      if (!rid) return;
      try {
        await this.rawMaterialService.create(rid, material);
        this.snackBar.open('Raw material added.', 'OK', { duration: 3000 });
      } catch {
        this.snackBar.open('Failed to add material.', 'Dismiss', {
          duration: 3000,
        });
      }
    });
  }

  openAddCustomDialog(): void {
    const ref = this.dialog.open(AddCustomMaterialDialogComponent, {
      width: '440px',
      data: { currency: this.currency },
    });
    ref.afterClosed().subscribe(async (material: RawMaterial | undefined) => {
      if (!material) return;
      const rid = this.restaurantId;
      if (!rid) return;
      try {
        await this.rawMaterialService.create(rid, material);
        this.snackBar.open('Custom material added.', 'OK', { duration: 3000 });
      } catch {
        this.snackBar.open('Failed to add material.', 'Dismiss', {
          duration: 3000,
        });
      }
    });
  }

  openEditDialog(material: RawMaterialRow): void {
    const ref = this.dialog.open(EditMaterialDialogComponent, {
      width: '480px',
      data: {
        material,
        suppliers: this.allSuppliers(),
        currency: this.currency,
      },
    });
    ref
      .afterClosed()
      .subscribe(async (changes: Partial<RawMaterial> | undefined) => {
        if (!changes) return;
        const rid = this.restaurantId;
        if (!rid) return;
        try {
          await this.rawMaterialService.update(rid, material.id, changes);
          this.snackBar.open('Material updated.', 'OK', { duration: 3000 });
        } catch {
          this.snackBar.open('Failed to update.', 'Dismiss', {
            duration: 3000,
          });
        }
      });
  }

  async deleteMaterial(material: RawMaterialRow): Promise<void> {
    const rid = this.restaurantId;
    if (!rid) return;
    try {
      await this.rawMaterialService.delete(rid, material.id);
      this.snackBar.open('Material deleted.', 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to delete.', 'Dismiss', { duration: 3000 });
    }
  }
}
