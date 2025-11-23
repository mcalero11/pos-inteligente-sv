use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: i64,
    pub category_id: Option<i64>,
    pub name: String,
    pub description: Option<String>,
    pub barcode: Option<String>,
    pub price: f64,
    pub partner_price: f64,
    pub vip_price: f64,
    pub cost: Option<f64>,
    pub stock: i32,
    pub min_stock: i32,
    pub max_stock: i32,
    pub discount_percentage: f64,
    pub image_url: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub parent_id: Option<i64>,
    pub sort_order: i32,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

pub struct ProductRepository;

impl ProductRepository {
    pub fn find_all(conn: &Connection, active_only: bool) -> Result<Vec<Product>> {
        let sql = if active_only {
            "SELECT * FROM products WHERE is_active = 1 ORDER BY name ASC"
        } else {
            "SELECT * FROM products ORDER BY name ASC"
        };

        let mut stmt = conn.prepare(sql)?;
        let products = stmt
            .query_map([], |row| {
                Ok(Product {
                    id: row.get(0)?,
                    category_id: row.get(1)?,
                    name: row.get(2)?,
                    description: row.get(3)?,
                    barcode: row.get(4)?,
                    price: row.get(5)?,
                    partner_price: row.get(6)?,
                    vip_price: row.get(7)?,
                    cost: row.get(8)?,
                    stock: row.get(9)?,
                    min_stock: row.get(10)?,
                    max_stock: row.get(11)?,
                    discount_percentage: row.get(12)?,
                    image_url: row.get(13)?,
                    is_active: row.get::<_, i32>(14)? == 1,
                    created_at: row.get(15)?,
                    updated_at: row.get(16)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(products)
    }

    pub fn find_by_id(conn: &Connection, id: i64) -> Result<Option<Product>> {
        let mut stmt = conn.prepare("SELECT * FROM products WHERE id = ?")?;
        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Product {
                id: row.get(0)?,
                category_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                barcode: row.get(4)?,
                price: row.get(5)?,
                partner_price: row.get(6)?,
                vip_price: row.get(7)?,
                cost: row.get(8)?,
                stock: row.get(9)?,
                min_stock: row.get(10)?,
                max_stock: row.get(11)?,
                discount_percentage: row.get(12)?,
                image_url: row.get(13)?,
                is_active: row.get::<_, i32>(14)? == 1,
                created_at: row.get(15)?,
                updated_at: row.get(16)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn find_by_barcode(conn: &Connection, barcode: &str) -> Result<Option<Product>> {
        let mut stmt =
            conn.prepare("SELECT * FROM products WHERE barcode = ? AND is_active = 1")?;
        let mut rows = stmt.query(params![barcode])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Product {
                id: row.get(0)?,
                category_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                barcode: row.get(4)?,
                price: row.get(5)?,
                partner_price: row.get(6)?,
                vip_price: row.get(7)?,
                cost: row.get(8)?,
                stock: row.get(9)?,
                min_stock: row.get(10)?,
                max_stock: row.get(11)?,
                discount_percentage: row.get(12)?,
                image_url: row.get(13)?,
                is_active: row.get::<_, i32>(14)? == 1,
                created_at: row.get(15)?,
                updated_at: row.get(16)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn update_stock(conn: &Connection, id: i64, quantity_change: i32) -> Result<()> {
        conn.execute(
            "UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            params![quantity_change, id],
        )?;
        Ok(())
    }
}

pub struct CategoryRepository;

impl CategoryRepository {
    pub fn find_all(conn: &Connection, active_only: bool) -> Result<Vec<Category>> {
        let sql = if active_only {
            "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC"
        } else {
            "SELECT * FROM categories ORDER BY sort_order ASC, name ASC"
        };

        let mut stmt = conn.prepare(sql)?;
        let categories = stmt
            .query_map([], |row| {
                Ok(Category {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    parent_id: row.get(3)?,
                    sort_order: row.get(4)?,
                    is_active: row.get::<_, i32>(5)? == 1,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(categories)
    }

    pub fn find_by_id(conn: &Connection, id: i64) -> Result<Option<Category>> {
        let mut stmt = conn.prepare("SELECT * FROM categories WHERE id = ?")?;
        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                parent_id: row.get(3)?,
                sort_order: row.get(4)?,
                is_active: row.get::<_, i32>(5)? == 1,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            }))
        } else {
            Ok(None)
        }
    }
}
