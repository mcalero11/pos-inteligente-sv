# Database Scripts

This directory contains database management scripts for the POS Inteligente SV application.

## Database Seeder

The seeder script populates the database with initial data required for the application to function properly.

### Usage

From the `src-tauri` directory, run:

```bash
# Use default database path (pos.db)
./scripts/run_seeder.sh

# Or specify a custom database path
./scripts/run_seeder.sh /path/to/your/database.db
```

### What gets seeded

The seeder will populate the following data:

1. **System Settings**:
   - Tax rate: 13.0%
   - Currency: USD
   - Company information
   - Session timeout and other system configurations

2. **Categories** (Pharmacy-focused):
   - Medicamentos
   - Cuidado Personal
   - Vitaminas y Suplementos
   - Primeros Auxilios
   - Bebé y Maternidad
   - Equipos Médicos
   - Cosméticos
   - General

3. **Default Users**:
   - **Admin**: username `admin`, PIN `1234`
     - Full permissions for all modules
   - **Cashier**: username `cajero`, PIN `5678`
     - Limited permissions (read products, manage customers, create transactions, view reports)

### Security

- User PINs are hashed using SHA-256 before storage
- The seeder uses `INSERT OR IGNORE` statements, so running it multiple times won't create duplicates
- **Important**: Change the default PINs after first login!

### Requirements

- The database must exist (migrations must have been run first)
- Rust toolchain must be available to build the seeder binary

### Manual Seeder Execution

You can also run the seeder binary directly:

```bash
# Build the seeder
cargo build --bin seed --release

# Run with default database
./target/release/seed

# Run with custom database path
./target/release/seed /path/to/database.db
```

## Development

The seeder source code is in `seed.rs`. It uses:

- `rusqlite` for direct database access
- `sha2` for PIN hashing
- Standard error handling and validation
