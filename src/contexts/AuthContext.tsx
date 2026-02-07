/**
 * Authentication Context Provider
 *
 * Manages user authentication state including:
 * - OAuth login (GitHub, Discord)
 * - Email/password login
 * - Token management with Capacitor Preferences
 */

/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigation } from "./NavigationContext";
import { api, type ApiResponse } from "../lib/api";
import { Browser } from "@capacitor/browser";
import { storage } from "../lib/storage";
import { App } from "@capacitor/app";
import type { User } from "../types";

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
  const processingDeepLinkRef = useRef(false);
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

  const saveTokens = useCallback(
    async (accessToken: string, refreshToken: string): Promise<User | null> => {
      console.log("Saving tokens...");
      try {
        await storage.setItem("access_token", accessToken);
        await storage.setItem("refresh_token", refreshToken);
        api.setToken(accessToken);
        console.log("Fetching user data...");
        const userData = await api.getCurrentUser();
        console.log("User data received, setting user:", userData?.email);
        setUser(userData);
        // Wait longer for React and Ionic to synchronize
        await new Promise(resolve => setTimeout(resolve, 500));
        return userData;
      } catch (e) {
        console.error("Failed to fetch user after login:", e);
        alert(
          `Authentication failed during profile fetch: ${e instanceof Error ? e.message : "Unknown error"}`,
        );
        return null;
      }
    },
    [],
  );

  const login = async (email: string, password: string) => {
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
          throw new Error("Failed to initialize session");
        }
      } else {
        throw new Error(response.error.message || "Login failed");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An error occurred";
      throw new Error(message);
    }
  };

  // Helper to process deep link URLs
  const handleDeepLink = useCallback(
    async (urlString: string): Promise<boolean> => {
      console.log("Processing deep link URL:", urlString);

      try {
        const url = new URL(urlString);

        // Support various formats: magicappdev://auth/callback, magicappdev://callback, etc.
        const isAuthCallback =
          url.protocol === "magicappdev:" &&
          (url.pathname.includes("callback") || url.host.includes("callback"));

        if (isAuthCallback) {
          console.log("OAuth callback detected, processing tokens...");
          processingDeepLinkRef.current = true;
          setIsLoading(true);

          // Try to get tokens from both search params and hash fragment
          const fragmentParams = new URLSearchParams(url.hash.substring(1));
          const accessToken =
            url.searchParams.get("accessToken") ||
            url.searchParams.get("access_token") ||
            fragmentParams.get("access_token") ||
            fragmentParams.get("accessToken");

          const refreshToken =
            url.searchParams.get("refreshToken") ||
            url.searchParams.get("refresh_token") ||
            fragmentParams.get("refresh_token") ||
            fragmentParams.get("refreshToken");

          const error =
            url.searchParams.get("error") || fragmentParams.get("error");

          if (error) {
            console.error("OAuth error from URL:", error);
            alert(`Login failed: ${error}`);
            setIsLoading(false);
            processingDeepLinkRef.current = false;
            return true; // We handled it, even if it's an error
          }

          if (accessToken && refreshToken) {
            console.log("Starting session with received tokens...");
            const userData = await saveTokens(accessToken, refreshToken);
            if (userData) {
              console.log(
                "OAuth successful, closing browser and navigating...",
              );
              Browser.close();

              // CRITICAL: Set loading to false BEFORE navigating
              // so the router is actually rendered and can handle the push
              setIsLoading(false);
              processingDeepLinkRef.current = false;

              console.log("Navigating to /tabs/home...");
              navigate("/tabs/home");
              return true;
            } else {
              console.error("Failed to fetch user data with received tokens");
              setIsLoading(false);
              processingDeepLinkRef.current = false;
              return true;
            }
          }

          setIsLoading(false);
          processingDeepLinkRef.current = false;
          return true;
        }
        return false;
      } catch (e) {
        console.error("Failed to parse deep link URL:", e);
        return false;
      }
    },
    [navigate, saveTokens],
  );

  // Handle navigation based on auth state
  useEffect(() => {
    // Only navigate if user is authenticated and not loading
    if (user && !isLoading) {
      // Use window.location.pathname as a hint, but we might also check history state
      const currentPath = window.location.pathname;
      console.log(
        "Auth navigation check - current path:",
        currentPath,
        "user:",
        user.email,
      );

      // Check if we're on an auth-related path or the callback path
      // On native, currentPath might be index.html or empty string sometimes
      const isAuthPath =
        [
          "/login",
          "/register",
          "/",
          "/auth/callback",
          "/index.html",
          "",
        ].includes(currentPath) ||
        currentPath.startsWith("/auth/") ||
        !currentPath.includes("/tabs/");

      if (isAuthPath) {
        if (!hasNavigatedRef.current) {
          console.log(
            "User authenticated on auth path, navigating to tabs home...",
          );
          hasNavigatedRef.current = true;
          navigate("/tabs/home");
        } else {
          console.log(
            "Already navigated once, but still on auth path. Forcing navigation again.",
          );
          navigate("/tabs/home");
        }
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

  // Separate effect for deep link listener to ensure it's always active
  useEffect(() => {
    console.log("Setting up App.appUrlOpen listener...");
    const appUrlOpenListener = App.addListener(
      "appUrlOpen",
      async (data: { url: string }) => {
        console.log("=== OAuth Callback Received (Listener) ===");
        console.log("Deep link URL:", data.url);

        // EXTREMELY LOUD DEBUGGING
        alert(`Deep link received: ${data.url.substring(0, 50)}...`);

        // Use a small delay to ensure the OS has finished the transition
        setTimeout(async () => {
          await handleDeepLink(data.url);
        }, 100);
      },
    );

    const loadAuth = async () => {
      console.log("Loading auth state from storage...");
      const accessToken = await storage.getItem("access_token");
      const refreshToken = await storage.getItem("refresh_token");

      if (accessToken) {
        api.setToken(accessToken);
        try {
          console.log("Fetching current user...");
          const userData = await api.getCurrentUser();
          console.log("User data received:", userData?.email);
          setUser(userData);
        } catch (e) {
          console.warn(
            "Access token failed or expired:",
            e instanceof Error ? e.message : String(e),
          );
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
        console.log("No access token found in storage.");
        setUser(null);
      }
    };

    const initialize = async () => {
      setIsLoading(true);
      try {
        // Give the bridge a moment to be completely ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 1. Check for cold start deep link
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
          console.log("App launched with URL (cold start):", launchUrl.url);
          alert(`Cold start URL: ${launchUrl.url.substring(0, 50)}...`);
          const handled = await handleDeepLink(launchUrl.url);
          if (handled) return; // Stop if deep link was handled successfully
        }

        // 2. Load from storage
        await loadAuth();
      } finally {
        if (!processingDeepLinkRef.current) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      console.log("Removing App.appUrlOpen listener...");
      appUrlOpenListener.then(listener => listener.remove());
    };
  }, [handleDeepLink]);

  // Check for OAuth callback in URL on load (web)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const webAt = urlParams.get("accessToken") || urlParams.get("access_token");
    const webRt =
      urlParams.get("refreshToken") || urlParams.get("refresh_token");
    if (webAt && webRt) {
      (async () => {
        setIsLoading(true);
        const userData = await saveTokens(webAt, webRt);
        if (userData) {
          navigate("/tabs/home");
        }
        setIsLoading(false);
      })();
    }
  }, [navigate, saveTokens]);

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
