import type { SaleItem } from "./SaleItem";
import type { Payment } from "./Payment";

export type SaleStatus =
  | "draft"
  | "held"
  | "quote"
  | "completed"
  | "cancelled"
  | "refunded";
export type ReturnType = "full" | "partial";

export interface Sale {
  id: number;
  transactionNumber: string;
  customerId?: number;
  userId: number;
  sessionId?: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: SaleStatus;
  notes?: string;
  dteId?: number;
  // Return tracking
  originalTransactionId?: number;
  returnType?: ReturnType;
  // Backend sync fields
  backendId?: string;
  syncStatus?: "pending" | "synced" | "conflict";
  lastSyncedAt?: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
  items?: SaleItem[];
  payments?: Payment[];
}

export interface CreateSaleItemData {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface CreatePaymentData {
  paymentMethod: string;
  amount: number;
  referenceNumber?: string;
  cardLastFour?: string;
  notes?: string;
}

export interface CreateSaleInput {
  customerId?: number;
  userId: number;
  sessionId?: number;
  items: CreateSaleItemData[];
  payments: CreatePaymentData[];
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
