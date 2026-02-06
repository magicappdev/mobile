import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.magicappdev",
  appName: "MagicAppDev",
  webDir: "dist",
  server: {
    // Allow cleartext for development
    cleartext: true,
    // For local development, can use: url: 'http://192.168.x.x:8100'
    // For production, omit url to use local assets
  },
};

export default config;
