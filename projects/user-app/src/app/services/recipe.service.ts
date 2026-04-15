import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Recipe, serializeRecipe, deserializeRecipe } from '@stockpot/shared';

export interface RecipeRow extends Recipe {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private firestore = inject(Firestore);

  getAll(restaurantId: string): Observable<RecipeRow[]> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/recipes`,
    );
    return collectionData(query(ref, orderBy('name')), {
      idField: 'id',
    }).pipe(
      map((docs) =>
        docs.map((d) => {
          const recipe = deserializeRecipe(d);
          return { id: (d as { id: string }).id, ...recipe };
        }),
      ),
    );
  }

  async create(restaurantId: string, recipe: Recipe): Promise<string> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/recipes`,
    );
    const docRef = await addDoc(ref, serializeRecipe(recipe));
    return docRef.id;
  }

  async update(
    restaurantId: string,
    recipeId: string,
    changes: Partial<Recipe>,
  ): Promise<void> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/recipes/${recipeId}`,
    );
    await updateDoc(ref, changes as Record<string, unknown>);
  }

  async delete(restaurantId: string, recipeId: string): Promise<void> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/recipes/${recipeId}`,
    );
    await deleteDoc(ref);
  }
}
