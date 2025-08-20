module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  ignorePatterns: [
    'build',
    'scripts',
    'lib',
    '.eslintrc.js',
    '.prettierrc.js',
    '*.config.js',
  ],
  rules: {
    'prettier/prettier': ['warn'],
  },
};
