use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Role {
    #[serde(rename = "admin")]
    Admin,
    #[serde(rename = "supervisor")]
    Supervisor,
    #[serde(rename = "cashier")]
    Cashier,
}

impl From<String> for Role {
    fn from(s: String) -> Self {
        match s.as_str() {
            "admin" => Role::Admin,
            "supervisor" => Role::Supervisor,
            _ => Role::Cashier,
        }
    }
}

impl ToString for Role {
    fn to_string(&self) -> String {
        match self {
            Role::Admin => "admin".to_string(),
            Role::Supervisor => "supervisor".to_string(),
            Role::Cashier => "cashier".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i64,
    pub username: String,
    pub email: Option<String>,
    pub full_name: String,
    pub role: Role,
    pub pin_hash: Option<String>,
    pub is_active: bool,
    pub last_login_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

pub struct UserRepository;

impl UserRepository {
    pub fn find_all(conn: &Connection, active_only: bool) -> Result<Vec<User>> {
        let sql = if active_only {
            "SELECT * FROM users WHERE is_active = 1 ORDER BY full_name ASC"
        } else {
            "SELECT * FROM users ORDER BY full_name ASC"
        };

        let mut stmt = conn.prepare(sql)?;
        let users = stmt
            .query_map([], |row| {
                Ok(User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    email: row.get(2)?,
                    full_name: row.get(3)?,
                    role: Role::from(row.get::<_, String>(4)?),
                    pin_hash: row.get(5)?,
                    is_active: row.get::<_, i32>(6)? == 1,
                    last_login_at: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(users)
    }

    pub fn find_by_id(conn: &Connection, id: i64) -> Result<Option<User>> {
        let mut stmt = conn.prepare("SELECT * FROM users WHERE id = ?")?;
        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(User {
                id: row.get(0)?,
                username: row.get(1)?,
                email: row.get(2)?,
                full_name: row.get(3)?,
                role: Role::from(row.get::<_, String>(4)?),
                pin_hash: row.get(5)?,
                is_active: row.get::<_, i32>(6)? == 1,
                last_login_at: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn find_by_username(conn: &Connection, username: &str) -> Result<Option<User>> {
        let mut stmt = conn.prepare("SELECT * FROM users WHERE username = ?")?;
        let mut rows = stmt.query(params![username])?;

        if let Some(row) = rows.next()? {
            Ok(Some(User {
                id: row.get(0)?,
                username: row.get(1)?,
                email: row.get(2)?,
                full_name: row.get(3)?,
                role: Role::from(row.get::<_, String>(4)?),
                pin_hash: row.get(5)?,
                is_active: row.get::<_, i32>(6)? == 1,
                last_login_at: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn update_last_login(conn: &Connection, user_id: i64) -> Result<()> {
        conn.execute(
            "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
            params![user_id],
        )?;
        Ok(())
    }

    pub fn get_cashiers(conn: &Connection) -> Result<Vec<User>> {
        let mut stmt = conn.prepare(
            "SELECT * FROM users WHERE role IN ('cashier', 'supervisor') AND is_active = 1 ORDER BY full_name ASC",
        )?;
        let users = stmt
            .query_map([], |row| {
                Ok(User {
                    id: row.get(0)?,
                    username: row.get(1)?,
                    email: row.get(2)?,
                    full_name: row.get(3)?,
                    role: Role::from(row.get::<_, String>(4)?),
                    pin_hash: row.get(5)?,
                    is_active: row.get::<_, i32>(6)? == 1,
                    last_login_at: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(users)
    }
}
