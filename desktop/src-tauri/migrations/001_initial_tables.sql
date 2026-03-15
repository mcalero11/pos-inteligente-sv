-- Initial database schema for POS system
-- This migration creates all necessary tables with proper indexes and constraints

-- Users table - stores system users with role-based access
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    pin_hash TEXT NOT NULL,  -- Removed UNIQUE: users can have same PIN
    role TEXT NOT NULL,
    full_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    permissions TEXT NOT NULL,
    -- Backend sync fields
    company_id TEXT,
    backend_user_id TEXT,
    phone_number TEXT,
    email TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories table - product categories
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    -- Backend sync fields
    backend_id TEXT UNIQUE,
    sync_status TEXT DEFAULT 'synced',  -- 'pending', 'synced', 'conflict'
    last_synced_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products table - inventory items
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    partner_price DECIMAL(10,2) NOT NULL,
    vip_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    -- Stock and cost management
    stock_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost DECIMAL(10,2),  -- Cost for profitability analysis
    is_active BOOLEAN NOT NULL DEFAULT 1,
    -- Backend sync fields
    backend_id TEXT UNIQUE,
    sync_status TEXT DEFAULT 'synced',
    last_synced_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Customers table - customer information
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    -- El Salvador tax identifiers
    nit TEXT,  -- Número de Identificación Tributaria (15 digits)
    nrc TEXT,  -- Número de Registro de Contribuyente
    tax_id TEXT,  -- Legacy/generic tax ID
    taxpayer_type TEXT DEFAULT 'NORMAL',  -- 'NORMAL', 'GRAN_CONTRIBUYENTE', 'EXENTO'
    is_company BOOLEAN NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    -- Backend sync fields
    backend_id TEXT UNIQUE,
    sync_status TEXT DEFAULT 'synced',
    last_synced_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table - sales transactions with user tracking
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER,
    user_id INTEGER NOT NULL,
    session_id INTEGER,  -- Link to cash register session
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',  -- 'draft', 'held', 'quote', 'completed', 'cancelled', 'refunded'
    notes TEXT,
    dte_id INTEGER,
    -- Return tracking
    original_transaction_id INTEGER,  -- Link to original sale if this is a return
    return_type TEXT,  -- 'full', 'partial', NULL
    -- Backend sync fields
    backend_id TEXT UNIQUE,
    sync_status TEXT DEFAULT 'pending',
    last_synced_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES cash_register_sessions(id),
    FOREIGN KEY (original_transaction_id) REFERENCES transactions(id)
);

-- Transaction items table - individual items in transactions
CREATE TABLE transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    applied_price_tier TEXT,  -- 'retail', 'partner', 'vip' - which tier was applied
    -- Pharmacy-specific fields
    doctor_name TEXT,
    doctor_license TEXT,
    requires_prescription BOOLEAN DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- DTE table - DTE documents
CREATE TABLE dte (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    dte_type TEXT NOT NULL,  -- 'FCF', 'CCF', 'CRE', 'LIQUIDACION', 'INVALIDACION'
    dte_control_number TEXT NOT NULL,
    dte_date DATETIME NOT NULL,
    dte_json TEXT NOT NULL,
    dte_status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected', 'contingency'
    dte_error_message TEXT,
    -- El Salvador MH fields
    codigo_generacion TEXT UNIQUE,  -- Unique code assigned by Hacienda
    sello TEXT,  -- Digital signature seal
    -- Contingency handling
    is_contingency BOOLEAN DEFAULT 0,
    contingency_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at DATETIME,
    dte_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dte_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Payments table - split payment support for transactions
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    payment_method TEXT NOT NULL,  -- 'cash', 'card', 'transfer', 'check', 'credit'
    amount DECIMAL(10,2) NOT NULL,
    reference_number TEXT,  -- Card transaction reference, check number, etc.
    card_last_four TEXT,  -- Last 4 digits of card (for card payments)
    notes TEXT,
    -- Backend sync fields
    backend_id TEXT UNIQUE,
    sync_status TEXT DEFAULT 'pending',
    last_synced_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Cash register sessions table - shift/session management
CREATE TABLE cash_register_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    opening_balance DECIMAL(10,2) NOT NULL,
    closing_balance DECIMAL(10,2),
    expected_balance DECIMAL(10,2),
    difference DECIMAL(10,2),  -- closing_balance - expected_balance
    status TEXT NOT NULL DEFAULT 'open',  -- 'open', 'closed'
    notes TEXT,
    opened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    -- Backend sync fields
    backend_id TEXT UNIQUE,
    sync_status TEXT DEFAULT 'pending',
    last_synced_at DATETIME,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cash movements table - track cash in/out during session (withdrawals, deposits)
CREATE TABLE cash_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    type TEXT NOT NULL,  -- 'withdrawal', 'deposit', 'adjustment'
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    performed_by INTEGER NOT NULL,
    notes TEXT,
    -- Backend sync fields
    backend_id TEXT UNIQUE,
    sync_status TEXT DEFAULT 'pending',
    last_synced_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES cash_register_sessions(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Stock movements table - inventory ledger for tracking stock changes
CREATE TABLE stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL,  -- 'purchase', 'sale', 'return', 'adjustment', 'loss', 'transfer'
    quantity DECIMAL(10,2) NOT NULL,  -- Positive for increases, negative for decreases
    reference_type TEXT,  -- 'transaction', 'purchase_order', 'manual', etc.
    reference_id INTEGER,  -- ID of related transaction, PO, etc.
    unit_cost DECIMAL(10,2),  -- Cost per unit at time of movement
    notes TEXT,
    user_id INTEGER,  -- User who performed the movement
    -- Backend sync fields
    backend_id TEXT UNIQUE,
    sync_status TEXT DEFAULT 'pending',
    last_synced_at DATETIME,
    version INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- System settings table - application configuration
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    is_system BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table - system activity tracking
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_name ON products(name);

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_active ON customers(is_active);

CREATE INDEX idx_transactions_number ON transactions(transaction_number);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);

CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

CREATE INDEX idx_dte_control_number ON dte(dte_control_number);
CREATE INDEX idx_dte_status ON dte(dte_status);
CREATE INDEX idx_dte_date ON dte(dte_date);

CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_method ON payments(payment_method);

CREATE INDEX idx_sessions_user ON cash_register_sessions(user_id);
CREATE INDEX idx_sessions_status ON cash_register_sessions(status);
CREATE INDEX idx_sessions_opened ON cash_register_sessions(opened_at);

CREATE INDEX idx_cash_movements_session ON cash_movements(session_id);
CREATE INDEX idx_cash_movements_type ON cash_movements(type);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
