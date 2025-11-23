# CLAUDE-architecture.md

Memory bank file documenting system architecture for Claude Code context.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         POS Inteligente SV                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │   Desktop    │    │     Web      │    │        Backend           │  │
│  │   (Tauri)    │    │   (React)    │    │         (Go)             │  │
│  │              │    │              │    │                          │  │
│  │  Preact UI   │    │  React 19    │    │  ┌────────────────────┐  │  │
│  │      +       │    │      +       │    │  │   Echo Framework   │  │  │
│  │  Rust Core   │    │   Vite       │    │  └─────────┬──────────┘  │  │
│  │              │    │              │    │            │             │  │
│  │  ┌────────┐  │    │              │    │  ┌────────▼──────────┐  │  │
│  │  │ SQLite │  │    │              │    │  │   PostgreSQL 16   │  │  │
│  │  └────────┘  │    │              │    │  │   + Redis 7       │  │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
│         │                   │                       │              │
│         │    HTTP/REST      │     HTTP/REST         │              │
│         └───────────────────┴───────────────────────┘              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Desktop Application (Tauri)

**Frontend Layer (Preact)**
```
src/
├── components/
│   ├── pos/          # POS-specific components (ProductGrid, Cart)
│   ├── dialogs/      # Modal dialogs (Customer, Inventory, Transactions)
│   ├── ui/           # Reusable UI primitives (Button, Input, Card)
│   └── debug/        # Development/debugging tools
├── contexts/         # React contexts for global state
├── hooks/            # Custom hooks (useDatabase, useSync, etc.)
├── i18n/             # Internationalization (Spanish locales)
├── lib/              # Utility functions
├── styles/           # Tailwind CSS styles
└── windows/          # Tauri window configurations
```

**Backend Layer (Rust)**
```
src-tauri/src/
├── commands/         # IPC handlers exposed to frontend
│   ├── auth.rs       # Authentication commands
│   ├── dte.rs        # DTE signing commands
│   ├── storage.rs    # Secure storage commands
│   └── system.rs     # System utility commands
├── services/         # Business logic
│   ├── database.rs   # SQLite operations
│   ├── dte_signer.rs # DTE document signing
│   └── secure_store.rs # Stronghold secure storage
├── plugins/          # Tauri plugin configuration
│   ├── sql.rs        # SQL plugin setup
│   ├── log.rs        # Logging configuration
│   └── stronghold.rs # Secure vault setup
├── lib.rs            # Library exports
└── main.rs           # Application entry point
```

### Backend API (Go)

**Clean Architecture Structure**
```
backend/
├── cmd/
│   └── api/
│       └── main.go           # Application entry point
├── internal/
│   ├── domain/               # Business entities & rules
│   │   ├── entities/         # Core domain models
│   │   ├── repositories/     # Repository interfaces
│   │   └── services/         # Domain services
│   ├── application/          # Use cases
│   │   ├── handlers/         # Request handlers
│   │   └── dto/              # Data transfer objects
│   ├── infrastructure/       # External concerns
│   │   ├── database/         # PostgreSQL implementation
│   │   ├── cache/            # Redis implementation
│   │   └── external/         # Third-party integrations (MH API)
│   └── interfaces/
│       └── http/             # HTTP routes & middleware
├── pkg/                      # Public reusable packages
└── api/                      # API documentation
```

### Web Admin (React)

**Standard React Structure**
```
web/src/
├── components/       # UI components
├── pages/            # Route pages
├── hooks/            # Custom hooks
├── services/         # API client services
└── utils/            # Utility functions
```

## Data Architecture

### Local Database (SQLite)

**Core Tables**
- `users` - System users with roles (admin, cashier, supervisor)
- `categories` - Product categorization
- `products` - Inventory with pricing (regular, partner, VIP)
- `customers` - Customer data with tax identifiers (NIT, DUI)
- `transactions` - Sales header records
- `transaction_items` - Sale line items
- `dte` - Electronic invoice tracking
- `system_settings` - Application configuration
- `audit_logs` - Activity audit trail

**Key Relationships**
```
categories 1───────n products
customers 1───────n transactions
transactions 1───n transaction_items
transactions 1───1 dte
products 1───────n transaction_items
users 1──────────n transactions
```

### Server Database (PostgreSQL)

Mirrors SQLite schema with additional:
- Multi-tenant support
- Change log table for sync tracking
- User sessions and tokens

## Sync Architecture

### Change Log Pattern

```
┌─────────────┐                    ┌─────────────┐
│   Desktop   │                    │   Backend   │
│   (SQLite)  │                    │ (PostgreSQL)│
│             │                    │             │
│ Local Data  │◄───── HTTP ───────►│ Central DB  │
│     +       │    Polling         │     +       │
│ Change Log  │                    │ Change Log  │
└─────────────┘                    └─────────────┘
```

**Sync Flow**
1. Desktop writes data to SQLite + change log entry
2. Polling service checks for pending changes
3. Changes batched and sent to backend
4. Backend validates, applies, records in central change log
5. Conflicts resolved via timestamps + business rules
6. Acknowledgment sent back, local change log updated

**Polling Strategy**
- Active use: 30-second intervals
- Idle: 5-minute intervals
- Offline: Queue changes, sync when reconnected

## Security Architecture

### Authentication Flow (Planned)

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───►│ Desktop │───►│ Backend │───►│WhatsApp │
│         │    │   App   │    │   API   │    │360dialog│
│         │◄───│         │◄───│         │◄───│   BSP   │
│  (OTP)  │    │ (Token) │    │ (JWT)   │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

**Authentication Options**
1. WhatsApp OTP (primary) - Via 360dialog Business API
2. Email magic link (fallback)
3. PIN for offline mode

### Secure Storage

**Tauri Stronghold**
- DTE signing certificates
- API tokens
- Encryption keys
- Offline PIN hash

**Environment Variables**
- Database credentials
- External API keys
- Service endpoints

## DTE Integration Architecture

### Document Signing Flow

```
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│   Sale    │───►│   DTE     │───►│  Signing  │───►│    MH     │
│ Complete  │    │ Generator │    │  Service  │    │   API     │
│           │    │           │    │  (RSA)    │    │           │
│ Cart +    │    │ JSON Doc  │    │ Signed    │    │ Reception │
│ Customer  │    │           │    │ Document  │    │ Number    │
└───────────┘    └───────────┘    └───────────┘    └───────────┘
```

**Supported DTE Types**
- FCF - Factura de Consumidor Final (primary)
- CCF - Comprobante de Crédito Fiscal
- NC - Nota de Crédito
- ND - Nota de Débito
- (8 additional types planned)

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Desktop UI | Preact 10.26 | Lightweight React alternative |
| Desktop Native | Tauri 2.5 + Rust | System access, SQLite, signing |
| Web UI | React 19 | Admin interface |
| Backend | Go 1.23 + Echo | API server |
| Local DB | SQLite | Offline-first storage |
| Server DB | PostgreSQL 16 | Central data store |
| Cache | Redis 7 | Sessions, caching |
| Build | Vite 6 | Fast development builds |
| CSS | Tailwind 4.1 | Utility-first styling |
| Testing | Vitest 3.2 | Unit testing |
| Auth | WhatsApp OTP | Passwordless login |

## Deployment Architecture

### Development

```bash
docker-compose up  # PostgreSQL + Redis + Backend + Web
pnpm tauri dev     # Desktop app (separate terminal)
```

### Production (Planned)

- Desktop: Tauri app bundle (Windows, macOS, Linux)
- Web: Static site on CDN
- Backend: Containerized on cloud provider
- Database: Managed PostgreSQL
- Cache: Managed Redis

## File Locations Reference

| Purpose | Location |
|---------|----------|
| Desktop entry | `desktop/src/main.tsx` |
| Tauri config | `desktop/src-tauri/tauri.conf.json` |
| SQLite migrations | `desktop/src-tauri/migrations/` |
| Rust commands | `desktop/src-tauri/src/commands/` |
| Go entry | `backend/cmd/api/main.go` |
| Shared types | `shared/types/domain.ts` |
| Docker config | `docker-compose.yml` |
| CI/CD | `.github/workflows/lint.yml` |
