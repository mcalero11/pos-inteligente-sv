import { logger } from './logger';

/**
 * Centralized localStorage service for the POS application
 * Provides type-safe localStorage operations with error handling
 */

export type StorageKeys = {
  'pos-color-theme': string;
  'pos-dark-mode': string;
  'pos-user-preferences': string;
  'pos-session-data': string;
};

class LocalStorageService {
  private isAvailable(): boolean {
    try {
      return typeof globalThis !== 'undefined' &&
        globalThis.localStorage !== undefined &&
        globalThis.localStorage !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get an item from localStorage
   */
  getItem<K extends keyof StorageKeys>(key: K): StorageKeys[K] | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return globalThis.localStorage.getItem(key) as StorageKeys[K] | null;
    } catch (error) {
      logger.warn(`Failed to get localStorage item "${key}":`, error);
      return null;
    }
  }

  /**
   * Set an item in localStorage
   */
  setItem<K extends keyof StorageKeys>(key: K, value: StorageKeys[K]): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      globalThis.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      logger.warn(`Failed to set localStorage item "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove an item from localStorage
   */
  removeItem<K extends keyof StorageKeys>(key: K): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      globalThis.localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.warn(`Failed to remove localStorage item "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all localStorage items
   */
  clear(): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      globalThis.localStorage.clear();
      return true;
    } catch (error) {
      logger.warn('Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Get a boolean value from localStorage
   */
  getBooleanItem<K extends keyof StorageKeys>(key: K): boolean | null {
    const value = this.getItem(key);
    if (value === null) {
      return null;
    }
    return value === 'true';
  }

  /**
   * Set a boolean value in localStorage
   */
  setBooleanItem<K extends keyof StorageKeys>(key: K, value: boolean): boolean {
    return this.setItem(key, value.toString() as StorageKeys[K]);
  }

  /**
   * Get a JSON object from localStorage
   */
  getJsonItem<T, K extends keyof StorageKeys>(key: K): T | null {
    const value = this.getItem(key);
    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.warn(`Failed to parse JSON from localStorage item "${key}":`, error);
      return null;
    }
  }

  /**
   * Set a JSON object in localStorage
   */
  setJsonItem<T, K extends keyof StorageKeys>(key: K, value: T): boolean {
    try {
      const jsonString = JSON.stringify(value);
      return this.setItem(key, jsonString as StorageKeys[K]);
    } catch (error) {
      logger.warn(`Failed to stringify JSON for localStorage item "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if localStorage is available and working
   */
  isSupported(): boolean {
    return this.isAvailable();
  }
}

// Export a singleton instance
export const localStorageService = new LocalStorageService();

// Export specific theme-related methods for convenience
export const themeStorage = {
  getColorTheme: () => localStorageService.getItem('pos-color-theme'),
  setColorTheme: (theme: string) => localStorageService.setItem('pos-color-theme', theme),
  getDarkMode: () => localStorageService.getBooleanItem('pos-dark-mode'),
  setDarkMode: (isDark: boolean) => localStorageService.setBooleanItem('pos-dark-mode', isDark),
};
