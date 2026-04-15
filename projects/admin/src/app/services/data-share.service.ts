import { Injectable } from '@angular/core';

/**
 * Configuration options for storing data in the DataShare service
 */
export interface DataShareOptions {
  /**
   * Keep data after first retrieval (default: false)
   * When false, data is automatically removed after get() call (consume-once pattern)
   */
  persist?: boolean;

  /**
   * Store in localStorage instead of memory (default: false)
   * Use for data that needs to survive page refreshes
   */
  useLocalStorage?: boolean;

  /**
   * Time to live in milliseconds (optional)
   * Data will be automatically removed after this duration
   */
  ttl?: number;
}

/**
 * Internal data structure for storing values with metadata
 */
interface StoredData<T> {
  value: T;
  options: DataShareOptions;
  expiresAt?: number;
}

/**
 * DataShare Service
 * 
 * A secure service for passing parameters between components without using query parameters.
 * 
 * ## Why This Approach is More Secure
 * 
 * Using query parameters to pass data between components has several security risks:
 * - **URL Exposure**: Sensitive data appears in the browser's address bar
 * - **Browser History**: Data persists in browser history, accessible to anyone using the device
 * - **Referrer Headers**: Data can leak through HTTP referrer headers when navigating to external sites
 * - **Bookmarks & Shared Links**: Users may bookmark or share URLs containing sensitive data
 * - **Server Logs**: Query parameters are often logged by web servers and proxies
 * 
 * The DataShare service mitigates these risks by:
 * - Keeping data in memory or localStorage only
 * - Never exposing data in URLs
 * - Providing automatic cleanup mechanisms
 * - Supporting TTL for temporary data
 * 
 * ## Usage Examples
 * 
 * ### Basic Usage (In-Memory, Consume Once)
 * ```typescript
 * // Component A - Setting data
 * constructor(private dataShare: DataShareService) {}
 * 
 * navigateToComponentB() {
 *   this.dataShare.set('userData', { id: 123, name: 'John' });
 *   this.router.navigate(['/component-b']);
 * }
 * 
 * // Component B - Getting data (automatically removed after retrieval)
 * ngOnInit() {
 *   const userData = this.dataShare.get<UserData>('userData');
 *   if (userData) {
 *     console.log(userData);
 *   }
 * }
 * ```
 * 
 * ### Persistent Data
 * ```typescript
 * // Store data that can be retrieved multiple times
 * this.dataShare.set('config', configData, { persist: true });
 * 
 * // Retrieved multiple times without removal
 * const config1 = this.dataShare.get('config');
 * const config2 = this.dataShare.get('config'); // Still available
 * ```
 * 
 * ### Using localStorage (Survives Page Refresh)
 * ```typescript
 * // Store in localStorage for persistence across page refreshes
 * this.dataShare.set('sessionData', data, { 
 *   useLocalStorage: true,
 *   persist: true 
 * });
 * ```
 * 
 * ### TTL (Time-to-Live)
 * ```typescript
 * // Auto-expire after 5 minutes
 * this.dataShare.set('tempToken', token, { 
 *   ttl: 5 * 60 * 1000,  // 5 minutes in milliseconds
 *   persist: true 
 * });
 * ```
 * 
 * ### Peek Without Removal
 * ```typescript
 * // Check if data exists without removing it
 * const hasData = this.dataShare.has('myKey');
 * 
 * // Get data without removing (even if not persisted)
 * const data = this.dataShare.peek('myKey');
 * ```
 * 
 * ## Best Practices
 * 
 * 1. **Use consume-once pattern for navigation data**: Default behavior automatically cleans up
 * 2. **Avoid storing large objects**: Keep data minimal for performance
 * 3. **Use TTL for temporary data**: Prevents memory leaks and stale data
 * 4. **Clear data explicitly when done**: Call clear() or clearAll() when appropriate
 * 5. **Use localStorage sparingly**: Only when data must survive page refresh
 * 6. **Never store passwords or tokens**: Even with this service, use proper authentication mechanisms
 * 7. **Use typed data**: Leverage TypeScript generics for type safety
 * 
 * ## When to Use In-Memory vs localStorage
 * 
 * ### Use In-Memory (Default)
 * - Navigation parameters between components
 * - Temporary UI state
 * - Data that should not survive page refresh
 * - Most common use case
 * 
 * ### Use localStorage
 * - User preferences that should persist
 * - Draft data that users might lose on refresh
 * - Session-like data (with appropriate TTL)
 * - Data that needs to survive tab close/reopen
 * 
 * Note: localStorage has size limits (typically 5-10MB) and may throw quota exceeded errors
 */
@Injectable({
  providedIn: 'root'
})
export class DataShareService {
  private readonly STORAGE_PREFIX = '__dataShare_';
  private memoryStorage = new Map<string, StoredData<any>>();

  constructor() {
    // Clean up expired items on initialization
    this.clearExpired();
  }

  /**
   * Store data with a named key
   * 
   * @param key Unique identifier for the data
   * @param data Data to store (will be JSON serialized for localStorage)
   * @param options Storage options (persist, useLocalStorage, ttl)
   * 
   * @example
   * // Store and auto-remove after retrieval
   * dataShare.set('userId', 123);
   * 
   * // Store with persistence
   * dataShare.set('config', configData, { persist: true });
   * 
   * // Store in localStorage with TTL
   * dataShare.set('token', tokenData, { 
   *   useLocalStorage: true, 
   *   ttl: 3600000  // 1 hour
   * });
   */
  set<T>(key: string, data: T, options: DataShareOptions = {}): void {
    const storedData: StoredData<T> = {
      value: data,
      options: {
        persist: options.persist ?? false,
        useLocalStorage: options.useLocalStorage ?? false,
        ttl: options.ttl
      }
    };

    // Calculate expiration time if TTL is set
    if (options.ttl && options.ttl > 0) {
      storedData.expiresAt = Date.now() + options.ttl;
    }

    try {
      if (options.useLocalStorage) {
        // Store in localStorage
        const storageKey = this.getStorageKey(key);
        localStorage.setItem(storageKey, JSON.stringify(storedData));
        // Remove from memory if it exists there
        this.memoryStorage.delete(key);
      } else {
        // Store in memory
        this.memoryStorage.set(key, storedData);
        // Remove from localStorage if it exists there
        try {
          const storageKey = this.getStorageKey(key);
          localStorage.removeItem(storageKey);
        } catch (e) {
          // Ignore removal errors
        }
      }
    } catch (error) {
      // Handle localStorage quota exceeded or JSON serialization errors
      console.error(`DataShareService: Error storing data for key "${key}":`, error);
      
      // Fallback to memory storage if localStorage fails
      if (options.useLocalStorage) {
        console.warn(`DataShareService: Falling back to memory storage for key "${key}"`);
        this.memoryStorage.set(key, storedData);
      }
    }
  }

  /**
   * Retrieve data by key
   * Automatically removes data after retrieval unless persist option was set
   * Returns undefined if key doesn't exist or has expired
   * 
   * @param key Unique identifier for the data
   * @param defaultValue Optional default value to return if key doesn't exist
   * @returns The stored data or defaultValue/undefined
   * 
   * @example
   * const userData = dataShare.get<User>('userData');
   * const config = dataShare.get('config', { theme: 'default' });
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    const storedData = this.getStoredData<T>(key);

    if (!storedData) {
      return defaultValue;
    }

    // Check if data has expired
    if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
      this.clear(key);
      return defaultValue;
    }

    const value = storedData.value;

    // Remove data if not persistent (consume-once pattern)
    if (!storedData.options.persist) {
      this.clear(key);
    }

    return value;
  }

  /**
   * Get data without removing it (even if not persisted)
   * Useful for checking data without consuming it
   * 
   * @param key Unique identifier for the data
   * @returns The stored data or undefined
   * 
   * @example
   * const userData = dataShare.peek<User>('userData');
   * if (userData) {
   *   // Data exists and is valid
   * }
   */
  peek<T>(key: string): T | undefined {
    const storedData = this.getStoredData<T>(key);

    if (!storedData) {
      return undefined;
    }

    // Check if data has expired
    if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
      this.clear(key);
      return undefined;
    }

    return storedData.value;
  }

  /**
   * Check if a key exists and has not expired
   * 
   * @param key Unique identifier for the data
   * @returns true if key exists and is valid
   * 
   * @example
   * if (dataShare.has('userData')) {
   *   // Data is available
   * }
   */
  has(key: string): boolean {
    const storedData = this.getStoredData(key);

    if (!storedData) {
      return false;
    }

    // Check if data has expired
    if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
      this.clear(key);
      return false;
    }

    return true;
  }

  /**
   * Remove data for a specific key from both memory and localStorage
   * 
   * @param key Unique identifier for the data
   * 
   * @example
   * dataShare.clear('userData');
   */
  clear(key: string): void {
    // Remove from memory
    this.memoryStorage.delete(key);

    // Remove from localStorage
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`DataShareService: Error clearing localStorage for key "${key}":`, error);
    }
  }

  /**
   * Remove all stored data from both memory and localStorage
   * 
   * @example
   * // Clear all stored data
   * dataShare.clearAll();
   */
  clearAll(): void {
    // Clear memory storage
    this.memoryStorage.clear();

    // Clear all dataShare items from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('DataShareService: Error clearing localStorage:', error);
    }
  }

  /**
   * Remove expired TTL items from both memory and localStorage
   * This is called automatically on service initialization
   * Can also be called manually for cleanup
   * 
   * @example
   * // Manually clean up expired data
   * dataShare.clearExpired();
   */
  clearExpired(): void {
    const now = Date.now();

    // Clear expired items from memory
    const memoryKeysToDelete: string[] = [];
    this.memoryStorage.forEach((storedData, key) => {
      if (storedData.expiresAt && now > storedData.expiresAt) {
        memoryKeysToDelete.push(key);
      }
    });
    memoryKeysToDelete.forEach(key => this.memoryStorage.delete(key));

    // Clear expired items from localStorage
    try {
      const storageKeysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith(this.STORAGE_PREFIX)) {
          try {
            const item = localStorage.getItem(storageKey);
            if (item) {
              const storedData = JSON.parse(item);
              if (storedData.expiresAt && now > storedData.expiresAt) {
                storageKeysToDelete.push(storageKey);
              }
            }
          } catch (error) {
            // Invalid JSON, remove it
            storageKeysToDelete.push(storageKey);
          }
        }
      }
      storageKeysToDelete.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('DataShareService: Error clearing expired localStorage items:', error);
    }
  }

  /**
   * Get the prefixed storage key for localStorage
   */
  private getStorageKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  /**
   * Retrieve stored data from memory or localStorage
   */
  private getStoredData<T>(key: string): StoredData<T> | null {
    // Check memory storage first
    if (this.memoryStorage.has(key)) {
      return this.memoryStorage.get(key) as StoredData<T>;
    }

    // Check localStorage
    try {
      const storageKey = this.getStorageKey(key);
      const item = localStorage.getItem(storageKey);
      if (item) {
        return JSON.parse(item) as StoredData<T>;
      }
    } catch (error) {
      console.error(`DataShareService: Error retrieving data for key "${key}":`, error);
      // Remove corrupted data
      try {
        const storageKey = this.getStorageKey(key);
        localStorage.removeItem(storageKey);
      } catch (e) {
        // Ignore removal errors
      }
    }

    return null;
  }
}
