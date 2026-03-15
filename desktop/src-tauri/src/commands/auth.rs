use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};

use crate::error::AppError;

/// Hash a PIN using Argon2id
/// Returns the hash in PHC string format
#[tauri::command]
pub async fn hash_pin(pin: String) -> Result<String, AppError> {
    tokio::task::spawn_blocking(move || {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        argon2
            .hash_password(pin.as_bytes(), &salt)
            .map(|hash| hash.to_string())
            .map_err(|e| AppError::Auth(format!("Failed to hash PIN: {}", e)))
    })
    .await
    .map_err(|e| AppError::TaskJoin(e.to_string()))?
}

/// Verify a PIN against its Argon2 hash
/// Supports both legacy SHA256 hashes and new Argon2 hashes
#[tauri::command]
pub async fn verify_pin(pin: String, hash: String) -> Result<bool, AppError> {
    tokio::task::spawn_blocking(move || {
        // Try Argon2 verification first (new format)
        if let Ok(parsed_hash) = PasswordHash::new(&hash) {
            let argon2 = Argon2::default();
            return argon2.verify_password(pin.as_bytes(), &parsed_hash).is_ok();
        }

        // Fallback to SHA256 for legacy hashes (64 hex characters)
        // This allows existing users to continue logging in
        if hash.len() == 64 && hash.chars().all(|c| c.is_ascii_hexdigit()) {
            use sha2::{Digest, Sha256};
            let mut hasher = Sha256::new();
            hasher.update(pin.as_bytes());
            let pin_hash = format!("{:x}", hasher.finalize());
            return pin_hash == hash;
        }

        false
    })
    .await
    .map_err(|e| AppError::TaskJoin(e.to_string()))
}
