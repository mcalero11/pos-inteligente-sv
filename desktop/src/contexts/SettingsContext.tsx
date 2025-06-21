import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { AppSettings, settingsService } from '@/lib/settings-service';
import { logger } from '@/lib/logger';
import { useAppState, AppState } from './AppStateContext';

interface SettingsContextType {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: any;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAppState();

  // Load settings only after AppStateContext is ready
  useEffect(() => {
    // Only load settings if app is ready (database connected)
    if (state === AppState.READY) {
      // Check if settings are already cached from AppStateContext initialization
      const cachedSettings = settingsService.getCachedSettings();
      if (cachedSettings) {
        // Settings already loaded by AppStateContext, just use them
        setSettings(cachedSettings);
        setIsLoading(false);
      } else {
        // Fallback: load settings if somehow not cached
        loadSettings();
      }
    } else if (state === AppState.LOADING || state === AppState.INITIALIZING) {
      // Still loading, keep loading state
      setIsLoading(true);
    } else {
      // Error states - don't try to load settings
      setIsLoading(false);
    }
  }, [state]);

  // Subscribe to settings changes
  useEffect(() => {
    const unsubscribe = settingsService.subscribe((newSettings) => {
      setSettings(newSettings);
      setIsLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSettings = await settingsService.getSettings();
      setSettings(loadedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      logger.error('Failed to load settings in context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      await settingsService.setSetting(key, value);
      // Settings will be updated via subscription
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update setting';
      setError(errorMessage);
      logger.error(`Failed to update setting ${key}:`, err);
      throw err;
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      await settingsService.updateSettings(updates);
      // Settings will be updated via subscription
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      logger.error('Failed to update settings:', err);
      throw err;
    }
  };

  const refreshSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const refreshedSettings = await settingsService.refresh();
      setSettings(refreshedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh settings';
      setError(errorMessage);
      logger.error('Failed to refresh settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error,
    updateSetting,
    updateSettings,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Utility hooks for specific settings
export function useSetting<K extends keyof AppSettings>(key: K) {
  const { settings } = useSettings();
  return settings?.[key] ?? null;
}

export function useCompanyInfo() {
  const { settings } = useSettings();
  if (!settings) return null;

  return {
    name: settings.companyName,
    address: settings.companyAddress,
    phone: settings.companyPhone,
  };
}

export function useCustomerDefaults() {
  const { settings } = useSettings();
  if (!settings) return null;

  return {
    defaultCustomerName: settings.defaultCustomerName,
    defaultCustomerType: settings.defaultCustomerType,
  };
}

export function useFinancialSettings() {
  const { settings } = useSettings();
  if (!settings) return null;

  return {
    taxRate: settings.taxRate,
    currency: settings.currency,
  };
} 
