# POS Desktop Client (Tauri)

The primary point-of-sale client built with Tauri for true offline-first operation with native hardware access.

## Overview

This is the main POS terminal application that cashiers use for daily operations. Built with Tauri 2.x, it provides:

- **100% Offline Operation**: Uses SQLite for local-first data with change log sync
- **Native Performance**: Rust backend with minimal resource usage
- **Hardware Integration**: Direct access to POS peripherals
- **DTE Integration**: Electronic invoicing for El Salvador tax compliance
- **Automatic Cloud Sync**: HTTP polling with adaptive intervals when online

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | Preact | 10.26.9 |
| Backend | Tauri/Rust | 2.5 |
| Database | SQLite | via rusqlite 0.32 |
| Build Tool | Vite | 6.x |
| CSS | Tailwind CSS | 4.x |
| Testing | Vitest | 3.2.4 |
| UI Components | shadcn/ui | - |

## Architecture

The frontend follows Domain-Driven Design (DDD):

```
desktop/
├── src/                        # Frontend (Preact + TypeScript)
│   ├── domains/                # Business logic by bounded context
│   │   ├── sales/              # Sales domain (cart, transactions)
│   │   │   ├── components/     # POS components (cart, header, footer)
│   │   │   ├── entities/       # Sale, SaleItem, Cart
│   │   │   ├── services/       # SalesService
│   │   │   └── hooks/          # useSales, useCart
│   │   ├── products/           # Products domain
│   │   │   ├── components/     # Product grid, search
│   │   │   ├── entities/       # Product, Category
│   │   │   └── services/       # ProductService
│   │   ├── customers/          # Customers domain
│   │   ├── users/              # Users/Auth domain
│   │   ├── settings/           # Settings domain
│   │   ├── dte/                # Electronic invoicing domain
│   │   │   └── services/       # DTEService, DTESigningService
│   │   └── audit/              # Audit/logging domain
│   ├── infrastructure/         # Technical concerns
│   │   ├── database/           # DatabaseAdapter (SQLite facade)
│   │   ├── logging/            # Logger service
│   │   ├── storage/            # Secure & local storage
│   │   └── tauri/              # Tauri IPC command wrappers
│   ├── presentation/           # UI layer
│   │   ├── providers/          # React contexts (AppState, Settings, Theme)
│   │   ├── hooks/              # Presentation hooks (useDialog, etc.)
│   │   ├── screens/            # Full-page screens (POS, Loading, Error)
│   │   ├── dialogs/            # Modal dialogs
│   │   └── layouts/            # Layout components
│   ├── shared/                 # Cross-cutting concerns
│   │   ├── ui/                 # UI components (shadcn/ui)
│   │   ├── utils/              # Utilities (cn, formatters)
│   │   └── components/         # Shared components
│   ├── lib/                    # Application services
│   │   ├── settings-service.ts # App settings with caching
│   │   ├── secure-storage.ts   # Secure key storage
│   │   └── crypto.ts           # Crypto utilities
│   └── i18n/                   # Internationalization (Spanish)
├── src-tauri/                  # Backend (Rust)
│   ├── src/
│   │   ├── commands/           # Tauri IPC handlers
│   │   ├── services/           # Business logic
│   │   └── plugins/            # Plugin configuration
│   ├── migrations/             # SQLite migrations
│   └── Cargo.toml              # Rust dependencies
└── public/                     # Static assets
```

## Key Features

### Local-First Data Management

The desktop client uses SQLite for all data with change log synchronization:

- **Shopping Cart**: Current sale items and modifications
- **Daily Transactions**: All sales stored locally
- **Cash Register State**: Opening balance, current cash, closing
- **Local Inventory**: Product quantities and availability
- **System Settings**: Cached configuration with reactive updates

### DTE (Electronic Invoicing)

Integration with El Salvador's Ministry of Finance:

- FCF (Factura de Consumidor Final) generation
- RSA-based document signing
- Secure certificate storage via Stronghold
- Offline queue with automatic retry

### Hardware Support (Planned)

Native integration with POS hardware through Rust:

- Receipt printers (ESC/POS protocol)
- Barcode scanners (HID and serial)
- Cash drawers
- Customer displays

### Synchronization

Two-tier sync strategy:

1. **Local Storage**: SQLite database persisted locally
2. **Cloud Sync**: HTTP polling to backend with adaptive intervals

## Prerequisites

- **Node.js 22+** (enforced in package.json)
- **Rust 1.70+** (stable)
- **pnpm 8+**
- Platform-specific requirements:
  - **Windows**: WebView2 (included in Windows 11)
  - **macOS**: Xcode Command Line Tools
  - **Linux**: webkit2gtk, libssl-dev

## Development Setup

### Install Dependencies

```bash
# Install JavaScript dependencies
pnpm install

# Rust dependencies are installed automatically by Cargo
```

### Run Development Mode

```bash
# Start Tauri in development mode with hot reload
pnpm tauri dev
```

This will:
- Start the Vite dev server for the frontend
- Compile and run the Rust backend
- Open the application window
- Enable hot module replacement for frontend changes

### Code Quality

```bash
# TypeScript type checking
pnpm type-check

# ESLint
pnpm lint
pnpm lint:fix

# Prettier formatting
pnpm format
pnpm format:check

# Run all checks
pnpm type-check && pnpm lint && pnpm format:check
```

### Testing

```bash
# Run tests with Vitest
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run Rust tests
cd src-tauri && cargo test
```

## Building for Production

### Build for Current Platform

```bash
# Build TypeScript first
pnpm build

# Create native installer
pnpm tauri build
```

The installer will be in `src-tauri/target/release/bundle/`

### Cross-Platform Builds

```bash
# Build for specific platform
pnpm tauri build --target x86_64-pc-windows-msvc
pnpm tauri build --target x86_64-apple-darwin
pnpm tauri build --target x86_64-unknown-linux-gnu
```

## Database

### Schema

SQLite database with migrations in `src-tauri/migrations/`:

| Table | Purpose |
|-------|---------|
| users | System users with role-based access |
| categories | Product categories |
| products | Inventory items with pricing |
| customers | Customer info with NIT/DUI |
| transactions | Sales transactions |
| transaction_items | Individual line items |
| dte | Electronic invoice documents |
| system_settings | App configuration |
| audit_logs | Activity tracking |

### Seed Data

```bash
# From src-tauri directory
cargo run --bin seed
```

## Configuration

### shadcn/ui Aliases

The project uses custom path aliases (see `components.json`):

```json
{
  "aliases": {
    "components": "@/shared/ui",
    "utils": "@/shared/utils",
    "ui": "@/shared/ui",
    "lib": "@/lib",
    "hooks": "@/presentation/hooks"
  }
}
```

### TypeScript Paths

Path aliases are configured in `tsconfig.json`:

- `@/*` → `src/*`
- `@shared/*` → `../../shared/*` (monorepo shared types)

## Troubleshooting

### Common Issues

#### Application won't start

- Check Rust is installed: `rustc --version`
- Verify Node.js version: `node --version` (must be 22+)
- Verify dependencies: `pnpm install`
- Clear build cache: `rm -rf dist node_modules/.vite`

#### TypeScript errors

- Run `pnpm type-check` to see detailed errors
- Check import paths use correct aliases (`@/domains/`, `@/infrastructure/`, etc.)

#### Database issues

- SQLite database is created automatically on first run
- Check migrations in `src-tauri/migrations/`
- Seed data: `cd src-tauri && cargo run --bin seed`

### Debug Mode

Enable detailed logging:

```bash
# Run with debug logging
RUST_LOG=debug pnpm tauri dev

# Run with trace logging (very verbose)
RUST_LOG=trace pnpm tauri dev
```

## Import Conventions

When adding new code, follow these import patterns:

```typescript
// Infrastructure
import { DatabaseAdapter } from '@/infrastructure/database';
import { logger } from '@/infrastructure/logging';

// Presentation
import { useSettings, useTheme } from '@/presentation/providers';
import { useDialog } from '@/presentation/hooks';

// Shared UI
import { Button, Input } from '@/shared/ui';
import { cn } from '@/shared/utils';

// Domain services
import { salesService } from '@/domains/sales/services';
import { productService } from '@/domains/products/services';

// Application services
import { settingsService } from '@/lib/settings-service';
```

## Security

- Local data encrypted at rest via Tauri Stronghold
- DTE certificates stored securely
- Password hashing with Argon2
- Automatic session timeout
- Audit logging for sensitive operations

## License

See the main project [LICENSE](../LICENSE) file.
