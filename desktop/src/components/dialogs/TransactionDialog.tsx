import { ShoppingCart, Plus, Minus, Trash2, Calculator, CreditCard } from "lucide-preact";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "preact/hooks";
import { usePOSTranslation } from "@/hooks/use-pos-translation";

interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface TransactionDialogProps {
  onClose: () => void;
  onComplete?: (transaction: {
    items: TransactionItem[];
    total: number;
  }) => void;
  customerName?: string;
}

function TransactionDialog({
  onClose,
  onComplete,
  customerName = "General Customer",
}: TransactionDialogProps) {
  const { t, formatCurrency, getPaymentMethodLabel } = usePOSTranslation();
  const [items, setItems] = useState<TransactionItem[]>([
    // Sample items for demo
    { id: "1", name: "Coffee", price: 2.5, quantity: 2, total: 5.0 },
    { id: "2", name: "Sandwich", price: 8.95, quantity: 1, total: 8.95 },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const paymentOptions = [
    { value: 'cash', label: getPaymentMethodLabel('cash') },
    { value: 'card', label: getPaymentMethodLabel('card') },
    { value: 'debit', label: getPaymentMethodLabel('debit') },
    { value: 'transfer', label: getPaymentMethodLabel('transfer') },
    { value: 'check', label: getPaymentMethodLabel('check') },
  ];

  const updateQuantity = (id: string, change: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change);
            return {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.13; // 13% tax
  const total = subtotal + tax;

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ items, total });
    }
    onClose();
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ShoppingCart class="w-5 h-5 text-primary dark:text-primary" />
          <span class="font-medium">{t('dialogs:transaction.customer')} {customerName}</span>
        </div>
        <div class="text-sm text-muted-foreground">
          {t('dialogs:transaction.transaction_number', { number: Date.now().toString().slice(-6) })}
        </div>
      </div>

      <div class="border rounded-lg">
        <div class="bg-muted p-3 rounded-t-lg">
          <div class="grid grid-cols-12 gap-2 text-sm font-medium">
            <div class="col-span-5">{t('dialogs:transaction_detailed.item')}</div>
            <div class="col-span-2 text-right">{t('dialogs:transaction_detailed.price')}</div>
            <div class="col-span-2 text-center">{t('dialogs:transaction_detailed.qty')}</div>
            <div class="col-span-2 text-right">{t('dialogs:transaction_detailed.total')}</div>
            <div class="col-span-1"></div>
          </div>
        </div>

        <div class="divide-y">
          {items.map((item) => (
            <div key={item.id} class="p-3">
              <div class="grid grid-cols-12 gap-2 items-center">
                <div class="col-span-5">
                  <span class="font-medium">{item.name}</span>
                </div>
                <div class="col-span-2 text-right text-sm">
                  {formatCurrency(item.price)}
                </div>
                <div class="col-span-2 flex items-center justify-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    class="w-6 h-6 p-0"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus class="w-3 h-3" />
                  </Button>
                  <span class="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    class="w-6 h-6 p-0"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus class="w-3 h-3" />
                  </Button>
                </div>
                <div class="col-span-2 text-right font-medium">
                  {formatCurrency(item.total)}
                </div>
                <div class="col-span-1 flex justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    class="w-6 h-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 class="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length === 0 && (
        <div class="text-center py-8 text-muted-foreground">
          <ShoppingCart class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('dialogs:transaction_detailed.no_items')}</p>
        </div>
      )}

      {items.length > 0 && (
        <>
          {/* Payment Method Selection */}
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <CreditCard class="w-4 h-4 text-primary" />
              <label class="text-sm font-medium">{t('dialogs:transaction.payment_method')}</label>
            </div>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('dialogs:transaction.select_payment')} />
              </SelectTrigger>
              <SelectContent>
                {paymentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Summary */}
          <div class="bg-primary-light dark:bg-primary-dark p-4 rounded-lg space-y-2">
            <div class="flex justify-between text-sm">
              <span>{t('dialogs:transaction_detailed.subtotal')}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>{t('dialogs:transaction_detailed.tax')}</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div class="flex justify-between text-lg font-semibold border-t pt-2">
              <span>{t('dialogs:transaction_detailed.total')}</span>
              <span class="text-primary dark:text-primary">
                {formatCurrency(total)}
              </span>
            </div>
            <div class="flex justify-between text-sm text-muted-foreground border-t pt-2">
              <span>{t('dialogs:transaction_detailed.method')}</span>
              <span>{paymentOptions.find(option => option.value === paymentMethod)?.label}</span>
            </div>
          </div>
        </>
      )}

      <div class="flex gap-2">
        <Button variant="outline" class="flex-1" onClick={onClose}>
          {t('common:buttons.cancel')}
        </Button>
        <Button
          class="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground dark:bg-primary dark:hover:bg-primary-hover dark:text-primary-foreground"
          onClick={handleComplete}
          disabled={items.length === 0}
        >
          <Calculator class="w-4 h-4 mr-2" />
          {t('dialogs:transaction.complete')}
        </Button>
      </div>
    </div>
  );
}

export default TransactionDialog;
