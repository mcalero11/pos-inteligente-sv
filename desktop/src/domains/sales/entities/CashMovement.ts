export type CashMovementType = "withdrawal" | "deposit" | "adjustment";

export interface CashMovement {
  id: number;
  sessionId: number;
  type: CashMovementType;
  amount: number;
  reason: string;
  performedBy: number; // User ID
  notes?: string;
  // Backend sync fields
  backendId?: string;
  syncStatus?: "pending" | "synced" | "conflict";
  lastSyncedAt?: string;
  version?: number;
  createdAt: string;
}

export interface CreateCashMovementInput {
  sessionId: number;
  type: CashMovementType;
  amount: number;
  reason: string;
  performedBy: number;
  notes?: string;
}
