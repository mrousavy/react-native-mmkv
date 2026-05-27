import type { MMKV } from '../specs/MMKV.nitro'
import { createMockMMKV } from '../createMMKV/createMockMMKV'
import { createMMKV as createWebMMKV } from '../createMMKV/createMMKV.web'

type Factory = () => MMKV

function mmkvTestSuite(name: string, factory: Factory) {
  describe(name, () => {
    let mmkv: MMKV

    beforeEach(() => {
      mmkv = factory()
      mmkv.clearAll()
    })

    describe('string', () => {
      test('set and get', () => {
        mmkv.set('key', 'hello')
        expect(mmkv.getString('key')).toBe('hello')
      })

      test('empty string', () => {
        mmkv.set('key', '')
        expect(mmkv.getString('key')).toBe('')
      })

      test('returns undefined for missing key', () => {
        expect(mmkv.getString('missing')).toBeUndefined()
      })
    })

    describe('number', () => {
      test('set and get integer', () => {
        mmkv.set('key', 42)
        expect(mmkv.getNumber('key')).toBe(42)
      })

      test('set and get float', () => {
        mmkv.set('key', 3.14)
        expect(mmkv.getNumber('key')).toBeCloseTo(3.14)
      })

      test('set and get zero', () => {
        mmkv.set('key', 0)
        expect(mmkv.getNumber('key')).toBe(0)
      })

      test('set and get negative', () => {
        mmkv.set('key', -100)
        expect(mmkv.getNumber('key')).toBe(-100)
      })

      test('returns undefined for missing key', () => {
        expect(mmkv.getNumber('missing')).toBeUndefined()
      })
    })

    describe('boolean', () => {
      test('set and get true', () => {
        mmkv.set('key', true)
        expect(mmkv.getBoolean('key')).toBe(true)
      })

      test('set and get false', () => {
        mmkv.set('key', false)
        expect(mmkv.getBoolean('key')).toBe(false)
      })

      test('returns undefined for missing key', () => {
        expect(mmkv.getBoolean('missing')).toBeUndefined()
      })
    })

    describe('buffer', () => {
      test('set and get ArrayBuffer', () => {
        const buffer = new ArrayBuffer(3)
        const view = new Uint8Array(buffer)
        view[0] = 1
        view[1] = 100
        view[2] = 255

        mmkv.set('key', buffer)
        const result = mmkv.getBuffer('key')

        expect(result).toBeDefined()
        const resultView = new Uint8Array(result!)
        expect(resultView.length).toBe(3)
        expect(resultView[0]).toBe(1)
        expect(resultView[1]).toBe(100)
        expect(resultView[2]).toBe(255)
      })

      test('set and get empty ArrayBuffer', () => {
        const buffer = new ArrayBuffer(0)
        mmkv.set('key', buffer)
        const result = mmkv.getBuffer('key')
        expect(result).toBeDefined()
        expect(new Uint8Array(result!).length).toBe(0)
      })

      test('returns undefined for missing key', () => {
        expect(mmkv.getBuffer('missing')).toBeUndefined()
      })
    })

    describe('contains', () => {
      test('returns true for existing key', () => {
        mmkv.set('key', 'value')
        expect(mmkv.contains('key')).toBe(true)
      })

      test('returns false for missing key', () => {
        expect(mmkv.contains('missing')).toBe(false)
      })
    })

    describe('remove', () => {
      test('removes existing key', () => {
        mmkv.set('key', 'value')
        mmkv.remove('key')
        expect(mmkv.getString('key')).toBeUndefined()
      })
    })

    describe('getAllKeys', () => {
      test('returns all keys', () => {
        mmkv.set('a', 'value')
        mmkv.set('b', 42)
        mmkv.set('c', true)
        expect(mmkv.getAllKeys().sort()).toEqual(['a', 'b', 'c'])
      })
    })
  })
}

mmkvTestSuite('Mock MMKV', () => createMockMMKV({ id: 'test.mock' }))
mmkvTestSuite('Web MMKV', () => createWebMMKV({ id: 'test.web' }))
