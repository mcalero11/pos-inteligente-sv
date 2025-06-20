import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePOSTranslation } from "@/hooks/use-pos-translation";
import {
  Package,
  Settings,
  FileText,
  HelpCircle,
  Clock,
  UserCheck,
  Bug,
} from "lucide-preact";

interface SystemMenuDialogProps {
  openDialog: (dialogType: string) => void;
}

// Placeholder function - return true for all permissions for now
const hasPermission = () => true;

export default function SystemMenuDialog({
  openDialog,
}: SystemMenuDialogProps) {
  const { t } = usePOSTranslation();

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
              <div className="font-medium">{t('dialogs:system_menu.inventory.title')}</div>
              <div className="text-xs text-primary/70">
                {t('dialogs:system_menu.inventory.description')}
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
              <div className="font-medium">{t('dialogs:system_menu.shifts.title')}</div>
              <div className="text-xs text-primary/70">{t('dialogs:system_menu.shifts.description')}</div>
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
              <div className="font-medium">{t('dialogs:system_menu.users.title')}</div>
              <div className="text-xs text-primary/70">
                {t('dialogs:system_menu.users.description')}
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
              <div className="font-medium">{t('dialogs:system_menu.logs.title')}</div>
              <div className="text-xs text-primary/70">
                {t('dialogs:system_menu.logs.description')}
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
              <div className="font-medium">{t('dialogs:system_menu.settings.title')}</div>
              <div className="text-xs text-primary/70">
                {t('dialogs:system_menu.settings.description')}
              </div>
            </div>
          </Button>
        </div>
      )}

      <Separator className="my-2" />

      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium">{t('common:labels.theme')}</span>
        <ThemeToggle />
      </div>

      <Separator className="my-2" />

      {/* Debug Tools (Dev Mode Only) */}
      {import.meta.env.DEV && (
        <div>
          <Button
            variant="ghost"
            className="justify-start h-10 w-full hover:bg-primary-light"
            onClick={() => handleMenuItemClick("debug")}
          >
            <Bug className="w-4 h-4 mr-3 text-primary" />
            {t('dialogs:system_menu.debug.title')}
          </Button>
        </div>
      )}

      <div>
        <Button
          variant="ghost"
          className="justify-start h-10 w-full hover:bg-primary-light"
          onClick={() => handleMenuItemClick("help")}
        >
          <HelpCircle className="w-4 h-4 mr-3 text-primary" />
          {t('dialogs:system_menu.help.title')}
        </Button>
      </div>


    </div>
  );
}
