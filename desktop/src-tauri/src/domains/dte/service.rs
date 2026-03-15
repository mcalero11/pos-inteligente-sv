use base64::{Engine, engine::general_purpose::STANDARD};
use rsa::{
    RsaPrivateKey,
    pkcs1v15::SigningKey,
    signature::{SignatureEncoding, Signer},
};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DteSignerError {
    #[error("Certificate not loaded")]
    CertificateNotLoaded,
    #[error("Failed to sign document: {0}")]
    SigningFailed(String),
    #[error("Invalid document format: {0}")]
    InvalidDocument(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SigningResult {
    pub success: bool,
    pub signed_data: Option<String>,
    pub codigo_generacion: Option<String>,
    pub numero_control: Option<String>,
    pub error: Option<String>,
}

pub struct DteSignerService {
    private_key: Option<RsaPrivateKey>,
}

impl DteSignerService {
    pub fn new() -> Self {
        DteSignerService { private_key: None }
    }

    pub fn load_certificate(&mut self, _path: &str, _password: &str) -> Result<(), DteSignerError> {
        // TODO: Implement actual certificate loading from PKCS12/PFX file
        // For now, generate a test key
        let mut rng = rand::thread_rng();
        let bits = 2048;
        let private_key = RsaPrivateKey::new(&mut rng, bits)
            .map_err(|e| DteSignerError::SigningFailed(e.to_string()))?;

        self.private_key = Some(private_key);
        Ok(())
    }

    pub fn is_loaded(&self) -> bool {
        self.private_key.is_some()
    }

    pub fn sign(&self, document: &str) -> Result<SigningResult, DteSignerError> {
        let private_key = self
            .private_key
            .as_ref()
            .ok_or(DteSignerError::CertificateNotLoaded)?;

        if document.is_empty() {
            return Err(DteSignerError::InvalidDocument(
                "Document cannot be empty".to_string(),
            ));
        }

        // Create signing key (use unprefixed since we don't have OID)
        let signing_key = SigningKey::<Sha256>::new_unprefixed(private_key.clone());

        // Sign the document
        let signature = signing_key.sign(document.as_bytes());
        let signature_base64 = STANDARD.encode(signature.to_bytes());

        // Generate codigo and numero control
        let codigo_generacion = generate_uuid();
        let numero_control = format!("DTE-{}", generate_sequence());

        Ok(SigningResult {
            success: true,
            signed_data: Some(signature_base64),
            codigo_generacion: Some(codigo_generacion),
            numero_control: Some(numero_control),
            error: None,
        })
    }
}

impl Default for DteSignerService {
    fn default() -> Self {
        Self::new()
    }
}

fn generate_uuid() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    format!(
        "{:08X}-{:04X}-4{:03X}-{:04X}-{:012X}",
        (timestamp >> 96) as u32,
        (timestamp >> 80) as u16,
        (timestamp >> 68) as u16 & 0x0FFF,
        ((timestamp >> 52) as u16 & 0x3FFF) | 0x8000,
        timestamp as u64 & 0xFFFFFFFFFFFF
    )
}

fn generate_sequence() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();

    format!("{:08}", timestamp % 100000000)
}
