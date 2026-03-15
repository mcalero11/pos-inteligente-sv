export type PaymentMethodType =
  | "cash"
  | "card"
  | "transfer"
  | "check"
  | "credit";

export interface Payment {
  id: number;
  transactionId: number;
  paymentMethod: PaymentMethodType;
  amount: number;
  referenceNumber?: string;
  cardLastFour?: string;
  notes?: string;
  // Backend sync fields
  backendId?: string;
  syncStatus?: "pending" | "synced" | "conflict";
  lastSyncedAt?: string;
  version?: number;
  createdAt: string;
}

export interface CreatePaymentInput {
  transactionId: number;
  paymentMethod: PaymentMethodType;
  amount: number;
  referenceNumber?: string;
  cardLastFour?: string;
  notes?: string;
}
