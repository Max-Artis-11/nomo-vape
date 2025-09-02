const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Add Node.js core module shims
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  events: require.resolve('events/'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('buffer/'),
  process: require.resolve('process/browser'),
  ws: path.resolve(__dirname, './shims/empty.js'), // 👈 Shim ws
};

// Exclude the real `ws` package from bundling (if present)
defaultConfig.resolver.blacklistRE = exclusionList([
  /node_modules\/ws\/.*/,
]);

module.exports = defaultConfig;
