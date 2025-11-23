use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemSetting {
    pub key: String,
    pub value: Value,
    pub updated_at: String,
}

pub struct SettingsRepository;

impl SettingsRepository {
    pub fn get_all(conn: &Connection, prefix: Option<&str>) -> Result<Vec<SystemSetting>> {
        let sql = match prefix {
            Some(p) => format!(
                "SELECT key, value, updated_at FROM system_settings WHERE key LIKE '{}%'",
                p
            ),
            None => "SELECT key, value, updated_at FROM system_settings".to_string(),
        };

        let mut stmt = conn.prepare(&sql)?;
        let settings = stmt
            .query_map([], |row| {
                let value_str: String = row.get(1)?;
                let value: Value = serde_json::from_str(&value_str).unwrap_or(Value::String(value_str));

                Ok(SystemSetting {
                    key: row.get(0)?,
                    value,
                    updated_at: row.get(2)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(settings)
    }

    pub fn get(conn: &Connection, key: &str) -> Result<Option<Value>> {
        let mut stmt =
            conn.prepare("SELECT value FROM system_settings WHERE key = ?")?;
        let mut rows = stmt.query(params![key])?;

        if let Some(row) = rows.next()? {
            let value_str: String = row.get(0)?;
            let value: Value = serde_json::from_str(&value_str).unwrap_or(Value::String(value_str));
            Ok(Some(value))
        } else {
            Ok(None)
        }
    }

    pub fn set(conn: &Connection, key: &str, value: &Value) -> Result<()> {
        let value_str = serde_json::to_string(value).unwrap_or_default();

        conn.execute(
            "INSERT INTO system_settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP",
            params![key, &value_str, &value_str],
        )?;

        Ok(())
    }

    pub fn delete(conn: &Connection, key: &str) -> Result<()> {
        conn.execute("DELETE FROM system_settings WHERE key = ?", params![key])?;
        Ok(())
    }
}
