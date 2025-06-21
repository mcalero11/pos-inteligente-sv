use crate::services::database::{get_migrations, DATABASE_URL};

/// Build the SQL plugin with database migrations
pub fn build() -> tauri_plugin_sql::Builder {
    tauri_plugin_sql::Builder::default().add_migrations(DATABASE_URL, get_migrations())
}

/// Build SQL plugin for testing with in-memory database
pub fn build_test() -> tauri_plugin_sql::Builder {
    tauri_plugin_sql::Builder::default().add_migrations("sqlite::memory:", get_migrations())
}

/// Build SQL plugin for development with verbose logging
pub fn build_development() -> tauri_plugin_sql::Builder {
    tauri_plugin_sql::Builder::default().add_migrations(DATABASE_URL, get_migrations())
    // Add any development-specific SQL configurations here
}

/// Build SQL plugin for production with optimizations
pub fn build_production() -> tauri_plugin_sql::Builder {
    tauri_plugin_sql::Builder::default().add_migrations(DATABASE_URL, get_migrations())
    // Add any production-specific SQL configurations here
}
