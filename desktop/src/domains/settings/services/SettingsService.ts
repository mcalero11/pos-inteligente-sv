import { DatabaseAdapter } from '../../../infrastructure/database';
import { logger } from '../../../infrastructure/logging';
import type { SystemSettings } from '../entities/SystemSettings';
import { DEFAULT_SETTINGS, mergeWithDefaults } from '../entities/SystemSettings';
import type { CompanyInfo } from '../entities/CompanyInfo';
import { EMPTY_COMPANY_INFO } from '../entities/CompanyInfo';

interface SettingsRow {
  key: string;
  value: string;
  updated_at: string;
}

type SettingsChangeListener = (settings: SystemSettings) => void;

export class SettingsService {
  private cache: SystemSettings | null = null;
  private listeners: Set<SettingsChangeListener> = new Set();

  async load(): Promise<SystemSettings> {
    if (this.cache) {
      return this.cache;
    }

    const rows = await DatabaseAdapter.query<SettingsRow>(
      "SELECT key, value FROM system_settings WHERE key LIKE 'settings.%'"
    );

    const settingsData: Record<string, unknown> = {};

    for (const row of rows) {
      const key = row.key.replace('settings.', '');
      try {
        settingsData[key] = JSON.parse(row.value);
      } catch {
        settingsData[key] = row.value;
      }
    }

    this.cache = mergeWithDefaults(settingsData as Partial<SystemSettings>);
    return this.cache;
  }

  async get<K extends keyof SystemSettings>(key: K): Promise<SystemSettings[K]> {
    const settings = await this.load();
    return settings[key];
  }

  async set<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]): Promise<void> {
    const dbKey = `settings.${String(key)}`;
    const dbValue = JSON.stringify(value);

    await DatabaseAdapter.execute(
      `INSERT INTO system_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
      [dbKey, dbValue, dbValue]
    );

    // Update cache
    if (this.cache) {
      this.cache = { ...this.cache, [key]: value };
      this.notifyListeners();
    }

    logger.info('Setting updated', { key, value });
  }

  async setMultiple(settings: Partial<SystemSettings>): Promise<void> {
    await DatabaseAdapter.transaction(async () => {
      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined) {
          const dbKey = `settings.${key}`;
          const dbValue = JSON.stringify(value);

          await DatabaseAdapter.execute(
            `INSERT INTO system_settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
            [dbKey, dbValue, dbValue]
          );
        }
      }
    });

    // Update cache
    if (this.cache) {
      this.cache = { ...this.cache, ...settings };
      this.notifyListeners();
    }

    logger.info('Multiple settings updated', { keys: Object.keys(settings) });
  }

  async reset(): Promise<void> {
    await DatabaseAdapter.execute("DELETE FROM system_settings WHERE key LIKE 'settings.%'");
    this.cache = DEFAULT_SETTINGS;
    this.notifyListeners();
    logger.info('Settings reset to defaults');
  }

  subscribe(listener: SettingsChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    if (this.cache) {
      for (const listener of this.listeners) {
        listener(this.cache);
      }
    }
  }

  // Company Info methods
  async getCompanyInfo(): Promise<CompanyInfo> {
    const row = await DatabaseAdapter.queryOne<SettingsRow>(
      "SELECT value FROM system_settings WHERE key = 'company_info'"
    );

    if (row) {
      try {
        return JSON.parse(row.value) as CompanyInfo;
      } catch {
        return EMPTY_COMPANY_INFO;
      }
    }

    return EMPTY_COMPANY_INFO;
  }

  async setCompanyInfo(info: CompanyInfo): Promise<void> {
    const value = JSON.stringify(info);

    await DatabaseAdapter.execute(
      `INSERT INTO system_settings (key, value) VALUES ('company_info', ?)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
      [value, value]
    );

    logger.info('Company info updated');
  }

  invalidateCache(): void {
    this.cache = null;
  }
}

export const settingsService = new SettingsService();
