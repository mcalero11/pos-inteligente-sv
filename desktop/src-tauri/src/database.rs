use tauri_plugin_sql::{Migration, MigrationKind};

/// Database migrations for the POS system
pub fn get_migrations() -> Vec<Migration> {
    vec![
        // Migration 1: Create initial tables
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../migrations/001_initial_tables.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

/// Database connection string for SQLite
pub const DATABASE_URL: &str = "sqlite:pos_database.db";
