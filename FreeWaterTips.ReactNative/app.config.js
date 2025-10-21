module.exports = {
  expo: {
    name: "Free Water Tips",
    slug: "free-water-tips",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "tips.freewater.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "tips.freewater.app"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      baseUrl: process.env.EXPO_WEB_BASE_PATH || "/"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_AZURE_FUNCTIONS_ENDPOINT
    }
  }
};
