import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { MMKV } from 'react-native-mmkv';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

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
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
