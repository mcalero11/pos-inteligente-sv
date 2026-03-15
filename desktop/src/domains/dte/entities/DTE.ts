import type { DTEType } from "./DTETypes";

export type DTEStatus =
  | "pending"
  | "signed"
  | "sent"
  | "accepted"
  | "rejected"
  | "error";

export interface DTE {
  id: number;
  transactionId: number;
  dteType: DTEType;
  codigoGeneracion: string;
  numeroControl: string;
  selloRecibido?: string;
  fechaEmision: string;
  jsonData: string;
  signedData?: string;
  status: DTEStatus;
  errorMessage?: string;
  retryCount: number;
  lastRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDTEInput {
  transactionId: number;
  dteType: DTEType;
  jsonData: string;
}

export interface DTESigningResult {
  success: boolean;
  signedData?: string;
  codigoGeneracion?: string;
  numeroControl?: string;
  errorMessage?: string;
}

export interface DTESendResult {
  success: boolean;
  selloRecibido?: string;
  errorMessage?: string;
}

export function isDTEPending(dte: DTE): boolean {
  return dte.status === "pending" || dte.status === "error";
}

export function canRetryDTE(dte: DTE, maxRetries: number = 3): boolean {
  return isDTEPending(dte) && dte.retryCount < maxRetries;
}

export function formatDTEStatus(status: DTEStatus): string {
  const statusLabels: Record<DTEStatus, string> = {
    pending: "Pendiente",
    signed: "Firmado",
    sent: "Enviado",
    accepted: "Aceptado",
    rejected: "Rechazado",
    error: "Error",
  };
  return statusLabels[status] || status;
}
