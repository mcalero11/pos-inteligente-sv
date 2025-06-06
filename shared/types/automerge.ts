// Automerge-specific schemas
// These types define the CRDT document structure

import { Product, Sale, CashRegister, SaleItem, CashMovement as DomainCashMovement } from './domain';

// Main Automerge document for each terminal
export interface TerminalDocument {
  // Identification
  terminal_id: string;
  last_updated: number;  // timestamp

  // Current cash register state
  cash_register: CashRegister;

  // Current day sales (archived on cash register close)
  today_sales: Sale[];

  // Current cart (sale in progress)
  current_cart: CurrentCart | null;

  // Local product cache (most used only)
  product_cache: ProductCache;

  // Daily cash movements
  cash_movements: LocalCashMovement[];
}

export interface CurrentCart {
  id: string;
  customer_id?: string;
  items: CartItem[];
  created_at: number;
  last_modified: number;
}

export interface CartItem extends SaleItem {
  // Additional cart fields
  notes?: string;
  modifiers?: ItemModifier[];
}

export interface ItemModifier {
  name: string;
  price_adjustment: number;
}

export interface ProductCache {
  // Map of product_id -> Product
  // Only keeps best-selling products for quick offline access
  products: { [key: string]: Product };
  last_updated: number;
}

export interface LocalCashMovement extends DomainCashMovement {
  id: string;
  type: 'SALE' | 'WITHDRAWAL' | 'DEPOSIT' | 'ADJUSTMENT' | 'OPENING';
  amount: number;
  sale_id?: string;
  reason?: string;
  timestamp: number;
  user_id: string;
}

// Synchronization message between nodes
export interface SyncMessage {
  from_terminal: string;
  to_terminal?: string;  // undefined = broadcast
  changes: Uint8Array;   // Automerge changes
  timestamp: number;
  sequence: number;      // For message ordering
}

// Local synchronization state
export interface LocalSyncState {
  peers: PeerInfo[];
  pending_sync: PendingSync[];
  last_server_sync: number;
}

export interface PeerInfo {
  terminal_id: string;
  last_seen: number;
  ip_address?: string;
  is_online: boolean;
}

export interface PendingSync {
  id: string;
  changes: Uint8Array;
  created_at: number;
  retry_count: number;
  last_error?: string;
}

// Helper functions for working with Automerge
export const createEmptyTerminalDocument = (terminalId: string): TerminalDocument => ({
  terminal_id: terminalId,
  last_updated: Date.now(),
  cash_register: {
    terminal_id: terminalId,
    status: 'CLOSED',
    opening_balance: 0,
    current_balance: 0,
    expected_balance: 0
  },
  today_sales: [],
  current_cart: null,
  product_cache: {
    products: {},
    last_updated: Date.now()
  },
  cash_movements: []
});

// Automerge configuration
export interface AutomergeConfig {
  // How many days of sales to keep in the document
  sales_retention_days: number;

  // Maximum size of product cache
  max_cached_products: number;

  // Compaction interval
  compact_interval_hours: number;

  // Enable P2P synchronization
  enable_p2p_sync: boolean;

  // Port for P2P synchronization
  p2p_port: number;
}
