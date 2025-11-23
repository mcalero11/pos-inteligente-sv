use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Customer {
    pub id: i64,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub customer_type: String,
    pub document_type: Option<String>,
    pub document_number: Option<String>,
    pub nrc: Option<String>,
    pub is_active: bool,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

pub struct CustomerRepository;

impl CustomerRepository {
    pub fn find_all(conn: &Connection, active_only: bool) -> Result<Vec<Customer>> {
        let sql = if active_only {
            "SELECT * FROM customers WHERE is_active = 1 ORDER BY name ASC"
        } else {
            "SELECT * FROM customers ORDER BY name ASC"
        };

        let mut stmt = conn.prepare(sql)?;
        let customers = stmt
            .query_map([], |row| {
                Ok(Customer {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    email: row.get(2)?,
                    phone: row.get(3)?,
                    address: row.get(4)?,
                    customer_type: row.get(5)?,
                    document_type: row.get(6)?,
                    document_number: row.get(7)?,
                    nrc: row.get(8)?,
                    is_active: row.get::<_, i32>(9)? == 1,
                    notes: row.get(10)?,
                    created_at: row.get(11)?,
                    updated_at: row.get(12)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(customers)
    }

    pub fn find_by_id(conn: &Connection, id: i64) -> Result<Option<Customer>> {
        let mut stmt = conn.prepare("SELECT * FROM customers WHERE id = ?")?;
        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Customer {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                phone: row.get(3)?,
                address: row.get(4)?,
                customer_type: row.get(5)?,
                document_type: row.get(6)?,
                document_number: row.get(7)?,
                nrc: row.get(8)?,
                is_active: row.get::<_, i32>(9)? == 1,
                notes: row.get(10)?,
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn search(conn: &Connection, query: &str, limit: i32) -> Result<Vec<Customer>> {
        let pattern = format!("%{}%", query);
        let mut stmt = conn.prepare(
            "SELECT * FROM customers
             WHERE is_active = 1 AND (name LIKE ? OR document_number LIKE ? OR phone LIKE ?)
             ORDER BY name ASC LIMIT ?",
        )?;

        let customers = stmt
            .query_map(params![&pattern, &pattern, &pattern, limit], |row| {
                Ok(Customer {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    email: row.get(2)?,
                    phone: row.get(3)?,
                    address: row.get(4)?,
                    customer_type: row.get(5)?,
                    document_type: row.get(6)?,
                    document_number: row.get(7)?,
                    nrc: row.get(8)?,
                    is_active: row.get::<_, i32>(9)? == 1,
                    notes: row.get(10)?,
                    created_at: row.get(11)?,
                    updated_at: row.get(12)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(customers)
    }
}
