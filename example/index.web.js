/**
 * Web entry: registers the app and mounts it into #root.
 * Bare RN ships no web runtime; this is the equivalent of what
 * `expo start --web` does behind the scenes.
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

if (typeof document !== 'undefined') {
  const rootTag = document.getElementById('root');
  // Skip when the harness runtime is driving the page — it manages mounting.
  if (rootTag && !window.__RN_HARNESS_BRIDGE__) {
    AppRegistry.runApplication(appName, { rootTag });
  }
}
