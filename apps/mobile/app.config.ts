import type { ConfigContext, ExpoConfig } from "expo/config";

import { theme } from "@repo/tailwind/theme-colors";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "desk-flow",
  slug: "desk-flow",
  scheme: "desk-flow",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/icon-light.png",
  newArchEnabled: true,
  updates: {
    fallbackToCacheTimeout: 0,
  },
  ios: {
    bundleIdentifier: "com.hitusss.deskflow",
    supportsTablet: true,
    icon: {
      light: "./assets/icon-light.png",
      dark: "./assets/icon-dark.png",
    },
  },
  android: {
    package: "your.bundle.identifier",
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: "./assets/icon-light.png",
      backgroundColor: theme.light.background,
    },
  },
  plugins: [
    "expo-router",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        backgroundColor: theme.light.background,
        image: "./assets/icon-light.png",
        dark: {
          backgroundColor: theme.dark.background,
          image: "./assets/icon-dark.png",
        },
      },
    ],
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
    reactCanary: true,
    reactCompiler: true,
  },
});
