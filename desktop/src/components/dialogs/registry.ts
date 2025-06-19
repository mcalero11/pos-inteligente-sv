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

export const dialogRegistry: Record<string, DialogConfig> = {
  customers: {
    title: "Customer Management",
    component: CustomerDialog,
    size: "2xl",
  },
  inventory: {
    title: "Inventory Management",
    component: InventoryDialog,
    size: "4xl",
  },
  settings: {
    title: "System Settings",
    component: SettingsDialog,
    size: "lg",
  },
  shifts: {
    title: "Shift Management",
    component: ShiftDialog,
    size: "xl",
  },
  users: {
    title: "User Management",
    component: UserDialog,
    size: "2xl",
  },
  logs: {
    title: "Activity Logs",
    component: LogsDialog,
    size: "3xl",
  },
  help: {
    title: "Keyboard Shortcuts",
    component: HelpDialog,
    size: "md",
  },
  systemMenu: {
    title: "System Menu",
    component: SystemMenuDialog,
    size: "sm",
  },
  endOfDay: {
    title: "End of Day Process",
    component: EndOfDayDialog,
    size: "md",
  },
  logout: {
    title: "Confirm Logout",
    component: LogoutDialog,
    size: "sm",
  },
  transaction: {
    title: "New Transaction",
    component: TransactionDialog,
    size: "2xl",
  },
};
