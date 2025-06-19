import Logo from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Settings, User, HelpCircle, Users } from "lucide-preact";

// Hardcoded placeholder data and functions
const selectedCustomer = {
  name: "General Customer",
  type: "general" as "general" | "partner" | "vip",
};

const getCustomerTypeInfo = (type: string) => {
  switch (type) {
    case "partner":
      return { name: "Partner" };
    case "vip":
      return { name: "VIP" };
    default:
      return { name: "General" };
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const hasPermission = (_permission: string) => {
  // Placeholder function - return true for all permissions for now
  return true;
};

interface POSHeaderProps {
  openDialog: (dialogType: string, props?: any) => void;
}

function POSHeader({ openDialog }: POSHeaderProps) {
  return (
    <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Logo className="h-8 w-8" />
        <Badge
          variant="default"
          className="bg-primary-light text-primary dark:bg-primary-dark dark:text-primary"
        >
          Terminal 1
        </Badge>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary-hover hover:bg-primary-light dark:text-primary dark:hover:text-primary dark:hover:bg-primary-dark"
                onClick={() => openDialog("help")}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show/Hide Keyboard Shortcuts (F6)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => openDialog("customers")}
          className="border-primary/20 text-primary hover:bg-primary-light dark:border-primary/30 dark:text-primary dark:hover:bg-primary-dark"
        >
          <Users className="h-4 w-4 mr-2" />
          Customers (F7)
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
            {getCustomerTypeInfo(selectedCustomer.type).name}
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openDialog("systemMenu")}
          className="border-primary/20 text-primary hover:bg-primary-light dark:border-primary/30 dark:text-primary dark:hover:bg-primary-dark"
        >
          <Settings className="w-4 h-4 mr-2" />
          Menu
        </Button>
      </div>
    </header>
  );
}

export default POSHeader;
