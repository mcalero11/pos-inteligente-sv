import { Receipt, Printer, X } from "lucide-preact";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { usePOSTranslation } from "@/presentation/hooks/use-pos-translation";
import type { Sale } from "@/domains/sales/entities/Sale";
import { toast } from "sonner";

interface ReceiptPreviewDialogProps {
  sale: Sale;
  onClose: () => void;
}

function ReceiptPreviewDialog({ sale, onClose }: ReceiptPreviewDialogProps) {
  const { t, formatCurrency } = usePOSTranslation();

  const handlePrint = () => {
    toast.info("Función de impresión próximamente");
  };

  // Format date and time
  const saleDate = new Date(sale.createdAt);
  const formattedDate = saleDate.toLocaleDateString("es-SV");
  const formattedTime = saleDate.toLocaleTimeString("es-SV");

  // Get payment method from first payment (we only support single payment for now)
  const paymentMethod = sale.payments?.[0]?.paymentMethod || "cash";
  const paymentAmount = sale.payments?.[0]?.amount || sale.total;

  return (
    <div class="space-y-4">
      {/* Header Section */}
      <div class="text-center space-y-2 pb-4 border-b border-border">
        <div class="flex items-center justify-center gap-2">
          <Receipt class="w-6 h-6 text-primary" />
          <h2 class="text-2xl font-bold text-card-foreground">
            {t("dialogs:receipt.title")}
          </h2>
        </div>
        <div class="text-sm text-muted-foreground space-y-1">
          <p class="font-mono text-base">
            {t("dialogs:receipt.transaction_number", {
              number: sale.transactionNumber,
            })}
          </p>
          <p>
            {formattedDate} - {formattedTime}
          </p>
          <p>{t("dialogs:receipt.cashier", { name: "Cajero #1" })}</p>
        </div>
      </div>

      {/* Items Section */}
      <div class="space-y-3">
        <h3 class="font-semibold text-card-foreground">
          {t("dialogs:receipt.items")}
        </h3>
        <div class="space-y-2">
          {sale.items?.map((item, index) => (
            <div key={index} class="flex justify-between text-sm">
              <div class="flex-1">
                <p class="font-medium text-card-foreground">
                  Producto #{item.productId}
                </p>
                <p class="text-muted-foreground text-xs">
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <div class="font-medium text-card-foreground">
                {formatCurrency(item.totalPrice)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Totals Section */}
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">
            {t("dialogs:transaction_detailed.subtotal")}
          </span>
          <span class="text-card-foreground">
            {formatCurrency(sale.subtotal)}
          </span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">
            {t("dialogs:transaction_detailed.tax")}
          </span>
          <span class="text-card-foreground">
            {formatCurrency(sale.taxAmount)}
          </span>
        </div>
        {sale.discountAmount > 0 && (
          <div class="flex justify-between text-sm text-orange-600">
            <span>Descuento</span>
            <span>-{formatCurrency(sale.discountAmount)}</span>
          </div>
        )}
        <Separator />
        <div class="flex justify-between text-lg font-bold">
          <span class="text-card-foreground">
            {t("dialogs:transaction_detailed.total")}
          </span>
          <span class="text-primary">{formatCurrency(sale.total)}</span>
        </div>
      </div>

      <Separator />

      {/* Payment Section */}
      <div class="bg-primary-light dark:bg-primary-dark p-4 rounded-lg space-y-2">
        <h3 class="font-semibold text-card-foreground">
          {t("dialogs:receipt.payment_info")}
        </h3>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">
            {t("dialogs:receipt.method")}
          </span>
          <span class="text-card-foreground capitalize">{paymentMethod}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">
            {t("dialogs:receipt.amount_paid")}
          </span>
          <span class="text-card-foreground">
            {formatCurrency(paymentAmount)}
          </span>
        </div>
        {paymentMethod === "cash" && paymentAmount > sale.total && (
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">
              {t("dialogs:receipt.change")}
            </span>
            <span class="text-card-foreground font-medium">
              {formatCurrency(paymentAmount - sale.total)}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div class="flex gap-2 pt-2">
        <Button variant="outline" class="flex-1" onClick={handlePrint}>
          <Printer class="w-4 h-4 mr-2" />
          {t("dialogs:receipt.print")}
        </Button>
        <Button
          class="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={onClose}
        >
          <X class="w-4 h-4 mr-2" />
          {t("dialogs:receipt.close")}
        </Button>
      </div>
    </div>
  );
}

export default ReceiptPreviewDialog;
