module.exports = {
  detectOpenHandles: true,
  forceExit: true,
  projects: [
    {
      displayName: 'react-native-mmkv',
      testMatch: ['<rootDir>/packages/react-native-mmkv/src/**/__tests__/**/*.(ts|tsx|js)', '<rootDir>/packages/react-native-mmkv/src/**/*.(test|spec).(ts|tsx|js)'],
      testPathIgnorePatterns: ['<rootDir>/packages/react-native-mmkv/lib/', '<rootDir>/packages/react-native-mmkv/src/__tests__/mmkv.test.ts'],
      preset: 'react-native',
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|react-native-.*)/)'
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      moduleNameMapper: {
        '^react-native-nitro-modules$': '<rootDir>/packages/react-native-mmkv/__mocks__/react-native-nitro-modules.js'
      },
      collectCoverageFrom: [
        'packages/react-native-mmkv/src/**/*.{ts,tsx}',
        '!packages/react-native-mmkv/src/**/*.d.ts'
      ]
    },
    {
      displayName: 'mmkv-storage',
      testMatch: ['<rootDir>/packages/react-native-mmkv/src/__tests__/mmkv.test.ts'],
      testEnvironment: 'jsdom',
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
      },
      globals: {
        TextEncoder: TextEncoder,
        TextDecoder: TextDecoder,
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    },
  ]
}
