import React from 'react'
import { AppState, Button, Text } from 'react-native'
import type { AppStateStatus, NativeEventSubscription } from 'react-native'
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  cleanup,
  waitFor,
} from '@testing-library/react-native'
import { createMMKV, useMMKVKeys, useMMKVNumber, useMMKVString } from '..'

const mmkv = createMMKV()

beforeEach(() => {
  mmkv.clearAll()
  mmkv.trim()
})

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

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
      act(() => {
        listeners.forEach((listener) => listener(state))
      })
    },
  }
}

test('hooks update when the value is changed directly through the instance', () => {
  const { result } = renderHook(() => useMMKVString('string-key', mmkv))

  expect(result.current[0]).toBeUndefined()

  // First, make a "normal" change
  act(() => {
    result.current[1]('value 1')
  })

  expect(result.current[0]).toStrictEqual('value 1')

  // Now, make the change directly through the instance.
  act(() => {
    mmkv.set('string-key', 'value 2')
  })
  expect(result.current[0]).toStrictEqual('value 2')
})

test('functional updates to hooks', () => {
  const Component: React.FC = () => {
    const [state, setState] = React.useState(0)
    const [value, setValue] = useMMKVNumber('number-key', mmkv)

    return (
      <>
        <Button
          testID="button"
          title="Double Increment Me"
          onPress={() => {
            // Increment the state value twice, using the function form of useState.
            setState((current) => current + 1)
            setState((current) => current + 1)

            // Increment the MMKV value twice, using the same function form.
            setValue((current) => (current ?? 0) + 1)
            setValue((current) => (current ?? 0) + 1)
          }}
        />
        <Text testID="state-value">State: {state.toString()}</Text>
        <Text testID="mmkv-value">MMKV: {(value ?? 0).toString()}</Text>
      </>
    )
  }

  render(<Component />)

  const button = screen.getByTestId('button')

  // Why these assertions:
  // https://github.com/mrousavy/react-native-mmkv/issues/599
  fireEvent.press(button)
  expect(screen.getByTestId('state-value').children).toStrictEqual([
    'State: ',
    '2',
  ])
  expect(screen.getByTestId('mmkv-value').children).toStrictEqual([
    'MMKV: ',
    '2',
  ])

  fireEvent.press(button)
  expect(screen.getByTestId('state-value').children).toStrictEqual([
    'State: ',
    '4',
  ])
  expect(screen.getByTestId('mmkv-value').children).toStrictEqual([
    'MMKV: ',
    '4',
  ])
})

test('useMMKV hook does not miss updates that happen during subscription setup', async () => {
  const raceKey = 'race-key'
  const raceMMKV = createMMKV()

  let simulatedRaceDone = false
  const originalSubscribe = raceMMKV.addOnValueChangedListener.bind(raceMMKV)
  raceMMKV.addOnValueChangedListener = ((listener) => {
    if (!simulatedRaceDone) {
      simulatedRaceDone = true
      raceMMKV.set(raceKey, 'updated-before-subscribe')
    }
    return originalSubscribe(listener)
  }) as typeof raceMMKV.addOnValueChangedListener

  const { result } = renderHook(() => useMMKVString(raceKey, raceMMKV))

  await waitFor(() => {
    expect(result.current[0]).toBe('updated-before-subscribe')
  })
})

test('useMMKV hook stays consistent during rapid updates', async () => {
  const raceKey = 'rapid-key'
  const { result } = renderHook(() => useMMKVNumber(raceKey, mmkv))

  act(() => {
    for (let i = 1; i <= 100; i++) {
      mmkv.set(raceKey, i)
    }
  })

  await waitFor(() => {
    expect(result.current[0]).toBe(100)
  })
})

test('useMMKV hook checks for external content changes when app becomes active', () => {
  const appState = mockAppStateChangeListener()
  const key = 'app-state-key'
  let value = 'before'

  const checkContentChanged = jest.spyOn(mmkv, 'checkContentChanged')
  jest.spyOn(mmkv, 'getString').mockImplementation((requestedKey) => {
    return requestedKey === key ? value : undefined
  })

  const { result } = renderHook(() => useMMKVString(key, mmkv))
  expect(result.current[0]).toStrictEqual('before')

  value = 'after'
  appState.emit('active')

  expect(checkContentChanged).toHaveBeenCalledTimes(1)
  expect(result.current[0]).toStrictEqual('after')
})

test('useMMKVKeys checks for external content changes when app becomes active', () => {
  const appState = mockAppStateChangeListener()
  let keys: string[] = []

  const checkContentChanged = jest.spyOn(mmkv, 'checkContentChanged')
  jest.spyOn(mmkv, 'getAllKeys').mockImplementation(() => keys)

  const { result } = renderHook(() => useMMKVKeys(mmkv))
  expect(result.current).toStrictEqual([])

  keys = ['external-key']
  appState.emit('active')

  expect(checkContentChanged).toHaveBeenCalledTimes(1)
  expect(result.current).toStrictEqual(['external-key'])
})
