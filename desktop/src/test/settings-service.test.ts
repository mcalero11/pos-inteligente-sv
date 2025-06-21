import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsService, DEFAULT_SETTINGS } from '../lib/settings-service';
import { databaseService } from '../lib/database';
import { logger } from '../lib/logger';

// Mock the database service
vi.mock('../lib/database');
vi.mock('../lib/logger');

const mockDatabaseService = databaseService as any;
const mockLogger = logger as any;

describe('SettingsService', () => {
  let settingsService: SettingsService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset the singleton instance
    (SettingsService as any).instance = null;
    settingsService = SettingsService.getInstance();

    // Clear any cached settings
    (settingsService as any).cachedSettings = null;
    (settingsService as any).lastLoadTime = 0;
    (settingsService as any).isLoading = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SettingsService.getInstance();
      const instance2 = SettingsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getSettings', () => {
    it('should return cached settings when cache is fresh', async () => {
      // Setup fresh cache
      const mockSettings = { ...DEFAULT_SETTINGS, companyName: 'Test Company' };
      (settingsService as any).cachedSettings = mockSettings;
      (settingsService as any).lastLoadTime = Date.now();

      const result = await settingsService.getSettings();

      expect(result).toBe(mockSettings);
      expect(mockDatabaseService.getAllSystemSettings).not.toHaveBeenCalled();
    });

    it('should load from database when cache is stale', async () => {
      // Setup stale cache
      (settingsService as any).cachedSettings = DEFAULT_SETTINGS;
      (settingsService as any).lastLoadTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago

      const mockDbSettings = [
        { key: 'company_name', value: 'Test Company' },
        { key: 'tax_rate', value: '0.15' },
        { key: 'currency', value: 'EUR' },
      ];

      mockDatabaseService.getAllSystemSettings.mockResolvedValue(mockDbSettings);

      const result = await settingsService.getSettings();

      expect(mockDatabaseService.getAllSystemSettings).toHaveBeenCalled();
      expect(result.companyName).toBe('Test Company');
      expect(result.taxRate).toBe(0.15);
      expect(result.currency).toBe('EUR');
    });

    it('should load from database when no cache exists', async () => {
      const mockDbSettings = [
        { key: 'company_name', value: 'Fresh Company' },
        { key: 'low_stock_alert', value: '5' },
      ];

      mockDatabaseService.getAllSystemSettings.mockResolvedValue(mockDbSettings);

      const result = await settingsService.getSettings();

      expect(mockDatabaseService.getAllSystemSettings).toHaveBeenCalled();
      expect(result.companyName).toBe('Fresh Company');
      expect(result.lowStockAlert).toBe(5);
    });

    it('should return defaults when database fails', async () => {
      mockDatabaseService.getAllSystemSettings.mockRejectedValue(new Error('DB Error'));

      const result = await settingsService.getSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to load settings, using defaults:',
        expect.any(Error)
      );
    });

    it('should prevent concurrent loads', async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockDatabaseService.getAllSystemSettings.mockReturnValue(delayedPromise);

      // Start multiple concurrent loads
      const promise1 = settingsService.getSettings();
      const promise2 = settingsService.getSettings();
      const promise3 = settingsService.getSettings();

      // Resolve the delayed promise
      resolvePromise!([]);

      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

      // Should only call database once
      expect(mockDatabaseService.getAllSystemSettings).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('getSetting', () => {
    it('should return specific setting value', async () => {
      const mockSettings = { ...DEFAULT_SETTINGS, companyName: 'Test Company' };
      (settingsService as any).cachedSettings = mockSettings;
      (settingsService as any).lastLoadTime = Date.now();

      const result = await settingsService.getSetting('companyName');

      expect(result).toBe('Test Company');
    });

    it('should load settings if not cached', async () => {
      const mockDbSettings = [
        { key: 'tax_rate', value: '0.20' },
      ];

      mockDatabaseService.getAllSystemSettings.mockResolvedValue(mockDbSettings);

      const result = await settingsService.getSetting('taxRate');

      expect(result).toBe(0.20);
      expect(mockDatabaseService.getAllSystemSettings).toHaveBeenCalled();
    });
  });

  describe('setSetting', () => {
    it('should update setting in database and cache', async () => {
      // Setup initial cache
      const mockSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).cachedSettings = mockSettings;

      mockDatabaseService.setSystemSetting.mockResolvedValue(undefined);

      await settingsService.setSetting('companyName', 'New Company');

      expect(mockDatabaseService.setSystemSetting).toHaveBeenCalledWith(
        'company_name',
        'New Company'
      );
      expect((settingsService as any).cachedSettings.companyName).toBe('New Company');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Setting updated: companyName = New Company'
      );
    });

    it('should serialize numeric values correctly', async () => {
      const mockSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).cachedSettings = mockSettings;

      mockDatabaseService.setSystemSetting.mockResolvedValue(undefined);

      await settingsService.setSetting('taxRate', 0.25);

      expect(mockDatabaseService.setSystemSetting).toHaveBeenCalledWith(
        'tax_rate',
        '0.25'
      );
      expect((settingsService as any).cachedSettings.taxRate).toBe(0.25);
    });

    it('should handle database errors', async () => {
      const mockSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).cachedSettings = mockSettings;

      const dbError = new Error('Database error');
      mockDatabaseService.setSystemSetting.mockRejectedValue(dbError);

      await expect(settingsService.setSetting('companyName', 'Failed Company'))
        .rejects.toThrow('Database error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update setting companyName:',
        dbError
      );
    });

    it('should notify listeners when setting is updated', async () => {
      const mockSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).cachedSettings = mockSettings;

      const listener = vi.fn();
      const changeListener = vi.fn();

      settingsService.subscribe(listener);
      settingsService.subscribeToChanges(changeListener);

      mockDatabaseService.setSystemSetting.mockResolvedValue(undefined);

      await settingsService.setSetting('companyName', 'Listener Test');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ companyName: 'Listener Test' })
      );
      expect(changeListener).toHaveBeenCalledWith('companyName', 'Listener Test');
    });
  });

  describe('updateSettings', () => {
    it('should update multiple settings in batch', async () => {
      const mockSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).cachedSettings = mockSettings;

      mockDatabaseService.setSystemSetting.mockResolvedValue(undefined);

      const updates = {
        companyName: 'Batch Company',
        taxRate: 0.18,
        currency: 'GBP',
      };

      await settingsService.updateSettings(updates);

      expect(mockDatabaseService.setSystemSetting).toHaveBeenCalledTimes(3);
      expect(mockDatabaseService.setSystemSetting).toHaveBeenCalledWith('company_name', 'Batch Company');
      expect(mockDatabaseService.setSystemSetting).toHaveBeenCalledWith('tax_rate', '0.18');
      expect(mockDatabaseService.setSystemSetting).toHaveBeenCalledWith('currency', 'GBP');

      expect((settingsService as any).cachedSettings).toMatchObject(updates);
    });

    it('should notify listeners for each updated setting', async () => {
      const mockSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).cachedSettings = mockSettings;

      const listener = vi.fn();
      const changeListener = vi.fn();

      settingsService.subscribe(listener);
      settingsService.subscribeToChanges(changeListener);

      mockDatabaseService.setSystemSetting.mockResolvedValue(undefined);

      const updates = {
        companyName: 'Batch Company',
        taxRate: 0.18,
      };

      await settingsService.updateSettings(updates);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining(updates)
      );
      expect(changeListener).toHaveBeenCalledTimes(2);
      expect(changeListener).toHaveBeenCalledWith('companyName', 'Batch Company');
      expect(changeListener).toHaveBeenCalledWith('taxRate', 0.18);
    });

    it('should handle batch update errors', async () => {
      const mockSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).cachedSettings = mockSettings;

      const dbError = new Error('Batch error');
      mockDatabaseService.setSystemSetting.mockRejectedValue(dbError);

      const updates = { companyName: 'Failed Batch' };

      await expect(settingsService.updateSettings(updates))
        .rejects.toThrow('Batch error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update settings in batch:',
        dbError
      );
    });
  });

  describe('Subscription System', () => {
    it('should notify subscribers when settings change', async () => {
      const listener = vi.fn();
      const unsubscribe = settingsService.subscribe(listener);

      const mockSettings = { ...DEFAULT_SETTINGS, companyName: 'Test' };
      (settingsService as any).cachedSettings = mockSettings;
      (settingsService as any).notifyListeners();

      expect(listener).toHaveBeenCalledWith(mockSettings);

      unsubscribe();
      (settingsService as any).notifyListeners();

      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should immediately call listener with current settings if available', async () => {
      const mockSettings = { ...DEFAULT_SETTINGS, companyName: 'Immediate' };
      (settingsService as any).cachedSettings = mockSettings;

      const listener = vi.fn();
      settingsService.subscribe(listener);

      expect(listener).toHaveBeenCalledWith(mockSettings);
    });

    it('should handle change listeners correctly', () => {
      const changeListener = vi.fn();
      const unsubscribe = settingsService.subscribeToChanges(changeListener);

      (settingsService as any).notifyChangeListeners('companyName', 'Test Change');

      expect(changeListener).toHaveBeenCalledWith('companyName', 'Test Change');

      unsubscribe();
      (settingsService as any).notifyChangeListeners('companyName', 'Test Change 2');

      // Should not be called again after unsubscribe
      expect(changeListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cache Management', () => {
    it('should refresh cache when requested', async () => {
      // Setup stale cache
      (settingsService as any).cachedSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).lastLoadTime = Date.now() - 1000;

      const mockDbSettings = [
        { key: 'company_name', value: 'Refreshed Company' },
      ];

      mockDatabaseService.getAllSystemSettings.mockResolvedValue(mockDbSettings);

      const result = await settingsService.refresh();

      expect(result.companyName).toBe('Refreshed Company');
      expect(mockDatabaseService.getAllSystemSettings).toHaveBeenCalled();
    });

    it('should report cache status correctly', () => {
      // No cache
      expect(settingsService.hasCache()).toBe(false);
      expect(settingsService.isLoaded()).toBe(false);

      // Fresh cache
      (settingsService as any).cachedSettings = DEFAULT_SETTINGS;
      (settingsService as any).lastLoadTime = Date.now();

      expect(settingsService.hasCache()).toBe(true);
      expect(settingsService.isLoaded()).toBe(true);

      // Stale cache
      (settingsService as any).lastLoadTime = Date.now() - 10 * 60 * 1000;

      expect(settingsService.hasCache()).toBe(false);
      expect(settingsService.isLoaded()).toBe(true);
    });

    it('should return cached settings synchronously', () => {
      const mockSettings = { ...DEFAULT_SETTINGS, companyName: 'Sync Test' };
      (settingsService as any).cachedSettings = mockSettings;

      const result = settingsService.getCachedSettings();

      expect(result).toBe(mockSettings);
    });

    it('should handle cache expiry correctly', () => {
      const mockSettings = { ...DEFAULT_SETTINGS };
      (settingsService as any).cachedSettings = mockSettings;

      // Fresh cache
      (settingsService as any).lastLoadTime = Date.now();
      expect((settingsService as any).isCacheFresh()).toBe(true);

      // Stale cache (older than CACHE_TTL)
      (settingsService as any).lastLoadTime = Date.now() - 6 * 60 * 1000; // 6 minutes
      expect((settingsService as any).isCacheFresh()).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize values correctly', () => {
      const service = settingsService as any;

      expect(service.serializeValue('string')).toBe('string');
      expect(service.serializeValue(123)).toBe('123');
      expect(service.serializeValue(true)).toBe('true');
      expect(service.serializeValue(false)).toBe('false');
    });

    it('should deserialize values correctly', () => {
      const service = settingsService as any;

      // String values
      expect(service.deserializeValue('companyName', 'Test Company')).toBe('Test Company');

      // Number values
      expect(service.deserializeValue('taxRate', '0.15')).toBe(0.15);
      expect(service.deserializeValue('lowStockAlert', '10')).toBe(10);

      // Boolean values would need to be added to the actual implementation
      // This test documents the expected behavior
    });
  });
}); 
