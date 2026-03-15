import { useState } from "preact/hooks";
import POSHeader from "@/domains/sales/components/pos-header";
import DialogManager from "@/presentation/dialogs/DialogManager";
import POSFooter from "@/domains/sales/components/pos-footer";
import POSProducts from "@/domains/products/components/pos-products";
import POSCart from "@/domains/sales/components/pos-cart";
import {
  useRenderTracker,
  usePerformanceTracker,
} from "@/presentation/hooks/use-render-tracker";
import { useDialog } from "@/presentation/hooks/use-dialog";
import { useCart } from "@/domains/sales/hooks/useCart";
import { useProducts } from "@/domains/products/hooks/useProducts";
import { useCategories } from "@/domains/products/hooks/useCategories";

function POS() {
  const { currentDialog, openDialog, closeDialog } = useDialog();

  // Category filtering state
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >();

  // Cart state - lifted to parent for sharing between components
  const cart = useCart();

  // Categories from database
  const categories = useCategories();

  // Products from database (filtered by category)
  const {
    products,
    loading: productsLoading,
    getProductByBarcode,
  } = useProducts({
    categoryId: selectedCategoryId,
  });

  // Track renders for the POS component
  useRenderTracker("POS", { currentDialog });
  usePerformanceTracker("POS");

  return (
    <div class="h-screen bg-muted text-foreground flex flex-col">
      <POSHeader openDialog={openDialog} />

      <main class="flex-1 flex overflow-hidden">
        <POSProducts
          products={products}
          loading={productsLoading}
          categories={categories.categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          onAddToCart={cart.addItem}
          onBarcodeScanned={getProductByBarcode}
        />
        <POSCart
          items={cart.items}
          itemCount={cart.itemCount}
          subtotal={cart.subtotal}
          taxAmount={cart.taxAmount}
          total={cart.total}
          isEmpty={cart.isEmpty}
          cart={cart.cart}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onClear={cart.clear}
          openDialog={openDialog}
        />
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
