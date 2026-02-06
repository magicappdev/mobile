/**
 * Theme types and definitions for MagicAppDev Ionic app
 */

export interface Theme {
  mode: "light" | "dark";
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    success: string;
    warning: string;
    error: string;
    tabBar: string;
    tabBarActive: string;
  };
}

export const lightTheme: Theme = {
  mode: "light",
  colors: {
    background: "#F2F2F7",
    card: "#FFFFFF",
    text: "#000000",
    textSecondary: "#8E8E93",
    border: "#C7C7CC",
    primary: "#007AFF",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    tabBar: "#F8F8F8",
    tabBarActive: "#007AFF",
  },
};

export const darkTheme: Theme = {
  mode: "dark",
  colors: {
    background: "#000000",
    card: "#1C1C1E",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    border: "#38383A",
    primary: "#0A84FF",
    success: "#32D74B",
    warning: "#FF9F0A",
    error: "#FF453A",
    tabBar: "#1C1C1E",
    tabBarActive: "#0A84FF",
  },
};

export type ThemeMode = "light" | "dark" | "automatic";
