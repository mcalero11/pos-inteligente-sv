use crate::dte_signer::{DteSigningError, DteSigningService, SignedDte};
use crate::secure_storage::{SecureStorageError, SecureStorageManager};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_shell::ShellExt;

#[derive(Serialize, Deserialize)]
pub struct SecretMetadata {
    pub key: String,
    pub exists: bool,
}

// === SECURE STORAGE COMMANDS ===

#[tauri::command]
pub async fn initialize_secure_storage(
    password_hash: Vec<u8>,
    app_handle: AppHandle,
    storage: State<'_, SecureStorageManager>,
) -> Result<(), SecureStorageError> {
    log::info!("Initializing secure storage");

    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| SecureStorageError::from(format!("Failed to get app data dir: {}", e)))?;

    log::debug!("App data directory: {:?}", app_data_dir);

    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| SecureStorageError::from(format!("Failed to create app data dir: {}", e)))?;

    let vault_path = app_data_dir.join("secure-storage.stronghold");
    let vault_path_str = vault_path
        .to_str()
        .ok_or_else(|| SecureStorageError::from("Invalid vault path"))?;

    log::debug!("Vault path: {}", vault_path_str);

    let result = storage.initialize(password_hash, vault_path_str).await;
    match &result {
        Ok(_) => log::info!("Secure storage initialized successfully"),
        Err(e) => log::error!("Failed to initialize secure storage: {}", e),
    }

    result
}

#[tauri::command]
pub async fn store_secret(
    key: String,
    secret_data: Vec<u8>,
    storage: State<'_, SecureStorageManager>,
) -> Result<(), SecureStorageError> {
    storage.store_secret(&key, &secret_data).await
}

#[tauri::command]
pub async fn has_secret(
    key: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<bool, SecureStorageError> {
    storage.has_secret(&key).await
}

#[tauri::command]
pub async fn remove_secret(
    key: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<(), SecureStorageError> {
    storage.remove_secret(&key).await
}

#[tauri::command]
pub async fn clear_secure_storage(
    storage: State<'_, SecureStorageManager>,
) -> Result<(), SecureStorageError> {
    storage.clear().await?;
    Ok(())
}

#[tauri::command]
pub async fn is_secure_storage_initialized(
    storage: State<'_, SecureStorageManager>,
) -> Result<bool, SecureStorageError> {
    Ok(storage.is_initialized().await)
}

// === DTE SIGNING COMMANDS ===

#[tauri::command]
pub async fn sign_dte_document(
    document_xml: String,
    private_key_id: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<SignedDte, DteSigningError> {
    DteSigningService::sign_dte(&storage, &document_xml, &private_key_id).await
}

#[tauri::command]
pub async fn can_sign_dte(
    private_key_id: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<bool, DteSigningError> {
    DteSigningService::can_sign(&storage, &private_key_id).await
}

// === UTILITY COMMANDS ===

#[tauri::command]
pub async fn get_secret_metadata(
    keys: Vec<String>,
    storage: State<'_, SecureStorageManager>,
) -> Result<Vec<SecretMetadata>, SecureStorageError> {
    let mut metadata = Vec::new();

    for key in keys {
        let exists = storage.has_secret(&key).await?;
        metadata.push(SecretMetadata { key, exists });
    }

    Ok(metadata)
}

// === SYSTEM COMMANDS ===

#[tauri::command]
pub async fn open_log_folder(app_handle: AppHandle) -> Result<(), String> {
    log::info!("Opening log folder");

    // Use the system log directory where Tauri plugin writes logs
    let logs_dir = app_handle
        .path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get app log dir: {}", e))?;

    // Always create logs directory if it doesn't exist
    std::fs::create_dir_all(&logs_dir)
        .map_err(|e| format!("Failed to create logs directory: {}", e))?;

    log::debug!("Opening logs directory: {:?}", logs_dir);

    // Convert path to string for the shell command
    let logs_dir_str = logs_dir
        .to_str()
        .ok_or_else(|| "Invalid logs directory path".to_string())?;

    // Use shell plugin to open the folder with the appropriate command for each OS
    let shell = app_handle.shell();

    #[cfg(target_os = "macos")]
    {
        shell
            .command("open")
            .args([logs_dir_str])
            .spawn()
            .map_err(|e| format!("Failed to open logs folder: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        shell
            .command("explorer")
            .args([logs_dir_str])
            .spawn()
            .map_err(|e| format!("Failed to open logs folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        shell
            .command("xdg-open")
            .args([logs_dir_str])
            .spawn()
            .map_err(|e| format!("Failed to open logs folder: {}", e))?;
    }

    log::info!("Log folder opened successfully");

    // Check if log files exist and list them
    if let Ok(entries) = std::fs::read_dir(&logs_dir) {
        let log_files: Vec<String> = entries
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                let file_name = entry.file_name().to_string_lossy().to_lowercase();
                file_name.ends_with(".log")
            })
            .map(|entry| entry.file_name().to_string_lossy().to_string())
            .collect();

        if log_files.is_empty() {
            log::info!("No log files found in directory: {:?}", logs_dir);
        } else {
            log::info!("Found log files: {:?}", log_files);

            // Show the size of the main log files
            for log_file in &log_files {
                let log_path = logs_dir.join(log_file);
                if let Ok(metadata) = std::fs::metadata(&log_path) {
                    log::info!("Log file '{}' size: {} bytes", log_file, metadata.len());
                }
            }
        }
    } else {
        log::error!("Failed to read logs directory: {:?}", logs_dir);
    }

    Ok(())
}

#[tauri::command]
pub async fn generate_test_logs(app_handle: AppHandle) -> Result<(), String> {
    log::info!("Generating test logs for debugging purposes");

    // Use the same system log directory where Tauri plugin writes logs
    let logs_dir = app_handle
        .path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get app log dir: {}", e))?;

    // Always create logs directory if it doesn't exist
    std::fs::create_dir_all(&logs_dir)
        .map_err(|e| format!("Failed to create logs directory: {}", e))?;

    // Generate various log levels
    log::trace!("Test TRACE level log from generate_test_logs command");
    log::debug!("Test DEBUG level log from generate_test_logs command");
    log::info!("Test INFO level log from generate_test_logs command");
    log::warn!("Test WARNING level log from generate_test_logs command");
    log::error!("Test ERROR level log from generate_test_logs command");

    // Generate logs with structured data
    log::info!("Test log with structured data: user_id=12345, action=test_generation");

    // Generate performance logs
    log::info!("Performance test: operation_duration=150ms, memory_usage=45MB");

    // Generate batch logs
    for i in 1..=5 {
        log::info!("Batch test log entry {} of 5", i);
    }

    // Write a manual test file to the universal logs directory
    let test_log_path = logs_dir.join("manual-test.log");
    let test_content = format!(
        "Manual test log created at: {}\nTest logs generated successfully via generate_test_logs command\n",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S")
    );

    std::fs::write(&test_log_path, test_content)
        .map_err(|e| format!("Failed to create manual test log: {}", e))?;

    log::info!("Test logs generation completed successfully");
    log::info!("Manual test log file created: {:?}", test_log_path);

    Ok(())
}

#[tauri::command]
pub fn hash_pin(pin: String) -> String {
    let mut hasher = Sha256::new();
    hasher.update(pin.as_bytes());
    format!("{:x}", hasher.finalize())
}

#[tauri::command]
pub fn verify_pin(pin: String, hash: String) -> bool {
    let pin_hash = hash_pin(pin);
    pin_hash == hash
}
