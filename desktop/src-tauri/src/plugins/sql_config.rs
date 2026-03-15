use crate::services::database::{DATABASE_URL, get_migrations};

/// Build the SQL plugin with database migrations
pub fn build() -> tauri_plugin_sql::Builder {
    tauri_plugin_sql::Builder::default().add_migrations(DATABASE_URL, get_migrations())
}
