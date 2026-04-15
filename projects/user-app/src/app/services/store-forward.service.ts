import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot } from '@angular/fire/firestore';

/**
 * Optional serialize/deserialize transforms for a specific document type.
 *
 * - `serialize`   — called before every Firestore write; strips nulls and adds
 *                   `_schemaVersion`. Use the model's `serializeXxx()` function.
 * - `deserialize` — called on every Firestore read (sync) and raw-cache read;
 *                   normalises missing fields and runs schema migrations. Use
 *                   the model's `deserializeXxx()` function.
 */
export interface StoreForwardTransforms<T> {
  serialize?: (data: T) => Record<string, unknown>;
  deserialize?: (raw: unknown) => T;
}

/**
 * StoreForwardService — Two-Stage Store-and-Forward
 *
 * For each key/value:
 *   1. Updates an Angular Signal immediately (optimistic UI).
 *   2. Writes to localStorage synchronously.
 *   3. Queues a background Firestore write (fire-and-forget, if firestorePath provided).
 *
 * On init, values are hydrated from localStorage on first access (fast first paint).
 * Calling `sync(key, firestorePath)` subscribes to Firestore for the canonical value.
 */
@Injectable({
  providedIn: 'root',
})
export class StoreForwardService {
  private firestore = inject(Firestore);
  private signals = new Map<string, WritableSignal<unknown>>();
  private unsubscribers = new Map<string, () => void>();

  /** Read signal for a key. Hydrates from localStorage on first access. */
  get<T>(key: string): WritableSignal<T | null> {
    if (!this.signals.has(key)) {
      const stored = this.readFromStorage<T>(key);
      this.signals.set(key, signal<unknown>(stored));
    }
    return this.signals.get(key) as WritableSignal<T | null>;
  }

  /**
   * Write a value.
   * 1. Updates the signal immediately.
   * 2. Persists to localStorage (full typed value, including _schemaVersion).
   * 3. Writes to Firestore in the background — calls `transforms.serialize()`
   *    first if provided, which strips nulls and adds versioning metadata.
   */
  set<T>(
    key: string,
    value: T,
    firestorePath?: string,
    transforms?: StoreForwardTransforms<T>,
  ): void {
    // 1. Signal update
    this.get<T>(key).set(value);

    // 2. LocalStorage — store the full typed value
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(
        `StoreForwardService: localStorage write failed for key "${key}"`,
      );
    }

    // 3. Background Firestore write — serialize if transform provided
    if (firestorePath) {
      const payload = transforms?.serialize
        ? transforms.serialize(value)
        : (value as object);
      setDoc(doc(this.firestore, firestorePath), payload, {
        merge: true,
      }).catch((err) =>
        console.error(
          `StoreForwardService: Firestore write failed for "${firestorePath}"`,
          err,
        ),
      );
    }
  }

  /**
   * Subscribe to Firestore for the canonical value.
   * The signal is updated whenever Firestore emits a new value.
   * If `transforms.deserialize` is provided it is called on every incoming
   * snapshot, normalising the raw Firestore data (missing fields, old schema)
   * before the signal and localStorage are updated.
   */
  sync<T>(
    key: string,
    firestorePath: string,
    transforms?: StoreForwardTransforms<T>,
  ): void {
    // Unsubscribe previous listener if any
    this.unsubscribers.get(key)?.();

    const unsub = onSnapshot(
      doc(this.firestore, firestorePath),
      (snapshot) => {
        const raw = snapshot.data();
        if (raw !== undefined) {
          const data = transforms?.deserialize
            ? transforms.deserialize(raw)
            : (raw as T);
          this.get<T>(key).set(data);
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch {
            // ignore storage errors
          }
        }
      },
      (err) =>
        console.error(
          `StoreForwardService: Firestore sync error for "${key}"`,
          err,
        ),
    );

    this.unsubscribers.set(key, unsub);
  }

  /** Stop syncing a key from Firestore (does not clear local data). */
  unsync(key: string): void {
    this.unsubscribers.get(key)?.();
    this.unsubscribers.delete(key);
  }

  /** Clear a key from signal, localStorage, and stop any active sync. */
  clear(key: string): void {
    this.get(key).set(null);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    this.unsync(key);
  }

  private readFromStorage<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}
