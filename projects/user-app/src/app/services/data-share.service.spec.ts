import { TestBed } from '@angular/core/testing';
import { DataShareService, DataShareOptions } from './data-share.service';

describe('DataShareService', () => {
  let service: DataShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataShareService);
    
    // Clear all storage before each test
    service.clearAll();
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    service.clearAll();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('In-Memory Storage', () => {
    it('should store and retrieve data from memory', () => {
      const testData = { id: 1, name: 'Test User' };
      service.set('testKey', testData);
      
      const retrieved = service.get<typeof testData>('testKey');
      expect(retrieved).toEqual(testData);
    });

    it('should return undefined for non-existent key', () => {
      const result = service.get('nonExistent');
      expect(result).toBeUndefined();
    });

    it('should return default value when key does not exist', () => {
      const defaultValue = { default: true };
      const result = service.get('nonExistent', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should automatically remove data after retrieval (consume-once pattern)', () => {
      service.set('tempData', 'value');
      
      const first = service.get('tempData');
      expect(first).toBe('value');
      
      const second = service.get('tempData');
      expect(second).toBeUndefined();
    });

    it('should persist data when persist option is true', () => {
      service.set('persistentData', 'value', { persist: true });
      
      const first = service.get('persistentData');
      expect(first).toBe('value');
      
      const second = service.get('persistentData');
      expect(second).toBe('value');
    });

    it('should handle various data types', () => {
      service.set('string', 'test string');
      service.set('number', 42);
      service.set('boolean', true);
      service.set('array', [1, 2, 3]);
      service.set('object', { key: 'value' });
      service.set('null', null);
      
      expect(service.get('string')).toBe('test string');
      expect(service.get('number')).toBe(42);
      expect(service.get('boolean')).toBe(true);
      expect(service.get('array')).toEqual([1, 2, 3]);
      expect(service.get('object')).toEqual({ key: 'value' });
      expect(service.get('null')).toBeNull();
    });
  });

  describe('localStorage Operations', () => {
    it('should store and retrieve data from localStorage', () => {
      const testData = { id: 2, name: 'Storage User' };
      service.set('localKey', testData, { useLocalStorage: true });
      
      const retrieved = service.get<typeof testData>('localKey');
      expect(retrieved).toEqual(testData);
    });

    it('should store data in localStorage with correct prefix', () => {
      service.set('localKey', 'value', { useLocalStorage: true, persist: true });
      
      const storageKey = '__dataShare_localKey';
      const storedItem = localStorage.getItem(storageKey);
      expect(storedItem).toBeTruthy();
    });

    it('should persist localStorage data after retrieval when persist is true', () => {
      service.set('persistentLocal', 'value', { 
        useLocalStorage: true, 
        persist: true 
      });
      
      const first = service.get('persistentLocal');
      expect(first).toBe('value');
      
      const second = service.get('persistentLocal');
      expect(second).toBe('value');
    });

    it('should remove localStorage data after retrieval when persist is false', () => {
      service.set('tempLocal', 'value', { useLocalStorage: true });
      
      const first = service.get('tempLocal');
      expect(first).toBe('value');
      
      const second = service.get('tempLocal');
      expect(second).toBeUndefined();
      
      const storageKey = '__dataShare_tempLocal';
      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it('should handle localStorage quota exceeded error gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
      spyOn(console, 'error');
      spyOn(console, 'warn');
      
      // Should fallback to memory storage
      service.set('quotaTest', 'value', { useLocalStorage: true });
      
      expect(console.error).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      
      // Should still be retrievable from memory
      const value = service.get('quotaTest');
      expect(value).toBe('value');
      
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle JSON serialization errors', () => {
      const circularRef: any = {};
      circularRef.self = circularRef;
      
      spyOn(console, 'error');
      
      // This should not throw, but log error
      service.set('circular', circularRef, { useLocalStorage: true });
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle corrupted localStorage data', () => {
      const storageKey = '__dataShare_corrupted';
      localStorage.setItem(storageKey, 'invalid json {{{');
      
      spyOn(console, 'error');
      
      const result = service.get('corrupted');
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalled();
      
      // Should clean up corrupted data
      expect(localStorage.getItem(storageKey)).toBeNull();
    });
  });

  describe('TTL (Time-to-Live)', () => {
    it('should expire data after TTL', (done) => {
      service.set('ttlData', 'value', { ttl: 100, persist: true });
      
      // Should be available immediately
      expect(service.get('ttlData')).toBe('value');
      
      // Should expire after TTL
      setTimeout(() => {
        const expired = service.get('ttlData');
        expect(expired).toBeUndefined();
        done();
      }, 150);
    });

    it('should expire localStorage data after TTL', (done) => {
      service.set('ttlLocalData', 'value', { 
        useLocalStorage: true, 
        ttl: 100,
        persist: true 
      });
      
      expect(service.get('ttlLocalData')).toBe('value');
      
      setTimeout(() => {
        const expired = service.get('ttlLocalData');
        expect(expired).toBeUndefined();
        
        const storageKey = '__dataShare_ttlLocalData';
        expect(localStorage.getItem(storageKey)).toBeNull();
        done();
      }, 150);
    });

    it('should return default value for expired data', (done) => {
      service.set('ttlDefault', 'value', { ttl: 50, persist: true });
      
      setTimeout(() => {
        const result = service.get('ttlDefault', 'default');
        expect(result).toBe('default');
        done();
      }, 100);
    });

    it('should clear expired items with clearExpired()', (done) => {
      service.set('expire1', 'value1', { ttl: 50, persist: true });
      service.set('expire2', 'value2', { ttl: 50, persist: true });
      service.set('noExpire', 'value3', { persist: true });
      
      setTimeout(() => {
        service.clearExpired();
        
        expect(service.peek('expire1')).toBeUndefined();
        expect(service.peek('expire2')).toBeUndefined();
        expect(service.peek('noExpire')).toBe('value3');
        done();
      }, 100);
    });

    it('should clear expired localStorage items with clearExpired()', (done) => {
      service.set('localExpire', 'value', { 
        useLocalStorage: true, 
        ttl: 50, 
        persist: true 
      });
      
      setTimeout(() => {
        service.clearExpired();
        
        const storageKey = '__dataShare_localExpire';
        expect(localStorage.getItem(storageKey)).toBeNull();
        done();
      }, 100);
    });
  });

  describe('has() Method', () => {
    it('should return true for existing key', () => {
      service.set('existingKey', 'value');
      expect(service.has('existingKey')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(service.has('nonExistent')).toBe(false);
    });

    it('should return false for expired key', (done) => {
      service.set('expireKey', 'value', { ttl: 50, persist: true });
      
      expect(service.has('expireKey')).toBe(true);
      
      setTimeout(() => {
        expect(service.has('expireKey')).toBe(false);
        done();
      }, 100);
    });

    it('should work with localStorage keys', () => {
      service.set('localKey', 'value', { useLocalStorage: true, persist: true });
      expect(service.has('localKey')).toBe(true);
    });
  });

  describe('peek() Method', () => {
    it('should retrieve data without removing it', () => {
      service.set('peekData', 'value');
      
      const first = service.peek('peekData');
      expect(first).toBe('value');
      
      const second = service.peek('peekData');
      expect(second).toBe('value');
      
      // Data should still be available with get()
      const third = service.get('peekData');
      expect(third).toBe('value');
    });

    it('should return undefined for non-existent key', () => {
      expect(service.peek('nonExistent')).toBeUndefined();
    });

    it('should return undefined for expired key', (done) => {
      service.set('peekExpire', 'value', { ttl: 50, persist: true });
      
      expect(service.peek('peekExpire')).toBe('value');
      
      setTimeout(() => {
        expect(service.peek('peekExpire')).toBeUndefined();
        done();
      }, 100);
    });

    it('should work with localStorage', () => {
      service.set('peekLocal', 'value', { useLocalStorage: true, persist: true });
      
      const peeked = service.peek('peekLocal');
      expect(peeked).toBe('value');
    });
  });

  describe('clear() Method', () => {
    it('should clear specific key from memory', () => {
      service.set('clearMe', 'value', { persist: true });
      service.set('keepMe', 'value', { persist: true });
      
      service.clear('clearMe');
      
      expect(service.has('clearMe')).toBe(false);
      expect(service.has('keepMe')).toBe(true);
    });

    it('should clear specific key from localStorage', () => {
      service.set('clearLocal', 'value', { useLocalStorage: true, persist: true });
      service.set('keepLocal', 'value', { useLocalStorage: true, persist: true });
      
      service.clear('clearLocal');
      
      expect(service.has('clearLocal')).toBe(false);
      expect(service.has('keepLocal')).toBe(true);
    });

    it('should not throw error when clearing non-existent key', () => {
      expect(() => service.clear('nonExistent')).not.toThrow();
    });
  });

  describe('clearAll() Method', () => {
    it('should clear all memory storage', () => {
      service.set('key1', 'value1', { persist: true });
      service.set('key2', 'value2', { persist: true });
      service.set('key3', 'value3', { persist: true });
      
      service.clearAll();
      
      expect(service.has('key1')).toBe(false);
      expect(service.has('key2')).toBe(false);
      expect(service.has('key3')).toBe(false);
    });

    it('should clear all localStorage items', () => {
      service.set('local1', 'value1', { useLocalStorage: true, persist: true });
      service.set('local2', 'value2', { useLocalStorage: true, persist: true });
      
      service.clearAll();
      
      expect(service.has('local1')).toBe(false);
      expect(service.has('local2')).toBe(false);
      
      // Verify localStorage is cleared
      expect(localStorage.getItem('__dataShare_local1')).toBeNull();
      expect(localStorage.getItem('__dataShare_local2')).toBeNull();
    });

    it('should only clear dataShare prefixed items from localStorage', () => {
      // Add non-dataShare item
      localStorage.setItem('otherKey', 'otherValue');
      
      service.set('dataKey', 'value', { useLocalStorage: true, persist: true });
      service.clearAll();
      
      // dataShare item should be cleared
      expect(service.has('dataKey')).toBe(false);
      
      // Other items should remain
      expect(localStorage.getItem('otherKey')).toBe('otherValue');
      
      // Clean up
      localStorage.removeItem('otherKey');
    });
  });

  describe('Type Safety', () => {
    interface User {
      id: number;
      name: string;
      email: string;
    }

    it('should maintain type safety with generics', () => {
      const user: User = { id: 1, name: 'John', email: 'john@example.com' };
      service.set<User>('user', user);
      
      const retrieved = service.get<User>('user');
      expect(retrieved).toEqual(user);
      expect(retrieved?.id).toBe(1);
      expect(retrieved?.name).toBe('John');
      expect(retrieved?.email).toBe('john@example.com');
    });

    it('should work with complex nested types', () => {
      interface ComplexData {
        users: User[];
        metadata: {
          total: number;
          page: number;
        };
      }

      const data: ComplexData = {
        users: [
          { id: 1, name: 'User1', email: 'user1@example.com' },
          { id: 2, name: 'User2', email: 'user2@example.com' }
        ],
        metadata: {
          total: 2,
          page: 1
        }
      };

      service.set<ComplexData>('complexData', data);
      const retrieved = service.get<ComplexData>('complexData');
      
      expect(retrieved).toEqual(data);
      expect(retrieved?.users.length).toBe(2);
      expect(retrieved?.metadata.total).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as key', () => {
      service.set('', 'value');
      expect(service.get('')).toBe('value');
    });

    it('should handle keys with special characters', () => {
      const key = 'key-with_special.chars@123';
      service.set(key, 'value');
      expect(service.get(key)).toBe('value');
    });

    it('should handle undefined as stored value', () => {
      service.set('undefinedValue', undefined);
      // undefined is stored and retrieved
      expect(service.has('undefinedValue')).toBe(true);
      expect(service.get('undefinedValue')).toBeUndefined();
    });

    it('should handle very large data objects', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `data_${i}`
      }));
      
      service.set('largeData', largeArray);
      const retrieved = service.get<typeof largeArray>('largeData');
      
      expect(retrieved).toEqual(largeArray);
      expect(retrieved?.length).toBe(1000);
    });

    it('should handle rapid consecutive set/get operations', () => {
      for (let i = 0; i < 100; i++) {
        service.set(`key${i}`, `value${i}`);
      }
      
      for (let i = 0; i < 100; i++) {
        expect(service.get(`key${i}`)).toBe(`value${i}`);
      }
    });

    it('should overwrite existing key', () => {
      service.set('overwrite', 'first', { persist: true });
      expect(service.get('overwrite')).toBe('first');
      
      service.set('overwrite', 'second', { persist: true });
      expect(service.get('overwrite')).toBe('second');
    });

    it('should handle mixed storage locations for same key', () => {
      // Set in memory
      service.set('mixedKey', 'memory', { persist: true });
      expect(service.get('mixedKey')).toBe('memory');
      
      // Overwrite in localStorage
      service.set('mixedKey', 'localStorage', { 
        useLocalStorage: true, 
        persist: true 
      });
      expect(service.get('mixedKey')).toBe('localStorage');
    });
  });

  describe('Initialization', () => {
    it('should clear expired items on service initialization', (done) => {
      // Create a new service instance with expired data already in localStorage
      service.set('willExpire', 'value', { 
        useLocalStorage: true, 
        ttl: 50, 
        persist: true 
      });
      
      setTimeout(() => {
        // Create new service instance (simulating page refresh)
        const newService = new DataShareService();
        
        // Expired item should be cleaned up
        expect(newService.has('willExpire')).toBe(false);
        done();
      }, 100);
    });
  });
});
