export type CustomerType = "individual" | "company";
export type DocumentType = "DUI" | "NIT" | "NRC" | "passport";
export type TaxpayerType = "NORMAL" | "GRAN_CONTRIBUYENTE" | "EXENTO";

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  // El Salvador tax identifiers
  nit?: string; // Número de Identificación Tributaria (15 digits)
  nrc?: string; // Número de Registro de Contribuyente
  taxId?: string; // Legacy/generic tax ID
  taxpayerType: TaxpayerType;
  isCompany: boolean;
  isActive: boolean;
  // Backend sync fields
  backendId?: string;
  syncStatus?: "pending" | "synced" | "conflict";
  lastSyncedAt?: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  nit?: string;
  nrc?: string;
  taxId?: string;
  taxpayerType?: TaxpayerType;
  isCompany?: boolean;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  isActive?: boolean;
}

export function isCompanyCustomer(customer: Customer): boolean {
  return customer.isCompany;
}

export function requiresNIT(customer: Customer): boolean {
  return customer.isCompany;
}

export function formatCustomerDocument(customer: Customer): string {
  if (customer.nit) {
    return `NIT: ${customer.nit}`;
  }
  if (customer.nrc) {
    return `NRC: ${customer.nrc}`;
  }
  if (customer.taxId) {
    return `Tax ID: ${customer.taxId}`;
  }
  return "Sin documento";
}

export const CONSUMIDOR_FINAL: Omit<
  Customer,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "backendId"
  | "syncStatus"
  | "lastSyncedAt"
  | "version"
> = {
  name: "Consumidor Final",
  taxpayerType: "NORMAL",
  isCompany: false,
  isActive: true,
};
