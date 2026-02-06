/**
 * Authentication Context Provider
 *
 * Manages user authentication state including:
 * - OAuth login (GitHub, Discord)
 * - Email/password login
 * - Token management with Capacitor Storage
 * - Deep linking for OAuth callbacks
 */

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../lib/storage";
import type { User } from "../types";
import { api } from "../lib/api";

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
    await storage.setItem("access_token", accessToken);
    await storage.setItem("refresh_token", refreshToken);
    api.setToken(accessToken);
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch {
      console.error("Failed to fetch user after login");
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login({ email, password });
      if (response.success) {
        await saveTokens(response.data.accessToken, response.data.refreshToken);
      } else if (response.success === false) {
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
    // Set up deep link handler for OAuth callbacks
    const handleDeepLink = (event: MessageEvent) => {
      // Verify origin to prevent XSS attacks - only accept messages from our API
      const allowedOrigins = [
        "https://magicappdev-api.magicappdev.workers.dev",
        "https://magicappdev-llmchat.magicappdev.workers.dev",
        window.location.origin, // Allow same origin
      ];
      if (!event.origin || !allowedOrigins.includes(event.origin)) {
        console.warn(
          "Rejected message from unauthorized origin:",
          event.origin,
        );
        return;
      }
      if (event.data?.type === "oauth_callback") {
        const { accessToken, refreshToken } = event.data;
        if (accessToken && refreshToken) {
          saveTokens(accessToken, refreshToken);
        }
      }
    };

    // Listen for messages from OAuth redirect page
    window.addEventListener("message", handleDeepLink);

    // Check for OAuth callback in URL on load
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    if (accessToken && refreshToken) {
      saveTokens(accessToken, refreshToken);
      // Clear URL params
      window.history.replaceState({}, "", window.location.pathname);
    }

    return () => {
      window.removeEventListener("message", handleDeepLink);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGitHub = async () => {
    // Use custom URL scheme for mobile OAuth callback
    const authUrl =
      api.getGitHubLoginUrl("mobile") +
      "&redirect_uri=" +
      encodeURIComponent("magicappdev://auth/callback");
    // For mobile, open in system browser
    window.open(authUrl, "_system");
  };

  const loginWithDiscord = async () => {
    // Use custom URL scheme for mobile OAuth callback
    const authUrl =
      api.getDiscordLoginUrl("mobile") +
      "&redirect_uri=" +
      encodeURIComponent("magicappdev://auth/callback");
    // For mobile, open in system browser
    window.open(authUrl, "_system");
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
