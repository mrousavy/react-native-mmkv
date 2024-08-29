module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  ignorePatterns: ['scripts', 'lib'],
  rules: {
    'prettier/prettier': ['warn'],
  },
};
