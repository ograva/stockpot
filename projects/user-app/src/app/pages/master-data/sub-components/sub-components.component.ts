import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
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
  SubComponent,
  SUB_COMPONENT_DEFAULTS,
  SubComponentIngredient,
} from '@stockpot/shared';
import { CoreService } from '../../../services/core.service';
import {
  SubComponentService,
  SubComponentRow,
} from '../../../services/sub-component.service';
import {
  RawMaterialService,
  RawMaterialRow,
} from '../../../services/raw-material.service';
import { CostService } from '../../../services/cost.service';
import { RawMaterial } from '@stockpot/shared';

// ─── Add/Edit SubComponent Dialog ────────────────────────────────────────────

@Component({
  selector: 'app-sub-component-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>
      {{ data.subComponent ? 'Edit' : 'Add' }} Sub-Component
    </h2>
    <mat-dialog-content class="max-h-[70vh] overflow-y-auto">
      <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input
            matInput
            formControlName="name"
            data-test-id="mstr-subcomp-name-input"
          />
        </mat-form-field>
        <div class="flex gap-4">
          <mat-form-field class="flex-1">
            <mat-label>Yield Qty</mat-label>
            <input matInput type="number" formControlName="yieldQty" />
          </mat-form-field>
          <mat-form-field class="flex-1">
            <mat-label>Yield Unit</mat-label>
            <input matInput formControlName="yieldUnit" />
          </mat-form-field>
          <mat-form-field class="flex-1">
            <mat-label>Yield %</mat-label>
            <input matInput type="number" formControlName="yieldPercent" />
          </mat-form-field>
        </div>

        <h3 class="font-medium">Ingredients</h3>
        <div formArrayName="ingredients">
          @for (ing of ingredientsArray.controls; track $index) {
            <div [formGroupName]="$index" class="flex items-center gap-3 mb-2">
              <mat-form-field class="flex-1">
                <mat-label>Raw Material</mat-label>
                <mat-select
                  formControlName="rawMaterialId"
                  data-test-id="mstr-subcomp-ing-search"
                >
                  @for (mat of data.materials; track mat.id) {
                    <mat-option [value]="mat.id">{{ mat.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field style="width: 100px">
                <mat-label>Qty</mat-label>
                <input matInput type="number" formControlName="qty" />
              </mat-form-field>
              <button
                mat-icon-button
                color="warn"
                type="button"
                (click)="removeIngredient($index)"
              >
                <mat-icon>remove_circle</mat-icon>
              </button>
            </div>
          }
        </div>
        <button mat-stroked-button type="button" (click)="addIngredient()">
          <mat-icon>add</mat-icon> Add Ingredient
        </button>

        <mat-divider></mat-divider>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Estimated Cost Per Unit</span>
          <span class="font-semibold" data-test-id="mstr-subcomp-total-cost">
            {{ estimatedCost() | number: '1.2-2' }} {{ data.currency }}
          </span>
        </div>

        <mat-form-field>
          <mat-label>Notes (optional)</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        data-test-id="mstr-subcomp-save-btn"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class SubComponentDialogComponent {
  data = inject<{
    subComponent?: SubComponentRow;
    materials: RawMaterialRow[];
    currency: string;
  }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<SubComponentDialogComponent>);
  fb = inject(FormBuilder);
  cost = inject(CostService);

  form: FormGroup = this.fb.group({
    name: [this.data.subComponent?.name ?? '', Validators.required],
    yieldQty: [
      this.data.subComponent?.yieldQty ?? 1,
      [Validators.required, Validators.min(0.01)],
    ],
    yieldUnit: [this.data.subComponent?.yieldUnit ?? 'kg', Validators.required],
    yieldPercent: [
      this.data.subComponent?.yieldPercent ?? 1.0,
      [Validators.required, Validators.min(0.01), Validators.max(1)],
    ],
    notes: [this.data.subComponent?.notes ?? ''],
    ingredients: this.fb.array(
      (this.data.subComponent?.ingredients ?? []).map((ing) =>
        this.fb.group({
          rawMaterialId: [ing.rawMaterialId, Validators.required],
          qty: [ing.qty, [Validators.required, Validators.min(0)]],
        }),
      ),
    ),
  });

  get ingredientsArray(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  addIngredient(): void {
    this.ingredientsArray.push(
      this.fb.group({
        rawMaterialId: ['', Validators.required],
        qty: [0, [Validators.required, Validators.min(0)]],
      }),
    );
  }

  removeIngredient(index: number): void {
    this.ingredientsArray.removeAt(index);
  }

  estimatedCost = computed(() => {
    const v = this.form.value;
    const materialsById = new Map<string, RawMaterial>(
      this.data.materials.map((m) => [m.id, m]),
    );
    const subComp: SubComponent = {
      name: v.name ?? '',
      yieldQty: v.yieldQty ?? 1,
      yieldUnit: v.yieldUnit ?? 'kg',
      yieldPercent: v.yieldPercent ?? 1,
      calculatedCostPerUnit: 0,
      ingredients: (v.ingredients ?? []).map((i: SubComponentIngredient) => ({
        rawMaterialId: i.rawMaterialId,
        qty: i.qty,
      })),
    };
    return this.cost.calcSubComponentCost(subComp, materialsById);
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const subComp: SubComponent = {
      name: v.name,
      yieldQty: v.yieldQty,
      yieldUnit: v.yieldUnit,
      yieldPercent: v.yieldPercent,
      calculatedCostPerUnit: this.estimatedCost(),
      ingredients: (v.ingredients ?? []).map((i: SubComponentIngredient) => ({
        rawMaterialId: i.rawMaterialId,
        qty: i.qty,
      })),
      ...(v.notes ? { notes: v.notes } : {}),
    };
    this.dialogRef.close(subComp);
  }
}

// ─── Sub-Components Page ──────────────────────────────────────────────────────

@Component({
  selector: 'app-sub-components',
  imports: [CommonModule, MaterialModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sub-components.component.html',
})
export class SubComponentsComponent implements OnInit {
  private core = inject(CoreService);
  private subComponentService = inject(SubComponentService);
  private rawMaterialService = inject(RawMaterialService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['name', 'yield', 'cost', 'actions'];
  allSubComponents = signal<SubComponentRow[]>([]);
  allMaterials = signal<RawMaterialRow[]>([]);

  get restaurantId(): string | undefined {
    return this.core.appUser()?.restaurantId;
  }

  ngOnInit(): void {
    const rid = this.restaurantId;
    if (!rid) return;
    this.subComponentService.getAll(rid).subscribe((subs) => {
      this.allSubComponents.set(subs);
    });
    this.rawMaterialService.getAll(rid).subscribe((mats) => {
      this.allMaterials.set(mats);
    });
  }

  openDialog(subComponent?: SubComponentRow): void {
    const ref = this.dialog.open(SubComponentDialogComponent, {
      width: '640px',
      data: {
        subComponent,
        materials: this.allMaterials(),
        currency: 'PHP',
      },
    });
    ref.afterClosed().subscribe(async (result: SubComponent | undefined) => {
      if (!result) return;
      const rid = this.restaurantId;
      if (!rid) return;
      try {
        if (subComponent) {
          await this.subComponentService.update(rid, subComponent.id, result);
          this.snackBar.open('Sub-component updated.', 'OK', {
            duration: 3000,
          });
        } else {
          await this.subComponentService.create(rid, result);
          this.snackBar.open('Sub-component added.', 'OK', { duration: 3000 });
        }
      } catch {
        this.snackBar.open('Operation failed.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  async delete(sub: SubComponentRow): Promise<void> {
    const rid = this.restaurantId;
    if (!rid) return;
    try {
      await this.subComponentService.delete(rid, sub.id);
      this.snackBar.open('Sub-component deleted.', 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to delete.', 'Dismiss', { duration: 3000 });
    }
  }
}
