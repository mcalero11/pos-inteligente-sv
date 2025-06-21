use sha2::{Digest, Sha256};

/// Hash a PIN using SHA256
#[tauri::command]
pub fn hash_pin(pin: String) -> String {
    let mut hasher = Sha256::new();
    hasher.update(pin.as_bytes());
    format!("{:x}", hasher.finalize())
}

/// Verify a PIN against its hash
#[tauri::command]
pub fn verify_pin(pin: String, hash: String) -> bool {
    let pin_hash = hash_pin(pin);
    pin_hash == hash
}
