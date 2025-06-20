import { LogOut, AlertTriangle } from "lucide-preact";
import { Button } from "@/components/ui/button";
import { usePOSTranslation } from "@/hooks/use-pos-translation";

interface LogoutDialogProps {
  onClose: () => void;
  onConfirm?: () => void;
  cashierName?: string;
  hasUnsavedWork?: boolean;
}

function LogoutDialog({
  onClose,
  onConfirm,
  cashierName = "John Doe",
  hasUnsavedWork = false,
}: LogoutDialogProps) {
  const { t } = usePOSTranslation();

  const handleConfirm = () => {
    // Placeholder function for logout process
    // In a real app, this would call an authentication service
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div class="space-y-4">
      <div class="text-center space-y-2">
        <div class="flex justify-center">
          <div class="w-12 h-12 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center">
            <LogOut class="w-6 h-6 text-primary dark:text-primary" />
          </div>
        </div>
        <h3 class="text-lg font-semibold">{t('dialogs:logout.title')}</h3>
        <p class="text-sm text-muted-foreground">
          {t('dialogs:logout.message', { name: cashierName })}
        </p>
      </div>

      {hasUnsavedWork && (
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div class="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle class="w-4 h-4" />
            <span class="text-sm font-medium">{t('dialogs:logout.unsaved_work')}</span>
          </div>
          <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            {t('dialogs:logout.unsaved_message')}
          </p>
        </div>
      )}

      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">
          {t('dialogs:logout.session_end')}
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" class="flex-1" onClick={onClose}>
          {t('common:buttons.cancel')}
        </Button>
        <Button
          class="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground dark:bg-primary dark:hover:bg-primary-hover dark:text-primary-foreground"
          onClick={handleConfirm}
        >
          <LogOut class="w-4 h-4 mr-2" />
          {t('common:buttons.logout')}
        </Button>
      </div>
    </div>
  );
}

export default LogoutDialog;
