mod commands;
mod domains;
pub mod error;
mod plugins;
mod services;

use std::sync::Mutex;

use commands::system::SaleWindowCounter;
use commands::*;
use domains::dte::service::DteSignerService;
use services::secure_storage::SecureStorageManager;
use tauri::Emitter;

// Re-export DTE domain commands (DTE signing requires Rust crypto)
use domains::dte::{is_certificate_loaded, load_certificate, sign_dte};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    plugins::configure_plugins(tauri::Builder::default())
        .manage(SecureStorageManager::new())
        .manage(SaleWindowCounter::new())
        .manage(Mutex::new(DteSignerService::new()))
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                // Emit event to main window when any window is destroyed
                let label = window.label().to_string();
                if let Err(e) = window.emit_to("main", "window-destroyed", label.clone()) {
                    // If main window is closed, this might fail, which is expected
                    log::debug!("Failed to emit window-destroyed to main window: {}", e);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            // Secure Storage
            initialize_secure_storage,
            store_secret,
            has_secret,
            remove_secret,
            clear_secure_storage,
            is_secure_storage_initialized,
            get_secret_metadata,
            // System Commands
            open_log_folder,
            generate_test_logs,
            // Authentication (PIN hashing with Argon2)
            hash_pin,
            verify_pin,
            // Domain: DTE (requires Rust crypto)
            sign_dte,
            load_certificate,
            is_certificate_loaded,
            // Database
            execute_transaction,
            // System
            create_sale_window,
            force_close_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
