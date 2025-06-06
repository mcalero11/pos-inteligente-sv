// Domain types shared across all applications
// This file is the source of truth for basic types

// Core domain types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  tax_rate: number;
  category_id: string;
  barcode?: string;
  unit: 'UNIT' | 'KG' | 'LB' | 'L';
  stock_trackable: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tax_id?: string;  // NIT/DUI for El Salvador
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;  // Name snapshot at time of sale
  quantity: number;
  unit_price: number;   // Price at time of sale
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
}

export interface Sale {
  id: string;
  terminal_id: string;
  cashier_id: string;
  customer_id?: string;
  items: SaleItem[];
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  payment_method: PaymentMethod;
  status: SaleStatus;
  invoice_number?: string;
  created_at: string;
  completed_at?: string;
  voided_at?: string;
  void_reason?: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED';
export type SaleStatus = 'PENDING' | 'COMPLETED' | 'VOIDED';

// Cash register types
export interface CashRegister {
  terminal_id: string;
  status: 'CLOSED' | 'OPEN';
  opening_balance: number;
  current_balance: number;
  expected_balance: number;
  opened_at?: string;
  opened_by?: string;
  closed_at?: string;
  closed_by?: string;
}

export interface CashMovement {
  id: string;
  terminal_id: string;
  type: 'SALE' | 'WITHDRAWAL' | 'DEPOSIT' | 'ADJUSTMENT' | 'OPENING';
  amount: number;
  reason?: string;
  reference_id?: string;  // Sale ID if applicable
  created_at: string;
  created_by: string;
}

// Configuration types
export interface Terminal {
  id: string;
  name: string;
  store_id: string;
  active: boolean;
  last_sync: string;
  config: TerminalConfig;
}

export interface TerminalConfig {
  printer_enabled: boolean;
  printer_type?: 'THERMAL' | 'INKJET';
  printer_port?: string;
  cash_drawer_enabled: boolean;
  cash_drawer_port?: string;
  barcode_scanner_enabled: boolean;
  offline_days_limit: number;  // Days of data to keep offline
}

// Synchronization types
export interface SyncStatus {
  terminal_id: string;
  last_sync_at: string;
  pending_changes: number;
  sync_in_progress: boolean;
  last_error?: string;
}

// Type utilities
export type UUID = string;
export type ISODateTime = string;
export type Currency = number;  // Stored in cents

// Shared constants
export const TAX_RATE_IVA = 0.13;  // 13% IVA in El Salvador
export const MAX_OFFLINE_DAYS = 7;
export const SYNC_INTERVAL_MS = 30000;  // 30 seconds
