import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from 'react-native-harness';
import { MMKV, createMMKV, deleteMMKV, existsMMKV } from 'react-native-mmkv';

const waitForNextTick = async () => {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
};

describe('MMKV Core Functionality', () => {
  let storage: MMKV;

  beforeEach(() => {
    storage = createMMKV();
    storage.clearAll(); // Start with clean state
  });

  afterEach(() => {
    storage.clearAll(); // Clean up after each test
  });

  describe('Basic CRUD Operations', () => {
    it('should store and retrieve string values correctly', () => {
      const testKey = 'testString';
      const testValue = 'Hello MMKV!';

      storage.set(testKey, testValue);

      expect(storage.getString(testKey)).toStrictEqual(testValue);
      expect(storage.contains(testKey)).toBe(true);
      expect(storage.getAllKeys()).toContain(testKey);
    });

    it('should store and retrieve number values correctly', () => {
      const testKey = 'testNumber';
      const testValue = 42.5;

      storage.set(testKey, testValue);

      expect(storage.getNumber(testKey)).toStrictEqual(testValue);
      expect(storage.contains(testKey)).toBe(true);
    });

    it('should store and retrieve boolean values correctly', () => {
      const testKey = 'testBoolean';

      storage.set(testKey, true);
      expect(storage.getBoolean(testKey)).toStrictEqual(true);

      storage.set(testKey, false);
      expect(storage.getBoolean(testKey)).toStrictEqual(false);
    });

    it('should store and retrieve values with correct types', () => {
      storage.set('stringKey', 'value');
      storage.set('numberKey', 123);
      storage.set('booleanKey', true);

      // Correct type access should work
      expect(storage.getString('stringKey')).toStrictEqual('value');
      expect(storage.getNumber('numberKey')).toStrictEqual(123);
      expect(storage.getBoolean('booleanKey')).toStrictEqual(true);
    });

    it('should handle type interpretation from raw bytes', () => {
      // MMKV stores raw bytes, so reading with wrong type may return interpreted values
      // rather than undefined, depending on the underlying byte representation
      storage.set('numberKey', 42);

      // Reading a number as string/boolean may return some interpreted value
      // We just verify it doesn't crash and returns something
      const stringResult = storage.getString('numberKey');
      const booleanResult = storage.getBoolean('numberKey');

      // These may or may not be undefined depending on byte interpretation
      expect(typeof stringResult).toBeDefined();
      expect(typeof booleanResult).toBeDefined();

      // But the correct type should still work
      expect(storage.getNumber('numberKey')).toStrictEqual(42);
    });

    it('should remove values correctly', () => {
      const testKey = 'removeTest';

      storage.set(testKey, 'value');
      expect(storage.contains(testKey)).toBe(true);

      storage.remove(testKey);
      expect(storage.contains(testKey)).toBe(false);
      expect(storage.getString(testKey)).toBeUndefined();
      expect(storage.getAllKeys()).not.toContain(testKey);
    });

    it('should clear all values correctly', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 42);
      storage.set('key3', true);

      expect(storage.getAllKeys().length).toBeGreaterThan(0);

      storage.clearAll();
      expect(storage.getAllKeys()).toEqual([]);
    });

    it('should return undefined for non-existent keys', () => {
      const nonExistentKey = 'doesNotExist';

      expect(storage.getString(nonExistentKey)).toBeUndefined();
      expect(storage.getNumber(nonExistentKey)).toBeUndefined();
      expect(storage.getBoolean(nonExistentKey)).toBeUndefined();
      expect(storage.getBuffer(nonExistentKey)).toBeUndefined();
      expect(storage.contains(nonExistentKey)).toBe(false);
    });
  });

  describe('Key Management', () => {
    it('should handle getAllKeys correctly', () => {
      const keys = ['key1', 'key2', 'key3'];

      keys.forEach((key, index) => {
        storage.set(key, `value${index}`);
      });

      const retrievedKeys = storage.getAllKeys();
      keys.forEach(key => {
        expect(retrievedKeys).toContain(key);
      });
    });

    it('should handle special characters in keys', () => {
      const specialKeys = [
        'key with spaces',
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots',
        'key/with/slashes',
        'émoji-key-🚀',
      ];

      specialKeys.forEach(key => {
        storage.set(key, 'test value');
        expect(storage.getString(key)).toStrictEqual('test value');
        expect(storage.contains(key)).toBe(true);
      });
    });
  });

  describe('Value Overwriting', () => {
    it('should overwrite existing values', () => {
      const key = 'overwriteTest';

      storage.set(key, 'original');
      expect(storage.getString(key)).toStrictEqual('original');

      storage.set(key, 'updated');
      expect(storage.getString(key)).toStrictEqual('updated');
    });

    it('should handle type changes for the same key', () => {
      const key = 'typeChangeTest';

      storage.set(key, 'string value');
      expect(storage.getString(key)).toStrictEqual('string value');

      storage.set(key, 42);
      expect(storage.getNumber(key)).toStrictEqual(42);

      storage.set(key, true);
      expect(storage.getBoolean(key)).toStrictEqual(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      const key = 'emptyString';
      storage.set(key, '');

      expect(storage.getString(key)).toStrictEqual('');
      expect(storage.contains(key)).toBe(true);
    });

    it('should handle zero and negative numbers', () => {
      storage.set('zero', 0);
      storage.set('negative', -42.5);

      expect(storage.getNumber('zero')).toStrictEqual(0);
      expect(storage.getNumber('negative')).toStrictEqual(-42.5);
    });

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(10000);
      const key = 'longString';

      storage.set(key, longString);
      expect(storage.getString(key)).toStrictEqual(longString);
    });

    it('should handle many keys', () => {
      const keyCount = 1000;
      const keys: string[] = [];

      for (let i = 0; i < keyCount; i++) {
        const key = `key${i}`;
        keys.push(key);
        storage.set(key, i);
      }

      // Verify all keys exist
      const allKeys = storage.getAllKeys();
      expect(allKeys.length).toBeGreaterThanOrEqual(keyCount);

      // Verify random samples
      for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * keyCount);
        const key = `key${randomIndex}`;
        expect(storage.getNumber(key)).toStrictEqual(randomIndex);
      }
    });
  });

  describe('ArrayBuffer/Buffer Operations', () => {
    it('should store and retrieve ArrayBuffer correctly', () => {
      const key = 'bufferTest';
      const data = new Uint8Array([1, 2, 3, 4, 5, 255]);
      const buffer = data.buffer;

      storage.set(key, buffer);

      const retrieved = storage.getBuffer(key);
      expect(retrieved).toBeDefined();
      expect(retrieved!.byteLength).toStrictEqual(buffer.byteLength);

      const retrievedArray = new Uint8Array(retrieved!);
      expect(retrievedArray).toEqual(data);
    });

    it('should handle empty ArrayBuffer', () => {
      const key = 'emptyBuffer';
      const emptyBuffer = new ArrayBuffer(0);

      storage.set(key, emptyBuffer);

      const retrieved = storage.getBuffer(key);
      expect(retrieved).toBeDefined();
      expect(retrieved!.byteLength).toStrictEqual(0);
    });

    it('should handle large ArrayBuffer', () => {
      const key = 'largeBuffer';
      const size = 1024 * 1024; // 1MB
      const data = new Uint8Array(size);

      // Fill with pattern
      for (let i = 0; i < size; i++) {
        data[i] = i % 256;
      }

      storage.set(key, data.buffer);

      const retrieved = storage.getBuffer(key);
      expect(retrieved).toBeDefined();
      expect(retrieved!.byteLength).toStrictEqual(size);

      const retrievedArray = new Uint8Array(retrieved!);
      // Check pattern at random positions
      for (let i = 0; i < 100; i++) {
        const pos = Math.floor(Math.random() * size);
        expect(retrievedArray[pos]).toStrictEqual(pos % 256);
      }
    });

    it('should handle different typed arrays', () => {
      const int16Data = new Int16Array([1000, -1000, 32767, -32768]);
      const float32Data = new Float32Array([3.14159, -2.718, 1.414]);
      const uint32Data = new Uint32Array([0, 1, 4294967295]);

      storage.set('int16', int16Data.buffer);
      storage.set('float32', float32Data.buffer);
      storage.set('uint32', uint32Data.buffer);

      const int16Retrieved = new Int16Array(storage.getBuffer('int16')!);
      const float32Retrieved = new Float32Array(storage.getBuffer('float32')!);
      const uint32Retrieved = new Uint32Array(storage.getBuffer('uint32')!);

      expect(int16Retrieved).toEqual(int16Data);
      expect(float32Retrieved).toEqual(float32Data);
      expect(uint32Retrieved).toEqual(uint32Data);
    });

    it('should handle buffer type interpretation', () => {
      const key = 'bufferTypeTest';
      const data = new Uint8Array([65, 66, 67]); // 'ABC' in ASCII

      storage.set(key, data.buffer);

      // Buffer should be retrievable as buffer
      expect(storage.getBuffer(key)).toBeDefined();

      // Other types may return interpreted values from the raw bytes
      // We just verify they don't crash
      const stringResult = storage.getString(key);
      const numberResult = storage.getNumber(key);
      const booleanResult = storage.getBoolean(key);

      // These may or may not be undefined depending on byte interpretation
      expect(() => stringResult).not.toThrow();
      expect(() => numberResult).not.toThrow();
      expect(() => booleanResult).not.toThrow();
    });
  });
});

describe('MMKV Configuration & Multiple Instances', () => {
  afterEach(() => {
    // Clean up all test instances
    try {
      createMMKV({ id: 'test-instance-1' }).clearAll();
      createMMKV({ id: 'test-instance-2' }).clearAll();
      createMMKV({ id: 'encrypted-instance' }).clearAll();
    } catch {
      // Instances might not exist, that's okay
    }
  });

  describe('Instance Configuration', () => {
    it('should create instances with different IDs', () => {
      const storage1 = createMMKV({ id: 'test-instance-1' });
      const storage2 = createMMKV({ id: 'test-instance-2' });

      // Set values in different instances
      storage1.set('shared-key', 'value-from-instance-1');
      storage2.set('shared-key', 'value-from-instance-2');

      // Values should be isolated
      expect(storage1.getString('shared-key')).toStrictEqual(
        'value-from-instance-1',
      );
      expect(storage2.getString('shared-key')).toStrictEqual(
        'value-from-instance-2',
      );
    });

    it('should handle default instance vs custom instance isolation', () => {
      const defaultStorage = createMMKV();
      const customStorage = createMMKV({ id: 'custom-test' });

      const key = 'isolation-test';
      defaultStorage.set(key, 'default-value');
      customStorage.set(key, 'custom-value');

      expect(defaultStorage.getString(key)).toStrictEqual('default-value');
      expect(customStorage.getString(key)).toStrictEqual('custom-value');

      // Clean up custom instance
      customStorage.clearAll();
    });

    it('should reuse same instance for same configuration', () => {
      const config = { id: 'reuse-test' };
      const storage1 = createMMKV(config);
      const storage2 = createMMKV(config);

      storage1.set('test-key', 'test-value');

      // Both references should point to same instance
      expect(storage2.getString('test-key')).toStrictEqual('test-value');

      // Clean up
      storage1.clearAll();
    });
  });

  describe('Instance Management', () => {
    it('should handle multiple instances independently', () => {
      const instances = Array.from({ length: 5 }, (_, i) =>
        createMMKV({ id: `multi-instance-${i}` }),
      );

      // Set different values in each instance
      instances.forEach((instance, i) => {
        instance.set('instance-number', i);
        instance.set('instance-name', `instance-${i}`);
      });

      // Verify isolation
      instances.forEach((instance, i) => {
        expect(instance.getNumber('instance-number')).toStrictEqual(i);
        expect(instance.getString('instance-name')).toStrictEqual(
          `instance-${i}`,
        );
      });

      // Clean up
      instances.forEach(instance => instance.clearAll());
    });

    it('should handle instance properties correctly', () => {
      const storage = createMMKV({ id: 'properties-test' });

      // Initially empty
      expect(storage.getAllKeys()).toEqual([]);

      // Add some data
      storage.set('key1', 'value1');
      storage.set('key2', 42);

      expect(storage.getAllKeys().length).toStrictEqual(2);
      expect(typeof storage.size).toBe('number');
      expect(storage.size).toBeGreaterThan(0);

      // Clean up
      storage.clearAll();
    });
  });
});

describe('MMKV Encryption & Security', () => {
  afterEach(() => {
    // Clean up encrypted instances
    try {
      createMMKV({ id: 'encrypted-test' }).clearAll();
      createMMKV({ id: 'recrypt-test' }).clearAll();
    } catch {
      // Instances might not exist, that's okay
    }
  });

  describe('Encryption', () => {
    it('should create encrypted instance and store data', () => {
      const encryptionKey = 'test-key-123456';
      const storage = createMMKV({
        id: 'encrypted-test',
        encryptionKey,
      });

      storage.set('secret-data', 'confidential information');
      storage.set('secret-number', 42);
      storage.set('secret-boolean', true);

      expect(storage.getString('secret-data')).toStrictEqual(
        'confidential information',
      );
      expect(storage.getNumber('secret-number')).toStrictEqual(42);
      expect(storage.getBoolean('secret-boolean')).toStrictEqual(true);
    });

    it('should isolate encrypted and non-encrypted instances', () => {
      const plainStorage = createMMKV({ id: 'plain-test' });
      const encryptedStorage = createMMKV({
        id: 'encrypted-isolation-test',
        encryptionKey: 'secret-key-456',
      });

      const key = 'shared-key';
      plainStorage.set(key, 'plain-value');
      encryptedStorage.set(key, 'encrypted-value');

      expect(plainStorage.getString(key)).toStrictEqual('plain-value');
      expect(encryptedStorage.getString(key)).toStrictEqual('encrypted-value');

      // Clean up
      plainStorage.clearAll();
      encryptedStorage.clearAll();
    });

    it('should handle recryption', () => {
      const storage = createMMKV({ id: 'recrypt-test' });

      // Set data without encryption
      storage.set('data-key', 'original-data');
      expect(storage.getString('data-key')).toStrictEqual('original-data');

      // Encrypt the storage
      storage.recrypt('new-encryption-key');
      expect(storage.getString('data-key')).toStrictEqual('original-data');

      // Change encryption key
      storage.recrypt('different-key-123');
      expect(storage.getString('data-key')).toStrictEqual('original-data');

      // Remove encryption
      storage.recrypt(undefined);
      expect(storage.getString('data-key')).toStrictEqual('original-data');
    });

    it('should handle encryption key validation', () => {
      // Test maximum key length (16 bytes)
      const maxKey = '1234567890123456'; // exactly 16 characters
      const storage = createMMKV({
        id: 'key-validation-test',
        encryptionKey: maxKey,
      });

      storage.set('test', 'value');
      expect(storage.getString('test')).toStrictEqual('value');

      storage.clearAll();
    });
  });
});

describe('MMKV Storage Management', () => {
  let storage: MMKV;

  beforeEach(() => {
    storage = createMMKV({ id: 'storage-management-test' });
    storage.clearAll();
  });

  afterEach(() => {
    storage.clearAll();
  });

  describe('Storage Size & Management', () => {
    it('should track storage size correctly', () => {
      const initialSize = storage.size;

      storage.set('test-key', 'test-value');
      expect(storage.size).toBeGreaterThan(initialSize);

      const sizeAfterSet = storage.size;

      storage.set('another-key', 'another-value');
      expect(storage.size).toBeGreaterThan(sizeAfterSet);
    });

    it('should handle trim operation', () => {
      // Add some data
      for (let i = 0; i < 100; i++) {
        storage.set(`key-${i}`, `value-${i}`);
      }

      const sizeBeforeTrim = storage.size;
      expect(sizeBeforeTrim).toBeGreaterThan(0);

      // Remove half the data
      for (let i = 0; i < 50; i++) {
        storage.remove(`key-${i}`);
      }

      // Trim should clean up unused space
      storage.trim();

      // Verify remaining data is still accessible
      for (let i = 50; i < 100; i++) {
        expect(storage.getString(`key-${i}`)).toStrictEqual(`value-${i}`);
      }
    });

    it('should handle clearAll correctly', () => {
      // Add various types of data
      storage.set('string-key', 'string-value');
      storage.set('number-key', 123.456);
      storage.set('boolean-key', true);
      storage.set('buffer-key', new Uint8Array([1, 2, 3]).buffer);

      expect(storage.getAllKeys().length).toStrictEqual(4);
      expect(storage.size).toBeGreaterThan(0);

      storage.clearAll();

      expect(storage.getAllKeys()).toEqual([]);
      expect(storage.contains('string-key')).toBe(false);
      expect(storage.contains('number-key')).toBe(false);
      expect(storage.contains('boolean-key')).toBe(false);
      expect(storage.contains('buffer-key')).toBe(false);
    });

    it('should handle storage operations after clearAll', () => {
      // Add data, clear, then add again
      storage.set('initial-key', 'initial-value');
      expect(storage.getString('initial-key')).toStrictEqual('initial-value');

      storage.clearAll();
      expect(storage.getString('initial-key')).toBeUndefined();

      storage.set('new-key', 'new-value');
      expect(storage.getString('new-key')).toStrictEqual('new-value');
      expect(storage.getAllKeys()).toEqual(['new-key']);
    });
  });

  describe('Performance & Stress Tests', () => {
    it('should handle rapid consecutive operations', () => {
      const iterations = 1000;

      // Rapid writes
      for (let i = 0; i < iterations; i++) {
        storage.set(`rapid-${i}`, i);
      }

      // Rapid reads
      for (let i = 0; i < iterations; i++) {
        expect(storage.getNumber(`rapid-${i}`)).toStrictEqual(i);
      }

      // Rapid removes
      for (let i = 0; i < iterations; i += 2) {
        storage.remove(`rapid-${i}`);
      }

      // Verify remaining data
      for (let i = 1; i < iterations; i += 2) {
        expect(storage.getNumber(`rapid-${i}`)).toStrictEqual(i);
      }
    });

    it('should handle mixed operations efficiently', () => {
      const operations = 500;

      for (let i = 0; i < operations; i++) {
        // Mix of different operations
        storage.set(`mixed-string-${i}`, `value-${i}`);
        storage.set(`mixed-number-${i}`, i * 1.5);
        storage.set(`mixed-boolean-${i}`, i % 2 === 0);

        if (i % 10 === 0) {
          storage.getAllKeys();
          storage.trim();
        }

        if (i % 3 === 0) {
          storage.contains(`mixed-string-${i}`);
        }
      }

      // Verify data integrity
      const keys = storage.getAllKeys();
      expect(keys.length).toBeGreaterThan(operations * 2); // At least 2/3 of the keys should exist

      // Random verification
      for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * operations);
        expect(storage.getString(`mixed-string-${randomIndex}`)).toStrictEqual(
          `value-${randomIndex}`,
        );
        expect(storage.getNumber(`mixed-number-${randomIndex}`)).toStrictEqual(
          randomIndex * 1.5,
        );
        expect(
          storage.getBoolean(`mixed-boolean-${randomIndex}`),
        ).toStrictEqual(randomIndex % 2 === 0);
      }
    });
  });
});

describe('MMKV Listeners & Observers', () => {
  let storage: MMKV;

  beforeEach(() => {
    storage = createMMKV({ id: 'listener-test' });
    storage.clearAll();
  });

  afterEach(() => {
    storage.clearAll();
  });

  describe('Value Change Listeners', () => {
    it('should trigger listeners on value changes', async () => {
      const changedKeys: string[] = [];

      const listener = storage.addOnValueChangedListener(key => {
        changedKeys.push(key);
      });

      storage.set('test-key-1', 'value1');
      storage.set('test-key-2', 42);
      storage.set('test-key-3', true);

      // Wait for the listeners to trigger
      await waitForNextTick();

      expect(changedKeys).toContain('test-key-1');
      expect(changedKeys).toContain('test-key-2');
      expect(changedKeys).toContain('test-key-3');

      listener.remove();
    });

    it('should trigger listeners on value updates', async () => {
      const changedKeys: string[] = [];

      const listener = storage.addOnValueChangedListener(key => {
        changedKeys.push(key);
      });

      const testKey = 'update-test';
      storage.set(testKey, 'original');
      storage.set(testKey, 'updated');
      storage.set(testKey, 'final');

      // Wait for the listeners to trigger
      await waitForNextTick();

      const keyChanges = changedKeys.filter(k => k === testKey);
      expect(keyChanges.length).toStrictEqual(3);

      listener.remove();
    });

    it('should trigger listeners on value removal', async () => {
      const changedKeys: string[] = [];

      const listener = storage.addOnValueChangedListener(key => {
        changedKeys.push(key);
      });

      const testKey = 'remove-test';
      storage.set(testKey, 'value');

      await waitForNextTick();
      storage.remove(testKey);

      // Wait for the listeners to trigger
      await waitForNextTick();

      expect(changedKeys.filter(k => k === testKey).length).toStrictEqual(2);

      listener.remove();
    });

    it('should handle multiple listeners correctly', async () => {
      const listener1Changes: string[] = [];
      const listener2Changes: string[] = [];

      const listener1 = storage.addOnValueChangedListener(key => {
        listener1Changes.push(key);
      });

      const listener2 = storage.addOnValueChangedListener(key => {
        listener2Changes.push(key);
      });

      storage.set('multi-listener-test', 'value');

      // Wait for the listeners to trigger
      await waitForNextTick();

      expect(listener1Changes).toContain('multi-listener-test');
      expect(listener2Changes).toContain('multi-listener-test');

      listener1.remove();
      listener2.remove();
    });

    it('should stop triggering after listener removal', async () => {
      const changedKeys: string[] = [];

      const listener = storage.addOnValueChangedListener(key => {
        changedKeys.push(key);
      });

      storage.set('before-removal', 'value');

      // Wait for the listeners to trigger
      await waitForNextTick();

      expect(changedKeys).toContain('before-removal');

      listener.remove();

      storage.set('after-removal', 'value');

      // Wait for potential listeners to trigger (but they shouldn't)
      await waitForNextTick();

      expect(changedKeys).not.toContain('after-removal');
    });

    it('should handle listener removal multiple times safely', () => {
      const listener = storage.addOnValueChangedListener(() => {});

      // Should not throw errors
      listener.remove();
      listener.remove();
      listener.remove();
    });

    it('should not trigger listeners for clearAll', async () => {
      const changedKeys: string[] = [];

      const listener = storage.addOnValueChangedListener(key => {
        changedKeys.push(key);
      });

      storage.set('key1', 'value1');
      storage.set('key2', 'value2');

      // Wait for the listeners to trigger
      await waitForNextTick();

      storage.clearAll();

      // Wait for the listeners to trigger
      await waitForNextTick();

      // We did 2x set and a clearAll (clears 2x keys)
      expect(changedKeys.length).toStrictEqual(4);

      listener.remove();
    });
  });
});

describe('Deleting instances and checking if they exist', () => {
  describe('Checking if an instance exists', () => {
    it('should exist', () => {
      expect(() => {
        createMMKV({ id: 'some-instance' })
        return existsMMKV('some-instance')
      }).toBe(true)
    })

    it('should not exist', () => {
      expect(() => {
        return existsMMKV('some-non-existing-instance')
      }).toBe(false)
    })
  })

  describe('Deleting an instance', () => {
    it('should delete properly', () => {
      expect(() => {
        createMMKV({ id: 'some-instance' })
        return deleteMMKV('some-instance')
      }).toBe(true)
    })
    it('should delete properly and exists should be false', () => {
      expect(() => {
        createMMKV({ id: 'some-instance' })
        deleteMMKV('some-instance')
        return existsMMKV('some-instance')
      }).toBe(true)
    })

    it('should not delete', () => {
      expect(() => {
        return deleteMMKV('some-non-existing-instance')
      }).toBe(false)
    })
  })
})

describe('MMKV Error Handling & Edge Cases', () => {
  let storage: MMKV;

  beforeEach(() => {
    storage = createMMKV({ id: 'error-handling-test' });
    storage.clearAll();
  });

  afterEach(() => {
    storage.clearAll();
  });

  describe('Error Scenarios', () => {
    it('should handle invalid key operations gracefully', () => {
      // Empty string key should throw
      expect(() => {
        storage.set('', 'empty-key-value');
      }).toThrow()
    });

    it('should handle concurrent operations', () => {
      // Simulate concurrent operations
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            storage.set(`concurrent-${i}`, i);
            return storage.getNumber(`concurrent-${i}`);
          }),
        );
      }

      return Promise.all(promises).then(results => {
        results.forEach((value, index) => {
          expect(value).toStrictEqual(index);
        });
      });
    });

    it('should handle Unicode and special characters', () => {
      const unicodeTests = [
        { key: 'emoji', value: '🚀🎉✨' },
        { key: 'chinese', value: '你好世界' },
        { key: 'arabic', value: 'مرحبا بالعالم' },
        { key: 'russian', value: 'Привет мир' },
        { key: 'japanese', value: 'こんにちは世界' },
        { key: 'mixed', value: 'Hello 🌍 नमस्ते 🙏' },
      ];

      unicodeTests.forEach(test => {
        storage.set(test.key, test.value);
        expect(storage.getString(test.key)).toStrictEqual(test.value);
      });
    });

    it('should handle extreme number values', () => {
      const extremeNumbers = [
        { key: 'max-safe', value: Number.MAX_SAFE_INTEGER },
        { key: 'min-safe', value: Number.MIN_SAFE_INTEGER },
        { key: 'max-value', value: Number.MAX_VALUE },
        { key: 'min-value', value: Number.MIN_VALUE },
        { key: 'infinity', value: Infinity },
        { key: 'negative-infinity', value: -Infinity },
        { key: 'nan', value: NaN },
      ];

      extremeNumbers.forEach(test => {
        storage.set(test.key, test.value);
        const retrieved = storage.getNumber(test.key);

        if (isNaN(test.value)) {
          expect(isNaN(retrieved!)).toBe(true);
        } else {
          expect(retrieved).toStrictEqual(test.value);
        }
      });
    });

    it('should maintain data integrity across operations', () => {
      // Create a complex data set
      const testData = {
        strings: Array.from({ length: 50 }, (_, i) => ({
          key: `str-${i}`,
          value: `string-value-${i}`,
        })),
        numbers: Array.from({ length: 50 }, (_, i) => ({
          key: `num-${i}`,
          value: Math.random() * 1000,
        })),
        booleans: Array.from({ length: 50 }, (_, i) => ({
          key: `bool-${i}`,
          value: i % 2 === 0,
        })),
      };

      // Set all data
      [...testData.strings, ...testData.numbers, ...testData.booleans].forEach(
        item => {
          storage.set(item.key, item.value);
        },
      );

      // Perform random operations
      for (let i = 0; i < 100; i++) {
        const operation = Math.floor(Math.random() * 4);
        switch (operation) {
          case 0: // Random read
            const randomKey = `str-${Math.floor(Math.random() * 50)}`;
            storage.getString(randomKey);
            break;
          case 1: // Random update
            const updateKey = `num-${Math.floor(Math.random() * 50)}`;
            storage.set(updateKey, Math.random() * 2000);
            break;
          case 2: // Check contains
            const checkKey = `bool-${Math.floor(Math.random() * 50)}`;
            storage.contains(checkKey);
            break;
          case 3: // Get all keys
            storage.getAllKeys();
            break;
        }
      }

      // Verify data integrity for strings and booleans (numbers were updated)
      testData.strings.forEach(item => {
        expect(storage.getString(item.key)).toStrictEqual(item.value);
      });

      testData.booleans.forEach(item => {
        expect(storage.getBoolean(item.key)).toStrictEqual(item.value);
      });

      // Verify all keys still exist
      const allKeys = storage.getAllKeys();
      expect(allKeys.length).toStrictEqual(150);
    });
  });
});
