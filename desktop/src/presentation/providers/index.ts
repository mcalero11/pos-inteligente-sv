// Presentation layer providers

// App state management (state machine for app lifecycle)
export { AppStateProvider, useAppState, AppState, ErrorType, type AppError } from './AppStateContext';

// Settings management
export { SettingsProvider, useSettings, useSetting, useCompanyInfo, useCustomerDefaults, useFinancialSettings } from './SettingsContext';

// Theme management
export { ThemeProvider, useTheme, type ColorTheme } from './ThemeContext';

// Debug tools
export { DebugProvider, useDebug } from './DebugContext';
