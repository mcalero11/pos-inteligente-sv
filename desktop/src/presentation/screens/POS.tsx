import POSHeader from "@/domains/sales/components/pos-header";
import DialogManager from "@/presentation/dialogs/DialogManager";
import POSFooter from "@/domains/sales/components/pos-footer";
import POSProducts from "@/domains/products/components/pos-products";
import POSCart from "@/domains/sales/components/pos-cart";
import { useRenderTracker, usePerformanceTracker } from "@/presentation/hooks/use-render-tracker";
import { useDialog } from "@/presentation/hooks/use-dialog";

function POS() {
  const { currentDialog, openDialog, closeDialog } = useDialog();

  // Track renders for the POS component
  useRenderTracker('POS', { currentDialog });
  usePerformanceTracker('POS');

  return (
    <div class="h-screen bg-muted text-foreground flex flex-col">
      <POSHeader openDialog={openDialog} />

      <main class="flex-1 flex overflow-hidden">
        <POSProducts />
        <POSCart />
      </main>

      <POSFooter openDialog={openDialog} />

      {/* Centralized Dialog System */}
      <DialogManager
        currentDialog={currentDialog}
        onClose={closeDialog}
        openDialog={openDialog}
      />
    </div>
  );
}

export default POS;
