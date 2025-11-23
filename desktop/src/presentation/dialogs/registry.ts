import { DialogConfig } from "./types";
import CustomerDialog from "./CustomerDialog";
import InventoryDialog from "./InventoryDialog";
import SettingsDialog from "./SettingsDialog";
import ShiftDialog from "./ShiftDialog";
import UserDialog from "./UserDialog";
import LogsDialog from "./LogsDialog";
import HelpDialog from "./HelpDialog";
import SystemMenuDialog from "./SystemMenuDialog";
import EndOfDayDialog from "./EndOfDayDialog";
import LogoutDialog from "./LogoutDialog";
import TransactionDialog from "./TransactionDialog";
import ErrorDialog from "./ErrorDialog";
import DebugDialog from "./DebugDialog";

// Function to get dialog registry with translated titles
export const getDialogRegistry = (t: (key: string) => string): Record<string, DialogConfig> => ({
  customers: {
    title: t('dialogs:customer.title'),
    component: CustomerDialog,
    size: "2xl",
  },
  inventory: {
    title: t('dialogs:inventory.title'),
    component: InventoryDialog,
    size: "4xl",
  },
  settings: {
    title: t('dialogs:settings.title'),
    component: SettingsDialog,
    size: "2xl",
  },
  shifts: {
    title: t('dialogs:shift.title'),
    component: ShiftDialog,
    size: "xl",
  },
  users: {
    title: t('dialogs:system_menu.users.title'),
    component: UserDialog,
    size: "2xl",
  },
  logs: {
    title: t('dialogs:logs.title'),
    component: LogsDialog,
    size: "3xl",
  },
  help: {
    title: t('dialogs:help.title'),
    component: HelpDialog,
    size: "md",
  },
  systemMenu: {
    title: t('dialogs:system_menu.title'),
    component: SystemMenuDialog,
    size: "sm",
  },
  endOfDay: {
    title: t('dialogs:end_of_day.title'),
    component: EndOfDayDialog,
    size: "md",
  },
  logout: {
    title: t('dialogs:logout.title'),
    component: LogoutDialog,
    size: "sm",
  },
  transaction: {
    title: t('dialogs:transaction.title'),
    component: TransactionDialog,
    size: "2xl",
  },
  error: {
    title: t('errors:titles.application'),
    component: ErrorDialog,
    size: "lg",
  },
  debug: {
    title: t('dialogs:system_menu.debug.title'),
    component: DebugDialog,
    size: "2xl",
  },
});

// Backwards compatibility - static registry (deprecated)
export const dialogRegistry: Record<string, DialogConfig> = getDialogRegistry((key: string) => {
  // Fallback to English if translation system not available
  const fallbacks: Record<string, string> = {
    'dialogs:customer.title': 'Customer Management',
    'dialogs:inventory.title': 'Inventory Management',
    'dialogs:settings.title': 'System Settings',
    'dialogs:shift.title': 'Shift Management',
    'dialogs:system_menu.users.title': 'User Management',
    'dialogs:logs.title': 'Activity Logs',
    'dialogs:help.title': 'Keyboard Shortcuts',
    'dialogs:system_menu.title': 'System Menu',
    'dialogs:end_of_day.title': 'End of Day Process',
    'dialogs:logout.title': 'Confirm Logout',
    'dialogs:transaction.title': 'New Transaction',
    'errors:titles.application': 'Application Error',
    'dialogs:system_menu.debug.title': 'Debug Tools',
  };
  return fallbacks[key] || key;
});
