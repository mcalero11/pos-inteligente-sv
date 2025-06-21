# Settings Service Architecture 🎛️

## Overview

The Settings Service provides a **reactive, cached, and type-safe** way to manage application configuration. It replaces hardcoded values throughout the application with database-driven settings that can be updated in real-time.

## 🏗️ Architecture Components

### 1. Settings Service (`src/lib/settings-service.ts`)

- **Singleton pattern** for global access
- **Reactive updates** via event listeners
- **Caching** with TTL for performance
- **Type-safe** operations with TypeScript interfaces
- **Automatic fallbacks** to default values

### 2. Settings Context (`src/contexts/SettingsContext.tsx`)

- **React Context** for component access
- **Loading states** and error handling
- **Batch updates** for efficiency
- **Automatic re-renders** when settings change

### 3. Database Integration

- **System settings table** for persistence
- **Seeded defaults** for initial setup
- **Migration support** for schema changes

## 🎯 Key Features

### Reactive Updates

```typescript
// Subscribe to all settings changes
const unsubscribe = settingsService.subscribe((newSettings) => {
  console.log('Settings updated:', newSettings);
});

// Subscribe to specific setting changes
const unsubscribe = settingsService.subscribeToChanges((key, value) => {
  console.log(`${key} changed to:`, value);
});
```

### Type Safety

```typescript
// All settings are typed
interface AppSettings {
  taxRate: number;
  currency: string;
  companyName: string;
  defaultCustomerName: string;
  defaultCustomerType: 'general' | 'partner' | 'vip';
  // ... more settings
}

// Type-safe access
const taxRate = await settingsService.getSetting('taxRate'); // number
const currency = await settingsService.getSetting('currency'); // string
```

### Caching & Performance

- **5-minute cache TTL** for database queries
- **Concurrent request prevention** during loads
- **Batch updates** for multiple settings
- **Immediate UI updates** via subscriptions

## 📊 Database Schema

### System Settings Table

```sql
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    is_system BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Default Settings (Seeded)

```rust
// Financial settings
("tax_rate", "13.0", "Default tax rate percentage", "financial", 1),
("currency", "USD", "System currency", "financial", 1),

// Company information
("company_name", "Mi Farmacia", "Company name for receipts", "company", 0),
("company_address", "", "Company address", "company", 0),
("company_phone", "", "Company phone number", "company", 0),

// Receipt settings
("receipt_footer", "Gracias por su compra", "Footer text for receipts", "receipt", 0),

// UI settings
("default_customer_name", "Cliente General", "Default customer name", "ui", 0),
("default_customer_type", "general", "Default customer type", "ui", 0),

// System settings
("low_stock_alert", "10", "Minimum stock level for alerts", "inventory", 0),
("backup_frequency", "24", "Backup frequency in hours", "system", 1),
("session_timeout", "480", "Session timeout in minutes", "security", 1),
```

## 🔧 Usage Examples

### 1. Component Usage with Hooks

```typescript
import { useSettings, useSetting, useFinancialSettings } from '@/contexts/SettingsContext';

function MyComponent() {
  // Get all settings
  const { settings, updateSetting, isLoading } = useSettings();
  
  // Get specific setting
  const taxRate = useSetting('taxRate');
  
  // Get grouped settings
  const { taxRate, currency } = useFinancialSettings() || {};
  
  // Update setting
  const handleTaxRateChange = (newRate: number) => {
    updateSetting('taxRate', newRate);
  };
  
  return (
    <div>
      <p>Tax Rate: {taxRate}%</p>
      <p>Currency: {currency}</p>
    </div>
  );
}
```

### 2. Service Direct Usage

```typescript
import { settingsService } from '@/lib/settings-service';

// Get individual setting
const taxRate = await settingsService.getSetting('taxRate');

// Update setting
await settingsService.setSetting('taxRate', 15.0);

// Batch update
await settingsService.updateSettings({
  taxRate: 15.0,
  currency: 'EUR',
  companyName: 'Nueva Farmacia'
});

// Subscribe to changes
const unsubscribe = settingsService.subscribe((settings) => {
  console.log('Settings updated:', settings);
});
```

### 3. Utility Functions

```typescript
import { formatCurrency, calculateTax, getCompanyInfo } from '@/lib/settings-service';

// Format currency based on settings
const formatted = await formatCurrency(123.45); // "$123.45"

// Calculate tax based on settings
const tax = await calculateTax(100); // 13.0 (based on 13% tax rate)

// Get company information
const company = await getCompanyInfo();
// { name: "Mi Farmacia", address: "", phone: "" }
```

## 🔄 Migration from Hardcoded Values

### Before (Hardcoded)

```typescript
// ❌ Hardcoded values scattered throughout the app
const TAX_RATE = 0.13;
const COMPANY_NAME = "Mi Farmacia";
const DEFAULT_CUSTOMER = "General Customer";

function calculateTotal(subtotal: number) {
  return subtotal * (1 + TAX_RATE);
}
```

### After (Settings Service)

```typescript
// ✅ Dynamic values from database
import { useFinancialSettings, useSetting } from '@/contexts/SettingsContext';

function MyComponent() {
  const { taxRate } = useFinancialSettings() || {};
  const companyName = useSetting('companyName');
  const defaultCustomer = useSetting('defaultCustomerName');
  
  const calculateTotal = (subtotal: number) => {
    return subtotal * (1 + (taxRate || 13) / 100);
  };
  
  return (
    <div>
      <h1>{companyName}</h1>
      <p>Customer: {defaultCustomer}</p>
      <p>Tax Rate: {taxRate}%</p>
    </div>
  );
}
```

## 🎨 Components Updated

### 1. POS Header (`src/components/pos/pos-header.tsx`)

- **Before**: `name: "General Customer"`
- **After**: `name: defaultCustomerName || "Cliente General"`

### 2. Transaction Dialog (`src/components/dialogs/TransactionDialog.tsx`)

- **Before**: `const tax = subtotal * 0.13;`
- **After**: `const tax = subtotal * (taxRate / 100);`

### 3. POS Cart (`src/components/pos/pos-cart.tsx`)

- **Before**: `const tax = subtotal * 0.08;`
- **After**: `const tax = subtotal * (taxRate / 100);`

### 4. Settings Dialog (`src/components/dialogs/SettingsDialog.tsx`)

- **Complete rewrite** with real settings management
- **Form validation** and change tracking
- **Batch save** functionality
- **Real-time updates** across the app

## 🔒 Error Handling & Fallbacks

### Graceful Degradation

```typescript
// Settings service provides fallbacks
const taxRate = await settingsService.getSetting('taxRate') || 13.0;

// Components handle loading states
if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} />;
}
```

### Default Values

```typescript
const DEFAULT_SETTINGS: AppSettings = {
  taxRate: 13.0,
  currency: 'USD',
  companyName: 'Mi Farmacia',
  // ... all settings have defaults
};
```

## 🚀 Benefits

### 1. **Maintainability**

- ✅ Single source of truth for configuration
- ✅ Easy to add new settings
- ✅ No scattered hardcoded values

### 2. **User Experience**

- ✅ Real-time updates without app restart
- ✅ Persistent configuration
- ✅ User-friendly settings interface

### 3. **Performance**

- ✅ Cached settings for fast access
- ✅ Batch updates for efficiency
- ✅ Minimal database queries

### 4. **Developer Experience**

- ✅ Type-safe settings access
- ✅ Reactive updates
- ✅ Easy testing with mocked settings

### 5. **Business Value**

- ✅ Configurable without code changes
- ✅ Per-location customization
- ✅ A/B testing capabilities

## 🧪 Testing

### Unit Tests

```typescript
import { settingsService } from '@/lib/settings-service';

describe('Settings Service', () => {
  it('should return default values when database is empty', async () => {
    const taxRate = await settingsService.getSetting('taxRate');
    expect(taxRate).toBe(13.0);
  });
  
  it('should update settings and notify listeners', async () => {
    const listener = jest.fn();
    settingsService.subscribe(listener);
    
    await settingsService.setSetting('taxRate', 15.0);
    
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ taxRate: 15.0 })
    );
  });
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/preact';
import { SettingsProvider } from '@/contexts/SettingsContext';

test('components use settings correctly', async () => {
  render(
    <SettingsProvider>
      <MyComponent />
    </SettingsProvider>
  );
  
  await waitFor(() => {
    expect(screen.getByText('Tax Rate: 13%')).toBeInTheDocument();
  });
});
```

## 🔮 Future Enhancements

### 1. **Multi-tenant Support**

- Settings per location/store
- Hierarchical configuration (global → store → terminal)

### 2. **Advanced Validation**

- Setting constraints and validation rules
- Dependency checking between settings

### 3. **Configuration Import/Export**

- Backup and restore settings
- Template configurations

### 4. **Audit Trail**

- Track who changed what and when
- Rollback capabilities

### 5. **Real-time Sync**

- WebSocket updates across terminals
- Conflict resolution for concurrent updates

## 📝 Summary

The Settings Service architecture provides a **robust, scalable, and user-friendly** way to manage application configuration. It eliminates hardcoded values, provides real-time updates, and offers a great developer experience with type safety and reactive programming patterns.

**Key Benefits:**

- 🎯 **No more hardcoded values**
- 🔄 **Real-time configuration updates**
- 🛡️ **Type-safe and error-resistant**
- ⚡ **High performance with caching**
- 🎨 **Great user experience**
- 🧪 **Testable and maintainable**

This pattern can be extended to any configuration needs in the application, making it a powerful foundation for building configurable, maintainable software.
