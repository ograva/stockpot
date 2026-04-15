import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { SettingsService, SiteSettings } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);

  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly isDirty = signal(false);

  readonly themeOptions: { value: SiteSettings['theme']; label: string }[] = [
    { value: 'orange_theme', label: 'Orange' },
    { value: 'blue_theme', label: 'Blue' },
    { value: 'purple_theme', label: 'Purple' },
  ];

  form = new FormGroup({
    appName: new FormControl('', [Validators.required]),
    theme: new FormControl<SiteSettings['theme']>('orange_theme', [
      Validators.required,
    ]),
    maintenanceMode: new FormControl(false),
    enable_registration: new FormControl(true),
  });

  constructor() {
    // Sync form with Firestore signal. Guard: skip patching if user has unsaved edits.
    effect(() => {
      const s = this.settingsService.settings();
      if (s && !this.isDirty()) {
        this.form.patchValue(
          {
            appName: s.appName,
            theme: s.theme,
            maintenanceMode: s.maintenanceMode,
            enable_registration: s.featureFlags?.enable_registration ?? true,
          },
          { emitEvent: false },
        );
      }
    });
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => this.isDirty.set(true));
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    try {
      const v = this.form.getRawValue();
      await this.settingsService.save({
        appName: v.appName!,
        theme: v.theme!,
        maintenanceMode: v.maintenanceMode ?? false,
        featureFlags: {
          enable_registration: v.enable_registration ?? true,
        },
      });
      this.isDirty.set(false);
    } catch (e) {
      console.error('[Settings] save failed:', e);
      this.saveError.set('Failed to save settings. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  reset(): void {
    const s = this.settingsService.settings();
    if (s) {
      this.form.patchValue(
        {
          appName: s.appName,
          theme: s.theme,
          maintenanceMode: s.maintenanceMode,
          enable_registration: s.featureFlags?.enable_registration ?? true,
        },
        { emitEvent: false },
      );
      this.isDirty.set(false);
    }
  }
}
