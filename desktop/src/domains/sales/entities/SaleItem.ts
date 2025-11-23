export interface SaleItem {
  id: number;
  transactionId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
}

export interface CreateSaleItemInput {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export function calculateItemSubtotal(
  unitPrice: number,
  quantity: number,
  discountAmount: number = 0
): number {
  return Math.round((unitPrice * quantity - discountAmount) * 100) / 100;
}
