use serde::{Deserialize, Serialize};
use tauri::command;

use super::repository::{Category, CategoryRepository, Product, ProductRepository};
use crate::infrastructure::database::get_connection;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductsResponse {
    pub success: bool,
    pub data: Option<Vec<Product>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductResponse {
    pub success: bool,
    pub data: Option<Product>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CategoriesResponse {
    pub success: bool,
    pub data: Option<Vec<Category>>,
    pub error: Option<String>,
}

#[command]
pub async fn get_products(active_only: Option<bool>) -> ProductsResponse {
    let active = active_only.unwrap_or(true);

    match get_connection() {
        Ok(conn) => match ProductRepository::find_all(&conn, active) {
            Ok(products) => ProductsResponse {
                success: true,
                data: Some(products),
                error: None,
            },
            Err(e) => ProductsResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch products: {}", e)),
            },
        },
        Err(e) => ProductsResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn get_product_by_id(id: i64) -> ProductResponse {
    match get_connection() {
        Ok(conn) => match ProductRepository::find_by_id(&conn, id) {
            Ok(product) => ProductResponse {
                success: true,
                data: product,
                error: None,
            },
            Err(e) => ProductResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch product: {}", e)),
            },
        },
        Err(e) => ProductResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn get_product_by_barcode(barcode: String) -> ProductResponse {
    match get_connection() {
        Ok(conn) => match ProductRepository::find_by_barcode(&conn, &barcode) {
            Ok(product) => ProductResponse {
                success: true,
                data: product,
                error: None,
            },
            Err(e) => ProductResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch product: {}", e)),
            },
        },
        Err(e) => ProductResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn get_categories(active_only: Option<bool>) -> CategoriesResponse {
    let active = active_only.unwrap_or(true);

    match get_connection() {
        Ok(conn) => match CategoryRepository::find_all(&conn, active) {
            Ok(categories) => CategoriesResponse {
                success: true,
                data: Some(categories),
                error: None,
            },
            Err(e) => CategoriesResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch categories: {}", e)),
            },
        },
        Err(e) => CategoriesResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}
