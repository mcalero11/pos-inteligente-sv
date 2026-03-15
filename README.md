<div align="center">

<img src="desktop/src-tauri/icons/icon.png" alt="POS Inteligente" width="96" />

# POS Inteligente El Salvador

*Offline-first point-of-sale system built for the Salvadoran market*

[![CI](https://github.com/mcalero11/pos-inteligente-sv/actions/workflows/lint.yml/badge.svg)](https://github.com/mcalero11/pos-inteligente-sv/actions/workflows/lint.yml)
[![Elastic License 2.0](https://img.shields.io/badge/license-Elastic%202.0-blue)](LICENSE)
[![Node.js 24+](https://img.shields.io/badge/node-24%2B-brightgreen)](https://nodejs.org)

[Overview](#overview) | [Architecture](#architecture) | [Getting Started](#getting-started) | [Development](#development) | [Documentation](#documentation)

</div>

---

## Screenshots

<p align="center">
  <img src="images/screenshot%201.png" alt="POS Terminal — Light mode, product grid view" width="720" />
</p>
<p align="center"><em>POS Terminal — Light mode with product grid and empty cart</em></p>

<p align="center">
  <img src="images/screenshot%202.png" alt="POS Terminal — Dark mode, list view with active cart" width="720" />
</p>
<p align="center"><em>POS Terminal — Dark mode with list view, active cart, and IVA calculation</em></p>

## Overview

POS Inteligente is a resilient, offline-capable POS ecosystem designed for Salvadoran businesses of all sizes — from individual freelancers to multi-branch retailers. It works entirely without internet, syncs automatically when connected, and integrates natively with El Salvador's electronic invoicing system (DTE).

### Key Features

- **100% Offline-First** — Sell without internet using a local SQLite database; sync automatically when connectivity returns
- **DTE Integration** — Built-in electronic invoicing compliant with El Salvador's Ministerio de Hacienda (FCF and other document types)
- **Multi-Window POS** — Open multiple sale windows simultaneously for parallel transactions
- **Multi-Branch Sync** — Change-log pattern with conflict resolution for eventual consistency across terminals
- **Secure by Default** — Argon2id password hashing, encrypted certificate storage via Stronghold, no secrets in code
- **Spanish Localization** — Full i18n support tailored for the Salvadoran market

## Architecture

The system is composed of three specialized applications:

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Desktop POS    │     │   Web Admin       │     │   Backend API    │
│  (Tauri + Rust) │◄───►│   (React 19)      │◄───►│   (Go + Echo)    │
│  SQLite local   │     │   Dashboard       │     │   PostgreSQL     │
│  Offline-first  │     │   Reports         │     │   Redis cache    │
└─────────────────┘     └──────────────────┘     └──────────────────┘
         │                                                │
         └────────── Sync via HTTP polling ───────────────┘
```

| Component | Stack | Purpose |
|-----------|-------|---------|
| **Desktop POS** | Tauri 2 · Preact · SQLite · Rust | Main offline-first terminal for daily sales operations |
| **Web Admin** | React 19 · Vite · TypeScript | Centralized management, reporting, and configuration |
| **Backend API** | Go · Echo · PostgreSQL · Redis | Server-side logic, DTE integration, and data sync |

> [!NOTE]
> The Desktop POS is a **lean Rust backend** — most business logic lives in TypeScript via `tauri-plugin-sql`. Rust handles only performance-critical operations like DTE signing (RSA) and secure storage.

## Getting Started

### Prerequisites

- [Node.js 24+](https://nodejs.org/) and [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/) (stable, latest)
- [Go 1.26+](https://go.dev/) (for backend)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (for services)

### Quick Start

```bash
# Clone the repository
git clone git@github.com:mcalero11/pos-inteligente-sv.git
cd pos-inteligente-sv

# Start backend services (PostgreSQL, Redis, API, Web Admin)
docker-compose up

# In a separate terminal, run the Desktop POS
cd desktop
pnpm install
pnpm tauri dev
```

> [!TIP]
> To also start PgAdmin and Redis Commander for debugging, use:
> ```bash
> docker-compose --profile tools up
> ```

### Access Points

| Application | URL |
|-------------|-----|
| Desktop POS | Opens automatically with `pnpm tauri dev` |
| Web Admin | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger Docs | http://localhost:8080/swagger |

## Development

### Commands

<details>
<summary><strong>Desktop (Tauri)</strong></summary>

```bash
cd desktop
pnpm install          # Install dependencies
pnpm tauri dev        # Run in development mode
pnpm tauri build      # Build production binary
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking
pnpm test             # Run tests (Vitest)
pnpm test:coverage    # Run tests with coverage
```

</details>

<details>
<summary><strong>Web Admin</strong></summary>

```bash
cd web
pnpm install          # Install dependencies
pnpm dev              # Run development server
pnpm build            # Build for production
pnpm lint             # Run ESLint
```

</details>

<details>
<summary><strong>Backend (Go)</strong></summary>

```bash
cd backend
go run cmd/api/main.go   # Run development server
go build ./...           # Build binary
go test ./...            # Run tests
```

</details>

### Project Structure

```
pos-inteligente-sv/
├── backend/                 # Go API server (clean architecture)
│   ├── cmd/api/             # Entry point
│   └── internal/            # Domain, application, infrastructure layers
├── desktop/                 # Tauri POS application
│   ├── src/                 # Preact frontend (DDD architecture)
│   │   ├── domains/         # Bounded contexts (sales, products, customers, ...)
│   │   ├── infrastructure/  # Database, logging, storage, Tauri IPC
│   │   ├── presentation/    # Screens, dialogs, providers
│   │   └── shared/          # UI components (shadcn/ui), utilities
│   └── src-tauri/           # Rust backend
│       ├── src/             # Commands, services, plugins
│       ├── capabilities/    # Window permissions
│       └── migrations/      # SQLite schema
├── web/                     # React admin panel
├── docs/                    # Architecture docs, ADRs, sprint plans
└── docker-compose.yml       # Development environment
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Frontend | Preact 10 · TypeScript · Tailwind CSS 4 · shadcn/ui · Vite 6 |
| Desktop Backend | Tauri 2 · Rust · rusqlite · Stronghold |
| Web Frontend | React 19 · TypeScript · Vite 6 |
| Backend API | Go 1.26 · Echo · PostgreSQL 17 · Redis 7 |
| Testing | Vitest · Go testing |
| CI/CD | GitHub Actions (lint, type-check, clippy, cargo test) |

### Code Quality

Run these before committing:

```bash
# Desktop
cd desktop && pnpm lint && pnpm type-check && pnpm format:check

# Backend
cd backend && go vet ./... && go fmt ./...
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and component interaction |
| [Project Status](PROJECT_STATUS.md) | Current sprint progress and metrics |
| [Sprint Plans](docs/sprints/) | Detailed sprint planning documents |
| [ADRs](docs/decisions/) | Architecture Decision Records |
| [PRD](docs/PRD.md) | Product Requirements Document |

> [!IMPORTANT]
> The PRD is **approved and locked**. All feature work must align with it. See sprint documents for current scope.

## Database Schema

The Desktop POS uses SQLite with the following core tables:

| Table | Purpose |
|-------|---------|
| `users` | System users with role-based access |
| `products` / `categories` | Product catalog and inventory |
| `transactions` / `transaction_items` | Sales with status tracking (draft, held, completed, ...) |
| `payments` | Split payments (cash, card, transfer, check, credit) |
| `cash_register_sessions` | Shift management with opening/closing balances |
| `stock_movements` | Inventory ledger (purchase, sale, return, adjustment) |
| `dte` | Electronic invoice documents |
| `customers` | Customer records with NIT/DUI/NRC identifiers |
| `audit_logs` | Activity tracking |

Schema definition: [`desktop/src-tauri/migrations/001_initial_tables.sql`](desktop/src-tauri/migrations/001_initial_tables.sql)
