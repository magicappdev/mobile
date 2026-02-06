import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.magicappdev",
  appName: "MagicAppDev",
  webDir: "dist",
  server: {
    // Use https scheme for local development
    androidScheme: "https",
    // Allow cleartext for development
    cleartext: true,
    // For development, can use: url: 'http://192.168.x.x:8100'
    // For production, omit url to use local assets
  },
  // Deep link configuration for magicappdev:// scheme
  plugins: {
    App: {
      // Handle URL opening events
    },
  },
};

export default config;
