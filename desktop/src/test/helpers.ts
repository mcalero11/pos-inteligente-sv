import { vi } from 'vitest';
import type { AppSettings } from '../lib/settings-service';

/**
 * Creates a mock database service for testing
 */
export const createMockDatabaseService = () => ({
  getAllSystemSettings: vi.fn(),
  setSystemSetting: vi.fn(),
  getSystemSetting: vi.fn(),
});

/**
 * Creates a mock logger for testing
 */
export const createMockLogger = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
});

/**
 * Creates mock database settings from app settings
 */
export const createMockDbSettings = (settings: Partial<AppSettings>) => {
  const settingsMapping: Record<keyof AppSettings, string> = {
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

  return Object.entries(settings).map(([key, value]) => ({
    key: settingsMapping[key as keyof AppSettings],
    value: String(value),
  }));
};

/**
 * Waits for a specified number of milliseconds (for testing async operations)
 * Note: In tests, prefer using vi.advanceTimersByTime() with fake timers
 */
export const wait = (ms: number) => new Promise<void>(resolve => {
  // Use globalThis.setTimeout which is available in the test environment
  (globalThis as any).setTimeout(resolve, ms);
});

/**
 * Creates a delayed promise that can be resolved manually
 */
export const createDelayedPromise = <T>() => {
  let resolve: (value: T) => void;
  let reject: (error: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}; 
