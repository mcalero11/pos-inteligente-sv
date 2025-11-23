use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use serde::{Deserialize, Serialize};
use tauri::command;

use super::repository::{User, UserRepository};
use crate::infrastructure::database::get_connection;

#[derive(Debug, Serialize, Deserialize)]
pub struct UsersResponse {
    pub success: bool,
    pub data: Option<Vec<User>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub success: bool,
    pub data: Option<User>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub user: Option<User>,
    pub error: Option<String>,
}

#[command]
pub async fn get_users(active_only: Option<bool>) -> UsersResponse {
    let active = active_only.unwrap_or(true);

    match get_connection() {
        Ok(conn) => match UserRepository::find_all(&conn, active) {
            Ok(users) => UsersResponse {
                success: true,
                data: Some(users),
                error: None,
            },
            Err(e) => UsersResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch users: {}", e)),
            },
        },
        Err(e) => UsersResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn get_cashiers() -> UsersResponse {
    match get_connection() {
        Ok(conn) => match UserRepository::get_cashiers(&conn) {
            Ok(users) => UsersResponse {
                success: true,
                data: Some(users),
                error: None,
            },
            Err(e) => UsersResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch cashiers: {}", e)),
            },
        },
        Err(e) => UsersResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

// Note: hash_pin and verify_pin are defined in commands/auth.rs
// They are re-used here via the legacy commands module

pub fn hash_pin_internal(pin: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(pin.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| format!("Failed to hash PIN: {}", e))
}

pub fn verify_pin_internal(pin_hash: &str, pin: &str) -> bool {
    let parsed_hash = match PasswordHash::new(pin_hash) {
        Ok(h) => h,
        Err(_) => return false,
    };

    Argon2::default()
        .verify_password(pin.as_bytes(), &parsed_hash)
        .is_ok()
}

#[command]
pub async fn authenticate_user(username: String, pin: String) -> AuthResponse {
    let conn = match get_connection() {
        Ok(c) => c,
        Err(e) => {
            return AuthResponse {
                success: false,
                user: None,
                error: Some(format!("Database connection failed: {}", e)),
            }
        }
    };

    let user = match UserRepository::find_by_username(&conn, &username) {
        Ok(Some(u)) => u,
        Ok(None) => {
            return AuthResponse {
                success: false,
                user: None,
                error: Some("User not found".to_string()),
            }
        }
        Err(e) => {
            return AuthResponse {
                success: false,
                user: None,
                error: Some(format!("Failed to fetch user: {}", e)),
            }
        }
    };

    if !user.is_active {
        return AuthResponse {
            success: false,
            user: None,
            error: Some("User is inactive".to_string()),
        };
    }

    let pin_hash = match &user.pin_hash {
        Some(h) => h,
        None => {
            return AuthResponse {
                success: false,
                user: None,
                error: Some("User has no PIN set".to_string()),
            }
        }
    };

    let is_valid = verify_pin_internal(pin_hash, &pin);

    if is_valid {
        let _ = UserRepository::update_last_login(&conn, user.id);
        AuthResponse {
            success: true,
            user: Some(user),
            error: None,
        }
    } else {
        AuthResponse {
            success: false,
            user: None,
            error: Some("Invalid PIN".to_string()),
        }
    }
}
