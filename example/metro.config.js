const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const rootNodeModules = path.resolve(workspaceRoot, 'node_modules');


const SINGLETONS = ['react', 'react-native', 'react-dom', 'react-native-web'];

const requireResolveFromRoot = (req) =>
  require.resolve(req, { paths: [rootNodeModules] });

/** @type {import('@react-native/metro-config').MetroConfig} */
const overrides = {
  watchFolders: [workspaceRoot],
  resolver: {
    platforms: ['web', 'ios', 'android', 'native'],
  },
};

const config = mergeConfig(getDefaultConfig(projectRoot), overrides);

const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const name of SINGLETONS) {
    if (moduleName === name || moduleName.startsWith(name + '/')) {
      const target =
        platform === 'web' &&
        name === 'react-native' &&
        (moduleName === 'react-native' || moduleName === 'react-native/index')
          ? 'react-native-web'
          : moduleName;
      try {
        return {
          type: 'sourceFile',
          filePath: requireResolveFromRoot(target),
        };
      } catch {
        // fall through to default resolution
      }
    }
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
