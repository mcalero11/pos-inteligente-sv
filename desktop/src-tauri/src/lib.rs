mod commands;
mod plugins;
mod services;

use commands::*;
use services::secure_storage::SecureStorageManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    plugins::configure_plugins(tauri::Builder::default())
        .manage(SecureStorageManager::new())
        .invoke_handler(tauri::generate_handler![
            // Secure Storage
            initialize_secure_storage,
            store_secret,
            has_secret,
            remove_secret,
            clear_secure_storage,
            is_secure_storage_initialized,
            get_secret_metadata,
            // DTE Signing
            sign_dte_document,
            can_sign_dte,
            // System Commands
            open_log_folder,
            generate_test_logs,
            // PIN Management
            hash_pin,
            verify_pin,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
