/**
 * Storage Adapter for Capacitor/Web
 *
 * Provides a simple async storage interface using localStorage for web
 * and Capacitor Preferences for native platforms.
 */

import { Preferences } from "@capacitor/preferences";

export const storage = {
  /**
   * Get an item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      // Use Capacitor Preferences for native platforms
      const { value } = await Preferences.get({ key });
      if (value !== null) {
        return value;
      }
      // Fall back to localStorage for web
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Failed to get ${key}`, e);
      // Fall back to localStorage on error
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
  },

  /**
   * Set an item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Use Capacitor Preferences for native platforms
      await Preferences.set({ key, value });
      // Also set in localStorage as backup
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Failed to set ${key}`, e);
      // Fall back to localStorage only
      try {
        localStorage.setItem(key, value);
      } catch {
        throw e;
      }
    }
  },

  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      // Remove from Capacitor Preferences
      await Preferences.remove({ key });
      // Also remove from localStorage
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove ${key}`, e);
      // Fall back to localStorage only
      try {
        localStorage.removeItem(key);
      } catch {
        throw e;
      }
    }
  },

  /**
   * Clear all items from storage
   */
  async clear(): Promise<void> {
    try {
      // Clear Capacitor Preferences
      await Preferences.clear();
      // Also clear localStorage
      localStorage.clear();
    } catch (e) {
      console.error("Failed to clear storage", e);
      // Fall back to localStorage only
      try {
        localStorage.clear();
      } catch {
        throw e;
      }
    }
  },
};
