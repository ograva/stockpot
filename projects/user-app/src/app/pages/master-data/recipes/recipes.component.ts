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
  Recipe,
  RECIPE_DEFAULTS,
  RecipeType,
  RecipeRawIngredient,
  RecipeSubComponentIngredient,
  RawMaterial,
  SubComponent,
} from '@stockpot/shared';
import { CoreService } from '../../../services/core.service';
import { RecipeService, RecipeRow } from '../../../services/recipe.service';
import {
  RawMaterialService,
  RawMaterialRow,
} from '../../../services/raw-material.service';
import {
  SubComponentService,
  SubComponentRow,
} from '../../../services/sub-component.service';
import { CostService } from '../../../services/cost.service';

// â”€â”€â”€ Add/Edit Recipe Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Component({
  selector: 'app-recipe-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.recipe ? 'Edit' : 'Add' }} Recipe</h2>
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
                data-test-id="mstr-recipe-name-input"
              />
              @if (form.get('name')?.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block"
                >Recipe Type</label
              >
              <mat-radio-group
                formControlName="recipeType"
                class="flex gap-4"
                data-test-id="mstr-recipe-type-select"
              >
                <mat-radio-button value="COOKED_TO_ORDER"
                  >Cooked to Order</mat-radio-button
                >
                <mat-radio-button value="PRE_MADE"
                  >Pre-Made / Batch</mat-radio-button
                >
              </mat-radio-group>
              <p class="text-xs text-gray-500 mt-1">
                Pre-Made recipes deduct stock at prep time; Cooked to Order
                deduct at sale.
              </p>
            </div>

            <mat-form-field>
              <mat-label>Category (optional)</mat-label>
              <input matInput formControlName="category" />
            </mat-form-field>
            <div class="flex gap-4">
              <mat-form-field class="flex-1">
                <mat-label>Selling Price</mat-label>
                <input matInput type="number" formControlName="sellingPrice" />
                <span matSuffix>PHP</span>
              </mat-form-field>
              <mat-form-field class="flex-1">
                <mat-label>Target Food Cost %</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="targetFoodCostPercent"
                  data-test-id="mstr-recipe-target-input"
                />
                <span matSuffix>%</span>
              </mat-form-field>
            </div>
            <div class="flex gap-4">
              <mat-form-field class="flex-1">
                <mat-label>Portion Size</mat-label>
                <input matInput type="number" formControlName="portionSize" />
              </mat-form-field>
              <mat-form-field class="flex-1">
                <mat-label>Portion Unit</mat-label>
                <input matInput formControlName="portionUnit" />
              </mat-form-field>
            </div>
            <mat-form-field>
              <mat-label>Par Portions Target</mat-label>
              <input matInput type="number" formControlName="parPortions" />
              <mat-hint
                >Min portions needed â€” drives back-calculation
                engine</mat-hint
              >
            </mat-form-field>
            @if (form.get('recipeType')?.value === 'PRE_MADE') {
              <mat-form-field>
                <mat-label>Current Batch Stock (portions)</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="currentStock"
                  data-test-id="mstr-recipe-stock-input"
                />
                <mat-hint>On-hand prepared portions</mat-hint>
              </mat-form-field>
            }
            <div class="flex items-center gap-2">
              <mat-slide-toggle formControlName="isActive"
                >Active on Menu</mat-slide-toggle
              >
            </div>
            <mat-form-field>
              <mat-label>Notes (optional)</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
            </mat-form-field>
          </form>
        </mat-tab>

        <!-- â”€â”€ Ingredients Tab â”€â”€ -->
        <mat-tab label="Ingredients">
          <div class="pt-4 flex flex-col gap-4">
            <h3
              class="font-medium text-sm text-gray-600 uppercase tracking-wide"
            >
              Raw Materials
            </h3>
            <div formArrayName="rawIngredients" [formGroup]="form">
              @for (ing of rawIngredientsArray.controls; track $index) {
                <div
                  [formGroupName]="$index"
                  class="flex items-center gap-3 mb-2"
                >
                  <mat-form-field class="flex-1">
                    <mat-label>Raw Material</mat-label>
                    <mat-select
                      formControlName="rawMaterialId"
                      data-test-id="mstr-recipe-search-ing"
                    >
                      @for (mat of data.materials; track mat.id) {
                        <mat-option [value]="mat.id"
                          >{{ mat.name }} ({{ mat.unit }})</mat-option
                        >
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field style="width:100px">
                    <mat-label>Qty / Portion</mat-label>
                    <input
                      matInput
                      type="number"
                      formControlName="qty"
                      [attr.data-test-id]="'mstr-recipe-item-qty-' + $index"
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
              (click)="addRawIngredient()"
            >
              <mat-icon>add</mat-icon> Add Raw Material
            </button>

            <mat-divider></mat-divider>

            <h3
              class="font-medium text-sm text-gray-600 uppercase tracking-wide"
            >
              Sub-Components
            </h3>
            <div formArrayName="subComponentIngredients" [formGroup]="form">
              @for (ing of subIngredientsArray.controls; track $index) {
                <div
                  [formGroupName]="$index"
                  class="flex items-center gap-3 mb-2"
                >
                  <mat-form-field class="flex-1">
                    <mat-label>Sub-Component</mat-label>
                    <mat-select
                      formControlName="subComponentId"
                      [attr.data-test-id]="'mstr-recipe-item-' + $index"
                    >
                      @for (sub of data.subComponents; track sub.id) {
                        <mat-option [value]="sub.id"
                          >{{ sub.name }} ({{ sub.yieldUnit }})</mat-option
                        >
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field style="width:100px">
                    <mat-label>Qty / Portion</mat-label>
                    <input
                      matInput
                      type="number"
                      formControlName="qty"
                      [attr.data-test-id]="'mstr-recipe-item-qty-sub-' + $index"
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
              (click)="addSubIngredient()"
            >
              <mat-icon>add</mat-icon> Add Sub-Component
            </button>

            <mat-divider></mat-divider>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500"
                >Theoretical Cost / Portion</span
              >
              <span class="font-semibold" data-test-id="mstr-recipe-theor-cost">
                {{ theoreticalCost() | number: '1.2-2' }} PHP
              </span>
            </div>
          </div>
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
                    [attr.data-test-id]="'mstr-recipe-step-' + $index"
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
              data-test-id="mstr-recipe-add-step-btn"
              (click)="addStep()"
            >
              <mat-icon>add</mat-icon> Add Step
            </button>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        data-test-id="mstr-recipe-save-btn"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class RecipeDialogComponent {
  data = inject<{
    recipe?: RecipeRow;
    materials: RawMaterialRow[];
    subComponents: SubComponentRow[];
    currency: string;
  }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<RecipeDialogComponent>);
  fb = inject(FormBuilder);
  cost = inject(CostService);

  form: FormGroup = this.fb.group({
    name: [this.data.recipe?.name ?? '', Validators.required],
    recipeType: [
      this.data.recipe?.recipeType ?? 'COOKED_TO_ORDER',
      Validators.required,
    ],
    category: [this.data.recipe?.category ?? ''],
    sellingPrice: [
      this.data.recipe?.sellingPrice ?? 0,
      [Validators.required, Validators.min(0)],
    ],
    targetFoodCostPercent: [30, [Validators.min(0), Validators.max(100)]],
    portionSize: [this.data.recipe?.portionSize ?? 1, Validators.required],
    portionUnit: [this.data.recipe?.portionUnit ?? 'pcs', Validators.required],
    parPortions: [this.data.recipe?.parPortions ?? 0, Validators.min(0)],
    currentStock: [this.data.recipe?.currentStock ?? 0, Validators.min(0)],
    isActive: [this.data.recipe?.isActive ?? true],
    notes: [this.data.recipe?.notes ?? ''],
    rawIngredients: this.fb.array(
      (this.data.recipe?.rawIngredients ?? []).map((ing) =>
        this.fb.group({
          rawMaterialId: [ing.rawMaterialId, Validators.required],
          qty: [ing.qty, [Validators.required, Validators.min(0)]],
        }),
      ),
    ),
    subComponentIngredients: this.fb.array(
      (this.data.recipe?.subComponentIngredients ?? []).map((ing) =>
        this.fb.group({
          subComponentId: [ing.subComponentId, Validators.required],
          qty: [ing.qty, [Validators.required, Validators.min(0)]],
        }),
      ),
    ),
    instructions: this.fb.array(
      (this.data.recipe?.instructions ?? []).map((step) =>
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

  theoreticalCost = computed(() => {
    const v = this.form.value as {
      rawIngredients: RecipeRawIngredient[];
      subComponentIngredients: RecipeSubComponentIngredient[];
    };
    const materialsById = new Map<string, RawMaterial>(
      this.data.materials.map((m) => [m.id, m]),
    );
    const subsById = new Map<string, SubComponent>(
      this.data.subComponents.map((s) => [s.id, s]),
    );
    const recipe: Recipe = {
      ...RECIPE_DEFAULTS,
      rawIngredients: v.rawIngredients ?? [],
      subComponentIngredients: v.subComponentIngredients ?? [],
    };
    return this.cost.calcRecipeCost(recipe, materialsById, subsById);
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;

    // Cycle detection
    const subsById = new Map(
      this.data.subComponents.map((s) => [s.id, { ...s, id: s.id }]),
    );
    const targetId = this.data.recipe?.id ?? '__new__';
    for (const ing of (v.subComponentIngredients ??
      []) as RecipeSubComponentIngredient[]) {
      if (
        ing.subComponentId &&
        this.cost.hasCircularDependency(targetId, ing.subComponentId, subsById)
      ) {
        return; // silently block â€” UI prevents save via disabled button
      }
    }

    // Wrap plain text steps in <p> tags
    const instructions: string[] = (v.instructions ?? [])
      .map((s: string) => s?.trim())
      .filter((s: string) => !!s)
      .map((s: string) => `<p>${s}</p>`);

    const recipe: Recipe = {
      name: v.name,
      recipeType: v.recipeType as RecipeType,
      ...(v.category ? { category: v.category } : {}),
      sellingPrice: v.sellingPrice,
      portionSize: v.portionSize,
      portionUnit: v.portionUnit,
      parPortions: v.parPortions ?? 0,
      currentStock: v.recipeType === 'PRE_MADE' ? (v.currentStock ?? 0) : 0,
      isActive: v.isActive,
      rawIngredients: (v.rawIngredients ?? []).map(
        (i: RecipeRawIngredient) => ({
          rawMaterialId: i.rawMaterialId,
          qty: i.qty,
        }),
      ),
      subComponentIngredients: (v.subComponentIngredients ?? []).map(
        (i: RecipeSubComponentIngredient) => ({
          subComponentId: i.subComponentId,
          qty: i.qty,
        }),
      ),
      instructions,
      theoreticalCost: this.theoreticalCost(),
      actualCost: this.data.recipe?.actualCost ?? 0,
      ...(v.notes ? { notes: v.notes } : {}),
    };
    this.dialogRef.close(recipe);
  }
}

// â”€â”€â”€ Recipes Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Component({
  selector: 'app-recipes',
  imports: [CommonModule, MaterialModule, RouterModule, ReactiveFormsModule],
  templateUrl: './recipes.component.html',
})
export class RecipesComponent implements OnInit {
  private core = inject(CoreService);
  private recipeService = inject(RecipeService);
  private rawMaterialService = inject(RawMaterialService);
  private subComponentService = inject(SubComponentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  allRecipes = signal<RecipeRow[]>([]);
  allMaterials = signal<RawMaterialRow[]>([]);
  allSubComponents = signal<SubComponentRow[]>([]);

  get restaurantId(): string | undefined {
    return this.core.appUser()?.restaurantId;
  }

  ngOnInit(): void {
    const rid = this.restaurantId;
    if (!rid) return;
    this.recipeService.getAll(rid).subscribe((r) => this.allRecipes.set(r));
    this.rawMaterialService
      .getAll(rid)
      .subscribe((m) => this.allMaterials.set(m));
    this.subComponentService
      .getAll(rid)
      .subscribe((s) => this.allSubComponents.set(s));
  }

  foodCostPercent(recipe: RecipeRow): number {
    if (!recipe.sellingPrice) return 0;
    return (recipe.theoreticalCost / recipe.sellingPrice) * 100;
  }

  openDialog(recipe?: RecipeRow): void {
    const ref = this.dialog.open(RecipeDialogComponent, {
      width: '680px',
      data: {
        recipe,
        materials: this.allMaterials(),
        subComponents: this.allSubComponents(),
        currency: 'PHP',
      },
    });
    ref.afterClosed().subscribe(async (result: Recipe | undefined) => {
      if (!result) return;
      const rid = this.restaurantId;
      if (!rid) return;
      try {
        if (recipe) {
          await this.recipeService.update(rid, recipe.id, result);
          this.snackBar.open('Recipe updated.', 'OK', { duration: 3000 });
        } else {
          await this.recipeService.create(rid, result);
          this.snackBar.open('Recipe added.', 'OK', { duration: 3000 });
        }
      } catch {
        this.snackBar.open('Operation failed.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  async deleteRecipe(recipe: RecipeRow): Promise<void> {
    const rid = this.restaurantId;
    if (!rid) return;
    try {
      await this.recipeService.delete(rid, recipe.id);
      this.snackBar.open('Recipe deleted.', 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to delete.', 'Dismiss', { duration: 3000 });
    }
  }
}
