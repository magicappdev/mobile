/**
 * Storage Adapter for Capacitor/Web
 *
 * Provides a simple async storage interface using localStorage for web
 * and Capacitor Preferences for native platforms (when in native context).
 *
 * For development in browser, uses localStorage directly.
 * For production on native, can use Capacitor Preferences from @capacitor/core.
 */

export const storage = {
  /**
   * Get an item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      // Use localStorage for web (development and production web)
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Failed to get ${key}`, e);
      return null;
    }
  },

  /**
   * Set an item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Failed to set ${key}`, e);
      throw e;
    }
  },

  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove ${key}`, e);
      throw e;
    }
  },

  /**
   * Clear all items from storage
   */
  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Failed to clear storage", e);
      throw e;
    }
  },
};
