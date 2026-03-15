export type PriceTier = "retail" | "partner" | "vip";

export interface SaleItem {
  id: number;
  transactionId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  appliedPriceTier?: PriceTier;
  // Pharmacy-specific fields
  doctorName?: string;
  doctorLicense?: string;
  requiresPrescription?: boolean;
  createdAt: string;
}

export interface CreateSaleItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  appliedPriceTier?: PriceTier;
  doctorName?: string;
  doctorLicense?: string;
  requiresPrescription?: boolean;
}

export function calculateItemSubtotal(
  unitPrice: number,
  quantity: number,
  discountAmount: number = 0
): number {
  return Math.round((unitPrice * quantity - discountAmount) * 100) / 100;
}
