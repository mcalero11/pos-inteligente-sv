export type SessionStatus = "open" | "closed";

export interface CashRegisterSession {
  id: number;
  userId: number;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number; // closing_balance - expected_balance
  status: SessionStatus;
  notes?: string;
  openedAt: string;
  closedAt?: string;
  // Backend sync fields
  backendId?: string;
  syncStatus?: "pending" | "synced" | "conflict";
  lastSyncedAt?: string;
  version?: number;
}

export interface CreateSessionInput {
  userId: number;
  openingBalance: number;
  notes?: string;
}

export interface CloseSessionInput {
  closingBalance: number;
  notes?: string;
}
