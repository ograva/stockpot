import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoreService } from '../../../services/core.service';
import { RecipeService, RecipeRow } from '../../../services/recipe.service';
import {
  RawMaterialService,
  RawMaterialRow,
} from '../../../services/raw-material.service';

interface ParLevelEntry {
  recipeId: string;
  recipeName: string;
  parPortions: number;
}

@Component({
  selector: 'app-par-levels',
  imports: [CommonModule, MaterialModule, RouterModule, FormsModule],
  templateUrl: './par-levels.component.html',
})
export class ParLevelsComponent implements OnInit {
  private core = inject(CoreService);
  private recipeService = inject(RecipeService);
  private rawMaterialService = inject(RawMaterialService);
  private snackBar = inject(MatSnackBar);

  parEntries = signal<ParLevelEntry[]>([]);
  rawMaterials = signal<RawMaterialRow[]>([]);
  saving = signal(false);

  get restaurantId(): string | undefined {
    return this.core.appUser()?.restaurantId;
  }

  ngOnInit(): void {
    const rid = this.restaurantId;
    if (!rid) return;
    this.recipeService.getAll(rid).subscribe((recipes) => {
      this.parEntries.set(
        recipes.map((r) => ({
          recipeId: r.id,
          recipeName: r.name,
          parPortions: r.parPortions ?? 0,
        })),
      );
    });
    this.rawMaterialService.getAll(rid).subscribe((mats) => {
      this.rawMaterials.set(mats);
    });
  }

  updateParPortions(entry: ParLevelEntry, value: number): void {
    this.parEntries.update((list) =>
      list.map((e) =>
        e.recipeId === entry.recipeId ? { ...e, parPortions: value } : e,
      ),
    );
  }

  async saveAll(): Promise<void> {
    const rid = this.restaurantId;
    if (!rid) return;
    this.saving.set(true);
    try {
      const updates = this.parEntries().map((e) =>
        this.recipeService.update(rid, e.recipeId, {
          parPortions: e.parPortions,
        }),
      );
      await Promise.all(updates);
      this.snackBar.open(
        'Par levels saved. Back-calculation will update raw material par minimums shortly.',
        'OK',
        { duration: 4000 },
      );
    } catch {
      this.snackBar.open('Failed to save par levels.', 'Dismiss', {
        duration: 3000,
      });
    } finally {
      this.saving.set(false);
    }
  }
}
