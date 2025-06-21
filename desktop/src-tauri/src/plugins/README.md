# Plugin Configuration

This directory contains organized plugin configurations for the Tauri application. Each plugin is configured in its own module for better maintainability and organization.

## Structure

- `mod.rs` - Main module that orchestrates all plugin configurations
- `log_config.rs` - Logging plugin configuration with human-readable formatting
- `sql_config.rs` - Database plugin configuration with migrations
- `storage_config.rs` - Secure storage (Stronghold) plugin configuration

## Usage

The main entry point is the `configure_plugins()` function in `mod.rs`, which is called from `lib.rs`:

```rust
use crate::plugins;

// In your main application setup
let app = plugins::configure_plugins(tauri::Builder::default())
    .manage(SecureStorageManager::new())
    .invoke_handler(tauri::generate_handler![...])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

## Plugin Configurations

### Logging Plugin (`log_config.rs`)

Provides structured logging with:

- Human-readable timestamps
- Log levels and source locations
- Multiple output targets (stdout, file, webview)
- File rotation and size management

Available configurations:

- `build()` - Default configuration for development
- `build_production()` - Production-optimized (less verbose, smaller files)
- `build_development()` - Development-optimized (very verbose, detailed)

### SQL Plugin (`sql_config.rs`)

Configures SQLite database with:

- Automatic migrations
- Database URL configuration
- Environment-specific optimizations

Available configurations:

- `build()` - Default configuration
- `build_test()` - In-memory database for testing
- `build_development()` - Development-specific settings
- `build_production()` - Production-optimized settings

### Storage Plugin (`storage_config.rs`)

Configures Stronghold secure storage with:

- Encrypted key-value storage
- Environment-specific security levels

Available configurations:

- `build()` - Default configuration
- `build_test()` - Faster, less secure for testing
- `build_development()` - Development-friendly settings
- `build_production()` - Maximum security for production

## Benefits of This Organization

1. **Separation of Concerns** - Each plugin has its own configuration file
2. **Environment-Specific Configurations** - Easy to switch between dev/prod settings
3. **Maintainability** - Changes to one plugin don't affect others
4. **Readability** - Clear documentation and organization
5. **Reusability** - Plugin configurations can be easily reused or modified
6. **Testing** - Dedicated test configurations for each plugin

## Adding New Plugins

To add a new plugin:

1. Create a new file `your_plugin_config.rs`
2. Add the module to `mod.rs`
3. Create a `build()` function that returns the plugin builder
4. Add the plugin to the `configure_plugins()` function
5. Document the plugin configuration in this README

Example:

```rust
// your_plugin_config.rs
pub fn build() -> your_plugin::Builder {
    your_plugin::Builder::new()
        .with_settings(...)
}

// mod.rs
pub mod your_plugin_config;

pub fn configure_plugins<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    builder
        // ... existing plugins
        .plugin(your_plugin_config::build().build())
}
```
