# CLAUDE-patterns.md

Memory bank file documenting code patterns and conventions for Claude Code context.

## Code Organization Patterns

### Tauri Command Pattern

Commands are the IPC bridge between Preact frontend and Rust backend.

**Rust Side** (`src-tauri/src/commands/`)
```rust
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CommandResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

#[command]
pub async fn sign_dte(payload: DtePayload) -> Result<SignedDte, String> {
    // Validation
    if payload.document.is_empty() {
        return Err("Document cannot be empty".to_string());
    }

    // Business logic via services
    let signed = dte_service::sign(&payload)?;

    Ok(signed)
}
```

**Frontend Side**
```typescript
import { invoke } from '@tauri-apps/api/core';

interface DtePayload {
  document: string;
  certificateId: string;
}

async function signDocument(payload: DtePayload): Promise<SignedDte> {
  try {
    return await invoke<SignedDte>('sign_dte', { payload });
  } catch (error) {
    console.error('DTE signing failed:', error);
    throw error;
  }
}
```

### Service Layer Pattern (Rust)

Services encapsulate business logic, separated from Tauri commands.

```rust
// src-tauri/src/services/dte_signer.rs
pub struct DteSignerService {
    certificate: Certificate,
}

impl DteSignerService {
    pub fn new(cert_path: &str) -> Result<Self, SignerError> {
        let certificate = Certificate::load(cert_path)?;
        Ok(Self { certificate })
    }

    pub fn sign(&self, document: &str) -> Result<SignedDocument, SignerError> {
        let hash = sha256::hash(document);
        let signature = self.certificate.sign(&hash)?;

        Ok(SignedDocument {
            original: document.to_string(),
            signature: base64::encode(&signature),
            timestamp: Utc::now(),
        })
    }
}
```

### Clean Architecture (Go Backend)

**Domain Entity**
```go
// internal/domain/entities/product.go
package entities

type Product struct {
    ID          string
    Name        string
    SKU         string
    Price       decimal.Decimal
    CategoryID  string
    IsActive    bool
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

func (p *Product) Validate() error {
    if p.Name == "" {
        return errors.New("product name is required")
    }
    if p.Price.IsNegative() {
        return errors.New("price cannot be negative")
    }
    return nil
}
```

**Repository Interface**
```go
// internal/domain/repositories/product_repository.go
package repositories

type ProductRepository interface {
    FindByID(ctx context.Context, id string) (*entities.Product, error)
    FindAll(ctx context.Context, filters ProductFilters) ([]entities.Product, error)
    Save(ctx context.Context, product *entities.Product) error
    Delete(ctx context.Context, id string) error
}
```

**Use Case Handler**
```go
// internal/application/handlers/product_handler.go
package handlers

type ProductHandler struct {
    repo repositories.ProductRepository
}

func (h *ProductHandler) CreateProduct(ctx context.Context, dto CreateProductDTO) (*entities.Product, error) {
    product := &entities.Product{
        ID:         uuid.New().String(),
        Name:       dto.Name,
        SKU:        dto.SKU,
        Price:      dto.Price,
        CategoryID: dto.CategoryID,
        IsActive:   true,
        CreatedAt:  time.Now(),
    }

    if err := product.Validate(); err != nil {
        return nil, err
    }

    if err := h.repo.Save(ctx, product); err != nil {
        return nil, err
    }

    return product, nil
}
```

### React Component Patterns (Preact/React)

**Functional Component with Hooks**
```tsx
// src/components/pos/ProductGrid.tsx
import { useState, useEffect } from 'preact/hooks';

interface ProductGridProps {
  categoryId?: string;
  onProductSelect: (product: Product) => void;
}

export function ProductGrid({ categoryId, onProductSelect }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchProducts(categoryId);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [categoryId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductSelect(product)}
        />
      ))}
    </div>
  );
}
```

**Context Pattern**
```tsx
// src/contexts/CartContext.tsx
import { createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ComponentChildren }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

## Database Patterns

### SQLite Migration Pattern

```sql
-- migrations/001_initial_tables.sql

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table with foreign key
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    category_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
```

### Change Log Pattern for Sync

```sql
-- Change log table
CREATE TABLE IF NOT EXISTS change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    data TEXT,  -- JSON of changed fields
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced INTEGER DEFAULT 0,
    sync_timestamp DATETIME
);

CREATE INDEX IF NOT EXISTS idx_change_log_unsynced ON change_log(synced) WHERE synced = 0;
```

**Trigger for automatic change logging**
```sql
CREATE TRIGGER IF NOT EXISTS products_insert_log
AFTER INSERT ON products
BEGIN
    INSERT INTO change_log (table_name, record_id, operation, data)
    VALUES ('products', NEW.id, 'INSERT', json_object(
        'name', NEW.name,
        'sku', NEW.sku,
        'price', NEW.price,
        'category_id', NEW.category_id
    ));
END;
```

## Error Handling Patterns

### Rust Error Pattern (thiserror)

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DteError {
    #[error("Certificate not found: {0}")]
    CertificateNotFound(String),

    #[error("Invalid document format: {0}")]
    InvalidFormat(String),

    #[error("Signing failed: {0}")]
    SigningFailed(#[from] rsa::Error),

    #[error("Database error: {0}")]
    DatabaseError(#[from] rusqlite::Error),
}

// Usage
pub fn sign_document(doc: &str) -> Result<SignedDoc, DteError> {
    if doc.is_empty() {
        return Err(DteError::InvalidFormat("Document is empty".into()));
    }
    // ...
}
```

### TypeScript Error Pattern

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

export class SyncError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'SYNC_ERROR', { originalError: originalError?.message });
    this.name = 'SyncError';
  }
}
```

## Styling Patterns

### Tailwind CSS with CVA

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
```

## Testing Patterns

### Vitest Unit Test

```typescript
// src/lib/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTax, calculateTotal } from './calculations';

describe('calculateTax', () => {
  it('calculates 13% IVA correctly', () => {
    expect(calculateTax(100)).toBe(13);
    expect(calculateTax(50)).toBe(6.5);
  });

  it('handles zero amount', () => {
    expect(calculateTax(0)).toBe(0);
  });
});

describe('calculateTotal', () => {
  it('sums items with tax', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 },
    ];
    // Subtotal: 25, Tax: 3.25, Total: 28.25
    expect(calculateTotal(items)).toBe(28.25);
  });
});
```

### Rust Test Pattern

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sign_document() {
        let service = DteSignerService::new_test().unwrap();
        let document = r#"{"type":"FCF","amount":100}"#;

        let result = service.sign(document);

        assert!(result.is_ok());
        let signed = result.unwrap();
        assert!(!signed.signature.is_empty());
    }

    #[test]
    fn test_empty_document_fails() {
        let service = DteSignerService::new_test().unwrap();

        let result = service.sign("");

        assert!(result.is_err());
    }
}
```

## Internationalization Pattern

```typescript
// src/i18n/locales/es/common.json
{
  "pos": {
    "cart": {
      "title": "Carrito",
      "empty": "El carrito está vacío",
      "subtotal": "Subtotal",
      "tax": "IVA (13%)",
      "total": "Total"
    },
    "checkout": {
      "button": "Procesar Venta",
      "success": "Venta completada exitosamente",
      "error": "Error al procesar la venta"
    }
  }
}

// Usage in component
import { useTranslation } from 'react-i18next';

function Cart() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('pos.cart.title')}</h2>
      {items.length === 0 && <p>{t('pos.cart.empty')}</p>}
    </div>
  );
}
```

## Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Files (TS) | kebab-case | `product-grid.tsx` |
| Files (Rust) | snake_case | `dte_signer.rs` |
| Components | PascalCase | `ProductGrid` |
| Functions (TS) | camelCase | `calculateTotal` |
| Functions (Rust) | snake_case | `sign_document` |
| Constants | SCREAMING_SNAKE | `TAX_RATE_IVA` |
| Types/Interfaces | PascalCase | `Product`, `CartItem` |
| Database tables | snake_case | `transaction_items` |
| CSS classes | Tailwind utilities | `flex items-center` |

## File Organization Rules

1. **One component per file** - Each component in its own file
2. **Index exports** - Use `index.ts` for folder exports
3. **Co-locate tests** - `*.test.ts` next to source file
4. **Separate concerns** - Commands, services, and plugins in different directories
5. **Shared types** - Domain types in `shared/types/`
