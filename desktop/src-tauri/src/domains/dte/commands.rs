use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{State, command};

use super::service::DteSignerService;
use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize)]
pub struct SignDteInput {
    pub dte_type: String,
    pub json_data: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignDteResult {
    pub signed_data: String,
    pub codigo_generacion: String,
    pub numero_control: String,
}

#[command]
pub async fn sign_dte(
    payload: SignDteInput,
    signer_state: State<'_, Mutex<DteSignerService>>,
) -> Result<SignDteResult, AppError> {
    let signer = signer_state
        .lock()
        .map_err(|e| AppError::Dte(format!("Failed to acquire signer lock: {}", e)))?;

    if !signer.is_loaded() {
        return Err(AppError::Dte(
            "Certificate not loaded. Please load a certificate first.".to_string(),
        ));
    }

    let result = signer
        .sign(&payload.json_data)
        .map_err(|e| AppError::Dte(format!("Signing failed: {}", e)))?;

    Ok(SignDteResult {
        signed_data: result.signed_data.unwrap_or_default(),
        codigo_generacion: result.codigo_generacion.unwrap_or_default(),
        numero_control: result.numero_control.unwrap_or_default(),
    })
}

#[command]
pub async fn load_certificate(
    path: String,
    password: String,
    signer_state: State<'_, Mutex<DteSignerService>>,
) -> Result<bool, AppError> {
    let mut signer = signer_state
        .lock()
        .map_err(|e| AppError::Dte(format!("Failed to acquire signer lock: {}", e)))?;

    signer
        .load_certificate(&path, &password)
        .map_err(|e| AppError::Dte(format!("Failed to load certificate: {}", e)))?;

    Ok(true)
}

#[command]
pub async fn is_certificate_loaded(
    signer_state: State<'_, Mutex<DteSignerService>>,
) -> Result<bool, AppError> {
    match signer_state.lock() {
        Ok(signer) => Ok(signer.is_loaded()),
        Err(_) => Ok(false),
    }
}
