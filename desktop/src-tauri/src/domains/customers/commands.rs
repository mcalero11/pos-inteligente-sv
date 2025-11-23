use serde::{Deserialize, Serialize};
use tauri::command;

use super::repository::{Customer, CustomerRepository};
use crate::infrastructure::database::get_connection;

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomersResponse {
    pub success: bool,
    pub data: Option<Vec<Customer>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerResponse {
    pub success: bool,
    pub data: Option<Customer>,
    pub error: Option<String>,
}

#[command]
pub async fn get_customers(active_only: Option<bool>) -> CustomersResponse {
    let active = active_only.unwrap_or(true);

    match get_connection() {
        Ok(conn) => match CustomerRepository::find_all(&conn, active) {
            Ok(customers) => CustomersResponse {
                success: true,
                data: Some(customers),
                error: None,
            },
            Err(e) => CustomersResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch customers: {}", e)),
            },
        },
        Err(e) => CustomersResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn get_customer_by_id(id: i64) -> CustomerResponse {
    match get_connection() {
        Ok(conn) => match CustomerRepository::find_by_id(&conn, id) {
            Ok(customer) => CustomerResponse {
                success: true,
                data: customer,
                error: None,
            },
            Err(e) => CustomerResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to fetch customer: {}", e)),
            },
        },
        Err(e) => CustomerResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}

#[command]
pub async fn search_customers(query: String, limit: Option<i32>) -> CustomersResponse {
    let max_results = limit.unwrap_or(20);

    match get_connection() {
        Ok(conn) => match CustomerRepository::search(&conn, &query, max_results) {
            Ok(customers) => CustomersResponse {
                success: true,
                data: Some(customers),
                error: None,
            },
            Err(e) => CustomersResponse {
                success: false,
                data: None,
                error: Some(format!("Failed to search customers: {}", e)),
            },
        },
        Err(e) => CustomersResponse {
            success: false,
            data: None,
            error: Some(format!("Database connection failed: {}", e)),
        },
    }
}
