/**
 * MSTR-008 — Par Level Back-Calculation Engine
 *
 * Triggered when a recipe document is written to Firestore.
 * When `parPortions` changes, recalculates `parMinimum` for each raw material
 * in the recipe's ingredient chain and writes back to the raw material docs.
 *
 * Formula:
 *   rawQtyRequired = portionsNeeded × ingredientQtyPerPortion / yieldDecimal
 *
 * For sub-component ingredients the qty is expanded through the sub-component's
 * own raw material list before applying the yield factor.
 */

import {
  onDocumentWritten,
  DocumentChangedEvent,
} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

interface RecipeDoc {
  parPortions?: number;
  rawIngredients?: { rawMaterialId: string; qty: number }[];
  subComponentIngredients?: { subComponentId: string; qty: number }[];
}

interface SubComponentDoc {
  yieldQty: number;
  yieldPercent: number;
  ingredients?: { rawMaterialId: string; qty: number }[];
}

/**
 * Compute the raw material quantities needed for one portion of the recipe.
 * Returns a map of rawMaterialId → total qty needed per portion.
 */
async function expandIngredients(
  restaurantId: string,
  recipe: RecipeDoc,
  db: admin.firestore.Firestore,
): Promise<Map<string, number>> {
  const qtyPerPortion = new Map<string, number>();

  // Direct raw material ingredients
  for (const ing of recipe.rawIngredients ?? []) {
    const existing = qtyPerPortion.get(ing.rawMaterialId) ?? 0;
    qtyPerPortion.set(ing.rawMaterialId, existing + ing.qty);
  }

  // Sub-component ingredients — expand through sub-component's own ingredients
  for (const subIng of recipe.subComponentIngredients ?? []) {
    const subSnap = await db
      .collection(`restaurants/${restaurantId}/subComponents`)
      .doc(subIng.subComponentId)
      .get();

    if (!subSnap.exists) continue;
    const sub = subSnap.data() as SubComponentDoc;

    const yieldDecimal = sub.yieldPercent > 0 ? sub.yieldPercent : 1;
    const yieldQty = sub.yieldQty > 0 ? sub.yieldQty : 1;

    for (const matIng of sub.ingredients ?? []) {
      // qty of raw material per unit of sub-component output
      const rawQtyPerSubUnit = matIng.qty / yieldQty / yieldDecimal;
      // qty of sub-component used per portion of recipe
      const rawQtyPerPortion = rawQtyPerSubUnit * subIng.qty;

      const existing = qtyPerPortion.get(matIng.rawMaterialId) ?? 0;
      qtyPerPortion.set(matIng.rawMaterialId, existing + rawQtyPerPortion);
    }
  }

  return qtyPerPortion;
}

export const onRecipeParLevelWritten = onDocumentWritten(
  'restaurants/{restaurantId}/recipes/{recipeId}',
  async (event: DocumentChangedEvent<RecipeDoc | undefined>) => {
    const restaurantId = event.params['restaurantId'] as string;
    const afterData = event.data?.after?.data() as RecipeDoc | undefined;

    if (!afterData) {
      // Document deleted — skip back-calculation
      return null;
    }

    const parPortions = afterData.parPortions ?? 0;
    if (parPortions <= 0) {
      // No par target set — nothing to calculate
      return null;
    }

    const db = admin.firestore();

    // Expand ingredients to raw material quantities per portion
    const qtyMap = await expandIngredients(restaurantId, afterData, db);

    if (qtyMap.size === 0) return null;

    // Compute parMinimum for each raw material and write back
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
      `[MSTR-008] Back-calculation complete for recipe ${event.params['recipeId']}: ` +
        `${qtyMap.size} raw material(s) updated.`,
    );

    return null;
  },
);
