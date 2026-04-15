import {
  SITE_SETTINGS_SCHEMA_VERSION,
  SITE_SETTINGS_DEFAULTS,
  SiteSettings,
  SiteSettingsDoc,
  deserializeSiteSettings,
  serializeSiteSettings,
} from './site-settings.model';

describe('SiteSettings model (DAT-302)', () => {
  // ─── deserializeSiteSettings ───────────────────────────────────────────────

  describe('deserializeSiteSettings()', () => {
    it('returns full defaults when called with null', () => {
      const result = deserializeSiteSettings(null);
      expect(result.appName).toBe(SITE_SETTINGS_DEFAULTS.appName);
      expect(result.theme).toBe(SITE_SETTINGS_DEFAULTS.theme);
      expect(result.maintenanceMode).toBe(
        SITE_SETTINGS_DEFAULTS.maintenanceMode,
      );
      expect(result.featureFlags.enable_registration).toBe(
        SITE_SETTINGS_DEFAULTS.featureFlags.enable_registration,
      );
    });

    it('returns full defaults when called with undefined', () => {
      const result = deserializeSiteSettings(undefined);
      expect(result.appName).toBe(SITE_SETTINGS_DEFAULTS.appName);
    });

    it('returns full defaults when called with an empty object', () => {
      const result = deserializeSiteSettings({});
      expect(result.appName).toBe(SITE_SETTINGS_DEFAULTS.appName);
      expect(result.theme).toBe('orange_theme');
      expect(result.maintenanceMode).toBe(false);
      expect(result.featureFlags.enable_registration).toBe(true);
    });

    it('maps all known fields from a valid snapshot', () => {
      const raw: SiteSettingsDoc = {
        _schemaVersion: 1,
        appName: 'MyApp',
        theme: 'blue_theme',
        maintenanceMode: true,
        featureFlags: { enable_registration: false },
      };
      const result = deserializeSiteSettings(raw);
      expect(result.appName).toBe('MyApp');
      expect(result.theme).toBe('blue_theme');
      expect(result.maintenanceMode).toBe(true);
      expect(result.featureFlags.enable_registration).toBe(false);
    });

    it('strips _schemaVersion — UI type never exposes it', () => {
      const raw: SiteSettingsDoc = {
        _schemaVersion: 1,
        appName: 'Test',
        theme: 'orange_theme',
        maintenanceMode: false,
        featureFlags: { enable_registration: true },
      };
      const result = deserializeSiteSettings(raw);
      expect(('_schemaVersion' in result)).toBeFalse();
    });

    it('fills individual missing fields with defaults', () => {
      const raw = { appName: 'PartialApp', _schemaVersion: 1 };
      const result = deserializeSiteSettings(raw);
      expect(result.appName).toBe('PartialApp');
      expect(result.theme).toBe(SITE_SETTINGS_DEFAULTS.theme);
      expect(result.maintenanceMode).toBe(false);
      expect(result.featureFlags.enable_registration).toBe(true);
    });

    it('handles old v0 documents (no _schemaVersion) without throwing', () => {
      const v0Raw = {
        appName: 'LegacyApp',
        theme: 'purple_theme' as const,
        maintenanceMode: false,
        featureFlags: { enable_registration: true },
      };
      expect(() => deserializeSiteSettings(v0Raw)).not.toThrow();
      expect(deserializeSiteSettings(v0Raw).appName).toBe('LegacyApp');
    });
  });

  // ─── serializeSiteSettings ─────────────────────────────────────────────────

  describe('serializeSiteSettings()', () => {
    const baseSettings: SiteSettings = {
      appName: 'TestApp',
      theme: 'orange_theme',
      maintenanceMode: false,
      featureFlags: { enable_registration: true },
    };

    it('always adds _schemaVersion to the output', () => {
      const result = serializeSiteSettings(baseSettings);
      expect(result._schemaVersion).toBe(SITE_SETTINGS_SCHEMA_VERSION);
    });

    it('includes all settings fields', () => {
      const result = serializeSiteSettings(baseSettings);
      expect(result.appName).toBe('TestApp');
      expect(result.theme).toBe('orange_theme');
      expect(result.maintenanceMode).toBe(false);
      expect((result.featureFlags as any).enable_registration).toBe(true);
    });

    it('never produces null values — Firestore safety check', () => {
      const result = serializeSiteSettings(baseSettings);
      const nullValues = Object.values(result).filter((v) => v === null);
      expect(nullValues.length).toBe(0);
    });

    it('serializes maintenanceMode: true correctly', () => {
      const settings: SiteSettings = { ...baseSettings, maintenanceMode: true };
      const result = serializeSiteSettings(settings);
      expect(result.maintenanceMode).toBe(true);
    });

    it('serializes enable_registration: false correctly', () => {
      const settings: SiteSettings = {
        ...baseSettings,
        featureFlags: { enable_registration: false },
      };
      const result = serializeSiteSettings(settings);
      expect((result.featureFlags as any).enable_registration).toBe(false);
    });
  });

  // ─── round-trip ────────────────────────────────────────────────────────────

  describe('serialize → deserialize round-trip', () => {
    it('reconstructs an equivalent settings object after a full round-trip', () => {
      const original: SiteSettings = {
        appName: 'RoundTripApp',
        theme: 'purple_theme',
        maintenanceMode: true,
        featureFlags: { enable_registration: false },
      };
      const serialized = serializeSiteSettings(original);
      const restored = deserializeSiteSettings(serialized);

      expect(restored.appName).toBe(original.appName);
      expect(restored.theme).toBe(original.theme);
      expect(restored.maintenanceMode).toBe(original.maintenanceMode);
      expect(restored.featureFlags.enable_registration).toBe(
        original.featureFlags.enable_registration,
      );
    });

    it('bumps _schemaVersion on re-serialization of a v0 document', () => {
      const v0Raw = {
        appName: 'OldApp',
        theme: 'blue_theme' as const,
        maintenanceMode: false,
        featureFlags: { enable_registration: true },
      };
      const deserialized = deserializeSiteSettings(v0Raw);
      const reserialized = serializeSiteSettings(deserialized);
      expect(reserialized._schemaVersion).toBe(SITE_SETTINGS_SCHEMA_VERSION);
    });
  });
});
