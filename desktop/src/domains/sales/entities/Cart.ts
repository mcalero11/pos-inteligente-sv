import type { Product } from "../../products/entities/Product";

export interface CartItem {
  product: Product;
  quantity: number;
  discountAmount: number;
}

export interface Cart {
  items: CartItem[];
  customerId?: number;
  notes?: string;
}

export function createEmptyCart(): Cart {
  return {
    items: [],
    customerId: undefined,
    notes: undefined,
  };
}

export function addToCart(
  cart: Cart,
  product: Product,
  quantity: number = 1
): Cart {
  const existingIndex = cart.items.findIndex(
    (item) => item.product.id === product.id
  );

  if (existingIndex >= 0) {
    const updatedItems = [...cart.items];
    updatedItems[existingIndex] = {
      ...updatedItems[existingIndex],
      quantity: updatedItems[existingIndex].quantity + quantity,
    };
    return { ...cart, items: updatedItems };
  }

  return {
    ...cart,
    items: [...cart.items, { product, quantity, discountAmount: 0 }],
  };
}

export function removeFromCart(cart: Cart, productId: number): Cart {
  return {
    ...cart,
    items: cart.items.filter((item) => item.product.id !== productId),
  };
}

export function updateCartItemQuantity(
  cart: Cart,
  productId: number,
  quantity: number
): Cart {
  if (quantity <= 0) {
    return removeFromCart(cart, productId);
  }

  return {
    ...cart,
    items: cart.items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    ),
  };
}

export function calculateCartTotals(
  cart: Cart,
  taxRate: number = 0.13
): { subtotal: number; taxAmount: number; total: number; itemCount: number } {
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity - item.discountAmount;
  }, 0);

  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount,
  };
}

export function clearCart(): Cart {
  return createEmptyCart();
}
