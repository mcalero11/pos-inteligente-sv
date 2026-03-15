use base64::Engine;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use tauri::Manager;

/// A single SQL statement to execute within a transaction.
#[derive(Debug, Deserialize)]
pub struct TransactionStatement {
    pub sql: String,
    pub params: Vec<JsonValue>,
    #[serde(default)]
    pub query: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecuteResult {
    pub rows_affected: usize,
    pub last_insert_id: i64,
}

#[derive(Debug, Serialize)]
pub struct QueryResult {
    pub rows: Vec<serde_json::Map<String, JsonValue>>,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum StatementResult {
    #[serde(rename_all = "camelCase")]
    Execute {
        rows_affected: usize,
        last_insert_id: i64,
    },
    Query {
        rows: Vec<serde_json::Map<String, JsonValue>>,
    },
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionResult {
    pub results: Vec<StatementResult>,
    pub last_insert_id: i64,
}

use crate::error::AppError;

#[tauri::command]
pub async fn execute_transaction(
    app_handle: tauri::AppHandle,
    statements: Vec<TransactionStatement>,
) -> Result<TransactionResult, AppError> {
    tokio::task::spawn_blocking(move || execute_transaction_sync(&app_handle, statements))
        .await
        .map_err(|e| AppError::TaskJoin(e.to_string()))?
        .map_err(AppError::Database)
}

fn execute_transaction_sync(
    app_handle: &tauri::AppHandle,
    statements: Vec<TransactionStatement>,
) -> Result<TransactionResult, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let db_path = app_data_dir.join("pos_database.db");

    let conn = rusqlite::Connection::open(&db_path)
        .map_err(|e| format!("Failed to open database: {}", e))?;

    configure_pragmas(&conn)?;

    conn.execute("BEGIN IMMEDIATE", [])
        .map_err(|e| format!("Failed to begin transaction: {}", e))?;

    let mut results = Vec::with_capacity(statements.len());
    let mut insert_ids: Vec<i64> = Vec::with_capacity(statements.len());
    let mut last_insert_id: i64 = 0;

    for (i, stmt) in statements.iter().enumerate() {
        let resolved_params = resolve_params(&stmt.params, &insert_ids, last_insert_id)?;

        if stmt.query {
            match execute_query(&conn, &stmt.sql, &resolved_params) {
                Ok(rows) => {
                    insert_ids.push(0);
                    results.push(StatementResult::Query { rows });
                }
                Err(e) => {
                    let _ = conn.execute("ROLLBACK", []);
                    return Err(format!("Statement {} failed: {}", i, e));
                }
            }
        } else {
            match execute_statement(&conn, &stmt.sql, &resolved_params) {
                Ok(rows_affected) => {
                    last_insert_id = conn.last_insert_rowid();
                    insert_ids.push(last_insert_id);
                    results.push(StatementResult::Execute {
                        rows_affected,
                        last_insert_id,
                    });
                }
                Err(e) => {
                    let _ = conn.execute("ROLLBACK", []);
                    return Err(format!("Statement {} failed: {}", i, e));
                }
            }
        }
    }

    conn.execute("COMMIT", [])
        .map_err(|e| format!("Failed to commit: {}", e))?;

    Ok(TransactionResult {
        results,
        last_insert_id,
    })
}

fn configure_pragmas(conn: &rusqlite::Connection) -> Result<(), String> {
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA foreign_keys = ON;
         PRAGMA cache_size = -64000;
         PRAGMA temp_store = MEMORY;
         PRAGMA busy_timeout = 5000;
         PRAGMA defer_foreign_keys = ON;",
    )
    .map_err(|e| format!("Failed to configure PRAGMAs: {}", e))
}

fn resolve_params(
    params: &[JsonValue],
    insert_ids: &[i64],
    last_insert_id: i64,
) -> Result<Vec<JsonValue>, String> {
    params
        .iter()
        .map(|p| match p {
            JsonValue::String(s) if s == "$LAST_INSERT_ID" => {
                Ok(JsonValue::Number(last_insert_id.into()))
            }
            JsonValue::String(s) if s.starts_with("$INSERT_ID_") => {
                let idx_str = &s["$INSERT_ID_".len()..];
                let idx: usize = idx_str
                    .parse()
                    .map_err(|_| format!("Invalid statement index in {}", s))?;
                let id = insert_ids
                    .get(idx)
                    .ok_or_else(|| format!("Statement index {} not yet executed", idx))?;
                Ok(JsonValue::Number((*id).into()))
            }
            other => Ok(other.clone()),
        })
        .collect()
}

fn json_to_rusqlite_params(params: &[JsonValue]) -> Vec<Box<dyn rusqlite::types::ToSql>> {
    params
        .iter()
        .map(|p| -> Box<dyn rusqlite::types::ToSql> {
            match p {
                JsonValue::Null => Box::new(rusqlite::types::Null),
                JsonValue::Bool(b) => Box::new(*b as i64),
                JsonValue::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else if let Some(f) = n.as_f64() {
                        Box::new(f)
                    } else {
                        Box::new(n.to_string())
                    }
                }
                JsonValue::String(s) => Box::new(s.clone()),
                other => Box::new(other.to_string()),
            }
        })
        .collect()
}

fn execute_statement(
    conn: &rusqlite::Connection,
    sql: &str,
    params: &[JsonValue],
) -> Result<usize, rusqlite::Error> {
    let rusqlite_params = json_to_rusqlite_params(params);
    let param_refs: Vec<&dyn rusqlite::types::ToSql> =
        rusqlite_params.iter().map(|p| p.as_ref()).collect();
    conn.execute(sql, param_refs.as_slice())
}

fn execute_query(
    conn: &rusqlite::Connection,
    sql: &str,
    params: &[JsonValue],
) -> Result<Vec<serde_json::Map<String, JsonValue>>, rusqlite::Error> {
    let rusqlite_params = json_to_rusqlite_params(params);
    let param_refs: Vec<&dyn rusqlite::types::ToSql> =
        rusqlite_params.iter().map(|p| p.as_ref()).collect();

    let mut stmt = conn.prepare(sql)?;
    let column_names: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();

    let rows = stmt.query_map(param_refs.as_slice(), |row| {
        let mut map = serde_json::Map::new();
        for (i, name) in column_names.iter().enumerate() {
            let value = row.get_ref(i)?;
            let json_val = rusqlite_value_to_json(value);
            map.insert(name.clone(), json_val);
        }
        Ok(map)
    })?;

    rows.collect::<Result<Vec<_>, _>>()
}

fn rusqlite_value_to_json(value: rusqlite::types::ValueRef<'_>) -> JsonValue {
    match value {
        rusqlite::types::ValueRef::Null => JsonValue::Null,
        rusqlite::types::ValueRef::Integer(i) => JsonValue::Number(i.into()),
        rusqlite::types::ValueRef::Real(f) => serde_json::Number::from_f64(f)
            .map(JsonValue::Number)
            .unwrap_or(JsonValue::Null),
        rusqlite::types::ValueRef::Text(t) => {
            JsonValue::String(String::from_utf8_lossy(t).to_string())
        }
        rusqlite::types::ValueRef::Blob(b) => {
            JsonValue::String(base64::engine::general_purpose::STANDARD.encode(b))
        }
    }
}
