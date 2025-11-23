export type CustomerType = 'individual' | 'company';
export type DocumentType = 'DUI' | 'NIT' | 'NRC' | 'passport';

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customerType: CustomerType;
  documentType?: DocumentType;
  documentNumber?: string;
  nrc?: string; // Número de Registro de Contribuyente (for companies)
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customerType: CustomerType;
  documentType?: DocumentType;
  documentNumber?: string;
  nrc?: string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  isActive?: boolean;
}

export function isCompanyCustomer(customer: Customer): boolean {
  return customer.customerType === 'company';
}

export function requiresNIT(customer: Customer): boolean {
  return customer.customerType === 'company' || customer.documentType === 'NIT';
}

export function formatCustomerDocument(customer: Customer): string {
  if (!customer.documentType || !customer.documentNumber) {
    return 'Sin documento';
  }
  return `${customer.documentType}: ${customer.documentNumber}`;
}

export const CONSUMIDOR_FINAL: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Consumidor Final',
  customerType: 'individual',
  isActive: true,
};
