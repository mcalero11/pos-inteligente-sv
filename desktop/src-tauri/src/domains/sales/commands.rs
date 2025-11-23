use serde::{Deserialize, Serialize};
use tauri::command;

use super::repository::{CreateSaleInput, Sale, SaleItem, SalesRepository};
use crate::infrastructure::database::get_connection;

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleResponse {
    pub success: bool,
    pub data: Option<Sale>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleWithItemsResponse {
    pub success: bool,
    pub sale: Option<Sale>,
    pub items: Option<Vec<SaleItem>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSaleResponse {
    pub success: bool,
    pub sale_id: Option<i64>,
    pub error: Option<String>,
}

#[command]
pub async fn get_sale_by_id(id: i64) -> SaleWithItemsResponse {
    match get_connection() {
        Ok(conn) => {
            let sale = match SalesRepository::find_by_id(&conn, id) {
                Ok(s) => s,
                Err(e) => {
                    return SaleWithItemsResponse {
                        success: false,
                        sale: None,
                        items: None,
                        error: Some(format!("Failed to fetch sale: {}", e)),
                    }
                }
            };

            if let Some(sale) = sale {
                let items = match SalesRepository::get_items(&conn, id) {
                    Ok(i) => i,
                    Err(e) => {
                        return SaleWithItemsResponse {
                            success: false,
                            sale: None,
                            items: None,
                            error: Some(format!("Failed to fetch sale items: {}", e)),
                        }
                    }
                };

                SaleWithItemsResponse {
                    success: true,
                    sale: Some(sale),
                    items: Some(items),
                    error: None,
                }
            } else {
                SaleWithItemsResponse {
                    success: false,
                    sale: None,
                    items: None,
                    error: Some("Sale not found".to_string()),
                }
            }
        }
        Err(e) => SaleWithItemsResponse {
            success: false,
            sale: None,
            items: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn create_sale(input: CreateSaleInput) -> CreateSaleResponse {
    let tax_rate = 0.13; // TODO: Get from settings

    match get_connection() {
        Ok(conn) => match SalesRepository::create(&conn, &input, tax_rate) {
            Ok(sale_id) => CreateSaleResponse {
                success: true,
                sale_id: Some(sale_id),
                error: None,
            },
            Err(e) => CreateSaleResponse {
                success: false,
                sale_id: None,
                error: Some(format!("Failed to create sale: {}", e)),
            },
        },
        Err(e) => CreateSaleResponse {
            success: false,
            sale_id: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn void_sale(id: i64, reason: Option<String>) -> SaleResponse {
    match get_connection() {
        Ok(conn) => {
            if let Err(e) = SalesRepository::void_sale(&conn, id, reason.as_deref()) {
                return SaleResponse {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to void sale: {}", e)),
                };
            }

            match SalesRepository::find_by_id(&conn, id) {
                Ok(sale) => SaleResponse {
                    success: true,
                    data: sale,
                    error: None,
                },
                Err(e) => SaleResponse {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to fetch voided sale: {}", e)),
                },
            }
        }
        Err(e) => SaleResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}
