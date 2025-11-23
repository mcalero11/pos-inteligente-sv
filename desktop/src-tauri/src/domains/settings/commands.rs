use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::command;

use super::repository::{SettingsRepository, SystemSetting};
use crate::infrastructure::database::get_connection;

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingsResponse {
    pub success: bool,
    pub data: Option<Vec<SystemSetting>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingResponse {
    pub success: bool,
    pub value: Option<Value>,
    pub error: Option<String>,
}

#[command]
pub async fn get_settings(prefix: Option<String>) -> SettingsResponse {
    match get_connection() {
        Ok(conn) => match SettingsRepository::get_all(&conn, prefix.as_deref()) {
            Ok(settings) => SettingsResponse {
                success: true,
                data: Some(settings),
                error: None,
            },
            Err(e) => SettingsResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch settings: {}", e)),
            },
        },
        Err(e) => SettingsResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn get_setting(key: String) -> SettingResponse {
    match get_connection() {
        Ok(conn) => match SettingsRepository::get(&conn, &key) {
            Ok(value) => SettingResponse {
                success: true,
                value,
                error: None,
            },
            Err(e) => SettingResponse {
                success: false,
                value: None,
                error: Some(format!("Failed to fetch setting: {}", e)),
            },
        },
        Err(e) => SettingResponse {
            success: false,
            value: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn set_setting(key: String, value: Value) -> Result<bool, String> {
    let conn = get_connection().map_err(|e| format!("Database connection failed: {}", e))?;

    SettingsRepository::set(&conn, &key, &value)
        .map_err(|e| format!("Failed to save setting: {}", e))?;

    Ok(true)
}

#[command]
pub async fn delete_setting(key: String) -> Result<bool, String> {
    let conn = get_connection().map_err(|e| format!("Database connection failed: {}", e))?;

    SettingsRepository::delete(&conn, &key)
        .map_err(|e| format!("Failed to delete setting: {}", e))?;

    Ok(true)
}
