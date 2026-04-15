import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { RouterModule } from '@angular/router';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlatformUom, deserializePlatformUom } from '@stockpot/shared';
import { CoreService } from '../../../services/core.service';
import { RestaurantService } from '../../../services/restaurant.service';
import { map } from 'rxjs';

interface UomToggle extends PlatformUom {
  id: string;
  active: boolean;
}

@Component({
  selector: 'app-active-uoms',
  imports: [CommonModule, MaterialModule, RouterModule, FormsModule],
  templateUrl: './active-uoms.component.html',
})
export class ActiveUomsComponent implements OnInit {
  private firestore = inject(Firestore);
  private core = inject(CoreService);
  private restaurantService = inject(RestaurantService);
  private snackBar = inject(MatSnackBar);

  saving = signal(false);

  private platformUoms = toSignal(
    collectionData(
      query(
        collection(this.firestore, 'platform_uom'),
        where('isActive', '==', true),
        orderBy('name'),
      ),
      { idField: 'id' },
    ).pipe(
      map((docs) =>
        docs.map((d) => ({
          id: (d as { id: string }).id,
          ...deserializePlatformUom(d),
        })),
      ),
    ),
    { initialValue: [] as (PlatformUom & { id: string })[] },
  );

  uomToggles = signal<UomToggle[]>([]);

  ngOnInit(): void {
    const restaurantDoc = this.core.appUser();
    const activeIds: string[] =
      (restaurantDoc as { activeUomIds?: string[] })?.activeUomIds ?? [];

    // Build toggles from platform UoMs
    const uoms = this.platformUoms();
    const toggles = uoms.map((u) => ({
      ...u,
      active: activeIds.includes(u.id),
    }));
    this.uomToggles.set(toggles);
  }

  selected = computed(() => this.uomToggles().filter((u) => u.active));

  toggle(uomId: string, value: boolean): void {
    this.uomToggles.update((list) =>
      list.map((u) => (u.id === uomId ? { ...u, active: value } : u)),
    );
  }

  async save(): Promise<void> {
    const restaurantId = this.core.appUser()?.restaurantId;
    if (!restaurantId) return;
    const selected = this.selected().map((u) => u.id);
    if (selected.length === 0) {
      this.snackBar.open('Select at least one unit of measure.', 'Dismiss', {
        duration: 3000,
      });
      return;
    }
    this.saving.set(true);
    try {
      await this.restaurantService.setActiveUoms(restaurantId, selected);
      this.snackBar.open('Active units of measure saved.', 'OK', {
        duration: 3000,
      });
    } finally {
      this.saving.set(false);
    }
  }
}
