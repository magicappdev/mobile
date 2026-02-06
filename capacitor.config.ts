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
  // Uncomment for local development from network:
  // url: 'http://10.0.2.2:8100'
};

export default config;
