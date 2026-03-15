export interface Product {
  id: number;
  categoryId?: number;
  barcode?: string;
  name: string;
  description?: string;
  price: number;
  partnerPrice: number;
  vipPrice: number;
  discountPercentage: number;
  stockQuantity: number;
  cost?: number;
  isActive: boolean;
  // Backend sync fields
  backendId?: string;
  syncStatus?: "pending" | "synced" | "conflict";
  lastSyncedAt?: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  categoryId?: number;
  barcode?: string;
  name: string;
  description?: string;
  price: number;
  partnerPrice?: number;
  vipPrice?: number;
  discountPercentage?: number;
  stockQuantity?: number;
  cost?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

export type PriceType = "regular" | "partner" | "vip";

export function getProductPrice(
  product: Product,
  priceType: PriceType = "regular"
): number {
  switch (priceType) {
    case "partner":
      return product.partnerPrice || product.price;
    case "vip":
      return product.vipPrice || product.price;
    default:
      return product.price;
  }
}

export function calculateDiscountedPrice(product: Product): number {
  if (product.discountPercentage <= 0) {
    return product.price;
  }
  const discount = product.price * (product.discountPercentage / 100);
  return Math.round((product.price - discount) * 100) / 100;
}
