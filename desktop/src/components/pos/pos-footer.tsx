import { User, Clock, Receipt, LogOut, FileText } from "lucide-preact";
import { Button } from "@/components/ui/button";

interface POSFooterProps {
  openDialog: (dialogType: string, props?: any) => void;
}

function POSFooter({ openDialog }: POSFooterProps) {
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
    <footer className="bg-primary text-primary-foreground px-4 py-1 flex items-center justify-between text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>Cashier: John Doe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Session:{" "}
            {Math.floor(
              (currentTime.getTime() - sessionStart.getTime()) / (1000 * 60)
            )}
            min
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5" />
          <span>Transactions: {transactionCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Daily Total: ${dailyTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-primary-foreground/70 text-xs">
          {currentTime.toLocaleTimeString()}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/20 h-6 px-1.5 text-xs"
          onClick={handleEndOfDay}
        >
          <FileText className="w-3 h-3 mr-1" />
          End Day (F5)
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/20 h-6 px-1.5 text-xs"
          onClick={handleLogout}
        >
          <LogOut className="w-3 h-3 mr-1" />
          Logout
        </Button>
      </div>
    </footer>
  );
}

export default POSFooter;
