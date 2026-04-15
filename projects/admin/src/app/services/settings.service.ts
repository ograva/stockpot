import {
  Injectable,
  Injector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SiteSettings,
  SITE_SETTINGS_DEFAULTS,
  deserializeSiteSettings,
  serializeSiteSettings,
} from '../models/site-settings.model';

// Re-export so SettingsComponent's existing import path stays unchanged.
export type { SiteSettings } from '../models/site-settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private settingsDoc = doc(this.firestore, 'settings', 'global');

  // Deserialize every Firestore snapshot: fills defaults, runs migrations,
  // and strips the internal _schemaVersion field before the signal is updated.
  private readonly settingsObs$: Observable<SiteSettings> = (
    docData(this.settingsDoc) as Observable<unknown>
  ).pipe(map((raw) => deserializeSiteSettings(raw)));

  readonly settings = toSignal(this.settingsObs$, {
    initialValue: SITE_SETTINGS_DEFAULTS,
  });

  async save(settings: SiteSettings): Promise<void> {
    try {
      // serializeSiteSettings adds _schemaVersion and guarantees no null values.
      const payload = serializeSiteSettings(settings);
      await runInInjectionContext(this.injector, () =>
        setDoc(this.settingsDoc, payload),
      );
    } catch (e) {
      console.error('[SettingsService] setDoc failed:', e);
      throw e;
    }
  }
}
