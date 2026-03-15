export type PaymentMethod = "cash" | "card" | "transfer" | "mixed";

export interface PaymentDetails {
  method: PaymentMethod;
  amountTendered?: number;
  change?: number;
  cardLast4?: string;
  referenceNumber?: string;
}

export function calculateChange(amountTendered: number, total: number): number {
  return Math.max(0, Math.round((amountTendered - total) * 100) / 100);
}

export function isValidPayment(
  payment: PaymentDetails,
  total: number
): boolean {
  if (payment.method === "cash") {
    return (payment.amountTendered ?? 0) >= total;
  }
  return true;
}
