const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const { withRnHarness } = require('react-native-harness/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.resolve(__dirname, '..')],
  resolver: {
    // Enable resolution of __tests__
    blockList: undefined,
  },
};

module.exports = withRnHarness(mergeConfig(getDefaultConfig(__dirname), config));
