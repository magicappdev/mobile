/**
 * Theme Context Provider for Ionic
 *
 * Provides theme management for the app including:
 * - Light/Dark/Automatic theme modes
 * - System theme detection
 * - Ionic theme integration via CSS variables
 */

/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useMemo, useState } from "react";
import { darkTheme, lightTheme } from "../constants/theme";
import type { Theme, ThemeMode } from "../constants/theme";
import { storage } from "../lib/storage";

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined,
);

const THEME_STORAGE_KEY = "magicappdev_theme_mode";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [mode, setModeState] = useState<ThemeMode>("automatic");

  // Detect system color scheme
  const systemColorScheme = useMemo(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await storage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.error("Failed to save theme preference", e);
    }
  };

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await storage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ["light", "dark", "automatic"].includes(savedMode)) {
          setModeState(savedMode as ThemeMode);
        }
      } catch (e) {
        console.error("Failed to load theme preference", e);
      }
    };
    loadTheme();
  }, []);

  // Determine actual theme based on mode and system preference
  const isDark =
    mode === "dark" || (mode === "automatic" && systemColorScheme === "dark");
  const theme = isDark ? darkTheme : lightTheme;

  // Apply theme to document root for Ionic CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute("color-scheme", "dark");
      root.classList.add("dark");
    } else {
      root.setAttribute("color-scheme", "light");
      root.classList.remove("dark");
    }

    // Set CSS variables for theme colors
    root.style.setProperty("--ion-background-color", theme.colors.background);
    root.style.setProperty("--ion-card-background", theme.colors.card);
    root.style.setProperty("--ion-text-color", theme.colors.text);
    root.style.setProperty("--ion-color-primary", theme.colors.primary);
    root.style.setProperty("--ion-color-success", theme.colors.success);
    root.style.setProperty("--ion-color-warning", theme.colors.warning);
    root.style.setProperty("--ion-color-danger", theme.colors.error);
  }, [isDark, theme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
