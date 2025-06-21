# Tauri Backend Architecture

This document describes the organized architecture of the Tauri backend for the POS application.

## Directory Structure

```
src/
├── commands/           # Tauri command handlers organized by domain
│   ├── mod.rs         # Main commands module
│   ├── auth.rs        # Authentication commands
│   ├── dte.rs         # DTE signing commands
│   ├── secure_storage.rs  # Secure storage commands
│   ├── system.rs      # System utility commands
│   ├── utils.rs       # General utility commands
│   └── README.md      # Commands documentation
├── plugins/           # Plugin configurations organized by type
│   ├── mod.rs         # Main plugins orchestrator
│   ├── log_config.rs  # Logging plugin configuration
│   ├── sql_config.rs  # Database plugin configuration
│   ├── storage_config.rs  # Secure storage plugin configuration
│   └── README.md      # Plugins documentation
├── services/          # Business logic services
│   ├── mod.rs         # Main services module
│   ├── database.rs    # Database configuration and migrations
│   ├── dte_signer.rs  # DTE signing service
│   ├── secure_storage.rs  # Secure storage service
│   └── README.md      # Services documentation
├── lib.rs            # Main library entry point
├── main.rs           # Application entry point
└── ARCHITECTURE.md   # This file
```

## Architecture Layers

### 1. **Entry Point Layer** (`lib.rs`, `main.rs`)

- **lib.rs**: Main library configuration, plugin setup, and command registration
- **main.rs**: Application entry point that calls the library

### 2. **Plugin Layer** (`plugins/`)

- Configures all Tauri plugins (logging, database, secure storage)
- Environment-specific configurations (dev, prod, test)
- Centralized plugin management

### 3. **Command Layer** (`commands/`)

- Tauri command handlers that expose functionality to the frontend
- Organized by domain (auth, DTE, storage, system)
- Thin layer that delegates to services

### 4. **Service Layer** (`services/`)

- Business logic implementation
- Database operations and migrations
- Secure storage management
- DTE signing functionality

## Data Flow

```
Frontend (React/TypeScript)
         │
         ▼
┌─────────────────┐
│   Tauri IPC     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Commands      │  ◄── Handles frontend requests
│   - auth.rs     │
│   - dte.rs      │
│   - system.rs   │
│   - storage.rs  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Services      │  ◄── Business logic
│   - database    │
│   - dte_signer  │
│   - storage     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Plugins       │  ◄── Infrastructure
│   - SQL         │
│   - Stronghold  │
│   - Logging     │
└─────────────────┘
```

## Key Design Principles

### 1. **Separation of Concerns**

- **Commands**: Handle Tauri IPC and parameter validation
- **Services**: Contain business logic and data operations
- **Plugins**: Manage infrastructure and external dependencies

### 2. **Domain Organization**

- Code is organized by functional domains (auth, DTE, storage, system)
- Each domain has its own files and clear boundaries
- Easy to locate and modify domain-specific functionality

### 3. **Dependency Direction**

```
Commands ──► Services ──► Plugins
```

- Commands depend on services
- Services depend on plugins/external libraries
- No circular dependencies

### 4. **Error Handling**

- Each service defines its own error types
- Errors are properly propagated through the layers
- Meaningful error messages for debugging

### 5. **Configuration Management**

- Environment-specific configurations for plugins
- Centralized configuration in plugin modules
- Easy to switch between dev/prod settings

## Module Responsibilities

### Commands Module

- **Purpose**: Expose functionality to the frontend via Tauri IPC
- **Responsibilities**:
  - Parameter validation and deserialization
  - Calling appropriate service methods
  - Error handling and response serialization
  - Logging command execution

### Services Module

- **Purpose**: Implement business logic and data operations
- **Responsibilities**:
  - Database operations and queries
  - Business rule enforcement
  - Data transformation and validation
  - Integration with external services

### Plugins Module

- **Purpose**: Configure and manage infrastructure plugins
- **Responsibilities**:
  - Database connection and migration setup
  - Logging configuration and formatting
  - Secure storage initialization
  - Environment-specific optimizations

## Adding New Functionality

### 1. Adding a New Command

```rust
// 1. Add to appropriate command module (e.g., commands/your_domain.rs)
#[tauri::command]
pub async fn your_command(param: String) -> Result<String, YourError> {
    your_service::process(param).await
}

// 2. Re-export in commands/mod.rs
pub use your_domain::*;

// 3. Register in lib.rs
.invoke_handler(tauri::generate_handler![
    your_command,
])
```

### 2. Adding a New Service

```rust
// 1. Create services/your_service.rs
pub struct YourService;
impl YourService {
    pub async fn process(input: String) -> Result<String, YourError> {
        // Implementation
    }
}

// 2. Add to services/mod.rs
pub mod your_service;
```

### 3. Adding a New Plugin Configuration

```rust
// 1. Create plugins/your_plugin_config.rs
pub fn build() -> your_plugin::Builder {
    your_plugin::Builder::new()
        .with_config(...)
}

// 2. Add to plugins/mod.rs
pub mod your_plugin_config;

// 3. Add to configure_plugins function
.plugin(your_plugin_config::build().build())
```

## Testing Strategy

### Unit Tests

- Each service should have comprehensive unit tests
- Mock external dependencies
- Test error conditions and edge cases

### Integration Tests

- Test command-to-service integration
- Test database operations with test database
- Test plugin configurations

### Example Test Structure

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_service_method() {
        // Arrange
        let service = YourService::new();
        
        // Act
        let result = service.method("test").await;
        
        // Assert
        assert!(result.is_ok());
    }
}
```

## Performance Considerations

### Database

- Use connection pooling (handled by tauri-plugin-sql)
- Implement proper indexing in migrations
- Use prepared statements for repeated queries

### Logging

- Configure appropriate log levels for different environments
- Use structured logging for better searchability
- Implement log rotation to manage disk space

### Secure Storage

- Minimize the number of vault operations
- Cache frequently accessed data appropriately
- Use async operations to avoid blocking

## Security Best Practices

### Secure Storage

- Never log sensitive data
- Use proper password hashing
- Implement secure key derivation

### Error Handling

- Don't expose internal system details in error messages
- Log security-relevant events
- Implement proper input validation

### Database

- Use parameterized queries (automatic with tauri-plugin-sql)
- Implement proper access controls
- Regular security updates

## Migration Guide

This architecture represents a migration from a monolithic structure to a well-organized, modular system:

### Before

```
src/
├── lib.rs (everything mixed together)
├── commands.rs (all commands in one file)
├── database.rs
├── dte_signer.rs
└── secure_storage.rs
```

### After

```
src/
├── commands/ (organized by domain)
├── services/ (business logic)
├── plugins/ (infrastructure)
└── lib.rs (clean orchestration)
```

### Benefits of Migration

1. **Better Organization** - Easy to find and modify code
2. **Improved Maintainability** - Changes are isolated to specific domains
3. **Enhanced Testability** - Each module can be tested independently
4. **Clearer Dependencies** - Explicit dependency relationships
5. **Scalability** - Easy to add new functionality without conflicts
6. **Documentation** - Each module is well-documented
7. **Team Development** - Multiple developers can work on different domains

This architecture provides a solid foundation for the POS application that can scale and evolve with the project's needs.
