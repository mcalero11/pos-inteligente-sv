use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SaleStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "voided")]
    Voided,
    #[serde(rename = "refunded")]
    Refunded,
}

impl From<String> for SaleStatus {
    fn from(s: String) -> Self {
        match s.as_str() {
            "pending" => SaleStatus::Pending,
            "completed" => SaleStatus::Completed,
            "voided" => SaleStatus::Voided,
            "refunded" => SaleStatus::Refunded,
            _ => SaleStatus::Pending,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Sale {
    pub id: i64,
    pub customer_id: Option<i64>,
    pub user_id: i64,
    pub subtotal: f64,
    pub tax_amount: f64,
    pub discount_amount: f64,
    pub total: f64,
    pub payment_method: String,
    pub status: SaleStatus,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleItem {
    pub id: i64,
    pub transaction_id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub discount_amount: f64,
    pub subtotal: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSaleInput {
    pub customer_id: Option<i64>,
    pub user_id: i64,
    pub items: Vec<CreateSaleItemInput>,
    pub payment_method: String,
    pub discount_amount: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSaleItemInput {
    pub product_id: i64,
    pub product_name: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub discount_amount: Option<f64>,
}

pub struct SalesRepository;

impl SalesRepository {
    pub fn find_by_id(conn: &Connection, id: i64) -> Result<Option<Sale>> {
        let mut stmt = conn.prepare("SELECT * FROM transactions WHERE id = ?")?;
        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Sale {
                id: row.get(0)?,
                customer_id: row.get(1)?,
                user_id: row.get(2)?,
                subtotal: row.get(3)?,
                tax_amount: row.get(4)?,
                discount_amount: row.get(5)?,
                total: row.get(6)?,
                payment_method: row.get(7)?,
                status: SaleStatus::from(row.get::<_, String>(8)?),
                notes: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_items(conn: &Connection, sale_id: i64) -> Result<Vec<SaleItem>> {
        let mut stmt = conn.prepare(
            "SELECT * FROM transaction_items WHERE transaction_id = ? ORDER BY id ASC",
        )?;

        let items = stmt
            .query_map(params![sale_id], |row| {
                Ok(SaleItem {
                    id: row.get(0)?,
                    transaction_id: row.get(1)?,
                    product_id: row.get(2)?,
                    product_name: row.get(3)?,
                    quantity: row.get(4)?,
                    unit_price: row.get(5)?,
                    discount_amount: row.get(6)?,
                    subtotal: row.get(7)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(items)
    }

    pub fn create(conn: &Connection, input: &CreateSaleInput, tax_rate: f64) -> Result<i64> {
        // Calculate totals
        let mut subtotal = 0.0;
        for item in &input.items {
            let item_subtotal =
                item.unit_price * (item.quantity as f64) - item.discount_amount.unwrap_or(0.0);
            subtotal += item_subtotal;
        }

        let tax_amount = (subtotal * tax_rate * 100.0).round() / 100.0;
        let total =
            ((subtotal + tax_amount - input.discount_amount.unwrap_or(0.0)) * 100.0).round()
                / 100.0;

        // Create transaction
        conn.execute(
            "INSERT INTO transactions (customer_id, user_id, subtotal, tax_amount, discount_amount, total, payment_method, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)",
            params![
                input.customer_id,
                input.user_id,
                subtotal,
                tax_amount,
                input.discount_amount.unwrap_or(0.0),
                total,
                input.payment_method,
                input.notes,
            ],
        )?;

        let sale_id = conn.last_insert_rowid();

        // Create items
        for item in &input.items {
            let item_subtotal =
                item.unit_price * (item.quantity as f64) - item.discount_amount.unwrap_or(0.0);

            conn.execute(
                "INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, discount_amount, subtotal)
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                params![
                    sale_id,
                    item.product_id,
                    item.product_name,
                    item.quantity,
                    item.unit_price,
                    item.discount_amount.unwrap_or(0.0),
                    item_subtotal,
                ],
            )?;

            // Update stock
            conn.execute(
                "UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                params![item.quantity, item.product_id],
            )?;
        }

        Ok(sale_id)
    }

    pub fn void_sale(conn: &Connection, id: i64, reason: Option<&str>) -> Result<()> {
        // Get sale items to restore stock
        let items = Self::get_items(conn, id)?;

        // Update sale status
        let notes = reason
            .map(|r| format!("ANULADO: {}", r))
            .unwrap_or_else(|| "ANULADO".to_string());

        conn.execute(
            "UPDATE transactions SET status = 'voided', notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            params![notes, id],
        )?;

        // Restore stock
        for item in items {
            conn.execute(
                "UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                params![item.quantity, item.product_id],
            )?;
        }

        Ok(())
    }
}
