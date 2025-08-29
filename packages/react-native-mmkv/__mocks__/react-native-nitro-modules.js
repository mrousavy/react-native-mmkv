// Mock for react-native-nitro-modules in Jest environment
module.exports = {
  NitroModules: {
    createHybridObject: jest.fn(() => {
      // Return a mock object that won't be used since MMKV has its own mock
      return {}
    }),
  },
}
