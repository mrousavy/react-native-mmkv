import React from 'react';
import { Button, Text } from 'react-native';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react-native';
import { MMKV, useMMKVNumber, useMMKVString } from '..';

const mmkv = new MMKV();

beforeEach(() => {
  mmkv.clearAll();
  mmkv.trim();
});

test('hooks update when the value is changed directly through the instance', () => {
  const { result } = renderHook(() => useMMKVString('string-key', mmkv));

  expect(result.current[0]).toBeUndefined();

  // First, make a "normal" change
  act(() => {
    result.current[1]('value 1');
  });

  expect(result.current[0]).toStrictEqual('value 1');

  // Now, make the change directly through the instance.
  act(() => {
    mmkv.set('string-key', 'value 2');
  });
  expect(result.current[0]).toStrictEqual('value 2');
});

test('functional updates to hooks', () => {
  const Component: React.FC = () => {
    const [state, setState] = React.useState(0);
    const [value, setValue] = useMMKVNumber('number-key', mmkv);

    return (
      <>
        <Button
          testID="button"
          title="Double Increment Me"
          onPress={() => {
            // Increment the state value twice, using the function form of useState.
            setState((current) => current + 1);
            setState((current) => current + 1);

            // Increment the MMKV value twice, using the same function form.
            setValue((current) => (current ?? 0) + 1);
            setValue((current) => (current ?? 0) + 1);
          }}
        />
        <Text testID="state-value">State: {state.toString()}</Text>
        <Text testID="mmkv-value">MMKV: {(value ?? 0).toString()}</Text>
      </>
    );
  };

  render(<Component />);

  const button = screen.getByTestId('button');

  // Why these assertions:
  // https://github.com/mrousavy/react-native-mmkv/issues/599
  fireEvent.press(button);
  expect(screen.getByTestId('state-value').children).toStrictEqual([
    'State: ',
    '2',
  ]);
  expect(screen.getByTestId('mmkv-value').children).toStrictEqual([
    'MMKV: ',
    '2',
  ]);

  fireEvent.press(button);
  expect(screen.getByTestId('state-value').children).toStrictEqual([
    'State: ',
    '4',
  ]);
  expect(screen.getByTestId('mmkv-value').children).toStrictEqual([
    'MMKV: ',
    '4',
  ]);
});
