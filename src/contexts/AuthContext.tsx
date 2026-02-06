/**
 * Authentication Context Provider
 *
 * Manages user authentication state including:
 * - OAuth login (GitHub, Discord)
 * - Email/password login
 * - Token management with Capacitor Preferences
 */

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types";
import { api, type ApiResponse } from "../lib/api";
import { storage } from "../lib/storage";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGitHub: () => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    const refreshToken = await storage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch {
        console.error("Logout failed");
      }
    }
    await storage.removeItem("access_token");
    await storage.removeItem("refresh_token");
    api.setToken(null);
    setUser(null);
  };

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    console.log("Saving tokens...");
    await storage.setItem("access_token", accessToken);
    await storage.setItem("refresh_token", refreshToken);
    api.setToken(accessToken);
    try {
      console.log("Fetching user data...");
      const userData = await api.getCurrentUser();
      console.log("User data received, setting user:", userData?.email);
      setUser(userData);
    } catch (e) {
      console.error("Failed to fetch user after login:", e);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = (await api.login({ email, password })) as ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>;
      if (response.success) {
        await saveTokens(response.data.accessToken, response.data.refreshToken);
      } else {
        throw new Error(response.error.message || "Login failed");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An error occurred";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load auth state on mount
    const loadAuth = async () => {
      console.log("Loading auth state...");
      const accessToken = await storage.getItem("access_token");
      const refreshToken = await storage.getItem("refresh_token");
      console.log(
        "access_token exists:",
        !!accessToken,
        "refresh_token exists:",
        !!refreshToken,
      );

      if (accessToken) {
        api.setToken(accessToken);
        try {
          console.log("Fetching current user...");
          const userData = await api.getCurrentUser();
          console.log("User data received:", userData?.email);
          setUser(userData);
        } catch {
          console.log("Access token failed, trying refresh...");
          if (refreshToken) {
            try {
              const newToken = await api.refresh(refreshToken);
              await storage.setItem("access_token", newToken);
              const userData = await api.getCurrentUser();
              setUser(userData);
            } catch {
              console.log("Refresh failed, logging out...");
              await handleLogout();
            }
          } else {
            console.log("No refresh token, logging out...");
            await handleLogout();
          }
        }
      } else {
        console.log("No stored tokens, user is logged out");
      }
      setIsLoading(false);
      console.log("Loading complete - user:", !!user, "isLoading: false");
    };

    loadAuth();

    // Handle deep links for OAuth callbacks
    const appUrlOpenListener = App.addListener("appUrlOpen", async (data: { url: string }) => {
      console.log("=== OAuth Callback Received ===");
      console.log("App opened with URL:", data.url);

      try {
        const url = new URL(data.url);
        console.log("Parsed URL - protocol:", url.protocol, "pathname:", url.pathname);

        if (url.protocol === "magicappdev:" && url.pathname === "/auth/callback") {
          const accessToken = url.searchParams.get("accessToken");
          const refreshToken = url.searchParams.get("refreshToken");
          const error = url.searchParams.get("error");

          console.log("Access token present:", !!accessToken);
          console.log("Refresh token present:", !!refreshToken);
          console.log("Error present:", !!error);

          if (error) {
            console.error("OAuth error:", error);
            alert(`Login failed: ${error}`);
            return;
          }

          if (accessToken && refreshToken) {
            console.log("Calling saveTokens...");
            await saveTokens(accessToken, refreshToken);
            // Close the browser if open
            Browser.close();
            // Navigate to home screen
            console.log("Navigating to home screen...");
            window.location.href = "/tabs/home";
          } else {
            console.error("Missing tokens in callback");
          }
        } else {
          console.log("URL does not match expected pattern");
        }
      } catch (e) {
        console.error("Failed to parse deep link URL:", e);
      }
      console.log("=== OAuth Callback Processing Complete ===");
    });

    // Check for OAuth callback in URL on load (web)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    if (accessToken && refreshToken) {
      (async () => {
        await saveTokens(accessToken, refreshToken);
        // Clear URL params
        window.history.replaceState({}, "", window.location.pathname);
        // Navigate to home screen after successful OAuth login
        window.location.href = "/tabs/home";
      })();
    }

    return () => {
      appUrlOpenListener.then(listener => listener.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GitHub OAuth
  const loginWithGitHub = async () => {
    try {
      // Generate a state parameter to pass through OAuth
      const state = JSON.stringify({
        platform: "mobile",
        timestamp: Date.now(),
      });

      const authUrl =
        `https://magicappdev-api.magicappdev.workers.dev/auth/login/github?platform=mobile&state=${encodeURIComponent(state)}`;

      console.log("Opening GitHub OAuth URL:", authUrl);

      // Open OAuth in browser
      await Browser.open({ url: authUrl });

      console.log("Browser opened, waiting for OAuth callback...");
    } catch (error) {
      console.error("Failed to open browser for GitHub login:", error);
      alert("Unable to open GitHub login. Please try again.");
    }
  };

  // Discord OAuth
  const loginWithDiscord = async () => {
    try {
      // Generate a state parameter to pass through OAuth
      const state = JSON.stringify({
        platform: "mobile",
        timestamp: Date.now(),
      });

      const authUrl =
        `https://magicappdev-api.magicappdev.workers.dev/auth/login/discord?platform=mobile&state=${encodeURIComponent(state)}`;

      console.log("Opening Discord OAuth URL:", authUrl);

      // Open OAuth in browser
      await Browser.open({ url: authUrl });

      console.log("Browser opened, waiting for OAuth callback...");
    } catch (error) {
      console.error("Failed to open Discord login:", error);
      alert("Unable to open Discord login. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGitHub,
        loginWithDiscord,
        login,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
