import type { SaleItem } from './SaleItem';
import type { PaymentMethod } from './PaymentMethod';

export type SaleStatus = 'pending' | 'completed' | 'voided' | 'refunded';

export interface Sale {
  id: number;
  customerId?: number;
  userId: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: SaleItem[];
}

export interface CreateSaleItemData {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface CreateSaleInput {
  customerId?: number;
  userId: number;
  items: CreateSaleItemData[];
  paymentMethod: PaymentMethod;
  discountAmount?: number;
  notes?: string;
}

export function calculateSaleTotals(
  items: Array<{ price: number; quantity: number; discountAmount?: number }>,
  taxRate: number = 0.13
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity - (item.discountAmount || 0);
    return sum + itemTotal;
  }, 0);

  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
