import { Injectable } from '@angular/core';
import {
  RawMaterial,
  SubComponent,
  Recipe,
  RecipeRawIngredient,
  RecipeSubComponentIngredient,
} from '@stockpot/shared';

@Injectable({ providedIn: 'root' })
export class CostService {
  /**
   * Calculate the cost per yieldUnit for a sub-component using DAG traversal.
   * Supports unbounded sub-component nesting (ADL-008).
   *
   * Formula: Σ(ingredient costs) / (yieldQty × yieldPercent)
   *
   * @param subComponent The sub-component to cost.
   * @param materialsById Map of rawMaterialId → RawMaterial.
   * @param subComponentsById Map of subComponentId → SubComponent (for nested sub-comps).
   * @param visited Visited-Set for cycle detection (keyed as "subComponent:{id}").
   */
  calcSubComponentCost(
    subComponent: SubComponent,
    materialsById: Map<string, RawMaterial>,
    subComponentsById: Map<string, SubComponent> = new Map(),
    visited: Set<string> = new Set(),
  ): number {
    const yieldDecimal =
      subComponent.yieldPercent > 0 ? subComponent.yieldPercent : 1;
    const yieldQty = subComponent.yieldQty > 0 ? subComponent.yieldQty : 1;

    let totalInputCost = 0;

    // Direct raw material inputs
    for (const ing of subComponent.rawIngredients ?? []) {
      const mat = materialsById.get(ing.rawMaterialId);
      totalInputCost += ing.qty * (mat?.unitCost ?? 0);
    }

    // Nested sub-component inputs — recursive DAG traversal
    for (const ing of subComponent.subComponentIngredients ?? []) {
      const key = `subComponent:${ing.subComponentId}`;
      if (visited.has(key)) {
        console.warn(
          `[CostService] Cycle detected at sub-component ${ing.subComponentId} — skipping branch.`,
        );
        continue;
      }
      visited.add(key);
      const nested = subComponentsById.get(ing.subComponentId);
      if (!nested) continue;
      const nestedCostPerUnit = this.calcSubComponentCost(
        nested,
        materialsById,
        subComponentsById,
        visited,
      );
      totalInputCost += ing.qty * nestedCostPerUnit;
    }

    return totalInputCost / yieldQty / yieldDecimal;
  }

  /**
   * Calculate the theoretical cost per portion for a recipe using full DAG traversal.
   * Sub-component costs are computed recursively, not read from cached `calculatedCostPerUnit`.
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
    const visited = new Set<string>();

    const rawCost = (recipe.rawIngredients ?? []).reduce(
      (sum: number, ing: RecipeRawIngredient) => {
        const mat = materialsById.get(ing.rawMaterialId);
        return sum + ing.qty * (mat?.unitCost ?? 0);
      },
      0,
    );

    const subCost = (recipe.subComponentIngredients ?? []).reduce(
      (sum: number, ing: RecipeSubComponentIngredient) => {
        const key = `subComponent:${ing.subComponentId}`;
        if (visited.has(key)) {
          console.warn(
            `[CostService] Cycle detected at sub-component ${ing.subComponentId} — skipping.`,
          );
          return sum;
        }
        visited.add(key);
        const sub = subComponentsById.get(ing.subComponentId);
        if (!sub) return sum;
        const costPerUnit = this.calcSubComponentCost(
          sub,
          materialsById,
          subComponentsById,
          new Set(visited),
        );
        return sum + ing.qty * costPerUnit;
      },
      0,
    );

    return rawCost + subCost;
  }

  /**
   * DAG cycle detection for the UI guard.
   * Returns true if adding `candidateSubCompId` as an ingredient would create a cycle.
   *
   * For sub-components: traverses the full nested sub-component graph.
   * For recipes: recipes are leaf nodes — a recipe cannot be an ingredient in a sub-component.
   *
   * @param targetId The ID of the entity being edited (sub-component or recipe).
   * @param candidateSubCompId The sub-component ID being added.
   * @param subComponentsById All sub-components in the restaurant.
   */
  hasCircularDependency(
    targetId: string,
    candidateSubCompId: string,
    subComponentsById: Map<string, SubComponent & { id: string }>,
  ): boolean {
    const visited = new Set<string>();
    const stack: string[] = [candidateSubCompId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === targetId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const sub = subComponentsById.get(current);
      if (!sub) continue;
      // Traverse nested sub-component ingredients (ADL-008 unbounded nesting)
      for (const ing of sub.subComponentIngredients ?? []) {
        stack.push(ing.subComponentId);
      }
    }
    return false;
  }
}
