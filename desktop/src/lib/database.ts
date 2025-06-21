import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';
import { logger } from './logger';

// Database interfaces matching the updated schema
export interface User {
  id: number;
  username: string;
  pin_hash: string; // Hashed 4-digit PIN for local authentication
  role: 'admin' | 'cashier';
  full_name: string;
  is_active: boolean;
  permissions: string; // JSON string of permissions
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  users?: string[];
  products?: string[];
  categories?: string[];
  customers?: string[];
  transactions?: string[];
  reports?: string[];
  settings?: string[];
  audit?: string[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  barcode?: string;
  name: string;
  description?: string;
  category_id: number;
  price: number;
  partner_price: number;
  vip_price: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  is_company: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  transaction_number: string;
  customer_id?: number;
  user_id: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  status: string;
  notes?: string;
  dte_id?: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  created_at: string;
}

export interface DTE {
  id: number;
  transaction_id: number;
  dte_control_number: string;
  dte_date: string;
  dte_json: string;
  dte_status: string;
  dte_error_message?: string;
  dte_created_at: string;
  dte_updated_at: string;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  table_name?: string;
  record_id?: number;
  old_values?: string; // JSON
  new_values?: string; // JSON
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Database service class
export class DatabaseService {
  private db: Database | null = null;

  async connect(): Promise<void> {
    try {
      this.db = await Database.load('sqlite:pos_database.db');
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      logger.info('Database disconnected');
    }
  }

  private ensureConnected(): Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // User management methods
  async authenticateUser(username: string, pin: string): Promise<User | null> {
    try {
      const db = this.ensureConnected();

      // First get the user by username
      const userResult = await db.select<User[]>(
        'SELECT * FROM users WHERE username = $1 AND is_active = 1',
        [username]
      );

      if (userResult.length === 0) {
        return null;
      }

      const user = userResult[0];

      // Verify PIN hash
      const isValidPin = await invoke<boolean>('verify_pin', {
        pin,
        hash: user.pin_hash
      });

      if (!isValidPin) {
        return null;
      }

      // Parse permissions JSON
      user.permissions = JSON.parse(user.permissions as unknown as string);

      logger.info(`User authenticated: ${username}`);
      return user;
    } catch (error) {
      logger.error('Failed to authenticate user', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'pin_hash'> & { pin: string }): Promise<User> {
    try {
      const db = this.ensureConnected();

      // Validate PIN format (4 digits)
      if (!/^\d{4}$/.test(userData.pin)) {
        throw new Error('PIN must be exactly 4 digits');
      }

      // Hash the PIN
      const pinHash = await invoke<string>('hash_pin', { pin: userData.pin });

      // Check for PIN hash uniqueness
      const existingPin = await db.select<{ count: number }[]>(
        'SELECT COUNT(*) as count FROM users WHERE pin_hash = $1',
        [pinHash]
      );

      if (existingPin[0].count > 0) {
        throw new Error('PIN already exists. Please choose a different PIN.');
      }

      const permissionsJson = JSON.stringify(userData.permissions);

      const result = await db.execute(
        `INSERT INTO users (username, pin_hash, role, full_name, is_active, permissions) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userData.username, pinHash, userData.role, userData.full_name,
        userData.is_active, permissionsJson]
      );

      if (!result.lastInsertId) {
        throw new Error('Failed to get user ID after creation');
      }

      const newUser = await this.getUserById(result.lastInsertId);
      if (!newUser) {
        throw new Error('Failed to retrieve created user');
      }

      logger.info(`User created: ${userData.username}`);
      return newUser;
    } catch (error) {
      logger.error('Failed to create user', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<User[]>('SELECT * FROM users WHERE id = $1', [id]);

      if (result.length === 0) {
        return null;
      }

      const user = result[0];
      user.permissions = JSON.parse(user.permissions as unknown as string);
      return user;
    } catch (error) {
      logger.error('Failed to get user by ID', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<User[]>('SELECT * FROM users ORDER BY created_at DESC');

      return result.map(user => ({
        ...user,
        permissions: JSON.parse(user.permissions as unknown as string)
      }));
    } catch (error) {
      logger.error('Failed to get all users', error);
      throw error;
    }
  }

  // Category management methods
  async getAllCategories(): Promise<Category[]> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Category[]>(
        'SELECT * FROM categories WHERE is_active = 1 ORDER BY name'
      );
      return result;
    } catch (error) {
      logger.error('Failed to get categories', error);
      throw error;
    }
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    try {
      const db = this.ensureConnected();
      const result = await db.execute(
        'INSERT INTO categories (name, description, is_active) VALUES ($1, $2, $3)',
        [categoryData.name, categoryData.description || null, categoryData.is_active]
      );

      if (!result.lastInsertId) {
        throw new Error('Failed to get category ID after creation');
      }

      const newCategory = await this.getCategoryById(result.lastInsertId);
      if (!newCategory) {
        throw new Error('Failed to retrieve created category');
      }

      logger.info(`Category created: ${categoryData.name}`);
      return newCategory;
    } catch (error) {
      logger.error('Failed to create category', error);
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<Category | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Category[]>('SELECT * FROM categories WHERE id = $1', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get category by ID', error);
      throw error;
    }
  }

  // Product management methods
  async getAllProducts(): Promise<Product[]> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Product[]>(
        'SELECT * FROM products WHERE is_active = 1 ORDER BY name'
      );
      return result;
    } catch (error) {
      logger.error('Failed to get products', error);
      throw error;
    }
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Product[]>(
        'SELECT * FROM products WHERE category_id = $1 AND is_active = 1 ORDER BY name',
        [categoryId]
      );
      return result;
    } catch (error) {
      logger.error('Failed to get products by category', error);
      throw error;
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      const db = this.ensureConnected();
      const result = await db.execute(
        `INSERT INTO products (barcode, name, description, category_id, price, partner_price, 
         vip_price, discount_percentage, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          productData.barcode || null,
          productData.name,
          productData.description || null,
          productData.category_id,
          productData.price,
          productData.partner_price,
          productData.vip_price,
          productData.discount_percentage,
          productData.is_active
        ]
      );

      if (!result.lastInsertId) {
        throw new Error('Failed to get product ID after creation');
      }

      const newProduct = await this.getProductById(result.lastInsertId);
      if (!newProduct) {
        throw new Error('Failed to retrieve created product');
      }

      logger.info(`Product created: ${productData.name}`);
      return newProduct;
    } catch (error) {
      logger.error('Failed to create product', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Product[]>('SELECT * FROM products WHERE id = $1', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get product by ID', error);
      throw error;
    }
  }

  // System settings methods
  async getSystemSetting(key: string): Promise<string | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<SystemSetting[]>(
        'SELECT * FROM system_settings WHERE key = $1',
        [key]
      );
      return result.length > 0 ? result[0].value : null;
    } catch (error) {
      logger.error('Failed to get system setting', error);
      throw error;
    }
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    try {
      const db = this.ensureConnected();
      await db.execute(
        `INSERT OR REPLACE INTO system_settings (key, value, updated_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [key, value]
      );
      logger.info(`System setting updated: ${key} = ${value}`);
    } catch (error) {
      logger.error('Failed to set system setting', error);
      throw error;
    }
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<SystemSetting[]>(
        'SELECT * FROM system_settings ORDER BY category, key'
      );
      return result;
    } catch (error) {
      logger.error('Failed to get all system settings', error);
      throw error;
    }
  }

  // Transaction methods
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    try {
      const db = this.ensureConnected();
      const result = await db.execute(
        `INSERT INTO transactions (transaction_number, customer_id, user_id, subtotal, 
         tax_amount, discount_amount, total, payment_method, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          transactionData.transaction_number,
          transactionData.customer_id || null,
          transactionData.user_id,
          transactionData.subtotal,
          transactionData.tax_amount,
          transactionData.discount_amount,
          transactionData.total,
          transactionData.payment_method,
          transactionData.status,
          transactionData.notes || null
        ]
      );

      if (!result.lastInsertId) {
        throw new Error('Failed to get transaction ID after creation');
      }

      const newTransaction = await this.getTransactionById(result.lastInsertId);
      if (!newTransaction) {
        throw new Error('Failed to retrieve created transaction');
      }

      logger.info(`Transaction created: ${transactionData.transaction_number}`);
      return newTransaction;
    } catch (error) {
      logger.error('Failed to create transaction', error);
      throw error;
    }
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Transaction[]>('SELECT * FROM transactions WHERE id = $1', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get transaction by ID', error);
      throw error;
    }
  }

  async getTransactionsByUser(userId: number, limit: number = 50): Promise<Transaction[]> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Transaction[]>(
        'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
        [userId, limit]
      );
      return result;
    } catch (error) {
      logger.error('Failed to get transactions by user', error);
      throw error;
    }
  }

  // Customer methods
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Customer[]>(
        'SELECT * FROM customers WHERE is_active = 1 ORDER BY name'
      );
      return result;
    } catch (error) {
      logger.error('Failed to get customers', error);
      throw error;
    }
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    try {
      const db = this.ensureConnected();
      const result = await db.execute(
        `INSERT INTO customers (name, email, phone, address, tax_id, is_company, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          customerData.name,
          customerData.email || null,
          customerData.phone || null,
          customerData.address || null,
          customerData.tax_id || null,
          customerData.is_company,
          customerData.is_active
        ]
      );

      if (!result.lastInsertId) {
        throw new Error('Failed to get customer ID after creation');
      }

      const newCustomer = await this.getCustomerById(result.lastInsertId);
      if (!newCustomer) {
        throw new Error('Failed to retrieve created customer');
      }

      logger.info(`Customer created: ${customerData.name}`);
      return newCustomer;
    } catch (error) {
      logger.error('Failed to create customer', error);
      throw error;
    }
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<Customer[]>('SELECT * FROM customers WHERE id = $1', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get customer by ID', error);
      throw error;
    }
  }

  // DTE methods
  async createDTE(dteData: Omit<DTE, 'id' | 'dte_created_at' | 'dte_updated_at'>): Promise<DTE> {
    try {
      const db = this.ensureConnected();
      const result = await db.execute(
        `INSERT INTO dte (transaction_id, dte_control_number, dte_date, dte_json, dte_status, dte_error_message) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          dteData.transaction_id,
          dteData.dte_control_number,
          dteData.dte_date,
          dteData.dte_json,
          dteData.dte_status,
          dteData.dte_error_message || null
        ]
      );

      if (!result.lastInsertId) {
        throw new Error('Failed to get DTE ID after creation');
      }

      const newDTE = await this.getDTEById(result.lastInsertId);
      if (!newDTE) {
        throw new Error('Failed to retrieve created DTE');
      }

      logger.info(`DTE created: ${dteData.dte_control_number}`);
      return newDTE;
    } catch (error) {
      logger.error('Failed to create DTE', error);
      throw error;
    }
  }

  async getDTEById(id: number): Promise<DTE | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<DTE[]>('SELECT * FROM dte WHERE id = $1', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get DTE by ID', error);
      throw error;
    }
  }

  async getDTEByTransactionId(transactionId: number): Promise<DTE | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<DTE[]>('SELECT * FROM dte WHERE transaction_id = $1', [transactionId]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get DTE by transaction ID', error);
      throw error;
    }
  }

  // Transaction Items methods
  async createTransactionItem(itemData: Omit<TransactionItem, 'id' | 'created_at'>): Promise<TransactionItem> {
    try {
      const db = this.ensureConnected();
      const result = await db.execute(
        `INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, discount_amount, total_price) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          itemData.transaction_id,
          itemData.product_id,
          itemData.quantity,
          itemData.unit_price,
          itemData.discount_amount,
          itemData.total_price
        ]
      );

      if (!result.lastInsertId) {
        throw new Error('Failed to get transaction item ID after creation');
      }

      const newItem = await this.getTransactionItemById(result.lastInsertId);
      if (!newItem) {
        throw new Error('Failed to retrieve created transaction item');
      }

      return newItem;
    } catch (error) {
      logger.error('Failed to create transaction item', error);
      throw error;
    }
  }

  async getTransactionItemById(id: number): Promise<TransactionItem | null> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<TransactionItem[]>('SELECT * FROM transaction_items WHERE id = $1', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get transaction item by ID', error);
      throw error;
    }
  }

  async getTransactionItems(transactionId: number): Promise<TransactionItem[]> {
    try {
      const db = this.ensureConnected();
      const result = await db.select<TransactionItem[]>(
        'SELECT * FROM transaction_items WHERE transaction_id = $1 ORDER BY created_at',
        [transactionId]
      );
      return result;
    } catch (error) {
      logger.error('Failed to get transaction items', error);
      throw error;
    }
  }

  // Audit logging
  async logAudit(auditData: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    try {
      const db = this.ensureConnected();
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, 
         new_values, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          auditData.user_id || null,
          auditData.action,
          auditData.table_name || null,
          auditData.record_id || null,
          auditData.old_values || null,
          auditData.new_values || null,
          auditData.ip_address || null,
          auditData.user_agent || null
        ]
      );
    } catch (error) {
      logger.error('Failed to log audit entry', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
