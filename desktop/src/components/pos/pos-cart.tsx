import { ShoppingCart, Trash2, Minus, Plus, CreditCard } from "lucide-preact";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState } from "preact/hooks";

// Mock data - you can replace this with actual data later
const mockCart = [
  { id: 1, name: "Coffee - Medium Roast", price: 12.99, quantity: 2 },
  { id: 2, name: "Sandwich - Turkey Club", price: 8.5, quantity: 1 },
];

// Mock customer data
const selectedCustomer = { type: "regular", name: "General Customer" };

const getCustomerTypeInfo = (type: string) => {
  const types = {
    regular: { name: "Regular", discount: 0 },
    member: { name: "Member", discount: 5 },
    vip: { name: "VIP", discount: 10 },
  };
  return types[type as keyof typeof types] || types.regular;
};

/// Right panel - Cart
function POSCart() {
  const [cart, setCart] = useState(mockCart);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const processPayment = () => {
    // Placeholder for payment processing logic
    globalThis.console?.log("Processing payment:", {
      paymentMethod,
      total,
      amountReceived,
    });
    setShowPayment(false);
    setCart([]); // Clear cart after successful payment
  };

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col h-full">
      {/* Cart Header - Fixed */}
      <div className="p-6 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-card-foreground">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCart([])}
            disabled={cart.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear (F3)
          </Button>
        </div>
      </div>

      {/* Cart Items - Scrollable */}
      <div className="flex-1 overflow-auto p-6 min-h-0">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Cart is empty</p>
            <p className="text-sm">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-primary-light rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-card-foreground">
                    {item.name}
                  </h4>
                  <p className="text-primary font-semibold">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-medium text-card-foreground">
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary - Fixed at bottom */}
      {cart.length > 0 && (
        <div className="p-6 border-t border-border bg-muted shrink-0">
          <div className="space-y-2 mb-4 text-card-foreground">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {selectedCustomer.type !== "regular" && (
              <div className="text-xs text-primary">
                {getCustomerTypeInfo(selectedCustomer.type).discount}% discount
                applied
              </div>
            )}
          </div>

          <Button
            className="w-full h-12 text-lg bg-primary hover:bg-primary-hover text-primary-foreground"
            size="lg"
            onClick={() => setShowPayment(true)}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Checkout (F4)
          </Button>

          {/* Simple Payment Modal */}
          {showPayment && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">
                  Process Payment
                </h3>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      ${total.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Customer: {selectedCustomer.name}
                      {selectedCustomer.type !== "regular" &&
                        ` (${getCustomerTypeInfo(selectedCustomer.type).name})`}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-card-foreground">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full p-2 border border-border rounded bg-card text-card-foreground"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="digital">Digital Wallet</option>
                    </select>
                  </div>

                  {paymentMethod === "cash" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block text-card-foreground">
                        Amount Received
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
                        Number.parseFloat(amountReceived) >= total && (
                          <p className="text-sm text-primary mt-1">
                            Change: $
                            {(
                              Number.parseFloat(amountReceived) - total
                            ).toFixed(2)}
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
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
                      onClick={processPayment}
                      disabled={
                        paymentMethod === "cash" &&
                        (!amountReceived ||
                          Number.parseFloat(amountReceived) < total)
                      }
                    >
                      Complete Sale
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
