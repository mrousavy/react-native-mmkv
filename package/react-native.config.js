// https://github.com/react-native-community/cli/blob/main/docs/dependencies.md

module.exports = {
  dependency: {
    platforms: {
      /**
       * @type {import('@react-native-community/cli-types').IOSDependencyParams}
       */
      ios: {},
      /**
       * @type {import('@react-native-community/cli-types').AndroidDependencyParams}
       */
      android: {
        cxxModuleCMakeListsModuleName: 'react-native-mmkv',
        cxxModuleCMakeListsPath: 'CMakeLists.txt',
        cxxModuleHeaderName: 'NativeMmkvModule',
      },
    },
  },
  // Codegen configuration for TurboModules
  codegenConfig: {
    name: 'RNMmkvSpec',
    type: 'modules',
    jsSrcsDir: 'src',
    android: {
      javaPackageName: 'com.mrousavy.mmkv',
    },
  },
};
