// Main entry point for shared types

// Export all domain types
export * from './domain';

// Export Automerge-specific types
export * from './automerge';

// Re-export commonly used types for convenience
export type {
  Product,
  Customer,
  Sale,
  SaleItem,
  PaymentMethod,
  SaleStatus,
  Terminal,
  TerminalConfig
} from './domain';

export type {
  TerminalDocument,
  CurrentCart,
  CartItem,
  SyncMessage,
  AutomergeConfig
} from './automerge';
