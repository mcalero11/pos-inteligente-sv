# Services Module

This directory contains all service implementations that provide business logic for the POS application. Services are used by commands and contain the core functionality.

## Structure

- `mod.rs` - Main module that organizes all services
- `database.rs` - Database configuration and migrations
- `dte_signer.rs` - DTE (Electronic Tax Document) signing service
- `secure_storage.rs` - Secure storage management service

## Service Categories

### Database Service (`database.rs`)

Manages database configuration and migrations for the POS system.

**Functions:**

- `get_migrations() -> Vec<Migration>` - Returns all database migrations
- `DATABASE_URL: &str` - SQLite database connection string

**Features:**

- SQLite database with automatic migrations
- Structured migration system
- Database schema versioning

### DTE Signing Service (`dte_signer.rs`)

Handles Electronic Tax Document signing for El Salvador's tax system.

**Structs:**

- `DteSigningService` - Main service implementation
- `SignedDte` - Represents a signed DTE document
- `DteSigningError` - Error handling for DTE operations

**Functions:**

- `sign_dte(storage, document_xml, private_key_id) -> Result<SignedDte, DteSigningError>` - Sign a DTE document
- `can_sign(storage, private_key_id) -> Result<bool, DteSigningError>` - Check if signing is possible

**Features:**

- Secure private key management through secure storage
- Document signing with timestamping
- Error handling and validation

### Secure Storage Service (`secure_storage.rs`)

Provides encrypted storage for sensitive data like private keys and credentials.

**Structs:**

- `SecureStorageManager` - Main storage manager
- `SecureStorageError` - Error handling for storage operations

**Functions:**

- `initialize(password_hash, vault_path) -> Result<(), SecureStorageError>` - Initialize storage
- `store_secret(key, data) -> Result<(), SecureStorageError>` - Store encrypted data
- `get_secret(key) -> Result<Vec<u8>, SecureStorageError>` - Retrieve encrypted data
- `has_secret(key) -> Result<bool, SecureStorageError>` - Check if secret exists
- `remove_secret(key) -> Result<(), SecureStorageError>` - Remove secret
- `clear() -> Result<(), SecureStorageError>` - Clear all secrets
- `is_initialized() -> bool` - Check initialization status

**Features:**

- Stronghold-based encryption
- Password-protected vaults
- Secure key-value storage
- Memory-safe operations

## Usage

Services are used by commands and other parts of the application:

```rust
// In a command
use crate::services::secure_storage::SecureStorageManager;
use crate::services::dte_signer::DteSigningService;

#[tauri::command]
pub async fn sign_document(
    document: String,
    key_id: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<SignedDte, DteSigningError> {
    DteSigningService::sign_dte(&storage, &document, &key_id).await
}
```

## Service Dependencies

```
┌─────────────────┐
│   Commands      │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│  DTE Signer     │───▶│ Secure Storage  │
│  Service        │    │  Service        │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Stronghold    │
│   Service       │    │   (External)    │
└─────────────────┘    └─────────────────┘
```

## Adding New Services

To add a new service:

1. **Create the service file** in `src/services/your_service.rs`
2. **Define the service struct** and its methods
3. **Add error handling** with custom error types
4. **Add to mod.rs** - `pub mod your_service;`
5. **Create corresponding commands** in `src/commands/`
6. **Add tests** for the service functionality
7. **Document the service** in this README

Example service structure:

```rust
// your_service.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YourServiceError {
    pub message: String,
}

impl From<String> for YourServiceError {
    fn from(message: String) -> Self {
        Self { message }
    }
}

pub struct YourService;

impl YourService {
    pub async fn do_something(&self, input: &str) -> Result<String, YourServiceError> {
        // Implementation here
        Ok(format!("Processed: {}", input))
    }
}
```

## Best Practices

1. **Error Handling** - Always use proper error types with meaningful messages
2. **Async Operations** - Use async/await for I/O operations
3. **State Management** - Keep services stateless when possible
4. **Security** - Never log sensitive data, use secure storage for secrets
5. **Testing** - Write unit tests for each service method
6. **Documentation** - Document all public methods and their behavior
7. **Separation of Concerns** - Keep business logic in services, not commands

## Testing Services

Services should have comprehensive unit tests:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_service_functionality() {
        let service = YourService;
        let result = service.do_something("test").await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Processed: test");
    }
}
```

## Migration from Previous Structure

The services were moved from the root `src/` directory to `src/services/` for better organization:

- `src/database.rs` → `src/services/database.rs`
- `src/dte_signer.rs` → `src/services/dte_signer.rs`
- `src/secure_storage.rs` → `src/services/secure_storage.rs`

All imports have been updated accordingly throughout the codebase.
