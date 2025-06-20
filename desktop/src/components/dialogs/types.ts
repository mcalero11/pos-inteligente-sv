import { ComponentType } from "preact";

// Dialog system types
export interface DialogState {
  type: string;
  props?: any;
}

export type DialogSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";

export interface DialogConfig {
  title: string;
  component: ComponentType<any>;
  size?: DialogSize;
}

export type DialogType =
  | "customers"
  | "inventory"
  | "settings"
  | "shifts"
  | "users"
  | "logs"
  | "help"
  | "systemMenu"
  | "transaction"
  | "endOfDay"
  | "logout"
  | "error"
  | "debug"
  | "stateDemo";

export interface DialogManagerProps {
  currentDialog: DialogState | null;
  onClose: () => void;
  openDialog: (dialogType: string, props?: any) => void;
}

export interface DialogProps {
  onClose?: () => void;
  [key: string]: any;
}

// Size mapping comments for reference:
// xs: ~320px - Very small dialogs (confirmations)
// sm: ~384px - Small dialogs (simple forms)
// md: ~448px - Medium dialogs (default)
// lg: ~512px - Large dialogs (help, settings)
// xl: ~576px - Extra large dialogs
// 2xl: ~672px - Customer management
// 3xl: ~768px - Activity logs, reports
// 4xl: ~896px - Inventory management, complex forms
