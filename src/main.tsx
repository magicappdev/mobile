import { App as CapacitorApp } from "@capacitor/app";
import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";

interface AppUrlOpenEvent {
  url: string;
}

/**
 * Handle deep linking for OAuth callbacks
 *
 * When user returns from OAuth login (GitHub/Discord),
 * the app will receive the access tokens via the magicappdev:// URL scheme
 */
CapacitorApp.addListener("appUrlOpen", (event: AppUrlOpenEvent) => {
  console.log("App opened with URL:", event.url);

  // Handle OAuth callback
  if (event.url.includes("auth/callback")) {
    const url = new URL(event.url);
    const accessToken = url.searchParams.get("accessToken");
    const refreshToken = url.searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      // Store tokens and notify the app
      localStorage.setItem("oauth_access_token", accessToken);
      localStorage.setItem("oauth_refresh_token", refreshToken);
      // Reload app to trigger auth state update
      window.location.reload();
    }
  }
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
