import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import {
  RestaurantSupplier,
  serializeRestaurantSupplier,
  deserializeRestaurantSupplier,
} from '@stockpot/shared';

export interface SupplierRow extends RestaurantSupplier {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private firestore = inject(Firestore);

  getAll(restaurantId: string): Observable<SupplierRow[]> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/suppliers`,
    );
    return collectionData(query(ref, orderBy('name')), {
      idField: 'id',
    }).pipe(
      map((docs) =>
        docs.map((d) => {
          const supplier = deserializeRestaurantSupplier(d);
          return { id: (d as { id: string }).id, ...supplier };
        }),
      ),
    );
  }

  async create(
    restaurantId: string,
    supplier: RestaurantSupplier,
  ): Promise<string> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/suppliers`,
    );
    const docRef = await addDoc(ref, serializeRestaurantSupplier(supplier));
    return docRef.id;
  }

  async update(
    restaurantId: string,
    supplierId: string,
    changes: Partial<RestaurantSupplier>,
  ): Promise<void> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/suppliers/${supplierId}`,
    );
    await updateDoc(ref, changes as Record<string, unknown>);
  }
}
