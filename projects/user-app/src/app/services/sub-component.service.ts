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
  SubComponent,
  serializeSubComponent,
  deserializeSubComponent,
} from '@stockpot/shared';

export interface SubComponentRow extends SubComponent {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class SubComponentService {
  private firestore = inject(Firestore);

  getAll(restaurantId: string): Observable<SubComponentRow[]> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/subComponents`,
    );
    return collectionData(query(ref, orderBy('name')), {
      idField: 'id',
    }).pipe(
      map((docs) =>
        docs.map((d) => {
          const sub = deserializeSubComponent(d);
          return { id: (d as { id: string }).id, ...sub };
        }),
      ),
    );
  }

  async create(
    restaurantId: string,
    subComponent: SubComponent,
  ): Promise<string> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/subComponents`,
    );
    const docRef = await addDoc(ref, serializeSubComponent(subComponent));
    return docRef.id;
  }

  async update(
    restaurantId: string,
    subComponentId: string,
    changes: Partial<SubComponent>,
  ): Promise<void> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/subComponents/${subComponentId}`,
    );
    await updateDoc(ref, changes as Record<string, unknown>);
  }

  async delete(restaurantId: string, subComponentId: string): Promise<void> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/subComponents/${subComponentId}`,
    );
    await deleteDoc(ref);
  }
}
