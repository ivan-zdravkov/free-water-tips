const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');

// Add support for local packages (monorepo setup)
const sharedPath = path.resolve(__dirname, '../FreeWaterTips.Shared');

config.watchFolders = [sharedPath];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../FreeWaterTips.Shared/node_modules'),
];

module.exports = config;
