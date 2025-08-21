import * as React from 'react';

import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  Button,
  Text,
  useColorScheme,
} from 'react-native';
import { createMMKV,  } from 'react-native-mmkv';

const storage = createMMKV();

export default function App() {
  const [text, setText] = React.useState<string>('');
  const [key, setKey] = React.useState<string>('');
  const [keys, setKeys] = React.useState<string[]>([]);
  const colorScheme = useColorScheme();


  const save = React.useCallback(() => {
    if (key == null || key.length < 1) {
      Alert.alert('Empty key!', 'Enter a key first.');
      return;
    }
    try {
      console.log('setting...');
      storage.set(key, text);
      console.log('set.');
    } catch (e) {
      console.error('Error:', e);
      Alert.alert('Failed to set value for key "test"!', JSON.stringify(e));
    }
  }, [key, text]);
  const read = React.useCallback(() => {
    if (key == null || key.length < 1) {
      Alert.alert('Empty key!', 'Enter a key first.');
      return;
    }
    try {
      console.log('getting...');
      const value = storage.getString(key);
      console.log('got:', value);
      Alert.alert('Result', `"${key}" = "${value}"`);
    } catch (e) {
      console.error('Error:', e);
      Alert.alert('Failed to get value for key "test"!', JSON.stringify(e));
    }
  }, [key]);

  React.useEffect(() => {
    try {
      console.log('getting all keys...');
      const _keys = storage.getAllKeys();
      setKeys(_keys);
      console.log('MMKV keys:', _keys);
    } catch (e) {
      console.error('Error:', e);
    }
  }, []);

  const isDark = colorScheme === 'dark';
  const dynamicStyles = createDynamicStyles(isDark);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Text style={[styles.keys, dynamicStyles.keys]}>
        Available Keys: {keys.join(', ')}
      </Text>
      <View style={styles.row}>
        <Text style={[styles.title, dynamicStyles.title]}>Key:</Text>
        <TextInput
          placeholder="Key"
          placeholderTextColor={isDark ? '#999' : '#666'}
          style={[styles.textInput, dynamicStyles.textInput]}
          value={key}
          onChangeText={setKey}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.title, dynamicStyles.title]}>Value:</Text>
        <TextInput
          placeholder="Value"
          placeholderTextColor={isDark ? '#999' : '#666'}
          style={[styles.textInput, dynamicStyles.textInput]}
          value={text}
          onChangeText={setText}
        />
      </View>
      <Button onPress={save} title="Save to MMKV" />
      <Button onPress={read} title="Read from MMKV" />
    </View>
  );
}

const createDynamicStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#000' : '#fff',
    },
    keys: {
      color: isDark ? '#ccc' : '#666',
    },
    title: {
      color: isDark ? '#fff' : '#000',
    },
    textInput: {
      color: isDark ? '#fff' : '#000',
      borderColor: isDark ? '#555' : '#000',
      backgroundColor: isDark ? '#222' : '#fff',
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  keys: {
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginVertical: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    padding: 10,
  },
});
