# Database Scripts

## Seed Data

The `seed.sql` file contains sample data for development:

- **8 Categories** - Pharmacy-focused product categories
- **26 Products** - Sample pharmacy products with pricing tiers, stock, and cost data
- **2 Users** - Admin and Cashier with default PINs
- **1 Customer** - "Consumidor Final" for anonymous sales
- **11 Settings** - System configuration
- **1 Cash Session** - Open session for testing
- **7 Stock Movements** - Initial stock purchases

### Running the Seeder

**Prerequisites:**
- Database must exist (run the app once to create it via migrations)
- SQLite3 CLI installed (`brew install sqlite3` on macOS)

**Find your database:**
```bash
# macOS - Database is in app data directory
ls ~/Library/Application\ Support/com.pos.desktop/

# The database file is named via tauri-plugin-sql configuration
```

**Run the seeder:**
```bash
# From desktop/src-tauri directory
sqlite3 "$HOME/Library/Application Support/com.pos.desktop/pos_database.db" < src-tauri/scripts/seed.sql
```

### Default Users

| Username | PIN  | Role    | Permissions |
|----------|------|---------|-------------|
| admin    | 1234 | Admin   | Full access |
| cajero   | 5678 | Cashier | Limited POS access |

> **Note:** PIN hashes in the seed file use SHA-256 for simplicity. The app's `hash_pin` command uses Argon2. For production, regenerate hashes via the app.

### Re-seeding

The seed uses `INSERT OR IGNORE` so it's safe to run multiple times - existing records won't be duplicated.

To reset and re-seed:
```bash
# Delete existing data first (careful!)
sqlite3 ~/Library/Application\ Support/com.pos.desktop/pos_database.db "DELETE FROM products; DELETE FROM categories; DELETE FROM users; DELETE FROM customers;"

# Then run seed
sqlite3 ~/Library/Application\ Support/com.pos.desktop/pos_database.db < scripts/seed.sql
```
