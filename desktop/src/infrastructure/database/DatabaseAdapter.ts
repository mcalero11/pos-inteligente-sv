import Database from '@tauri-apps/plugin-sql';
import { logger } from '../logging/Logger';

export type QueryResult = Record<string, unknown>[];

export interface DatabaseConfig {
  path: string;
}

/**
 * DatabaseAdapter - Thin facade over Tauri SQL plugin
 *
 * This adapter provides a simple interface for database operations.
 * Domain services use this adapter instead of directly accessing the database.
 * This allows for:
 * - Centralized connection management
 * - Query logging and error handling
 * - Easy testing with mock implementations
 */
class DatabaseAdapterClass {
  private db: Database | null = null;
  private readonly dbPath = 'sqlite:pos_database.db';
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      this.db = await Database.load(this.dbPath);
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to initialize database', { error });
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    return this.db !== null;
  }

  /**
   * Execute a SELECT query and return results
   */
  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T[]> {
    await this.ensureConnection();

    try {
      const result = await this.db!.select<T[]>(sql, params);
      logger.debug('Query executed', { sql: sql.substring(0, 100), rowCount: result.length });
      return result;
    } catch (error) {
      logger.error('Query failed', { sql, params, error });
      throw error;
    }
  }

  /**
   * Execute a single-row SELECT query
   */
  async queryOne<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results[0] || null;
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE query
   * Returns the number of affected rows and last insert ID
   */
  async execute(
    sql: string,
    params: unknown[] = []
  ): Promise<{ rowsAffected: number; lastInsertId: number }> {
    await this.ensureConnection();

    try {
      const result = await this.db!.execute(sql, params);
      logger.debug('Execute completed', {
        sql: sql.substring(0, 100),
        rowsAffected: result.rowsAffected,
      });
      return {
        rowsAffected: result.rowsAffected,
        lastInsertId: result.lastInsertId ?? 0,
      };
    } catch (error) {
      logger.error('Execute failed', { sql, params, error });
      throw error;
    }
  }

  /**
   * Execute multiple statements in a transaction
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.ensureConnection();

    try {
      await this.db!.execute('BEGIN TRANSACTION');
      const result = await fn();
      await this.db!.execute('COMMIT');
      return result;
    } catch (error) {
      await this.db!.execute('ROLLBACK');
      logger.error('Transaction rolled back', { error });
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.initPromise = null;
      logger.info('Database connection closed');
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
  }
}

// Singleton export
export const DatabaseAdapter = new DatabaseAdapterClass();

// Type helpers for building queries
export function buildInsertQuery(
  table: string,
  data: Record<string, unknown>
): { sql: string; params: unknown[] } {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const params = Object.values(data);
  return { sql, params };
}

export function buildUpdateQuery(
  table: string,
  data: Record<string, unknown>,
  whereClause: string,
  whereParams: unknown[] = []
): { sql: string; params: unknown[] } {
  const sets = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(', ');
  const sql = `UPDATE ${table} SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause}`;
  const params = [...Object.values(data), ...whereParams];
  return { sql, params };
}
