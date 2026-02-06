/**
 * Authentication Context Provider
 *
 * Manages user authentication state including:
 * - OAuth login (GitHub, Discord)
 * - Email/password login
 * - Token management with Capacitor Preferences
 */

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { api, type ApiResponse } from "../lib/api";
import { Browser } from "@capacitor/browser";
import { storage } from "../lib/storage";
import { App } from "@capacitor/app";
import type { User } from "../types";
import { useNavigation } from "./NavigationContext";

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
  const hasNavigatedRef = useRef(false);
  const { navigate } = useNavigation();

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
    hasNavigatedRef.current = false; // Reset navigation flag on logout
  };

  const saveTokens = async (
    accessToken: string,
    refreshToken: string,
  ): Promise<User | null> => {
    console.log("Saving tokens...");
    await storage.setItem("access_token", accessToken);
    await storage.setItem("refresh_token", refreshToken);
    api.setToken(accessToken);
    try {
      console.log("Fetching user data...");
      const userData = await api.getCurrentUser();
      console.log("User data received, setting user:", userData?.email);
      setUser(userData);
      // Wait for React to update the state before returning
      await new Promise(resolve => setTimeout(resolve, 100));
      return userData;
    } catch (e) {
      console.error("Failed to fetch user after login:", e);
      return null;
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
        const userData = await saveTokens(
          response.data.accessToken,
          response.data.refreshToken,
        );
        if (!userData) {
          throw new Error("Failed to fetch user data");
        }
        // Additional delay to ensure React has flushed state updates
        await new Promise(resolve => setTimeout(resolve, 200));
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

  // Handle navigation based on auth state
  useEffect(() => {
    // Only navigate if user is authenticated, not loading, and we haven't navigated yet
    if (user && !isLoading && !hasNavigatedRef.current) {
      const currentPath = window.location.pathname;
      console.log("Auth navigation check - current path:", currentPath);

      // Check if we're on an auth-related path or the callback path
      const isAuthPath = ["/login", "/register", "/", "/auth/callback"].includes(currentPath) ||
                         currentPath.startsWith("/auth/");

      if (isAuthPath) {
        console.log("User authenticated, navigating to root for redirect...");
        hasNavigatedRef.current = true;
        // Navigate to root - the App.tsx will redirect to /tabs/home based on user state
        navigate("/");
      } else {
        // Already on a protected route, mark as navigated
        console.log("Already on protected route:", currentPath);
        hasNavigatedRef.current = true;
      }
    }
    // Reset navigation flag when user logs out (user becomes null)
    if (!user && !isLoading) {
      hasNavigatedRef.current = false;
    }
  }, [user, isLoading, navigate]);

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
    const appUrlOpenListener = App.addListener(
      "appUrlOpen",
      async (data: { url: string }) => {
        console.log("=== OAuth Callback Received ===");
        console.log("App opened with URL:", data.url);

        try {
          const url = new URL(data.url);
          console.log(
            "Parsed URL - protocol:",
            url.protocol,
            "pathname:",
            url.pathname,
          );

          if (
            url.protocol === "magicappdev:" &&
            url.pathname === "/auth/callback"
          ) {
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
              console.log("Setting loading state to true...");
              setIsLoading(true);
              console.log("Calling saveTokens...");
              const userData = await saveTokens(accessToken, refreshToken);
              if (userData) {
                // Close the browser if open
                Browser.close();
                // Set loading to false - navigation will be handled by useEffect watching user state
                setIsLoading(false);
              } else {
                console.error("Failed to fetch user after OAuth");
                setIsLoading(false);
              }
            } else {
              console.error("Missing tokens in callback");
            }
          } else {
            console.log("URL does not match expected pattern");
          }
        } catch (e) {
          console.error("Failed to parse deep link URL:", e);
          setIsLoading(false);
        }
        console.log("=== OAuth Callback Processing Complete ===");
      },
    );

    // Check for OAuth callback in URL on load (web)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    if (accessToken && refreshToken) {
      (async () => {
        setIsLoading(true);
        const userData = await saveTokens(accessToken, refreshToken);
        if (userData) {
          // Set loading to false - navigation will be handled by useEffect watching user state
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
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

      const authUrl = `https://magicappdev-api.magicappdev.workers.dev/auth/login/github?platform=mobile&state=${encodeURIComponent(state)}`;

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

      const authUrl = `https://magicappdev-api.magicappdev.workers.dev/auth/login/discord?platform=mobile&state=${encodeURIComponent(state)}`;

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
