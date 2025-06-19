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
  | "logout";

export interface DialogManagerProps {
  currentDialog: DialogState | null;
  onClose: () => void;
  openDialog: (dialogType: string, props?: any) => void;
}

export interface DialogProps {
  onClose?: () => void;
  [key: string]: any;
}

// Size mapping for consistent dialog sizing
export const dialogSizeMap: Record<DialogSize, string> = {
  xs: "max-w-xs", // ~320px - Very small dialogs (confirmations)
  sm: "max-w-sm", // ~384px - Small dialogs (simple forms)
  md: "max-w-md", // ~448px - Medium dialogs (default)
  lg: "max-w-lg", // ~512px - Large dialogs (help, settings)
  xl: "max-w-xl", // ~576px - Extra large dialogs
  "2xl": "max-w-2xl", // ~672px - Customer management
  "3xl": "max-w-3xl", // ~768px - Activity logs, reports
  "4xl": "max-w-4xl", // ~896px - Inventory management, complex forms
};
