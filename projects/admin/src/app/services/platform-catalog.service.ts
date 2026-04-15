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
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PlatformUom,
  PlatformUomDoc,
  serializePlatformUom,
  deserializePlatformUom,
  PlatformIngredient,
  PlatformIngredientDoc,
  serializePlatformIngredient,
  deserializePlatformIngredient,
  PlatformVendor,
  PlatformVendorDoc,
  serializePlatformVendor,
  deserializePlatformVendor,
  VendorCatalogItem,
  VendorCatalogItemDoc,
  serializeVendorCatalogItem,
  deserializeVendorCatalogItem,
} from '@stockpot/shared';

export type UomRow = PlatformUom & { id: string };
export type IngredientRow = PlatformIngredient & { id: string };
export type VendorRow = PlatformVendor & { id: string };
export type CatalogItemRow = VendorCatalogItem & { id: string };

@Injectable({ providedIn: 'root' })
export class PlatformCatalogService {
  private firestore = inject(Firestore);

  // ── UoM ───────────────────────────────────────────────────────────────────

  getUoms(showArchived = false): Observable<UomRow[]> {
    const col = collection(this.firestore, 'platform_uom');
    const q = showArchived
      ? query(col, orderBy('name'))
      : query(col, where('isActive', '==', true), orderBy('name'));
    return collectionData(q, { idField: '_docId' }).pipe(
      map((docs) =>
        docs.map((d) => {
          const { _docId, ...rest } = d as Record<string, unknown> & {
            _docId: string;
          };
          return { id: _docId, ...deserializePlatformUom(rest) };
        }),
      ),
    );
  }

  async createUom(uom: PlatformUom): Promise<void> {
    const id = crypto.randomUUID();
    await setDoc(
      doc(this.firestore, `platform_uom/${id}`),
      serializePlatformUom(uom),
    );
  }

  async updateUom(id: string, partial: Partial<PlatformUom>): Promise<void> {
    await updateDoc(doc(this.firestore, `platform_uom/${id}`), partial);
  }

  async archiveUom(id: string): Promise<void> {
    await updateDoc(doc(this.firestore, `platform_uom/${id}`), {
      isActive: false,
    });
  }

  // ── Ingredients ───────────────────────────────────────────────────────────

  getIngredients(showArchived = false): Observable<IngredientRow[]> {
    const col = collection(this.firestore, 'platform_ingredients');
    const q = showArchived
      ? query(col, orderBy('name'))
      : query(col, where('isActive', '==', true), orderBy('name'));
    return collectionData(q, { idField: '_docId' }).pipe(
      map((docs) =>
        docs.map((d) => {
          const { _docId, ...rest } = d as Record<string, unknown> & {
            _docId: string;
          };
          return { id: _docId, ...deserializePlatformIngredient(rest) };
        }),
      ),
    );
  }

  async createIngredient(ingredient: PlatformIngredient): Promise<void> {
    const id = crypto.randomUUID();
    await setDoc(
      doc(this.firestore, `platform_ingredients/${id}`),
      serializePlatformIngredient(ingredient),
    );
  }

  async archiveIngredient(id: string): Promise<void> {
    await updateDoc(doc(this.firestore, `platform_ingredients/${id}`), {
      isActive: false,
    });
  }

  // ── Vendors / Suppliers ───────────────────────────────────────────────────

  getVendors(): Observable<VendorRow[]> {
    const col = collection(this.firestore, 'vendors');
    const q = query(col, orderBy('name'));
    return collectionData(q, { idField: '_docId' }).pipe(
      map((docs) =>
        docs.map((d) => {
          const { _docId, ...rest } = d as Record<string, unknown> & {
            _docId: string;
          };
          return { id: _docId, ...deserializePlatformVendor(rest) };
        }),
      ),
    );
  }

  async createVendor(vendor: PlatformVendor): Promise<string> {
    const id = crypto.randomUUID();
    await setDoc(
      doc(this.firestore, `vendors/${id}`),
      serializePlatformVendor(vendor),
    );
    return id;
  }

  async deactivateVendor(id: string): Promise<void> {
    await updateDoc(doc(this.firestore, `vendors/${id}`), { isActive: false });
  }

  // ── Vendor Catalog Items ──────────────────────────────────────────────────

  getVendorCatalog(vendorId: string): Observable<CatalogItemRow[]> {
    const col = collection(this.firestore, `vendors/${vendorId}/catalog`);
    const q = query(col, orderBy('name'));
    return collectionData(q, { idField: '_docId' }).pipe(
      map((docs) =>
        docs.map((d) => {
          const { _docId, ...rest } = d as Record<string, unknown> & {
            _docId: string;
          };
          return { id: _docId, ...deserializeVendorCatalogItem(rest) };
        }),
      ),
    );
  }

  async addProductToSupplier(
    vendorId: string,
    existingItems: CatalogItemRow[],
    item: VendorCatalogItem,
  ): Promise<void> {
    const duplicate = existingItems.some(
      (i) => i.platformIngredientRef === item.platformIngredientRef,
    );
    if (duplicate) {
      throw new Error(
        'This ingredient is already listed in this supplier catalog.',
      );
    }
    const id = crypto.randomUUID();
    await setDoc(
      doc(this.firestore, `vendors/${vendorId}/catalog/${id}`),
      serializeVendorCatalogItem(item),
    );
  }
}
