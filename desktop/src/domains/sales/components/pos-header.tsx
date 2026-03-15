import Logo from "@/shared/ui/logo";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Settings, User, HelpCircle, PlusSquare } from "lucide-preact";
import { useRenderTracker } from "@/presentation/hooks/use-render-tracker";
import { usePOSTranslation } from "@/presentation/hooks/use-pos-translation";
import { useCustomerDefaults } from "@/presentation/providers";
import { useWindowManager } from "@/presentation/providers";
import { useSales } from "@/domains/sales/hooks";

// Placeholder function - return true for all permissions for now
// const hasPermission = (_permission: string) => {
//   return true;
// };

interface POSHeaderProps {
  openDialog: (dialogType: string, props?: any) => void;
}

function POSHeader({ openDialog }: POSHeaderProps) {
  const { t, getCustomerTypeLabel } = usePOSTranslation();
  const customerDefaults = useCustomerDefaults();
  const windowManager = useWindowManager();
  const { createAnotherSale } = useSales();

  // Track renders for the header component
  useRenderTracker("POSHeader", { openDialog });

  return (
    <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Logo className="h-8 w-8" />

        {/* Show sale number badge in child windows instead of Terminal badge */}
        {!windowManager.isMainWindow && windowManager.saleNumber && (
          <Badge
            variant="default"
            className="bg-primary-light text-primary dark:bg-primary-dark dark:text-primary"
          >
            {t("pos:header.sale_number", { number: windowManager.saleNumber })}
          </Badge>
        )}

        {/* Nueva Venta button - only in main window */}
        {windowManager.isMainWindow && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => createAnotherSale()}
            className="border-primary/20 text-primary hover:bg-primary-light dark:border-primary/30 dark:text-primary dark:hover:bg-primary-dark"
            title={
              windowManager.hasActiveChildren
                ? t("pos:header.active_sales", {
                    count: windowManager.activeChildWindows.length,
                  })
                : undefined
            }
          >
            <PlusSquare className="h-4 w-4 mr-2" />
            {t("pos:header.new_sale")}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Customer selector */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => openDialog("customers")}
          className="border-primary/20 text-primary hover:bg-primary-light dark:border-primary/30 dark:text-primary dark:hover:bg-primary-dark flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">
            {customerDefaults?.defaultCustomerName || "Cliente General"}
          </span>
          <Badge
            variant="outline"
            className="text-xs border-primary/30 text-primary dark:border-primary/50 dark:text-primary"
          >
            {getCustomerTypeLabel(
              (customerDefaults?.defaultCustomerType || "general") as
                | "general"
                | "partner"
                | "vip"
            )}
          </Badge>
        </Button>

        {/* System Menu */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => openDialog("systemMenu")}
          className="border-primary/20 text-primary hover:bg-primary-light dark:border-primary/30 dark:text-primary dark:hover:bg-primary-dark"
        >
          <Settings className="w-4 h-4 mr-2" />
          {t("pos:header.menu_button")}
        </Button>

        {/* Help button - moved to last position */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:text-primary-hover hover:bg-primary-light dark:text-primary dark:hover:text-primary dark:hover:bg-primary-dark"
          onClick={() => openDialog("help")}
          title={t("pos:header.help_tooltip")}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export default POSHeader;
