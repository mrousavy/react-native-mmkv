const path = require('path');
const pak = require('../package.json');

module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          [pak.name]: path.join(__dirname, '..', pak.source),
        },
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
  ],
};
