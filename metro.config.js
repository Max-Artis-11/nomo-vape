// metro.config.js — Expo SDK 54 compatible
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Load the default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// --- Add Node.js core module shims ---
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  events: require.resolve('events/'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('buffer/'),
  process: require.resolve('process/browser'),
  ws: path.resolve(__dirname, './shims/empty.js'), // 👈 Shim ws
};

// --- Exclude the real `ws` package from bundling ---
config.resolver.blockList = [
  /node_modules\/ws\/.*/,
];

module.exports = config;
