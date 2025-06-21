use crate::services::secure_storage::{SecureStorageError, SecureStorageManager};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

#[derive(Serialize, Deserialize)]
pub struct SecretMetadata {
    pub key: String,
    pub exists: bool,
}

/// Initialize the secure storage with a password hash
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

/// Store a secret in the secure storage
#[tauri::command]
pub async fn store_secret(
    key: String,
    secret_data: Vec<u8>,
    storage: State<'_, SecureStorageManager>,
) -> Result<(), SecureStorageError> {
    storage.store_secret(&key, &secret_data).await
}

/// Check if a secret exists in the secure storage
#[tauri::command]
pub async fn has_secret(
    key: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<bool, SecureStorageError> {
    storage.has_secret(&key).await
}

/// Remove a secret from the secure storage
#[tauri::command]
pub async fn remove_secret(
    key: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<(), SecureStorageError> {
    storage.remove_secret(&key).await
}

/// Clear all secrets from the secure storage
#[tauri::command]
pub async fn clear_secure_storage(
    storage: State<'_, SecureStorageManager>,
) -> Result<(), SecureStorageError> {
    storage.clear().await?;
    Ok(())
}

/// Check if the secure storage is initialized
#[tauri::command]
pub async fn is_secure_storage_initialized(
    storage: State<'_, SecureStorageManager>,
) -> Result<bool, SecureStorageError> {
    Ok(storage.is_initialized().await)
}

/// Get metadata for multiple secrets (existence check)
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
