import { useState, useCallback, useMemo } from 'preact/hooks';
import type { Product } from '../../products/entities/Product';
import type { Cart, CartItem } from '../entities/Cart';
import {
  createEmptyCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  calculateCartTotals,
  clearCart,
} from '../entities/Cart';
import { settingsService } from '../../settings/services/SettingsService';

interface UseCartReturn {
  cart: Cart;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setCustomer: (customerId: number | undefined) => void;
  setNotes: (notes: string | undefined) => void;
  clear: () => void;
  isEmpty: boolean;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart>(createEmptyCart);
  const [taxRate, setTaxRate] = useState(0.13);

  // Load tax rate from settings
  useState(() => {
    settingsService.get('taxRate').then((rate) => {
      if (typeof rate === 'number') {
        setTaxRate(rate);
      }
    });
  });

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setCart((current) => addToCart(current, product, quantity));
  }, []);

  const removeItem = useCallback((productId: number) => {
    setCart((current) => removeFromCart(current, productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setCart((current) => updateCartItemQuantity(current, productId, quantity));
  }, []);

  const setCustomer = useCallback((customerId: number | undefined) => {
    setCart((current) => ({ ...current, customerId }));
  }, []);

  const setNotes = useCallback((notes: string | undefined) => {
    setCart((current) => ({ ...current, notes }));
  }, []);

  const clear = useCallback(() => {
    setCart(clearCart(cart));
  }, [cart]);

  const totals = useMemo(() => calculateCartTotals(cart, taxRate), [cart, taxRate]);

  return {
    cart,
    items: cart.items,
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,
    addItem,
    removeItem,
    updateQuantity,
    setCustomer,
    setNotes,
    clear,
    isEmpty: cart.items.length === 0,
  };
}
