import { useState, useEffect, useCallback } from 'preact/hooks';
import type { SystemSettings } from '../entities/SystemSettings';
import { settingsService } from '../services/SettingsService';

interface UseSettingsReturn {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateSetting: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.load();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]): Promise<void> => {
      try {
        await settingsService.set(key, value);
        setSettings((current) => (current ? { ...current, [key]: value } : null));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update setting');
        throw err;
      }
    },
    []
  );

  const updateSettings = useCallback(async (updates: Partial<SystemSettings>): Promise<void> => {
    try {
      await settingsService.setMultiple(updates);
      setSettings((current) => (current ? { ...current, ...updates } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadSettings();

    // Subscribe to settings changes
    const unsubscribe = settingsService.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    reload: loadSettings,
    updateSetting,
    updateSettings,
  };
}
