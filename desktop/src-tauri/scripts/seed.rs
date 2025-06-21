use rusqlite::{params, Connection, Result};
use sha2::{Digest, Sha256};
use std::env;
use std::path::Path;

fn hash_pin(pin: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(pin.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn seed_system_settings(conn: &Connection) -> Result<()> {
    println!("Seeding system settings...");

    let settings = [
        (
            "tax_rate",
            "13.0",
            "Default tax rate percentage",
            "financial",
            1,
        ),
        ("currency", "USD", "System currency", "financial", 1),
        (
            "receipt_footer",
            "Gracias por su compra",
            "Footer text for receipts",
            "receipt",
            0,
        ),
        (
            "company_name",
            "Mi Farmacia",
            "Company name for receipts",
            "company",
            0,
        ),
        ("company_address", "", "Company address", "company", 0),
        ("company_phone", "", "Company phone number", "company", 0),
        (
            "low_stock_alert",
            "10",
            "Minimum stock level for alerts",
            "inventory",
            0,
        ),
        (
            "backup_frequency",
            "24",
            "Backup frequency in hours",
            "system",
            1,
        ),
        (
            "session_timeout",
            "480",
            "Session timeout in minutes",
            "security",
            1,
        ),
        (
            "default_customer_name",
            "Cliente General",
            "Default customer name for transactions",
            "ui",
            0,
        ),
        (
            "default_customer_type",
            "general",
            "Default customer type",
            "ui",
            0,
        ),
    ];

    for (key, value, description, category, is_system) in settings.iter() {
        conn.execute(
            "INSERT OR IGNORE INTO system_settings (key, value, description, category, is_system) 
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![key, value, description, category, *is_system],
        )?;
    }

    println!("✓ System settings seeded");
    Ok(())
}

fn seed_categories(conn: &Connection) -> Result<()> {
    println!("Seeding categories...");

    let categories = [
        ("Medicamentos", "Medicamentos y productos farmacéuticos"),
        (
            "Cuidado Personal",
            "Productos de higiene y cuidado personal",
        ),
        (
            "Vitaminas y Suplementos",
            "Vitaminas, minerales y suplementos nutricionales",
        ),
        (
            "Primeros Auxilios",
            "Productos para primeros auxilios y emergencias",
        ),
        ("Bebé y Maternidad", "Productos para bebés y madres"),
        ("Equipos Médicos", "Equipos y dispositivos médicos"),
        ("Cosméticos", "Productos de belleza y cosméticos"),
        ("General", "Productos generales y otros"),
    ];

    for (name, description) in categories.iter() {
        conn.execute(
            "INSERT OR IGNORE INTO categories (name, description, is_active) VALUES (?1, ?2, 1)",
            params![name, description],
        )?;
    }

    println!("✓ Categories seeded");
    Ok(())
}

fn seed_users(conn: &Connection) -> Result<()> {
    println!("Seeding users...");

    // Admin user with full permissions
    let admin_permissions = r#"{"users": ["create", "read", "update", "delete"], "products": ["create", "read", "update", "delete"], "categories": ["create", "read", "update", "delete"], "customers": ["create", "read", "update", "delete"], "transactions": ["create", "read", "update", "delete", "refund"], "reports": ["read", "export"], "settings": ["read", "update"], "audit": ["read"]}"#;

    // Cashier user with limited permissions
    let cashier_permissions = r#"{"products": ["read"], "customers": ["create", "read", "update"], "transactions": ["create", "read"], "reports": ["read"]}"#;

    let users = [
        (
            "admin",
            "1234",
            "admin",
            "Administrador del Sistema",
            admin_permissions,
        ),
        (
            "cajero",
            "5678",
            "cashier",
            "Cajero Principal",
            cashier_permissions,
        ),
    ];

    for (username, pin, role, full_name, permissions) in users.iter() {
        let pin_hash = hash_pin(pin);

        conn.execute(
            "INSERT OR IGNORE INTO users (username, pin_hash, role, full_name, is_active, permissions) 
             VALUES (?1, ?2, ?3, ?4, 1, ?5)",
            params![username, pin_hash, role, full_name, permissions],
        )?;

        println!("✓ User '{}' created with PIN hash", username);
    }

    println!("✓ Users seeded");
    Ok(())
}

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();

    let db_path = if args.len() > 1 {
        &args[1]
    } else {
        "pos_database.db" // Default database name
    };

    if !Path::new(db_path).exists() {
        eprintln!("Error: Database file '{}' does not exist!", db_path);
        eprintln!("Please run migrations first to create the database.");
        std::process::exit(1);
    }

    println!("🌱 Starting database seeding process...");
    println!("Database: {}", db_path);

    let conn = Connection::open(db_path)?;

    // Check if tables exist
    let mut stmt = conn.prepare("SELECT name FROM sqlite_master WHERE type='table'")?;
    let table_names: Vec<String> = stmt
        .query_map([], |row| Ok(row.get::<_, String>(0)?))?
        .collect::<Result<Vec<_>, _>>()?;

    let required_tables = ["system_settings", "categories", "users"];
    for table in required_tables.iter() {
        if !table_names.contains(&table.to_string()) {
            eprintln!("Error: Required table '{}' not found!", table);
            eprintln!("Please run migrations first.");
            std::process::exit(1);
        }
    }

    // Seed data
    seed_system_settings(&conn)?;
    seed_categories(&conn)?;
    seed_users(&conn)?;

    println!("🎉 Database seeding completed successfully!");
    println!();
    println!("Default users created:");
    println!("  - Admin: username='admin', PIN='1234'");
    println!("  - Cashier: username='cajero', PIN='5678'");
    println!();
    println!("⚠️  Please change the default PINs after first login!");

    Ok(())
}
