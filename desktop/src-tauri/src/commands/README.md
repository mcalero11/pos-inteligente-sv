# Commands Module

This directory contains all Tauri commands organized by functionality. Each command module focuses on a specific domain of the application.

## Structure

- `mod.rs` - Main module that re-exports all commands
- `auth.rs` - Authentication related commands (PIN hashing, verification)
- `dte.rs` - DTE (Electronic Tax Document) signing commands
- `secure_storage.rs` - Secure storage management commands
- `system.rs` - System utility commands (log folder, test logs)
- `utils.rs` - General utility commands (currently empty, ready for future utilities)

## Command Categories

### Authentication Commands (`auth.rs`)

- `hash_pin(pin: String) -> String` - Hash a PIN using SHA256
- `verify_pin(pin: String, hash: String) -> bool` - Verify a PIN against its hash

### DTE Commands (`dte.rs`)

- `sign_dte_document(document_xml: String, private_key_id: String) -> Result<SignedDte, DteSigningError>` - Sign a DTE document
- `can_sign_dte(private_key_id: String) -> Result<bool, DteSigningError>` - Check if DTE signing is possible

### Secure Storage Commands (`secure_storage.rs`)

- `initialize_secure_storage(password_hash: Vec<u8>) -> Result<(), SecureStorageError>` - Initialize secure storage
- `store_secret(key: String, secret_data: Vec<u8>) -> Result<(), SecureStorageError>` - Store a secret
- `has_secret(key: String) -> Result<bool, SecureStorageError>` - Check if secret exists
- `remove_secret(key: String) -> Result<(), SecureStorageError>` - Remove a secret
- `clear_secure_storage() -> Result<(), SecureStorageError>` - Clear all secrets
- `is_secure_storage_initialized() -> Result<bool, SecureStorageError>` - Check initialization status
- `get_secret_metadata(keys: Vec<String>) -> Result<Vec<SecretMetadata>, SecureStorageError>` - Get metadata for multiple secrets

### System Commands (`system.rs`)

- `open_log_folder() -> Result<(), String>` - Open the application log folder in file explorer
- `generate_test_logs() -> Result<(), String>` - Generate test logs for debugging

## Usage

All commands are re-exported through the main module, so you can use them in your `lib.rs` like this:

```rust
use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Authentication
            hash_pin,
            verify_pin,
            // DTE
            sign_dte_document,
            can_sign_dte,
            // Secure Storage
            initialize_secure_storage,
            store_secret,
            has_secret,
            remove_secret,
            clear_secure_storage,
            is_secure_storage_initialized,
            get_secret_metadata,
            // System
            open_log_folder,
            generate_test_logs,
        ])
        // ... rest of your app setup
}
```

## Adding New Commands

To add a new command:

1. **Choose the appropriate module** or create a new one if needed
2. **Add the command function** with the `#[tauri::command]` attribute
3. **Update the module's re-exports** in the respective module file
4. **Add to the main re-exports** in `mod.rs` if creating a new module
5. **Add to the invoke_handler** in `lib.rs`
6. **Document the command** in this README

Example of adding a new command to the `utils.rs` module:

```rust
// In utils.rs
#[tauri::command]
pub fn format_currency(amount: f64, currency: &str) -> String {
    format!("{} {:.2}", currency, amount)
}

// In mod.rs (add to re-exports)
pub use utils::*;

// In lib.rs (add to invoke_handler)
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    format_currency,
])
```

## Benefits of This Organization

1. **Clear Separation** - Each domain has its own file
2. **Easy Navigation** - Quickly find commands by category
3. **Maintainability** - Changes to one category don't affect others
4. **Scalability** - Easy to add new command categories
5. **Documentation** - Clear documentation for each command category
6. **Testing** - Can test each category independently
