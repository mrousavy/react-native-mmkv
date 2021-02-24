import * as React from 'react';

import { StyleSheet, View, TextInput, Alert, Button } from 'react-native';
import { MMKV } from 'react-native-mmkv';

export default function App() {
  const [text, setText] = React.useState<string>('');

  const save = React.useCallback(() => {
    try {
      console.log('setting...');
      MMKV.set(text, 'text');
      console.log('set.');
    } catch (e) {
      console.error('Error:', e);
      Alert.alert('Failed to set value for key "test"!', JSON.stringify(e));
    }
  }, [text]);
  const read = React.useCallback(() => {
    try {
      console.log('getting...');
      const value = MMKV.getString('text');
      console.log('got:', value);
      setText(value);
    } catch (e) {
      console.error('Error:', e);
      Alert.alert('Failed to get value for key "test"!', JSON.stringify(e));
    }
  }, []);

  React.useEffect(() => {
    try {
      console.log('setting...');
      MMKV.set('Test', 'test-key');
      console.log('set.');
      console.log('getting...');
      const string = MMKV.getString('test-key');
      console.log(`got ${string}.`);
    } catch (e) {
      console.error('Error:', e);
    }
  }, []);

  return (
    <View style={styles.container}>
      <TextInput style={styles.textInput} value={text} onChangeText={setText} />
      <Button onPress={save} title="Save to MMKV" />
      <Button onPress={read} title="Read from MMKV" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    width: '80%',
    height: 60,
    marginVertical: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'black',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
});
