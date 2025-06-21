import { useState } from "preact/hooks";
import Logo from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, User, HelpCircle, Users, Activity } from "lucide-preact";
import { useRenderTracker } from "@/hooks/use-render-tracker";
import { usePOSTranslation } from "@/hooks/use-pos-translation";
import PerformanceDialog from "@/components/dialogs/PerformanceDialog";
import { useSetting } from "@/contexts/SettingsContext";

// Placeholder function - return true for all permissions for now
// const hasPermission = (_permission: string) => {
//   return true;
// };

interface POSHeaderProps {
  openDialog: (dialogType: string, props?: any) => void;
}

function POSHeader({ openDialog }: POSHeaderProps) {
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const { t, getCustomerTypeLabel } = usePOSTranslation();
  const defaultCustomerName = useSetting('defaultCustomerName');
  const defaultCustomerType = useSetting('defaultCustomerType');

  // Track renders for the header component
  useRenderTracker('POSHeader', { openDialog });

  // Use settings-based customer data
  const selectedCustomer = {
    name: defaultCustomerName || "Cliente General",
    type: (defaultCustomerType || "general") as "general" | "partner" | "vip",
  };

  return (
    <>
      <PerformanceDialog
        isOpen={isPerformanceDialogOpen}
        onClose={() => setIsPerformanceDialogOpen(false)}
      />
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo className="h-8 w-8" />
          <Badge
            variant="default"
            className="bg-primary-light text-primary dark:bg-primary-dark dark:text-primary"
          >
            {t('pos:header.terminal', { number: 1 })}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:text-primary-hover hover:bg-primary-light dark:text-primary dark:hover:text-primary dark:hover:bg-primary-dark"
            onClick={() => openDialog("help")}
            title={t('pos:header.help_tooltip')}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDialog("customers")}
            className="border-primary/20 text-primary hover:bg-primary-light dark:border-primary/30 dark:text-primary dark:hover:bg-primary-dark"
          >
            <Users className="h-4 w-4 mr-2" />
            {t('pos:header.customers_button')}
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light rounded-md border border-primary/20 dark:bg-primary-dark dark:border-primary/30">
            <User className="h-4 w-4 text-primary dark:text-primary" />
            <span className="text-sm font-medium text-primary dark:text-primary">
              {selectedCustomer.name}
            </span>
            <Badge
              variant="outline"
              className="text-xs border-primary/30 text-primary dark:border-primary/50 dark:text-primary"
            >
              {getCustomerTypeLabel(selectedCustomer.type)}
            </Badge>
          </div>

          {/* Performance Inspector Button (Dev Mode Only) */}
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPerformanceDialogOpen(true)}
              className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
              title={t('pos:header.performance_button')}
            >
              <Activity className="w-4 h-4 mr-2" />
              {t('pos:header.performance_button')}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => openDialog("systemMenu")}
            className="border-primary/20 text-primary hover:bg-primary-light dark:border-primary/30 dark:text-primary dark:hover:bg-primary-dark"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('pos:header.menu_button')}
          </Button>
        </div>
      </header>
    </>
  );
}

export default POSHeader;
