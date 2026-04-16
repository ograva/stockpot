/**
 * MSTR-011 / MSTR-012 â€” Par Level Back-Calculation Engine (DAG Edition)
 *
 * Two triggers:
 *  1. onRecipeParLevelWritten â€” fires when a recipe document changes.
 *  2. onSubComponentWritten â€” fires when a sub-component changes;
 *     finds all recipes that reference it and re-runs back-calculation.
 *
 * ADL-008: Sub-components support unbounded DAG nesting.
 * Cycle guard: a visited Set prevents infinite recursion.
 *
 * Formula:
 *   rawQtyRequired = parPortions Ã— qtyPerPortion / (yieldQty Ã— yieldPercent)
 */

import {
  onDocumentWritten,
  DocumentChangedEvent,
} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// â”€â”€â”€ Minimal server-side doc interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface RecipeDoc {
  parPortions?: number;
  rawIngredients?: { rawMaterialId: string; qty: number }[];
  subComponentIngredients?: { subComponentId: string; qty: number }[];
}

interface SubComponentDoc {
  yieldQty: number;
  yieldPercent: number;
  rawIngredients?: { rawMaterialId: string; qty: number }[];
  subComponentIngredients?: { subComponentId: string; qty: number }[];
}

// â”€â”€â”€ DAG ingredient expansion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Recursively expand a sub-component into raw material quantities per unit of output.
 * Uses a visited Set (keyed by subComponentId) to prevent infinite loops in cycles.
 *
 * Returns a map of rawMaterialId â†’ qty per unit of this sub-component's yield.
 */
async function expandSubComponent(
  restaurantId: string,
  subComponentId: string,
  db: admin.firestore.Firestore,
  visited: Set<string>,
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (visited.has(subComponentId)) {
    console.warn(
      `[back-calc] Cycle detected at sub-component ${subComponentId} â€” skipping branch.`,
    );
    return result;
  }
  visited.add(subComponentId);

  const snap = await db
    .collection(`restaurants/${restaurantId}/subComponents`)
    .doc(subComponentId)
    .get();
  if (!snap.exists) return result;

  const sub = snap.data() as SubComponentDoc;
  const yieldDecimal = sub.yieldPercent > 0 ? sub.yieldPercent : 1;
  const yieldQty = sub.yieldQty > 0 ? sub.yieldQty : 1;

  // Direct raw material inputs of this sub-component
  for (const ing of sub.rawIngredients ?? []) {
    const rawPerUnit = ing.qty / yieldQty / yieldDecimal;
    result.set(
      ing.rawMaterialId,
      (result.get(ing.rawMaterialId) ?? 0) + rawPerUnit,
    );
  }

  // Nested sub-component inputs â€” recurse
  for (const ing of sub.subComponentIngredients ?? []) {
    const nestedMap = await expandSubComponent(
      restaurantId,
      ing.subComponentId,
      db,
      new Set(visited),
    );
    for (const [matId, nestedPerUnit] of nestedMap.entries()) {
      // nestedPerUnit is qty of rawMaterial per unit of nested sub-component output.
      // We use ing.qty of that sub-component per yieldQty of the parent.
      const rawPerUnit = (nestedPerUnit * ing.qty) / yieldQty / yieldDecimal;
      result.set(matId, (result.get(matId) ?? 0) + rawPerUnit);
    }
  }

  return result;
}

/**
 * Expand a recipe's full ingredient chain into raw material quantities per portion.
 * Returns a map of rawMaterialId â†’ total qty needed per portion of the recipe.
 */
async function expandRecipeIngredients(
  restaurantId: string,
  recipe: RecipeDoc,
  db: admin.firestore.Firestore,
): Promise<Map<string, number>> {
  const qtyPerPortion = new Map<string, number>();

  // Direct raw material ingredients
  for (const ing of recipe.rawIngredients ?? []) {
    qtyPerPortion.set(
      ing.rawMaterialId,
      (qtyPerPortion.get(ing.rawMaterialId) ?? 0) + ing.qty,
    );
  }

  // Sub-component ingredients â€” full DAG expansion
  for (const subIng of recipe.subComponentIngredients ?? []) {
    const subMap = await expandSubComponent(
      restaurantId,
      subIng.subComponentId,
      db,
      new Set<string>(),
    );
    for (const [matId, rawPerSubUnit] of subMap.entries()) {
      qtyPerPortion.set(
        matId,
        (qtyPerPortion.get(matId) ?? 0) + rawPerSubUnit * subIng.qty,
      );
    }
  }

  return qtyPerPortion;
}

// â”€â”€â”€ Core back-calculation logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function runBackCalculation(
  restaurantId: string,
  recipeId: string,
  recipe: RecipeDoc,
  db: admin.firestore.Firestore,
): Promise<void> {
  const parPortions = recipe.parPortions ?? 0;
  if (parPortions <= 0) {
    // parPortions cleared to 0 â€” zero-out parMinimum for materials in this recipe
    const qtyMap = await expandRecipeIngredients(restaurantId, recipe, db);
    if (qtyMap.size === 0) return;
    const batch = db.batch();
    for (const rawMaterialId of qtyMap.keys()) {
      const matRef = db.doc(
        `restaurants/${restaurantId}/rawMaterials/${rawMaterialId}`,
      );
      batch.update(matRef, { parMinimum: 0 });
    }
    await batch.commit();
    console.log(
      `[back-calc] parPortions=0 for recipe ${recipeId}: reset parMinimum on ${qtyMap.size} material(s).`,
    );
    return;
  }

  const qtyMap = await expandRecipeIngredients(restaurantId, recipe, db);
  if (qtyMap.size === 0) return;

  const batch = db.batch();
  for (const [rawMaterialId, qtyPerPortion] of qtyMap.entries()) {
    const rawQtyRequired = parPortions * qtyPerPortion;
    const matRef = db.doc(
      `restaurants/${restaurantId}/rawMaterials/${rawMaterialId}`,
    );
    batch.update(matRef, { parMinimum: rawQtyRequired });
  }

  await batch.commit();
  console.log(
    `[back-calc] Recipe ${recipeId}: ${qtyMap.size} raw material(s) updated, parPortions=${parPortions}.`,
  );
}

// â”€â”€â”€ Trigger 1: Recipe written â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const onRecipeParLevelWritten = onDocumentWritten(
  'restaurants/{restaurantId}/recipes/{recipeId}',
  async (event: DocumentChangedEvent<RecipeDoc | undefined>) => {
    const restaurantId = event.params['restaurantId'] as string;
    const recipeId = event.params['recipeId'] as string;
    const afterData = event.data?.after?.data() as RecipeDoc | undefined;

    if (!afterData) return null; // deleted

    const db = admin.firestore();
    await runBackCalculation(restaurantId, recipeId, afterData, db);
    return null;
  },
);

// â”€â”€â”€ Trigger 2: Sub-component written â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const onSubComponentWritten = onDocumentWritten(
  'restaurants/{restaurantId}/subComponents/{subComponentId}',
  async (event: DocumentChangedEvent<SubComponentDoc | undefined>) => {
    const restaurantId = event.params['restaurantId'] as string;
    const subComponentId = event.params['subComponentId'] as string;

    // Check whether the yield/ingredient data actually changed
    const before = event.data?.before?.data() as SubComponentDoc | undefined;
    const after = event.data?.after?.data() as SubComponentDoc | undefined;

    if (!after) return null; // deleted â€” nothing to recalculate

    const db = admin.firestore();

    // Firestore 'array-contains' doesn't match partial objects reliably for nested fields.
    // Fetch all recipes and filter in memory (acceptable for Phase 1 restaurant scale).
    const allRecipesSnap = await db
      .collection(`restaurants/${restaurantId}/recipes`)
      .get();

    const affectedRecipes = allRecipesSnap.docs.filter(
      (doc: admin.firestore.QueryDocumentSnapshot) => {
        const data = doc.data() as RecipeDoc;
        return (data.subComponentIngredients ?? []).some(
          (ing) => ing.subComponentId === subComponentId,
        );
      },
    );

    if (affectedRecipes.length === 0) {
      console.log(
        `[back-calc] Sub-component ${subComponentId} changed; no referencing recipes found.`,
      );
      return null;
    }

    console.log(
      `[back-calc] Sub-component ${subComponentId} changed; re-running back-calc for ` +
        `${affectedRecipes.length} recipe(s).`,
    );

    for (const recipeDoc of affectedRecipes) {
      await runBackCalculation(
        restaurantId,
        recipeDoc.id,
        recipeDoc.data() as RecipeDoc,
        db,
      );
    }

    void before; // reserved for future delta-check optimisation (skip re-calc if unchanged)
    return null;
  },
);
