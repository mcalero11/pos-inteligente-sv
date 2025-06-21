use crate::services::dte_signer::{DteSigningError, DteSigningService, SignedDte};
use crate::services::secure_storage::SecureStorageManager;
use tauri::State;

/// Sign a DTE document using the specified private key
#[tauri::command]
pub async fn sign_dte_document(
    document_xml: String,
    private_key_id: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<SignedDte, DteSigningError> {
    DteSigningService::sign_dte(&storage, &document_xml, &private_key_id).await
}

/// Check if we can sign DTE documents with the specified private key
#[tauri::command]
pub async fn can_sign_dte(
    private_key_id: String,
    storage: State<'_, SecureStorageManager>,
) -> Result<bool, DteSigningError> {
    DteSigningService::can_sign(&storage, &private_key_id).await
}
