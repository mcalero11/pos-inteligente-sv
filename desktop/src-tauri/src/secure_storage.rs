use serde::Serialize;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub struct SecureStorageManager {
    initialized: Arc<RwLock<bool>>,
}

#[derive(Debug, thiserror::Error, Serialize)]
pub enum SecureStorageError {
    #[error("Storage not initialized")]
    NotInitialized,
    #[error("Storage error: {0}")]
    StorageError(String),
    #[error("Serialization error: {0}")]
    SerializationError(String),
}

impl From<String> for SecureStorageError {
    fn from(error: String) -> Self {
        SecureStorageError::StorageError(error)
    }
}

impl From<&str> for SecureStorageError {
    fn from(error: &str) -> Self {
        SecureStorageError::StorageError(error.to_string())
    }
}

impl From<serde_json::Error> for SecureStorageError {
    fn from(error: serde_json::Error) -> Self {
        SecureStorageError::SerializationError(error.to_string())
    }
}

impl SecureStorageManager {
    pub fn new() -> Self {
        Self {
            initialized: Arc::new(RwLock::new(false)),
        }
    }

    pub async fn initialize(
        &self,
        _password_hash: Vec<u8>,
        _vault_path: &str,
    ) -> Result<(), SecureStorageError> {
        // In Tauri v2, Stronghold initialization is handled by the plugin
        // We just track that the manager has been "initialized"
        let mut initialized = self.initialized.write().await;
        *initialized = true;
        Ok(())
    }

    pub async fn is_initialized(&self) -> bool {
        *self.initialized.read().await
    }

    pub async fn store_secret(
        &self,
        _key: &str,
        _secret_data: &[u8],
    ) -> Result<(), SecureStorageError> {
        if !self.is_initialized().await {
            return Err(SecureStorageError::NotInitialized);
        }

        // In Tauri v2, secret storage is handled by the Stronghold plugin via JavaScript
        // This method will be called from commands that interact with the plugin
        Ok(())
    }

    pub async fn get_secret(&self, _key: &str) -> Result<Vec<u8>, SecureStorageError> {
        if !self.is_initialized().await {
            return Err(SecureStorageError::NotInitialized);
        }

        // This will be implemented via Stronghold plugin commands
        // For now, return empty data
        Ok(vec![])
    }

    pub async fn has_secret(&self, _key: &str) -> Result<bool, SecureStorageError> {
        if !self.is_initialized().await {
            return Err(SecureStorageError::NotInitialized);
        }

        // This will be implemented via Stronghold plugin commands
        Ok(false)
    }

    pub async fn remove_secret(&self, _key: &str) -> Result<(), SecureStorageError> {
        if !self.is_initialized().await {
            return Err(SecureStorageError::NotInitialized);
        }

        // This will be implemented via Stronghold plugin commands
        Ok(())
    }

    pub async fn clear(&self) -> Result<(), SecureStorageError> {
        if !self.is_initialized().await {
            return Err(SecureStorageError::NotInitialized);
        }

        // Clear in-memory state only
        let mut initialized = self.initialized.write().await;
        *initialized = false;
        Ok(())
    }
}

impl Default for SecureStorageManager {
    fn default() -> Self {
        Self::new()
    }
}
