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
  SubComponentRawIngredient,
  SubComponentSubIngredient,
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

// â”€â”€â”€ Add/Edit SubComponent Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Component({
  selector: 'app-sub-component-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>
      {{ data.subComponent ? 'Edit' : 'Add' }} Sub-Component
    </h2>
    <mat-dialog-content class="max-h-[80vh] overflow-y-auto">
      <mat-tab-group>
        <!-- â”€â”€ Details Tab â”€â”€ -->
        <mat-tab label="Details">
          <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
            <mat-form-field>
              <mat-label>Name</mat-label>
              <input
                matInput
                formControlName="name"
                data-test-id="mstr-subcomp-name-input"
              />
              @if (form.get('name')?.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
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
                <mat-hint>0.01 â€“ 1.00</mat-hint>
              </mat-form-field>
            </div>

            <mat-form-field>
              <mat-label>Notes (optional)</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
            </mat-form-field>
          </form>
        </mat-tab>

        <!-- â”€â”€ Ingredients Tab â”€â”€ -->
        <mat-tab label="Ingredients">
          <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
            <h3
              class="font-medium text-sm text-gray-600 uppercase tracking-wide"
            >
              Raw Materials
            </h3>
            <div formArrayName="rawIngredients">
              @for (ing of rawIngredientsArray.controls; track $index) {
                <div
                  [formGroupName]="$index"
                  class="flex items-center gap-3 mb-2"
                >
                  <mat-form-field class="flex-1">
                    <mat-label>Raw Material</mat-label>
                    <mat-select
                      formControlName="rawMaterialId"
                      [attr.data-test-id]="'mstr-subcomp-raw-row-' + $index"
                    >
                      @for (mat of data.materials; track mat.id) {
                        <mat-option [value]="mat.id"
                          >{{ mat.name }} ({{ mat.unit }})</mat-option
                        >
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field style="width:100px">
                    <mat-label>Qty</mat-label>
                    <input
                      matInput
                      type="number"
                      formControlName="qty"
                      [attr.data-test-id]="'mstr-subcomp-qty-' + $index"
                    />
                  </mat-form-field>
                  <button
                    mat-icon-button
                    color="warn"
                    type="button"
                    (click)="removeRawIngredient($index)"
                  >
                    <mat-icon>remove_circle</mat-icon>
                  </button>
                </div>
              }
            </div>
            <button
              mat-stroked-button
              type="button"
              data-test-id="mstr-subcomp-raw-search"
              (click)="addRawIngredient()"
            >
              <mat-icon>add</mat-icon> Add Raw Material
            </button>

            <mat-divider class="my-2"></mat-divider>

            <h3
              class="font-medium text-sm text-gray-600 uppercase tracking-wide"
            >
              Sub-Components
            </h3>
            <div formArrayName="subComponentIngredients">
              @for (ing of subIngredientsArray.controls; track $index) {
                <div
                  [formGroupName]="$index"
                  class="flex items-center gap-3 mb-2"
                >
                  <mat-form-field class="flex-1">
                    <mat-label>Sub-Component</mat-label>
                    <mat-select
                      formControlName="subComponentId"
                      [attr.data-test-id]="'mstr-subcomp-sub-row-' + $index"
                    >
                      @for (sub of data.subComponents; track sub.id) {
                        <mat-option [value]="sub.id"
                          >{{ sub.name }} ({{ sub.yieldUnit }})</mat-option
                        >
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field style="width:100px">
                    <mat-label>Qty</mat-label>
                    <input
                      matInput
                      type="number"
                      formControlName="qty"
                      [attr.data-test-id]="'mstr-subcomp-qty-sub-' + $index"
                    />
                  </mat-form-field>
                  <button
                    mat-icon-button
                    color="warn"
                    type="button"
                    (click)="removeSubIngredient($index)"
                  >
                    <mat-icon>remove_circle</mat-icon>
                  </button>
                </div>
              }
            </div>
            <button
              mat-stroked-button
              type="button"
              data-test-id="mstr-subcomp-sub-search"
              (click)="addSubIngredient()"
            >
              <mat-icon>add</mat-icon> Add Sub-Component
            </button>

            <mat-divider class="my-2"></mat-divider>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500"
                >Estimated Cost Per Yield Unit</span
              >
              <span
                class="font-semibold"
                data-test-id="mstr-subcomp-total-cost"
              >
                {{ estimatedCost() | number: '1.2-2' }} PHP
              </span>
            </div>
          </form>
        </mat-tab>

        <!-- â”€â”€ Instructions Tab â”€â”€ -->
        <mat-tab label="Instructions">
          <div class="flex flex-col gap-3 pt-4" [formGroup]="form">
            @for (ctrl of instructionsArray.controls; track $index) {
              <div class="flex items-start gap-2">
                <span
                  class="mt-3 text-sm text-gray-500 font-medium w-6 text-right"
                  >{{ $index + 1 }}.</span
                >
                <mat-form-field class="flex-1">
                  <mat-label>Step {{ $index + 1 }}</mat-label>
                  <textarea
                    matInput
                    [formControl]="$any(ctrl)"
                    rows="2"
                    [attr.data-test-id]="'mstr-subcomp-step-' + $index"
                  ></textarea>
                </mat-form-field>
                <button
                  mat-icon-button
                  color="warn"
                  type="button"
                  (click)="removeStep($index)"
                  class="mt-2"
                >
                  <mat-icon>remove_circle</mat-icon>
                </button>
              </div>
            }
            <button
              mat-stroked-button
              type="button"
              data-test-id="mstr-subcomp-add-step-btn"
              (click)="addStep()"
            >
              <mat-icon>add</mat-icon> Add Step
            </button>
          </div>
        </mat-tab>

        <!-- â”€â”€ Stock & PAR Tab â”€â”€ -->
        <mat-tab label="Stock & PAR">
          <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
            <p class="text-sm text-gray-500">
              Track on-hand batch stock and set reorder alerts. Leave PAR fields
              at 0 to disable alerts for this sub-component.
            </p>
            <mat-form-field>
              <mat-label
                >Current Stock (in
                {{ form.get('yieldUnit')?.value || 'yield unit' }})</mat-label
              >
              <input
                matInput
                type="number"
                formControlName="currentStock"
                data-test-id="mstr-subcomp-stock-input"
              />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Par Minimum</mat-label>
              <input
                matInput
                type="number"
                formControlName="parMinimum"
                data-test-id="mstr-subcomp-par-input"
              />
              <mat-hint
                >Alert fires when stock falls below this. 0 =
                disabled.</mat-hint
              >
            </mat-form-field>
            <mat-form-field>
              <mat-label>Critical Threshold</mat-label>
              <input
                matInput
                type="number"
                formControlName="criticalThreshold"
                data-test-id="mstr-subcomp-critical-input"
              />
              <mat-hint
                >Stockout alarm level (should be â‰¤ par minimum). 0 =
                disabled.</mat-hint
              >
            </mat-form-field>
          </form>
        </mat-tab>
      </mat-tab-group>
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
    subComponents: SubComponentRow[];
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
    currentStock: [
      this.data.subComponent?.currentStock ?? 0,
      Validators.min(0),
    ],
    parMinimum: [this.data.subComponent?.parMinimum ?? 0, Validators.min(0)],
    criticalThreshold: [
      this.data.subComponent?.criticalThreshold ?? 0,
      Validators.min(0),
    ],
    rawIngredients: this.fb.array(
      (this.data.subComponent?.rawIngredients ?? []).map((ing) =>
        this.fb.group({
          rawMaterialId: [ing.rawMaterialId, Validators.required],
          qty: [ing.qty, [Validators.required, Validators.min(0)]],
        }),
      ),
    ),
    subComponentIngredients: this.fb.array(
      (this.data.subComponent?.subComponentIngredients ?? []).map((ing) =>
        this.fb.group({
          subComponentId: [ing.subComponentId, Validators.required],
          qty: [ing.qty, [Validators.required, Validators.min(0)]],
        }),
      ),
    ),
    instructions: this.fb.array(
      (this.data.subComponent?.instructions ?? []).map((step) =>
        this.fb.control(step),
      ),
    ),
  });

  get rawIngredientsArray(): FormArray {
    return this.form.get('rawIngredients') as FormArray;
  }

  get subIngredientsArray(): FormArray {
    return this.form.get('subComponentIngredients') as FormArray;
  }

  get instructionsArray(): FormArray {
    return this.form.get('instructions') as FormArray;
  }

  addRawIngredient(): void {
    this.rawIngredientsArray.push(
      this.fb.group({
        rawMaterialId: ['', Validators.required],
        qty: [0, [Validators.required, Validators.min(0)]],
      }),
    );
  }

  removeRawIngredient(index: number): void {
    this.rawIngredientsArray.removeAt(index);
  }

  addSubIngredient(): void {
    this.subIngredientsArray.push(
      this.fb.group({
        subComponentId: ['', Validators.required],
        qty: [0, [Validators.required, Validators.min(0)]],
      }),
    );
  }

  removeSubIngredient(index: number): void {
    this.subIngredientsArray.removeAt(index);
  }

  addStep(): void {
    this.instructionsArray.push(this.fb.control(''));
  }

  removeStep(index: number): void {
    this.instructionsArray.removeAt(index);
  }

  estimatedCost = computed(() => {
    const v = this.form.value;
    const materialsById = new Map<string, RawMaterial>(
      this.data.materials.map((m) => [m.id, m]),
    );
    const subComponentsById = new Map<string, SubComponent>(
      this.data.subComponents.map((s) => [s.id, s]),
    );
    const subComp: SubComponent = {
      ...SUB_COMPONENT_DEFAULTS,
      name: v.name ?? '',
      yieldQty: v.yieldQty ?? 1,
      yieldUnit: v.yieldUnit ?? 'kg',
      yieldPercent: v.yieldPercent ?? 1,
      rawIngredients: (v.rawIngredients ?? []) as SubComponentRawIngredient[],
      subComponentIngredients: (v.subComponentIngredients ??
        []) as SubComponentSubIngredient[],
    };
    return this.cost.calcSubComponentCost(
      subComp,
      materialsById,
      subComponentsById,
    );
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;

    // Cycle detection: check all sub-component ingredients
    const subsById = new Map(
      this.data.subComponents.map((s) => [s.id, { ...s, id: s.id }]),
    );
    const currentId = this.data.subComponent?.id ?? '__new__';
    for (const ing of (v.subComponentIngredients ??
      []) as SubComponentSubIngredient[]) {
      if (
        ing.subComponentId &&
        this.cost.hasCircularDependency(currentId, ing.subComponentId, subsById)
      ) {
        this.dialogRef.close({ _cycleError: true });
        return;
      }
    }

    // Wrap plain-text steps in <p> tags for HTML storage
    const instructions: string[] = (v.instructions ?? [])
      .map((s: string) => s?.trim())
      .filter((s: string) => !!s)
      .map((s: string) => `<p>${s}</p>`);

    const subComp: SubComponent = {
      name: v.name,
      yieldQty: v.yieldQty,
      yieldUnit: v.yieldUnit,
      yieldPercent: v.yieldPercent,
      calculatedCostPerUnit: this.estimatedCost(),
      rawIngredients: (v.rawIngredients ?? []).map(
        (i: SubComponentRawIngredient) => ({
          rawMaterialId: i.rawMaterialId,
          qty: i.qty,
        }),
      ),
      subComponentIngredients: (v.subComponentIngredients ?? []).map(
        (i: SubComponentSubIngredient) => ({
          subComponentId: i.subComponentId,
          qty: i.qty,
        }),
      ),
      instructions,
      currentStock: v.currentStock ?? 0,
      ...(v.parMinimum > 0 ? { parMinimum: v.parMinimum } : {}),
      ...(v.criticalThreshold > 0
        ? { criticalThreshold: v.criticalThreshold }
        : {}),
      ...(v.notes ? { notes: v.notes } : {}),
    };
    this.dialogRef.close(subComp);
  }
}

// â”€â”€â”€ Sub-Components Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  displayedColumns = ['name', 'yield', 'stock', 'cost', 'actions'];
  allSubComponents = signal<SubComponentRow[]>([]);
  allMaterials = signal<RawMaterialRow[]>([]);

  get restaurantId(): string | undefined {
    return this.core.appUser()?.restaurantId;
  }

  ngOnInit(): void {
    const rid = this.restaurantId;
    if (!rid) return;
    this.subComponentService
      .getAll(rid)
      .subscribe((subs) => this.allSubComponents.set(subs));
    this.rawMaterialService
      .getAll(rid)
      .subscribe((mats) => this.allMaterials.set(mats));
  }

  openDialog(subComponent?: SubComponentRow): void {
    const ref = this.dialog.open(SubComponentDialogComponent, {
      width: '680px',
      data: {
        subComponent,
        materials: this.allMaterials(),
        subComponents: this.allSubComponents().filter(
          (s) => s.id !== subComponent?.id,
        ),
        currency: 'PHP',
      },
    });
    ref
      .afterClosed()
      .subscribe(
        async (
          result: (SubComponent & { _cycleError?: boolean }) | undefined,
        ) => {
          if (!result) return;
          if (result._cycleError) {
            this.snackBar.open(
              'Circular dependency detected. Cannot save.',
              'Dismiss',
              {
                duration: 4000,
                panelClass: ['snack-error'],
                data: { 'data-test-id': 'mstr-subcomp-cycle-error' },
              },
            );
            return;
          }
          const rid = this.restaurantId;
          if (!rid) return;
          try {
            if (subComponent) {
              await this.subComponentService.update(
                rid,
                subComponent.id,
                result,
              );
              this.snackBar.open('Sub-component updated.', 'OK', {
                duration: 3000,
              });
            } else {
              await this.subComponentService.create(rid, result);
              this.snackBar.open('Sub-component added.', 'OK', {
                duration: 3000,
              });
            }
          } catch {
            this.snackBar.open('Operation failed.', 'Dismiss', {
              duration: 3000,
            });
          }
        },
      );
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
