export type StockMovementType =
  | "purchase"
  | "sale"
  | "return"
  | "adjustment"
  | "loss"
  | "transfer";

export interface StockMovement {
  id: number;
  productId: number;
  movementType: StockMovementType;
  quantity: number; // Positive for increases, negative for decreases
  referenceType?: string; // 'transaction', 'purchase_order', 'manual', etc.
  referenceId?: number;
  unitCost?: number;
  notes?: string;
  userId?: number;
  // Backend sync fields
  backendId?: string;
  syncStatus?: "pending" | "synced" | "conflict";
  lastSyncedAt?: string;
  version?: number;
  createdAt: string;
}

export interface CreateStockMovementInput {
  productId: number;
  movementType: StockMovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  unitCost?: number;
  notes?: string;
  userId?: number;
}
