import { ShoppingCart, Plus, Minus, Trash2, Calculator } from "lucide-preact";
import { Button } from "@/components/ui/button";
import { useState } from "preact/hooks";

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
  const [items, setItems] = useState<TransactionItem[]>([
    // Sample items for demo
    { id: "1", name: "Coffee", price: 2.5, quantity: 2, total: 5.0 },
    { id: "2", name: "Sandwich", price: 8.95, quantity: 1, total: 8.95 },
  ]);

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
          <span class="font-medium">Customer: {customerName}</span>
        </div>
        <div class="text-sm text-muted-foreground">
          Transaction #{Date.now().toString().slice(-6)}
        </div>
      </div>

      <div class="border rounded-lg">
        <div class="bg-muted p-3 rounded-t-lg">
          <div class="grid grid-cols-12 gap-2 text-sm font-medium">
            <div class="col-span-5">Item</div>
            <div class="col-span-2 text-right">Price</div>
            <div class="col-span-2 text-center">Qty</div>
            <div class="col-span-2 text-right">Total</div>
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
                  ${item.price.toFixed(2)}
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
                  ${item.total.toFixed(2)}
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
          <p>No items in transaction</p>
        </div>
      )}

      {items.length > 0 && (
        <div class="bg-primary-light dark:bg-primary-dark p-4 rounded-lg space-y-2">
          <div class="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Tax (13%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span class="text-primary dark:text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div class="flex gap-2">
        <Button variant="outline" class="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          class="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground dark:bg-primary dark:hover:bg-primary-hover dark:text-primary-foreground"
          onClick={handleComplete}
          disabled={items.length === 0}
        >
          <Calculator class="w-4 h-4 mr-2" />
          Complete Transaction
        </Button>
      </div>
    </div>
  );
}

export default TransactionDialog;
