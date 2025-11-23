# Tauri Backend Architecture

This document describes the architecture of the Tauri backend for the POS application.

## Directory Structure

```
src/
├── commands/              # Shared infrastructure commands
│   ├── mod.rs             # Commands module
│   ├── auth.rs            # Authentication commands (PIN hash/verify)
│   ├── secure_storage.rs  # Secure storage commands
│   ├── system.rs          # System utility commands
│   ├── utils.rs           # General utilities
│   └── README.md          # Commands documentation
├── domains/               # Domain-driven business logic
│   ├── mod.rs             # Domains module
│   ├── customers/         # Customer domain
│   │   ├── commands.rs    # Customer Tauri commands
│   │   ├── repository.rs  # Customer data access
│   │   └── mod.rs
│   ├── dte/               # DTE (electronic invoicing) domain
│   │   ├── commands.rs    # DTE signing commands
│   │   ├── service.rs     # DTE signer service
│   │   └── mod.rs
│   ├── products/          # Products domain
│   │   ├── commands.rs    # Product Tauri commands
│   │   ├── repository.rs  # Product data access
│   │   └── mod.rs
│   ├── sales/             # Sales domain
│   │   ├── commands.rs    # Sales Tauri commands
│   │   ├── repository.rs  # Sales data access
│   │   └── mod.rs
│   ├── settings/          # Settings domain
│   │   ├── commands.rs    # Settings Tauri commands
│   │   ├── repository.rs  # Settings data access
│   │   └── mod.rs
│   └── users/             # Users domain
│       ├── commands.rs    # User Tauri commands
│       ├── repository.rs  # User data access
│       └── mod.rs
├── infrastructure/        # Infrastructure layer
│   ├── mod.rs
│   └── database.rs        # Database initialization
├── plugins/               # Plugin configurations
│   ├── mod.rs             # Plugin orchestrator
│   ├── log_config.rs      # Logging plugin configuration
│   ├── sql_config.rs      # Database plugin configuration
│   ├── storage_config.rs  # Secure storage plugin configuration
│   └── README.md          # Plugins documentation
├── services/              # Shared services
│   ├── mod.rs             # Services module
│   ├── database.rs        # Database utilities
│   ├── dte_signer.rs      # DTE signing utilities
│   ├── secure_storage.rs  # Secure storage service
│   └── README.md          # Services documentation
├── lib.rs                 # Main library entry point
├── main.rs                # Application entry point
└── ARCHITECTURE.md        # This file
```

## Architecture Layers

### 1. Entry Point (`lib.rs`, `main.rs`)

- **lib.rs**: Main library configuration, plugin setup, and command registration
- **main.rs**: Application entry point that calls the library

### 2. Domains Layer (`domains/`)

Business logic organized by domain (DDD pattern):
- **customers/**: Customer management
- **dte/**: Electronic invoicing (DTE signing, certificates)
- **products/**: Product catalog and inventory
- **sales/**: Sales transactions
- **settings/**: System settings
- **users/**: User management and authentication

Each domain contains:
- `commands.rs`: Tauri IPC handlers
- `repository.rs`: Data access layer
- `mod.rs`: Module exports

### 3. Commands Layer (`commands/`)

Shared infrastructure commands that don't belong to a specific domain:
- **auth.rs**: PIN hashing and verification
- **secure_storage.rs**: Secure key/value storage
- **system.rs**: System utilities (logs, debugging)

### 4. Services Layer (`services/`)

Shared business logic services used across domains:
- **database.rs**: Database configuration and migrations
- **dte_signer.rs**: DTE signing service
- **secure_storage.rs**: Secure storage management

### 5. Plugins Layer (`plugins/`)

Infrastructure plugin configurations:
- **log_config.rs**: Logging (tauri-plugin-log)
- **sql_config.rs**: SQLite database (tauri-plugin-sql)
- **storage_config.rs**: Secure storage (tauri-plugin-stronghold)

## Data Flow

```
Frontend (Preact/TypeScript)
         │
         ▼
┌─────────────────────────────────────┐
│           Tauri IPC                 │
└─────────────────────────────────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌─────────────┐  ┌────────────┐  ┌────────────┐
│   Domains   │  │  Commands  │  │  Services  │
│ - products  │  │ - auth     │  │ - storage  │
│ - sales     │  │ - storage  │  │ - dte      │
│ - customers │  │ - system   │  └────────────┘
│ - users     │  └────────────┘
│ - dte       │
│ - settings  │
└─────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│           Plugins                   │
│   SQL (SQLite) │ Stronghold │ Log  │
└─────────────────────────────────────┘
```

## Key Design Principles

### 1. Domain-Driven Design

- Business logic organized by bounded context
- Each domain is self-contained with commands and repository
- Clear boundaries between domains

### 2. Separation of Concerns

- **Domains**: Business logic for specific contexts
- **Commands**: Shared infrastructure functionality
- **Services**: Cross-cutting concerns
- **Plugins**: External infrastructure

### 3. Dependency Direction

```
Domains ──► Services ──► Plugins
Commands ──► Services ──► Plugins
```

- Domains/Commands depend on services
- Services depend on plugins
- No circular dependencies

## Module Responsibilities

### Domains Module

Each domain contains:
- **commands.rs**: Tauri IPC handlers with `#[tauri::command]`
- **repository.rs**: Database queries and data mapping
- **Types**: Domain-specific structs and enums

### Commands Module

- Infrastructure commands not tied to business domains
- Authentication utilities (PIN management)
- System utilities (log access, debugging)
- Secure storage management

### Services Module

- Business logic shared across domains
- External service integrations
- Complex operations requiring multiple repositories

### Plugins Module

- Environment-specific configurations (dev/prod/test)
- Plugin initialization and setup
- Centralized infrastructure management

## Adding New Functionality

### Adding a New Domain Command

```rust
// 1. Create in domains/your_domain/commands.rs
#[tauri::command]
pub async fn your_command(param: String) -> Result<YourType, String> {
    // Implementation
}

// 2. Export in domains/your_domain/mod.rs
pub use commands::your_command;

// 3. Register in lib.rs invoke_handler
.invoke_handler(tauri::generate_handler![
    domains::your_domain::your_command,
])
```

### Adding a Shared Command

```rust
// 1. Add to commands/your_module.rs
#[tauri::command]
pub fn your_command() -> Result<String, String> {
    // Implementation
}

// 2. Export in commands/mod.rs
pub mod your_module;
pub use your_module::*;

// 3. Register in lib.rs
.invoke_handler(tauri::generate_handler![
    your_command,
])
```

## Testing Strategy

### Unit Tests

- Repository methods with mock data
- Service logic with mocked dependencies
- Command handlers with stubbed services

### Integration Tests

- Full command-to-database flow
- Plugin configurations
- Error propagation

## Security Best Practices

### Secure Storage

- Use Stronghold for sensitive data (certificates, keys)
- Proper password hashing (Argon2)
- Never log sensitive data

### Database

- Parameterized queries (automatic with tauri-plugin-sql)
- Input validation in commands
- Proper error handling without exposing internals

### DTE Signing

- Certificates stored securely in memory
- Password-protected certificate loading
- Audit logging for signing operations
