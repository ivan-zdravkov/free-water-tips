const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');

// Set publicPath for web builds when EXPO_WEB_BASE_PATH is set
if (process.env.EXPO_WEB_BASE_PATH) {
  config.transformer = {
    ...config.transformer,
    publicPath: process.env.EXPO_WEB_BASE_PATH,
  };
}

module.exports = config;

