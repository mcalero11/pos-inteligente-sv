import Database from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";
import { logger } from "../logging/Logger";

export type QueryResult = Record<string, unknown>[];

export interface DatabaseConfig {
  path: string;
}

// --- Transaction batch types ---

export interface TransactionStatement {
  sql: string;
  params: (string | number | boolean | null)[];
  query?: boolean;
}

export interface ExecuteStatementResult {
  type: "execute";
  rowsAffected: number;
  lastInsertId: number;
}

export interface QueryStatementResult {
  type: "query";
  rows: Record<string, unknown>[];
}

export type StatementResult = ExecuteStatementResult | QueryStatementResult;

export interface TransactionResult {
  results: StatementResult[];
  lastInsertId: number;
}

/**
 * Placeholder: replaced at runtime with the lastInsertId from the most recent
 * execute statement within the same transaction.
 */
export const LAST_INSERT_ID = "$LAST_INSERT_ID";

/**
 * Returns a placeholder that references the lastInsertId from a specific
 * statement by its index within the transaction batch.
 */
export function insertIdOf(statementIndex: number): string {
  return `$INSERT_ID_${statementIndex}`;
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
  private readonly dbPath = "sqlite:pos_database.db";
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

      // Configure SQLite PRAGMAs for better performance and concurrency
      await this.configurePragmas();

      // Log PRAGMA status for debugging
      await this.logPragmaStatus();

      logger.info("Database connection established");
    } catch (error) {
      logger.error("Failed to initialize database", { error });
      throw error;
    }
  }

  /**
   * Configure SQLite PRAGMA settings for optimal performance
   */
  private async configurePragmas(): Promise<void> {
    try {
      // Enable Write-Ahead Logging for better concurrent access
      await this.db!.execute("PRAGMA journal_mode = WAL");

      // Reduce disk syncing while maintaining safety in WAL mode
      await this.db!.execute("PRAGMA synchronous = NORMAL");

      // Enable foreign key constraints for data integrity
      await this.db!.execute("PRAGMA foreign_keys = ON");

      // Cache size: 64MB for better query performance
      await this.db!.execute("PRAGMA cache_size = -64000");

      // Store temporary tables in memory
      await this.db!.execute("PRAGMA temp_store = MEMORY");

      logger.debug("SQLite PRAGMAs configured successfully");
    } catch (error) {
      logger.warn("Failed to configure PRAGMAs", { error });
    }
  }

  /**
   * Log current PRAGMA settings for debugging
   */
  private async logPragmaStatus(): Promise<void> {
    try {
      const journalMode = await this.db!.select<[{ journal_mode: string }]>(
        "PRAGMA journal_mode"
      );
      const synchronous =
        await this.db!.select<[{ synchronous: number }]>("PRAGMA synchronous");
      const foreignKeys = await this.db!.select<[{ foreign_keys: number }]>(
        "PRAGMA foreign_keys"
      );
      const cacheSize =
        await this.db!.select<[{ cache_size: number }]>("PRAGMA cache_size");

      logger.info("Database PRAGMA configuration", {
        journal_mode: journalMode[0]?.journal_mode,
        synchronous: synchronous[0]?.synchronous,
        foreign_keys: foreignKeys[0]?.foreign_keys === 1 ? "ON" : "OFF",
        cache_size: cacheSize[0]?.cache_size,
      });
    } catch (error) {
      logger.warn("Failed to read PRAGMA status", { error });
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

    const operationStart = Date.now();

    try {
      const result = await this.db!.select<T[]>(sql, params);
      const duration = Date.now() - operationStart;

      logger.debug(`[QUERY] Completed (${duration}ms)`, {
        sql: sql.substring(0, 100),
        rowCount: result.length,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - operationStart;
      logger.error(`[QUERY] Failed (${duration}ms)`, {
        sql,
        params,
        error,
      });
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

    const operationStart = Date.now();

    logger.debug("[EXECUTE] Starting", {
      sql: sql.substring(0, 100),
      params,
    });

    try {
      const result = await this.db!.execute(sql, params);
      const duration = Date.now() - operationStart;

      logger.debug(`[EXECUTE] Completed (${duration}ms)`, {
        sql: sql.substring(0, 100),
        rowsAffected: result.rowsAffected,
      });

      return {
        rowsAffected: result.rowsAffected,
        lastInsertId: result.lastInsertId ?? 0,
      };
    } catch (error) {
      const duration = Date.now() - operationStart;
      logger.error(`[EXECUTE] Failed (${duration}ms)`, {
        sql,
        params,
        error,
      });
      throw error;
    }
  }

  /**
   * Execute multiple statements in a single atomic transaction on the Rust side.
   * Uses a dedicated rusqlite connection to avoid the "database is locked" bug
   * caused by the sqlx pool dispatching statements to different connections.
   *
   * Use LAST_INSERT_ID or insertIdOf(n) as param values to reference
   * lastInsertId from previous execute statements within the batch.
   */
  async transactionBatch(
    statements: TransactionStatement[]
  ): Promise<TransactionResult> {
    const transactionStart = Date.now();
    logger.info("[TRANSACTION_BATCH] Starting", {
      statementCount: statements.length,
    });

    try {
      const result = await invoke<TransactionResult>("execute_transaction", {
        statements,
      });

      const duration = Date.now() - transactionStart;
      logger.info(`[TRANSACTION_BATCH] Completed (${duration}ms)`, {
        statementCount: statements.length,
        lastInsertId: result.lastInsertId,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - transactionStart;
      logger.error(`[TRANSACTION_BATCH] Failed (${duration}ms)`, { error });
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
      logger.info("Database connection closed");
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
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
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
    .join(", ");
  const sql = `UPDATE ${table} SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause}`;
  const params = [...Object.values(data), ...whereParams];
  return { sql, params };
}
