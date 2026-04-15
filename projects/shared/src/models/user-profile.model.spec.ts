import {
  USER_PROFILE_SCHEMA_VERSION,
  UserProfileDoc,
  deserializeUserProfile,
  serializeUserProfile,
} from './user-profile.model';

describe('UserProfile model (DAT-302)', () => {
  // ─── deserializeUserProfile ────────────────────────────────────────────────

  describe('deserializeUserProfile()', () => {
    it('fills all required defaults when called with null', () => {
      const result = deserializeUserProfile(null);
      expect(result._schemaVersion).toBe(USER_PROFILE_SCHEMA_VERSION);
      expect(result.name).toBe('');
      expect(result.email).toBe('');
      expect(result.role).toBe('user');
      expect(result.photoURL).toBeUndefined();
    });

    it('fills all required defaults when called with undefined', () => {
      const result = deserializeUserProfile(undefined);
      expect(result.name).toBe('');
      expect(result.email).toBe('');
      expect(result.role).toBe('user');
    });

    it('fills all required defaults when called with an empty object', () => {
      const result = deserializeUserProfile({});
      expect(result.name).toBe('');
      expect(result.email).toBe('');
      expect(result.role).toBe('user');
    });

    it('maps known fields from a valid snapshot', () => {
      const raw = {
        _schemaVersion: 1,
        name: 'Alice',
        email: 'alice@example.com',
        role: 'admin',
        photoURL: 'https://example.com/avatar.png',
      };
      const result = deserializeUserProfile(raw);
      expect(result.name).toBe('Alice');
      expect(result.email).toBe('alice@example.com');
      expect(result.role).toBe('admin');
      expect(result.photoURL).toBe('https://example.com/avatar.png');
    });

    it('omits photoURL when the field is absent from the snapshot', () => {
      const raw = { name: 'Bob', email: 'bob@example.com' };
      const result = deserializeUserProfile(raw);
      expect('photoURL' in result).toBeFalse();
    });

    it('omits photoURL when the field is an empty string', () => {
      const raw = { name: 'Bob', email: 'bob@example.com', photoURL: '' };
      const result = deserializeUserProfile(raw);
      expect('photoURL' in result).toBeFalse();
    });

    it('always stamps the current schema version', () => {
      const result = deserializeUserProfile({ _schemaVersion: 0, name: 'Old' });
      expect(result._schemaVersion).toBe(USER_PROFILE_SCHEMA_VERSION);
    });

    it('defaults role to "user" when field is absent', () => {
      const result = deserializeUserProfile({ name: 'Bob', email: 'b@b.com' });
      expect(result.role).toBe('user');
    });
  });

  // ─── serializeUserProfile ──────────────────────────────────────────────────

  describe('serializeUserProfile()', () => {
    const base: UserProfileDoc = {
      _schemaVersion: USER_PROFILE_SCHEMA_VERSION,
      name: 'Alice',
      email: 'alice@example.com',
      role: 'user',
    };

    it('always includes _schemaVersion in the output', () => {
      const result = serializeUserProfile(base);
      expect(result['_schemaVersion']).toBe(USER_PROFILE_SCHEMA_VERSION);
    });

    it('includes all required fields', () => {
      const result = serializeUserProfile(base);
      expect(result['name']).toBe('Alice');
      expect(result['email']).toBe('alice@example.com');
      expect(result['role']).toBe('user');
    });

    it('omits photoURL when undefined — no null written to Firestore', () => {
      const result = serializeUserProfile(base);
      expect('photoURL' in result).toBeFalse();
    });

    it('omits photoURL when it is an empty string', () => {
      const doc: UserProfileDoc = { ...base, photoURL: '' };
      const result = serializeUserProfile(doc);
      expect('photoURL' in result).toBeFalse();
    });

    it('includes photoURL when it has a value', () => {
      const doc: UserProfileDoc = {
        ...base,
        photoURL: 'https://example.com/avatar.png',
      };
      const result = serializeUserProfile(doc);
      expect(result['photoURL']).toBe('https://example.com/avatar.png');
    });

    it('never produces null values — Firestore safety check', () => {
      const doc: UserProfileDoc = { ...base, photoURL: undefined };
      const result = serializeUserProfile(doc);
      const nullValues = Object.values(result).filter((v) => v === null);
      expect(nullValues.length).toBe(0);
    });

    it('defaults role to "user" when role is undefined on the doc', () => {
      const doc: UserProfileDoc = { ...base, role: undefined };
      const result = serializeUserProfile(doc);
      expect(result['role']).toBe('user');
    });
  });

  // ─── round-trip ────────────────────────────────────────────────────────────

  describe('serialize → deserialize round-trip', () => {
    it('reconstructs an equivalent document after a full round-trip', () => {
      const original: UserProfileDoc = {
        _schemaVersion: USER_PROFILE_SCHEMA_VERSION,
        name: 'Carol',
        email: 'carol@example.com',
        role: 'admin',
        photoURL: 'https://example.com/carol.jpg',
      };
      const serialized = serializeUserProfile(original);
      const restored = deserializeUserProfile(serialized);

      expect(restored.name).toBe(original.name);
      expect(restored.email).toBe(original.email);
      expect(restored.role).toBe(original.role);
      expect(restored.photoURL).toBe(original.photoURL);
      expect(restored._schemaVersion).toBe(USER_PROFILE_SCHEMA_VERSION);
    });

    it('round-trips cleanly when photoURL is absent', () => {
      const original: UserProfileDoc = {
        _schemaVersion: USER_PROFILE_SCHEMA_VERSION,
        name: 'Dave',
        email: 'dave@example.com',
        role: 'user',
      };
      const restored = deserializeUserProfile(serializeUserProfile(original));
      expect('photoURL' in restored).toBeFalse();
    });
  });
});
