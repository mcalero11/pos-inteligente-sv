use serde::{Deserialize, Serialize};
use tauri::command;

use super::service::{SigningResult, DTE_SIGNER};

#[derive(Debug, Serialize, Deserialize)]
pub struct SignDteInput {
    pub dte_type: String,
    pub json_data: String,
}

#[command]
pub async fn sign_dte(payload: SignDteInput) -> SigningResult {
    let signer = match DTE_SIGNER.lock() {
        Ok(s) => s,
        Err(e) => {
            return SigningResult {
                success: false,
                signed_data: None,
                codigo_generacion: None,
                numero_control: None,
                error: Some(format!("Failed to acquire signer lock: {}", e)),
            }
        }
    };

    if !signer.is_loaded() {
        return SigningResult {
            success: false,
            signed_data: None,
            codigo_generacion: None,
            numero_control: None,
            error: Some("Certificate not loaded. Please load a certificate first.".to_string()),
        };
    }

    match signer.sign(&payload.json_data) {
        Ok(result) => result,
        Err(e) => SigningResult {
            success: false,
            signed_data: None,
            codigo_generacion: None,
            numero_control: None,
            error: Some(format!("Signing failed: {}", e)),
        },
    }
}

#[command]
pub async fn load_certificate(path: String, password: String) -> Result<bool, String> {
    let mut signer = DTE_SIGNER
        .lock()
        .map_err(|e| format!("Failed to acquire signer lock: {}", e))?;

    signer
        .load_certificate(&path, &password)
        .map_err(|e| format!("Failed to load certificate: {}", e))?;

    Ok(true)
}

#[command]
pub async fn is_certificate_loaded() -> bool {
    match DTE_SIGNER.lock() {
        Ok(signer) => signer.is_loaded(),
        Err(_) => false,
    }
}
