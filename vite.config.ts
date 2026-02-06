/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  build: {
    minify: "terser",
    terserOptions: {
      format: {
        comments: false, // Remove all comments to avoid 'Unterminated comment' issues
      },
    },
    target: "es2020",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
