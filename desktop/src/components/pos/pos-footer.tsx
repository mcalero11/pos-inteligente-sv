import { User, Clock, Receipt, LogOut, FileText, WifiOff } from "lucide-preact";
import { Button } from "@/components/ui/button";
import { useAppState, AppState } from "@/contexts/AppStateContext";
import { usePOSTranslation } from "@/hooks/use-pos-translation";

interface POSFooterProps {
  openDialog: (dialogType: string, props?: any) => void;
}

function POSFooter({ openDialog }: POSFooterProps) {
  const { state } = useAppState();
  const { t, formatCurrency } = usePOSTranslation();
  const isOffline = state === AppState.OFFLINE;

  // Static data for now - in a real app these would come from props or context
  const currentTime = new Date();
  const sessionStart = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
  const transactionCount = 42;
  const dailyTotal = 1250.75;

  const handleEndOfDay = () => {
    // Open the End of Day dialog with current session data
    openDialog("endOfDay", {
      transactionCount,
      dailyTotal,
      sessionStart,
      cashierName: "John Doe",
      onConfirm: () => {
        // Placeholder function for end of day process
        // In a real app, this would call an API
      },
    });
  };

  const handleLogout = () => {
    // Open the logout confirmation dialog
    openDialog("logout", {
      cashierName: "John Doe",
      hasUnsavedWork: false,
      onConfirm: () => {
        // Placeholder function for logout
        // In a real app, this would call an authentication service
      },
    });
  };

  return (
    <footer className={`px-4 py-1 flex items-center justify-between text-xs ${isOffline
      ? "bg-muted text-muted-foreground"
      : "bg-primary text-primary-foreground"
      }`}>
      <div className="flex items-center gap-4">
        {isOffline && (
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="font-medium">{t('pos:footer.offline')}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{t('pos:header.cashier', { name: 'John Doe' })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {t('pos:footer.session_time', {
              duration: Math.floor(
                (currentTime.getTime() - sessionStart.getTime()) / (1000 * 60)
              )
            })}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5" />
          <span>{t('pos:footer.transactions', { count: transactionCount })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>{t('pos:footer.daily_total', { amount: formatCurrency(dailyTotal) })}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${isOffline ? "text-muted-foreground/70" : "text-primary-foreground/70"
          }`}>
          {currentTime.toLocaleTimeString()}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className={`h-6 px-1.5 text-xs ${isOffline
            ? "text-muted-foreground hover:bg-muted-foreground/20"
            : "text-primary-foreground hover:bg-primary-foreground/20"
            }`}
          onClick={handleEndOfDay}
        >
          <FileText className="w-3 h-3 mr-1" />
          {t('pos:footer.end_day')}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-6 px-1.5 text-xs ${isOffline
            ? "text-muted-foreground hover:bg-muted-foreground/20"
            : "text-primary-foreground hover:bg-primary-foreground/20"
            }`}
          onClick={handleLogout}
        >
          <LogOut className="w-3 h-3 mr-1" />
          {t('pos:footer.logout')}
        </Button>
      </div>
    </footer>
  );
}

export default POSFooter;
