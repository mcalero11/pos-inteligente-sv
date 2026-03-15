export interface SystemSettings {
  // Tax Configuration
  taxRate: number; // Default: 0.13 (13% IVA for El Salvador)
  taxIncluded: boolean;

  // Receipt Configuration
  receiptHeader: string;
  receiptFooter: string;
  showLogo: boolean;

  // POS Configuration
  defaultPaymentMethod: string;
  allowPartialPayments: boolean;
  requireCustomerForSale: boolean;
  autoOpenCashDrawer: boolean;

  // Sync Configuration
  syncEnabled: boolean;
  syncIntervalSeconds: number;
  maxOfflineDays: number;

  // DTE Configuration
  dteEnabled: boolean;
  dteAutoSend: boolean;
  dteRetryAttempts: number;

  // UI Configuration
  theme: "light" | "dark" | "system";
  language: string;
  currency: string;
  currencySymbol: string;
  decimalPlaces: number;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  // Tax
  taxRate: 0.13,
  taxIncluded: false,

  // Receipt
  receiptHeader: "",
  receiptFooter: "Gracias por su compra",
  showLogo: true,

  // POS
  defaultPaymentMethod: "cash",
  allowPartialPayments: false,
  requireCustomerForSale: false,
  autoOpenCashDrawer: true,

  // Sync
  syncEnabled: true,
  syncIntervalSeconds: 30,
  maxOfflineDays: 7,

  // DTE
  dteEnabled: true,
  dteAutoSend: true,
  dteRetryAttempts: 3,

  // UI
  theme: "system",
  language: "es",
  currency: "USD",
  currencySymbol: "$",
  decimalPlaces: 2,
};

export function mergeWithDefaults(
  partial: Partial<SystemSettings>
): SystemSettings {
  return { ...DEFAULT_SETTINGS, ...partial };
}
