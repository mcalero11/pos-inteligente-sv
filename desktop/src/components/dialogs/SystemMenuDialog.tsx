import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Package,
  Settings,
  FileText,
  HelpCircle,
  Clock,
  UserCheck,
} from "lucide-preact";

interface SystemMenuDialogProps {
  openDialog: (dialogType: string) => void;
}

// Placeholder function - return true for all permissions for now
const hasPermission = () => true;

export default function SystemMenuDialog({
  openDialog,
}: SystemMenuDialogProps) {
  const handleMenuItemClick = (dialogType: string) => {
    // Open the new dialog - this will replace the current dialog (system menu)
    openDialog(dialogType);
  };

  return (
    <div className="space-y-2">
      {hasPermission() && (
        <div>
          <Button
            variant="ghost"
            className="justify-start h-12 w-full hover:bg-primary-light"
            onClick={() => handleMenuItemClick("inventory")}
          >
            <Package className="w-4 h-4 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">Inventory</div>
              <div className="text-xs text-primary/70">
                Manage products & stock
              </div>
            </div>
          </Button>
        </div>
      )}

      {hasPermission() && (
        <div>
          <Button
            variant="ghost"
            className="justify-start h-12 w-full hover:bg-primary-light"
            onClick={() => handleMenuItemClick("shifts")}
          >
            <Clock className="w-4 h-4 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">Shifts</div>
              <div className="text-xs text-primary/70">Manage work shifts</div>
            </div>
          </Button>
        </div>
      )}

      {hasPermission() && (
        <div>
          <Button
            variant="ghost"
            className="justify-start h-12 w-full hover:bg-primary-light"
            onClick={() => handleMenuItemClick("users")}
          >
            <UserCheck className="w-4 h-4 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">Users</div>
              <div className="text-xs text-primary/70">
                Manage user accounts
              </div>
            </div>
          </Button>
        </div>
      )}

      {hasPermission() && (
        <div>
          <Button
            variant="ghost"
            className="justify-start h-12 w-full hover:bg-primary-light"
            onClick={() => handleMenuItemClick("logs")}
          >
            <FileText className="w-4 h-4 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">Activity Logs</div>
              <div className="text-xs text-primary/70">
                View system activity
              </div>
            </div>
          </Button>
        </div>
      )}

      {hasPermission() && (
        <div>
          <Button
            variant="ghost"
            className="justify-start h-12 w-full hover:bg-primary-light"
            onClick={() => handleMenuItemClick("settings")}
          >
            <Settings className="w-4 h-4 mr-3 text-primary" />
            <div className="text-left">
              <div className="font-medium">Settings</div>
              <div className="text-xs text-primary/70">
                System configuration
              </div>
            </div>
          </Button>
        </div>
      )}

      <Separator className="my-2" />

      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium">Theme</span>
        <ThemeToggle />
      </div>

      <Separator className="my-2" />

      <div>
        <Button
          variant="ghost"
          className="justify-start h-10 w-full hover:bg-primary-light"
          onClick={() => handleMenuItemClick("help")}
        >
          <HelpCircle className="w-4 h-4 mr-3 text-primary" />
          Keyboard Shortcuts
        </Button>
      </div>
    </div>
  );
}
