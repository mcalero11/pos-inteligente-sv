import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  CreditCard,
  Loader2,
} from "lucide-preact";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Input } from "@/shared/ui/input";
import { useState } from "preact/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useRenderTracker } from "@/presentation/hooks/use-render-tracker";
import { usePOSTranslation } from "@/presentation/hooks/use-pos-translation";
import {
  useFinancialSettings,
  useCustomerDefaults,
} from "@/presentation/providers";
import type { CartItem, Cart } from "../entities/Cart";
import { useSales } from "../hooks/useSales";
import { toast } from "sonner";
import type { PaymentMethod } from "../entities/PaymentMethod";

interface POSCartProps {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  isEmpty: boolean;
  cart: Cart;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClear: () => void;
  openDialog?: (dialogType: string, props?: any) => void;
}

/// Right panel - Cart
function POSCart({
  items,
  itemCount,
  subtotal,
  taxAmount,
  total,
  isEmpty,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  openDialog,
}: POSCartProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const { t, formatCurrency, getCustomerTypeLabel, getPaymentMethodLabel } =
    usePOSTranslation();
  const financialSettings = useFinancialSettings();
  const customerDefaults = useCustomerDefaults();
  const { createSale, loading } = useSales();

  // Track renders for the cart component
  useRenderTracker("POSCart", {
    items,
    showPayment,
    paymentMethod,
    amountReceived,
  });

  // Use settings-based customer data
  const selectedCustomer = {
    type: customerDefaults?.defaultCustomerType || "regular",
    name: customerDefaults?.defaultCustomerName || "Cliente General",
  };

  // Tax rate from settings (for display)
  const taxRate = financialSettings?.taxRate || 13;

  const handleCheckoutClick = () => {
    if (isEmpty) {
      toast.error("El carrito está vacío");
      return;
    }
    setShowPayment(true);
  };

  const processPayment = async () => {
    try {
      const loadingToastId = toast.loading("Procesando venta...");

      // Hardcoded userId = 1 (as per user decision)
      const sale = await createSale(cart, 1, paymentMethod as PaymentMethod);

      toast.dismiss(loadingToastId);

      if (sale) {
        toast.success("Venta completada exitosamente");
        setShowPayment(false);
        setAmountReceived(""); // Reset amount received for next sale
        onClear(); // Clear cart after successful sale

        // Open receipt preview dialog
        if (openDialog) {
          openDialog("receiptPreview", { sale });
        }
      } else {
        toast.error("Error al completar la venta");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col h-full">
      {/* Cart Header - Fixed */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-card-foreground">
            <ShoppingCart className="w-5 h-5 text-primary" />
            {t("pos:cart.title_with_count", { count: itemCount })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={isEmpty}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("pos:cart.clear_button")}
          </Button>
        </div>
      </div>

      {/* Cart Items - Scrollable */}
      <div className="flex-1 overflow-auto p-6 min-h-0">
        {isEmpty ? (
          <div className="text-center text-muted-foreground mt-8">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>{t("pos:cart.empty")}</p>
            <p className="text-sm">{t("pos:cart.empty_message")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-primary-light rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-card-foreground">
                    {item.product.name}
                  </h4>
                  <p className="text-primary font-semibold">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateQuantity(item.product.id, item.quantity - 1)
                    }
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-medium text-card-foreground">
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateQuantity(item.product.id, item.quantity + 1)
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveItem(item.product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary - Fixed at bottom */}
      {!isEmpty && (
        <div className="p-6 border-t border-border bg-muted shrink-0">
          <div className="space-y-2 mb-4 text-card-foreground">
            <div className="flex justify-between">
              <span>{t("pos:cart.subtotal")}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("pos:cart.tax", { rate: taxRate })}</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t("pos:cart.total")}</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {selectedCustomer.type !== "regular" && (
              <div className="text-xs text-primary">
                {t("pos:cart.discount_applied", { percent: 5 })}
              </div>
            )}
          </div>

          <Button
            className="w-full h-12 text-lg bg-primary hover:bg-primary-hover text-primary-foreground"
            size="lg"
            onClick={handleCheckoutClick}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {t("pos:cart.checkout_button")}
          </Button>

          {/* Simple Payment Modal */}
          {showPayment && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">
                  {t("pos:cart.process_payment")}
                </h3>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("pos:header.customer", {
                        name: selectedCustomer.name,
                      })}
                      {selectedCustomer.type !== "regular" &&
                        ` (${getCustomerTypeLabel(selectedCustomer.type as "general" | "partner" | "vip")})`}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-card-foreground">
                      {t("pos:cart.payment_method")}
                    </label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value: string) => setPaymentMethod(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          {getPaymentMethodLabel("cash")}
                        </SelectItem>
                        <SelectItem value="card">
                          {getPaymentMethodLabel("card")}
                        </SelectItem>
                        <SelectItem value="digital">
                          {getPaymentMethodLabel("digital")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "cash" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block text-card-foreground">
                        {t("pos:cart.amount_received")}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amountReceived}
                        onInput={(e: any) => setAmountReceived(e.target.value)}
                        className="text-lg h-12"
                      />
                      {amountReceived &&
                        !isNaN(Number.parseFloat(amountReceived)) &&
                        Number.parseFloat(amountReceived) >= total && (
                          <p className="text-sm text-primary mt-1">
                            {t("pos:cart.change", {
                              amount: Number.parseFloat(amountReceived) - total,
                            })}
                          </p>
                        )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowPayment(false)}
                    >
                      {t("common:buttons.cancel")}
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
                      onClick={processPayment}
                      disabled={
                        loading ||
                        (paymentMethod === "cash" &&
                          (!amountReceived ||
                            Number.parseFloat(amountReceived) < total))
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        t("pos:cart.complete_sale")
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default POSCart;
