import { Injectable } from '@angular/core';
import {
  RawMaterial,
  SubComponent,
  Recipe,
  RecipeRawIngredient,
  RecipeSubComponentIngredient,
  SubComponentIngredient,
} from '@stockpot/shared';

@Injectable({ providedIn: 'root' })
export class CostService {
  /**
   * Calculate the cost per yieldUnit for a sub-component.
   *   cost = sum(ingredient.qty × rawMaterial.unitCost) / yieldQty / yieldPercent
   *
   * @param subComponent The sub-component to cost.
   * @param materialsById Map of rawMaterialId → RawMaterial.
   */
  calcSubComponentCost(
    subComponent: SubComponent,
    materialsById: Map<string, RawMaterial>,
  ): number {
    const rawCost = subComponent.ingredients.reduce(
      (sum: number, ing: SubComponentIngredient) => {
        const mat = materialsById.get(ing.rawMaterialId);
        return sum + ing.qty * (mat?.unitCost ?? 0);
      },
      0,
    );
    const yieldDecimal =
      subComponent.yieldPercent > 0 ? subComponent.yieldPercent : 1;
    const yieldQty = subComponent.yieldQty > 0 ? subComponent.yieldQty : 1;
    return rawCost / yieldQty / yieldDecimal;
  }

  /**
   * Calculate the theoretical cost per portion for a recipe.
   *   cost = Σ rawIngredients(qty × rawMat.unitCost)
   *        + Σ subComponentIngredients(qty × subComponent.calculatedCostPerUnit)
   *
   * @param recipe The recipe to cost.
   * @param materialsById Map of rawMaterialId → RawMaterial.
   * @param subComponentsById Map of subComponentId → SubComponent.
   */
  calcRecipeCost(
    recipe: Recipe,
    materialsById: Map<string, RawMaterial>,
    subComponentsById: Map<string, SubComponent>,
  ): number {
    const rawCost = recipe.rawIngredients.reduce(
      (sum: number, ing: RecipeRawIngredient) => {
        const mat = materialsById.get(ing.rawMaterialId);
        return sum + ing.qty * (mat?.unitCost ?? 0);
      },
      0,
    );
    const subCost = recipe.subComponentIngredients.reduce(
      (sum: number, ing: RecipeSubComponentIngredient) => {
        const sub = subComponentsById.get(ing.subComponentId);
        return sum + ing.qty * (sub?.calculatedCostPerUnit ?? 0);
      },
      0,
    );
    return rawCost + subCost;
  }

  /**
   * Guard against circular ingredient chains.
   * Returns true if adding `candidateId` as a sub-component to a recipe would
   * introduce a cycle — i.e. the sub-component's own ingredients (recursively)
   * already reference the recipe.
   *
   * For Phase 1, sub-components only contain raw materials (no nesting), so this
   * is a simple O(n) check over the sub-component's ingredients.
   *
   * @param recipeId The recipe being edited.
   * @param candidateId The sub-component being added.
   * @param subComponentsById All sub-components in the restaurant.
   */
  hasCircularDependency(
    recipeId: string,
    candidateId: string,
    subComponentsById: Map<string, SubComponent & { id: string }>,
  ): boolean {
    // BFS / DFS through sub-component tree
    const visited = new Set<string>();
    const stack: string[] = [candidateId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === recipeId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      // Sub-components in Phase 1 only reference raw materials — no nested sub-components.
      // When nested sub-components are supported, push their IDs here.
    }
    return false;
  }
}
