import POSHeader from "@/components/pos/pos-header";
import DialogManager from "@/components/dialogs/DialogManager";
import POSFooter from "@/components/pos/pos-footer";
import POSProducts from "@/components/pos/pos-products";
import POSCart from "@/components/pos/pos-cart";
import { useRenderTracker, usePerformanceTracker } from "@/hooks/use-render-tracker";
import { useDialog } from "@/hooks/use-dialog";

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
