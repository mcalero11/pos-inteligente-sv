-- POS Inteligente - Seed Data
-- Run with: sqlite3 /path/to/pos_database.db < scripts/seed.sql

-- ============================================
-- System Settings
-- ============================================
INSERT OR IGNORE INTO system_settings (key, value, description, category, is_system) VALUES
('tax_rate', '13.0', 'Default tax rate percentage (IVA El Salvador)', 'financial', 1),
('currency', 'USD', 'System currency', 'financial', 1),
('receipt_footer', 'Gracias por su compra', 'Footer text for receipts', 'receipt', 0),
('company_name', 'Mi Farmacia', 'Company name for receipts', 'company', 0),
('company_address', '', 'Company address', 'company', 0),
('company_phone', '', 'Company phone number', 'company', 0),
('low_stock_alert', '10', 'Minimum stock level for alerts', 'inventory', 0),
('backup_frequency', '24', 'Backup frequency in hours', 'system', 1),
('session_timeout', '480', 'Session timeout in minutes', 'security', 1),
('default_customer_name', 'Consumidor Final', 'Default customer name for transactions', 'ui', 0),
('default_customer_type', 'general', 'Default customer type', 'ui', 0);

-- ============================================
-- Categories (Pharmacy-focused)
-- ============================================
INSERT OR IGNORE INTO categories (name, description, is_active) VALUES
('Medicamentos', 'Medicamentos y productos farmaceuticos', 1),
('Cuidado Personal', 'Productos de higiene y cuidado personal', 1),
('Vitaminas y Suplementos', 'Vitaminas, minerales y suplementos nutricionales', 1),
('Primeros Auxilios', 'Productos para primeros auxilios y emergencias', 1),
('Bebe y Maternidad', 'Productos para bebes y madres', 1),
('Equipos Medicos', 'Equipos y dispositivos medicos', 1),
('Cosmeticos', 'Productos de belleza y cosmeticos', 1),
('General', 'Productos generales y otros', 1);

-- ============================================
-- Products (Sample pharmacy products)
-- ============================================
INSERT OR IGNORE INTO products (barcode, name, description, category_id, price, partner_price, vip_price, discount_percentage, stock_quantity, cost, is_active) VALUES
-- Medicamentos (category_id = 1)
('7501234567890', 'Acetaminofen 500mg', 'Tabletas para dolor y fiebre - Caja 20 unidades', 1, 2.50, 2.25, 2.00, 0, 50, 1.50, 1),
('7501234567891', 'Ibuprofeno 400mg', 'Antiinflamatorio - Caja 20 tabletas', 1, 3.75, 3.40, 3.00, 0, 45, 2.25, 1),
('7501234567892', 'Amoxicilina 500mg', 'Antibiotico - Caja 21 capsulas', 1, 8.50, 7.65, 6.80, 0, 30, 5.10, 1),
('7501234567893', 'Omeprazol 20mg', 'Protector gastrico - Caja 14 capsulas', 1, 5.25, 4.75, 4.20, 0, 40, 3.15, 1),
('7501234567894', 'Loratadina 10mg', 'Antialergico - Caja 10 tabletas', 1, 3.00, 2.70, 2.40, 0, 35, 1.80, 1),

-- Cuidado Personal (category_id = 2)
('7502234567890', 'Jabon Antibacterial', 'Jabon liquido 250ml', 2, 2.99, 2.69, 2.39, 0, 60, 1.79, 1),
('7502234567891', 'Shampoo Anticaspa', 'Shampoo 400ml', 2, 5.50, 4.95, 4.40, 0, 40, 3.30, 1),
('7502234567892', 'Pasta Dental', 'Pasta dental con fluor 100ml', 2, 2.25, 2.00, 1.80, 0, 70, 1.35, 1),
('7502234567893', 'Desodorante Roll-on', 'Desodorante 50ml', 2, 3.50, 3.15, 2.80, 0, 55, 2.10, 1),

-- Vitaminas y Suplementos (category_id = 3)
('7503234567890', 'Vitamina C 1000mg', 'Tabletas efervescentes - Tubo 10 unidades', 3, 4.99, 4.49, 3.99, 0, 48, 2.99, 1),
('7503234567891', 'Multivitaminico', 'Tabletas - Frasco 30 unidades', 3, 12.50, 11.25, 10.00, 0, 25, 7.50, 1),
('7503234567892', 'Omega 3', 'Capsulas blandas - Frasco 60 unidades', 3, 15.00, 13.50, 12.00, 0, 20, 9.00, 1),

-- Primeros Auxilios (category_id = 4)
('7504234567890', 'Alcohol 70%', 'Botella 250ml', 4, 1.75, 1.58, 1.40, 0, 80, 1.05, 1),
('7504234567891', 'Curitas Adhesivas', 'Caja 100 unidades surtidas', 4, 3.25, 2.93, 2.60, 0, 65, 1.95, 1),
('7504234567892', 'Gasa Esteril', 'Paquete 10 unidades 10x10cm', 4, 2.50, 2.25, 2.00, 0, 75, 1.50, 1),
('7504234567893', 'Agua Oxigenada', 'Botella 120ml', 4, 1.25, 1.13, 1.00, 0, 90, 0.75, 1),

-- Bebe y Maternidad (category_id = 5)
('7505234567890', 'Panales Talla M', 'Paquete 40 unidades', 5, 12.99, 11.69, 10.39, 0, 35, 7.79, 1),
('7505234567891', 'Formula Infantil', 'Lata 400g', 5, 18.50, 16.65, 14.80, 0, 20, 11.10, 1),
('7505234567892', 'Toallitas Humedas', 'Paquete 80 unidades', 5, 3.99, 3.59, 3.19, 0, 45, 2.39, 1),

-- Equipos Medicos (category_id = 6)
('7506234567890', 'Termometro Digital', 'Termometro con pantalla LCD', 6, 8.99, 8.09, 7.19, 0, 15, 5.39, 1),
('7506234567891', 'Tensiometro de Brazo', 'Monitor de presion arterial digital', 6, 35.00, 31.50, 28.00, 0, 10, 21.00, 1),
('7506234567892', 'Oximetro de Pulso', 'Medidor de saturacion de oxigeno', 6, 25.00, 22.50, 20.00, 0, 12, 15.00, 1),

-- Cosmeticos (category_id = 7)
('7507234567890', 'Crema Hidratante', 'Crema facial 50ml', 7, 9.99, 8.99, 7.99, 0, 30, 5.99, 1),
('7507234567891', 'Protector Solar SPF50', 'Locion 120ml', 7, 12.50, 11.25, 10.00, 0, 28, 7.50, 1),

-- General (category_id = 8)
('7508234567890', 'Mascarillas Desechables', 'Caja 50 unidades', 8, 5.00, 4.50, 4.00, 0, 100, 3.00, 1),
('7508234567891', 'Guantes de Latex', 'Caja 100 unidades talla M', 8, 8.50, 7.65, 6.80, 0, 85, 5.10, 1);

-- ============================================
-- Default Customer (Consumidor Final)
-- ============================================
INSERT OR IGNORE INTO customers (name, email, phone, address, tax_id, is_company, is_active) VALUES
('Consumidor Final', NULL, NULL, NULL, NULL, 0, 1);

-- ============================================
-- Users
-- NOTE: PIN hashes below are SHA-256 for development only.
-- In production, use the app's hash_pin command (Argon2) to generate proper hashes.
-- Default PINs: admin=1234, cajero=5678
-- ============================================
INSERT OR IGNORE INTO users (username, pin_hash, role, full_name, is_active, permissions) VALUES
('admin', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'admin', 'Administrador del Sistema', 1,
 '{"users": ["create", "read", "update", "delete"], "products": ["create", "read", "update", "delete"], "categories": ["create", "read", "update", "delete"], "customers": ["create", "read", "update", "delete"], "transactions": ["create", "read", "update", "delete", "refund"], "reports": ["read", "export"], "settings": ["read", "update"], "audit": ["read"]}'),
('cajero', 'a9a51e283d6abc45b3d55e7cf98f557fde6d75cb77d30c90f42e8e5aa3c0f8cd', 'cashier', 'Cajero Principal', 1,
 '{"products": ["read"], "customers": ["create", "read", "update"], "transactions": ["create", "read"], "reports": ["read"]}');

-- ============================================
-- Cash Register Sessions (Sample for testing)
-- ============================================
INSERT OR IGNORE INTO cash_register_sessions (id, user_id, opening_balance, status, notes, opened_at) VALUES
(1, 2, 100.00, 'open', 'Turno de apertura', datetime('now', '-2 hours'));

-- ============================================
-- Stock Movements (Initial stock for products)
-- ============================================
INSERT OR IGNORE INTO stock_movements (product_id, movement_type, quantity, reference_type, unit_cost, notes, user_id) VALUES
-- Initial stock purchases for medicines
(1, 'purchase', 50, 'manual', 1.50, 'Compra inicial - Acetaminofen', 1),
(2, 'purchase', 45, 'manual', 2.25, 'Compra inicial - Ibuprofeno', 1),
(3, 'purchase', 30, 'manual', 5.10, 'Compra inicial - Amoxicilina', 1),
-- Initial stock for personal care
(6, 'purchase', 60, 'manual', 1.79, 'Compra inicial - Jabon', 1),
(7, 'purchase', 40, 'manual', 3.30, 'Compra inicial - Shampoo', 1),
-- Initial stock for general items
(24, 'purchase', 100, 'manual', 3.00, 'Compra inicial - Mascarillas', 1),
(25, 'purchase', 85, 'manual', 5.10, 'Compra inicial - Guantes', 1);

-- ============================================
-- Summary
-- ============================================
-- Categories: 8
-- Products: 26
-- Users: 2 (admin/1234, cajero/5678)
-- Customers: 1 (Consumidor Final)
-- Settings: 11
-- Cash Sessions: 1 (open)
-- Stock Movements: 7 (initial purchases)
