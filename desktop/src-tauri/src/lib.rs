mod commands;
mod domains;
mod infrastructure;
mod plugins;
mod services;

use commands::*;
use services::secure_storage::SecureStorageManager;

// Re-export domain commands for use in invoke_handler
use domains::customers::{get_customer_by_id, get_customers, search_customers};
use domains::dte::{is_certificate_loaded, load_certificate, sign_dte};
use domains::products::{get_categories, get_product_by_barcode, get_product_by_id, get_products};
use domains::sales::{create_sale, get_sale_by_id, void_sale};
use domains::settings::{delete_setting, get_setting, get_settings, set_setting};
use domains::users::{authenticate_user, get_cashiers, get_users};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    plugins::configure_plugins(tauri::Builder::default())
        .manage(SecureStorageManager::new())
        .invoke_handler(tauri::generate_handler![
            // Secure Storage
            initialize_secure_storage,
            store_secret,
            has_secret,
            remove_secret,
            clear_secure_storage,
            is_secure_storage_initialized,
            get_secret_metadata,
            // System Commands
            open_log_folder,
            generate_test_logs,
            // Authentication
            hash_pin,
            verify_pin,
            // Domain: Products
            get_products,
            get_product_by_id,
            get_product_by_barcode,
            get_categories,
            // Domain: Sales
            get_sale_by_id,
            create_sale,
            void_sale,
            // Domain: Customers
            get_customers,
            get_customer_by_id,
            search_customers,
            // Domain: Users
            get_users,
            get_cashiers,
            authenticate_user,
            // Domain: DTE
            sign_dte,
            load_certificate,
            is_certificate_loaded,
            // Domain: Settings
            get_settings,
            get_setting,
            set_setting,
            delete_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
