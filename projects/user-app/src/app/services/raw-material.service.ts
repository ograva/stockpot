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
import {
  RawMaterial,
  serializeRawMaterial,
  deserializeRawMaterial,
} from '@stockpot/shared';

export interface RawMaterialRow extends RawMaterial {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class RawMaterialService {
  private firestore = inject(Firestore);

  getAll(restaurantId: string): Observable<RawMaterialRow[]> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/rawMaterials`,
    );
    return collectionData(query(ref, orderBy('name')), {
      idField: 'id',
    }).pipe(
      map((docs) =>
        docs.map((d) => {
          const mat = deserializeRawMaterial(d);
          return { id: (d as { id: string }).id, ...mat };
        }),
      ),
    );
  }

  async create(restaurantId: string, material: RawMaterial): Promise<string> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/rawMaterials`,
    );
    const docRef = await addDoc(ref, serializeRawMaterial(material));
    return docRef.id;
  }

  async update(
    restaurantId: string,
    materialId: string,
    changes: Partial<RawMaterial>,
  ): Promise<void> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/rawMaterials/${materialId}`,
    );
    await updateDoc(ref, changes as Record<string, unknown>);
  }

  async delete(restaurantId: string, materialId: string): Promise<void> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/rawMaterials/${materialId}`,
    );
    await deleteDoc(ref);
  }
}
