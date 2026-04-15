import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Restaurant,
  RestaurantDoc,
  serializeRestaurant,
  deserializeRestaurant,
} from '@stockpot/shared';

/** Tenant with its Firestore document ID. */
export type TenantRow = Restaurant & { id: string };

@Injectable({ providedIn: 'root' })
export class TenantService {
  private firestore = inject(Firestore);

  /** Live observable of all restaurant documents (platform-level, no tenant isolation). */
  getAll(): Observable<TenantRow[]> {
    const ref = collection(this.firestore, 'restaurants');
    return collectionData(query(ref, orderBy('createdAt', 'desc')), {
      idField: '_docId',
    }).pipe(
      map((docs) =>
        docs.map((d: any) => ({
          ...deserializeRestaurant(d),
          id: d['_docId'] as string,
        })),
      ),
    );
  }

  /**
   * Creates a new restaurant/tenant document.
   * Uses the provided restaurantId as the Firestore document ID.
   */
  async createTenant(
    restaurantId: string,
    data: Omit<Restaurant, 'createdAt' | 'status'>,
  ): Promise<void> {
    const restaurant: Restaurant = {
      ...data,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    await setDoc(
      doc(this.firestore, `restaurants/${restaurantId}`),
      serializeRestaurant(restaurant),
    );
  }

  /**
   * Updates editable fields of an existing tenant.
   */
  async updateTenant(
    restaurantId: string,
    data: Pick<Restaurant, 'name' | 'address' | 'timezone'>,
  ): Promise<void> {
    await updateDoc(doc(this.firestore, `restaurants/${restaurantId}`), {
      name: data.name,
      address: data.address,
      timezone: data.timezone,
    });
  }

  /**
   * Sets tenant status to 'suspended'. Does NOT delete any data.
   */
  async suspendTenant(restaurantId: string): Promise<void> {
    await updateDoc(doc(this.firestore, `restaurants/${restaurantId}`), {
      status: 'suspended',
    });
  }

  /**
   * Restores a suspended tenant to 'active' status.
   */
  async reactivateTenant(restaurantId: string): Promise<void> {
    await updateDoc(doc(this.firestore, `restaurants/${restaurantId}`), {
      status: 'active',
    });
  }
}
