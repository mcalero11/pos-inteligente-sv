mod commands;
mod dte_signer;
mod secure_storage;

use commands::*;
use secure_storage::SecureStorageManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_stronghold::Builder::new(|_| vec![]).build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("pos-app".to_string()),
                    }),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
                ])
                .level(log::LevelFilter::Debug)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .max_file_size(50_000_000) // 50MB max file size
                .build(),
        )
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
