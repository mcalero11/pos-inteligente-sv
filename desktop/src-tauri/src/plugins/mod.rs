pub mod log_config;
pub mod sql_config;
pub mod storage_config;

use tauri::{Builder, Runtime};

/// Configure all plugins for the Tauri application
pub fn configure_plugins<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(storage_config::build().build())
        .plugin(sql_config::build().build())
        .plugin(log_config::build().build())
}
