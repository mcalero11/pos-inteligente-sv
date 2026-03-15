# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

> [!IMPORTANT]
> **Agent Persona**: This workspace is configured with a **Project Manager (PM)** persona defined in `.cursorrules`. The agent acts as a Technical PM, enforcing documentation and roadmap alignment.
>
> ## 📂 Project Structure & Documentation
>
> **Key Documents**:
> - `PROJECT_STATUS.md` - Current project health, recovery metrics, and active sprint
> - `docs/PRD.md` - Product Requirements Document (APPROVED & LOCKED)
> - `docs/sprints/` - Sprint planning documents (sprint-01.md, sprint-02.md, sprint-03.md, etc.)
> - `.cursorrules` - PM persona and workflow guidelines
> - `desktop/` - Tauri-based POS Desktop application
> - `backend/` - Go backend services
>
> **Documentation Standards**:
> - Sprint documents live in `docs/sprints/` and follow naming: `sprint-NN.md`
> - Use GitHub-style markdown with alerts for important sections
> - Keep status documents concise and actionable

POS Inteligente El Salvador is an offline-first point-of-sale system designed for the Salvadoran market. It consists of three main applications:

1. **Desktop POS (Tauri)** - Main offline-first POS terminal with SQLite
2. **Web Admin (React)** - Centralized administration panel
3. **Backend API (Go)** - Server with PostgreSQL and DTE integration

**Current Status**: Sprint 3 - Core Sales Flow Implementation (cart, transactions, multi-window POS)

## Development Commands

### Desktop Application (Tauri)
```bash
cd desktop
pnpm install              # Install dependencies
pnpm tauri dev            # Run development server
pnpm build                # Build TypeScript
pnpm tauri build          # Build desktop app
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix linting issues
pnpm format               # Format with Prettier
pnpm format:check         # Check formatting
pnpm type-check           # TypeScript type checking
pnpm test                 # Run tests with Vitest
pnpm test:run             # Run tests once
pnpm test:ui              # Run tests with UI
pnpm test:coverage        # Run tests with coverage
```

### Web Admin Application
```bash
cd web
pnpm install              # Install dependencies
pnpm dev                  # Run development server
pnpm build                # Build for production
pnpm lint                 # Run ESLint
```

### Backend API (Go)
```bash
cd backend
go run cmd/api/main.go    # Run development server
go build ./...            # Build binary
go test ./...             # Run tests
```

### Full System
```bash
docker-compose up         # Start all services (PostgreSQL, Redis, Backend, Web)
docker-compose --profile tools up  # Include PgAdmin and Redis Commander
```

## Architecture

### Multi-Client Architecture
- **Desktop (Tauri)**: Offline-first POS with SQLite, syncs with backend when online
- **Web (React 19)**: Admin panel for centralized management and reporting
- **Backend (Go)**: API server with PostgreSQL, handles DTE integration and sync

### Key Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Desktop Frontend | Preact | 10.26.9 |
| Desktop Backend | Tauri/Rust | 2.10 |
| Web Frontend | React | 19.1.0 |
| Backend | Go + Echo | 1.26+ |
| Local Database | SQLite | via rusqlite 0.32 |
| Server Database | PostgreSQL | 17 |
| Build Tool | Vite | 6.x |
| Package Manager | pnpm | - |
| CSS Framework | Tailwind CSS | 4.1.10 |
| Toast Notifications | Sonner | 2.0.7 |
| Testing | Vitest | 3.2.4 |

### Tauri Backend Architecture
The Tauri backend is a **lean Rust layer** — most business logic lives in TypeScript via `tauri-plugin-sql`:
- **Commands** (`src-tauri/src/commands/`): Tauri IPC handlers (auth, database, DTE, secure_storage, system)
  - `database.rs`: Batch SQL execution via `execute_transaction` with `$LAST_INSERT_ID` / `$INSERT_ID_[N]` cross-statement references
  - `system.rs`: Multi-window management (`create_sale_window`), log utilities
  - `auth.rs`: PIN hashing (Argon2id) with legacy SHA-256 backward compatibility
- **Domains** (`src-tauri/src/domains/`): Only DTE remains (requires Rust crypto - RSA signing)
- **Services** (`src-tauri/src/services/`): DTE signing, secure storage
- **Plugins** (`src-tauri/src/plugins/`): Infrastructure configuration (SQL, logging, stronghold)

### Multi-Window Architecture
- Main window (`main`) has full capabilities including window creation
- Child sale windows (`pos-sale-{N}`) have restricted capabilities (no window creation, no secure storage)
- `WindowManagerContext` tracks active windows, emits events on create/destroy
- Capabilities defined in `src-tauri/capabilities/main-window.json` and `sale-window.json`

### Desktop Frontend DDD Architecture
The Preact frontend (`desktop/src/`) follows Domain-Driven Design:
- **Domains** (`domains/`): Bounded contexts with entities, services, hooks, and components
  - Each domain (sales, products, customers, users, settings, dte, audit) is self-contained
  - Domain services handle business logic via DatabaseAdapter facade
- **Infrastructure** (`infrastructure/`): Technical concerns (database, logging, storage, tauri)
  - `DatabaseAdapter`: Thin facade over Tauri SQL plugin for all database operations
  - `Logger`: Centralized logging with domain-specific loggers
- **Presentation** (`presentation/`): UI layer (providers, hooks, screens, dialogs)
  - `AppStateProvider`: App lifecycle state machine
  - `SettingsProvider`: Reactive app settings
- **Shared** (`shared/`): Cross-cutting UI components (shadcn/ui, sonner toasts, digital-clock) and utilities
- **Lib** (`lib/`): Application-level services that bridge multiple domains

### Backend Clean Architecture
The Go backend follows clean architecture:
- **Domain** (`internal/domain/`): Business entities and rules
- **Application** (`internal/application/`): Use cases and handlers
- **Infrastructure** (`internal/infrastructure/`): Database, cache, external services
- **Interfaces** (`internal/interfaces/http/`): HTTP route handlers

## Key Features

### Offline-First Design
- Desktop app works completely offline using SQLite
- Automatic sync with backend when connection is available
- Change log pattern for conflict resolution
- Adaptive polling intervals based on activity

### DTE Integration (El Salvador Electronic Invoicing)
- Electronic invoice generation for Salvadoran tax compliance
- DTE signing service in Tauri backend using RSA
- Support for FCF (Factura de Consumidor Final) and other document types
- Integration with Ministry of Finance (Ministerio de Hacienda) API

### Internationalization
Desktop app uses i18next with Spanish locale support in `desktop/src/i18n/locales/es/`.

## Development Guidelines

### Node.js Version
All JavaScript/TypeScript projects require **Node.js 24+** (enforced in package.json engines).

### Package Manager
Use `pnpm` for all Node.js projects. Lock files are committed.

### Testing
- Desktop: Vitest for unit tests
- Use `pnpm test` in respective directories
- Always run tests before committing

### Code Quality
```bash
# Before committing, run:
pnpm lint        # ESLint
pnpm type-check  # TypeScript
pnpm format:check # Prettier (desktop only)
```

### Database
- **Desktop**: SQLite with migrations in `desktop/src-tauri/migrations/`
- **Backend**: PostgreSQL for server data
- Use proper migrations for schema changes

### Security
- Secure storage using Tauri Stronghold plugin
- Password hashing with Argon2
- Never commit secrets or API keys
- Use environment variables for configuration

## File Structure

```
pos-inteligente-sv/
├── backend/                # Go API server
│   ├── cmd/api/            # Entry point (main.go)
│   ├── internal/           # Private packages (clean architecture)
│   └── pkg/                # Public reusable packages
├── desktop/                # Tauri POS application
│   ├── src/                # Preact frontend (DDD architecture)
│   │   ├── domains/        # Business logic by bounded context
│   │   │   ├── sales/      # Sales domain (cart, transactions)
│   │   │   ├── products/   # Products domain (catalog, inventory)
│   │   │   ├── customers/  # Customers domain
│   │   │   ├── users/      # Users domain (auth, sessions)
│   │   │   ├── settings/   # Settings domain
│   │   │   ├── dte/        # DTE domain (electronic invoicing)
│   │   │   └── audit/      # Audit domain (logs, debugging)
│   │   ├── infrastructure/ # Technical concerns
│   │   │   ├── database/   # DatabaseAdapter facade
│   │   │   ├── logging/    # Logger service
│   │   │   ├── storage/    # Secure & local storage
│   │   │   └── tauri/      # Tauri IPC commands
│   │   ├── presentation/   # UI layer
│   │   │   ├── providers/  # React contexts (AppState, Settings, Theme, WindowManager)
│   │   │   ├── hooks/      # Presentation hooks
│   │   │   ├── screens/    # Full-page screens (POS, Loading, Error)
│   │   │   ├── dialogs/    # Modal dialogs (Transaction, ReceiptPreview, ActiveSalesWarning)
│   │   │   └── layouts/    # Layout components
│   │   ├── shared/         # Cross-cutting concerns
│   │   │   ├── ui/         # UI components (shadcn/ui, sonner, digital-clock)
│   │   │   ├── utils/      # Utilities (cn, formatters)
│   │   │   └── components/ # Shared components (theme picker)
│   │   ├── lib/            # Application services
│   │   │   ├── settings-service.ts  # App settings
│   │   │   ├── secure-storage.ts    # Secure key storage
│   │   │   └── crypto.ts            # Crypto utilities
│   │   └── i18n/           # Internationalization
│   └── src-tauri/          # Rust backend
│       ├── src/            # Commands, services, plugins
│       │   ├── commands/   # auth, database, dte, secure_storage, system
│       │   ├── domains/    # Only DTE (crypto-dependent)
│       │   └── plugins/    # SQL, logging, stronghold config
│       ├── capabilities/   # Window permissions (main-window, sale-window)
│       ├── migrations/     # SQLite migrations
│       └── scripts/        # Seed SQL script
├── web/                    # React admin panel
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   ├── decisions/          # ADRs
│   └── sprints/            # Sprint documentation
├── docker-compose.yml      # Development environment
└── PROJECT_STATUS.md       # Sprint progress tracking
```

## Database Schema

The SQLite database (`desktop/src-tauri/migrations/001_initial_tables.sql`) includes:

| Table | Purpose |
|-------|---------|
| users | System users with role-based access |
| categories | Product categories |
| products | Inventory items with pricing and stock tracking |
| customers | Customer info with NIT/DUI/NRC tax identifiers |
| transactions | Sales transactions (draft, held, quote, completed, cancelled, refunded) |
| transaction_items | Individual line items with price tier tracking |
| payments | Split payment support (cash, card, transfer, check, credit) |
| cash_register_sessions | Shift management with opening/closing balances |
| cash_movements | Cash withdrawals, deposits, adjustments during sessions |
| stock_movements | Inventory ledger (purchase, sale, return, adjustment, loss, transfer) |
| dte | Electronic invoice documents with contingency handling |
| system_settings | Application configuration by category |
| audit_logs | Activity tracking |

## Important Patterns

### Error Handling
- Tauri commands return `Result<T, E>` types
- Frontend handles errors gracefully with user-friendly messages
- Proper error logging at all levels using `tauri-plugin-log`

### State Management
- React context for global state
- Local component state for UI-specific data
- SQLite for persistent local data

### Sync Architecture
- Change log pattern for data synchronization (replaced Automerge CRDT)
- Conflict resolution using timestamps and business rules
- HTTP polling with adaptive intervals
- Offline-first with eventual consistency

### Authentication (Planned)
- Passwordless: WhatsApp OTP via 360dialog BSP
- Email magic links as fallback
- JWT tokens for API authentication

## Common Issues

### Development Setup
- Ensure Rust is installed for Tauri development
- Use correct Node.js version (24+)
- Install all dependencies with `pnpm install`
- For Tauri: `rustup update` to get latest stable Rust

### Database Issues
- SQLite database created automatically on first run
- Check migration files for schema changes
- Seed data: SQL seed script in `desktop/src-tauri/scripts/seed.sql`
- Database uses WAL mode with NORMAL synchronous for better concurrent performance

### Build Issues
- Run `pnpm type-check` to identify TypeScript errors
- Ensure all dependencies are installed
- Check ESLint output for code quality issues
- For Rust: `cargo clippy` for additional warnings

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/lint.yml`) runs:
- **Backend**: golangci-lint, go vet, go fmt
- **Web**: ESLint, TypeScript check
- **Desktop**: TypeScript check
- **Tauri**: cargo fmt, clippy, cargo test

## Key Decisions

See `docs/decisions/` for detailed ADRs:
- `002-sqlite-sync-architecture.md` - SQLite + change log over Automerge
- `003-passwordless-auth.md` - WhatsApp OTP + email magic links
- `004-certificate-vault-management.md` - DTE certificate handling

## Related Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Project Status](PROJECT_STATUS.md)
- [Sprint 1 Details](docs/sprints/sprint-01.md)
- [Sprint 3 Details](docs/sprints/sprint-03.md)
