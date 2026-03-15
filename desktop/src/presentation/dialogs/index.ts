// Presentation layer dialogs

// Core dialog infrastructure
export { default as DialogManager } from "./DialogManager";
export { dialogRegistry } from "./registry";
export type {
  DialogState,
  DialogProps,
  DialogConfig,
  DialogType,
  DialogSize,
  DialogManagerProps,
} from "./types";

// Business dialogs
export { default as CustomerDialog } from "./CustomerDialog";
export { default as EndOfDayDialog } from "./EndOfDayDialog";
export { default as ErrorDialog } from "./ErrorDialog";
export { default as HelpDialog } from "./HelpDialog";
export { default as InventoryDialog } from "./InventoryDialog";
export { default as LogoutDialog } from "./LogoutDialog";
export { default as SettingsDialog } from "./SettingsDialog";
export { default as ShiftDialog } from "./ShiftDialog";
export { default as SystemMenuDialog } from "./SystemMenuDialog";
export { default as TransactionDialog } from "./TransactionDialog";
export { default as UserDialog } from "./UserDialog";

// Debug dialogs
export { default as DebugDialog } from "./DebugDialog";
export { default as LogsDialog } from "./LogsDialog";
export { default as PerformanceDialog } from "./PerformanceDialog";
