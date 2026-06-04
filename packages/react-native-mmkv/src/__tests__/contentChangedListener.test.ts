import { AppState } from 'react-native'
import type { AppStateStatus, NativeEventSubscription } from 'react-native'
import { createMockMMKV } from '../createMMKV/createMockMMKV'
import { addContentChangedListener } from '../addContentChangedListener/addContentChangedListener'

function mockAppStateChangeListener(): {
  emit: (state: AppStateStatus) => void
} {
  const listeners = new Set<(state: AppStateStatus) => void>()

  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((type, listener): NativeEventSubscription => {
      if (type === 'change') {
        listeners.add(listener as (state: AppStateStatus) => void)
      }

      return {
        remove: () => {
          listeners.delete(listener as (state: AppStateStatus) => void)
        },
      } as NativeEventSubscription
    })

  return {
    emit: (state) => {
      listeners.forEach((listener) => listener(state))
    },
  }
}

afterEach(() => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
})

test('content changed listener checks content when app becomes active', () => {
  const appState = mockAppStateChangeListener()
  const storage = createMockMMKV({ id: 'content-changed-listener-test' })
  const checkContentChanged = jest.spyOn(storage, 'checkContentChanged')

  addContentChangedListener(storage)

  appState.emit('background')
  expect(checkContentChanged).not.toHaveBeenCalled()

  appState.emit('active')
  expect(checkContentChanged).toHaveBeenCalledTimes(1)
})

test('content changed listener registers once per instance', () => {
  mockAppStateChangeListener()
  const storage = createMockMMKV({
    id: 'content-changed-listener-once-test',
  })

  addContentChangedListener(storage)
  addContentChangedListener(storage)

  expect(AppState.addEventListener).toHaveBeenCalledTimes(1)
})
