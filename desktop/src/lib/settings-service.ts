import { databaseService } from './database';
import { logger } from './logger';

// Settings types for better type safety
export interface AppSettings {
  // Financial settings
  taxRate: number;
  currency: string;

  // Company information
  companyName: string;
  companyAddress: string;
  companyPhone: string;

  // Receipt settings
  receiptFooter: string;

  // System settings
  lowStockAlert: number;
  backupFrequency: number;
  sessionTimeout: number;

  // UI settings
  defaultCustomerName: string;
  defaultCustomerType: 'general' | 'partner' | 'vip';
}

// Default fallback values
const DEFAULT_SETTINGS: AppSettings = {
  taxRate: 13.0,
  currency: 'USD',
  companyName: 'Mi Empresa',
  companyAddress: '',
  companyPhone: '',
  receiptFooter: 'Gracias por su compra',
  lowStockAlert: 10,
  backupFrequency: 24,
  sessionTimeout: 480,
  defaultCustomerName: 'Cliente General',
  defaultCustomerType: 'general',
};

// Settings mapping from database keys to app settings
const SETTINGS_MAPPING: Record<keyof AppSettings, string> = {
  taxRate: 'tax_rate',
  currency: 'currency',
  companyName: 'company_name',
  companyAddress: 'company_address',
  companyPhone: 'company_phone',
  receiptFooter: 'receipt_footer',
  lowStockAlert: 'low_stock_alert',
  backupFrequency: 'backup_frequency',
  sessionTimeout: 'session_timeout',
  defaultCustomerName: 'default_customer_name',
  defaultCustomerType: 'default_customer_type',
};

// Event types for reactive updates
type SettingsListener = (settings: AppSettings) => void;
type SettingChangeListener = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;

/**
 * Reactive Settings Service with caching and real-time updates
 * 
 * Features:
 * - Cached settings for performance
 * - Reactive updates via listeners
 * - Type-safe access to settings
 * - Automatic fallbacks to defaults
 * - Batch updates for efficiency
 */
export class SettingsService {
  private static instance: SettingsService;
  private cachedSettings: AppSettings | null = null;
  private listeners: Set<SettingsListener> = new Set();
  private changeListeners: Set<SettingChangeListener> = new Set();
  private isLoading = false;
  private lastLoadTime = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Use the singleton database service instance
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Get all settings (cached or from database)
   */
  async getSettings(): Promise<AppSettings> {
    // Return cached settings if fresh
    if (this.cachedSettings && this.isCacheFresh()) {
      return this.cachedSettings;
    }

    // Prevent concurrent loads
    if (this.isLoading) {
      return this.waitForLoad();
    }

    return this.loadSettings();
  }

  /**
   * Get a specific setting value
   */
  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const settings = await this.getSettings();
    return settings[key];
  }

  /**
   * Update a specific setting
   */
  async setSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    try {
      const dbKey = SETTINGS_MAPPING[key];
      const dbValue = this.serializeValue(value);

      await databaseService.setSystemSetting(dbKey, dbValue);

      // Update cache
      if (this.cachedSettings) {
        this.cachedSettings[key] = value;
        this.notifyListeners();
        this.notifyChangeListeners(key, value);
      }

      logger.info(`Setting updated: ${key} = ${value}`);
    } catch (error) {
      logger.error(`Failed to update setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Update multiple settings in batch
   */
  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    try {
      // Update database in batch
      const promises = Object.entries(updates).map(([key, value]) => {
        const dbKey = SETTINGS_MAPPING[key as keyof AppSettings];
        const dbValue = this.serializeValue(value as string | number | boolean);
        return databaseService.setSystemSetting(dbKey, dbValue);
      });

      await Promise.all(promises);

      // Update cache
      if (this.cachedSettings) {
        Object.assign(this.cachedSettings, updates);
        this.notifyListeners();

        // Notify individual changes
        Object.entries(updates).forEach(([key, value]) => {
          this.notifyChangeListeners(key as keyof AppSettings, value as AppSettings[keyof AppSettings]);
        });
      }

      logger.info('Settings updated in batch:', Object.keys(updates));
    } catch (error) {
      logger.error('Failed to update settings in batch:', error);
      throw error;
    }
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);

    // Immediately call with current settings if available
    if (this.cachedSettings) {
      listener(this.cachedSettings);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to specific setting changes
   */
  subscribeToChanges(listener: SettingChangeListener): () => void {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  /**
   * Force refresh settings from database
   */
  async refresh(): Promise<AppSettings> {
    this.cachedSettings = null;
    this.lastLoadTime = 0;
    return this.loadSettings();
  }

  /**
   * Get cached settings synchronously (may be null)
   */
  getCachedSettings(): AppSettings | null {
    return this.cachedSettings;
  }

  /**
   * Check if settings are cached and fresh
   */
  hasCache(): boolean {
    return this.cachedSettings !== null && this.isCacheFresh();
  }

  /**
   * Check if settings are loaded and cached
   */
  isLoaded(): boolean {
    return this.cachedSettings !== null;
  }

  // Private methods

  private async loadSettings(): Promise<AppSettings> {
    this.isLoading = true;

    try {
      const settings = { ...DEFAULT_SETTINGS };

      // Load all settings from database
      const dbSettings = await databaseService.getAllSystemSettings();

      // Map database settings to app settings
      for (const [appKey, dbKey] of Object.entries(SETTINGS_MAPPING)) {
        const dbSetting = dbSettings.find(s => s.key === dbKey);
        if (dbSetting) {
          const key = appKey as keyof AppSettings;
          settings[key] = this.deserializeValue(key, dbSetting.value);
        }
      }

      this.cachedSettings = settings;
      this.lastLoadTime = Date.now();
      this.notifyListeners();

      logger.info('Settings loaded and cached');
      return settings;

    } catch (error) {
      logger.error('Failed to load settings, using defaults:', error);
      this.cachedSettings = { ...DEFAULT_SETTINGS };
      return this.cachedSettings;
    } finally {
      this.isLoading = false;
    }
  }

  private async waitForLoad(): Promise<AppSettings> {
    // Wait for current load to complete
    while (this.isLoading) {
      await new Promise(resolve => globalThis.setTimeout(resolve, 50));
    }
    return this.cachedSettings || DEFAULT_SETTINGS;
  }

  private isCacheFresh(): boolean {
    return Date.now() - this.lastLoadTime < this.CACHE_TTL;
  }

  private serializeValue(value: string | number | boolean): string {
    if (typeof value === 'string') return value;
    return String(value);
  }

  private deserializeValue<K extends keyof AppSettings>(
    key: K,
    value: string
  ): AppSettings[K] {
    const defaultValue = DEFAULT_SETTINGS[key];

    if (typeof defaultValue === 'number') {
      const parsed = parseFloat(value);
      return (isNaN(parsed) ? defaultValue : parsed) as AppSettings[K];
    }

    if (typeof defaultValue === 'boolean') {
      return (value === 'true' || value === '1') as unknown as AppSettings[K];
    }

    return value as AppSettings[K];
  }

  private notifyListeners(): void {
    if (this.cachedSettings) {
      this.listeners.forEach(listener => {
        try {
          listener(this.cachedSettings!);
        } catch (error) {
          logger.error('Error in settings listener:', error);
        }
      });
    }
  }

  private notifyChangeListeners<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(key, value);
      } catch (error) {
        logger.error('Error in settings change listener:', error);
      }
    });
  }
}

// Singleton instance
export const settingsService = SettingsService.getInstance();

// Utility functions for common operations
export const formatCurrency = async (amount: number): Promise<string> => {
  const currency = await settingsService.getSetting('currency');
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const calculateTax = async (amount: number): Promise<number> => {
  const taxRate = await settingsService.getSetting('taxRate');
  return amount * (taxRate / 100);
};

export const getCompanyInfo = async () => {
  const [name, address, phone] = await Promise.all([
    settingsService.getSetting('companyName'),
    settingsService.getSetting('companyAddress'),
    settingsService.getSetting('companyPhone'),
  ]);

  return { name, address, phone };
}; 
