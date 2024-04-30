module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  ignorePatterns: ['scripts', 'lib'],
  rules: {
    'prettier/prettier': ['warn'],
    '@typescript-eslint/consistent-type-imports': 'warn',
  },
};
