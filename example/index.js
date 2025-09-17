/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () =>
    global.RN_HARNESS
      ? require('@react-native-harness/runtime').ReactNativeHarness
      : require('./src/App').default
  );
  
