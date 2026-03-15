import { DatabaseAdapter } from "../../../infrastructure/database";
import { logger } from "../../../infrastructure/logging";
import type {
  AuditLog,
  CreateAuditLogInput,
  AuditAction,
} from "../entities/AuditLog";

interface AuditLogRow {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: string | null;
  created_at: string;
}

function mapRowToAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action as AuditAction,
    entityType: row.entity_type,
    entityId: row.entity_id ?? undefined,
    oldValue: row.old_value ?? undefined,
    newValue: row.new_value ?? undefined,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    createdAt: row.created_at,
  };
}

export class AuditService {
  async findAll(options?: {
    userId?: number;
    action?: AuditAction;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    let sql = "SELECT * FROM audit_logs WHERE 1=1";
    const params: unknown[] = [];

    if (options?.userId) {
      sql += " AND user_id = ?";
      params.push(options.userId);
    }

    if (options?.action) {
      sql += " AND action = ?";
      params.push(options.action);
    }

    if (options?.entityType) {
      sql += " AND entity_type = ?";
      params.push(options.entityType);
    }

    if (options?.startDate) {
      sql += " AND created_at >= ?";
      params.push(options.startDate);
    }

    if (options?.endDate) {
      sql += " AND created_at <= ?";
      params.push(options.endDate);
    }

    sql += " ORDER BY created_at DESC";

    if (options?.limit) {
      sql += " LIMIT ?";
      params.push(options.limit);
    } else {
      sql += " LIMIT 1000"; // Default limit
    }

    const rows = await DatabaseAdapter.query<AuditLogRow>(sql, params);
    return rows.map(mapRowToAuditLog);
  }

  async findById(id: number): Promise<AuditLog | null> {
    const row = await DatabaseAdapter.queryOne<AuditLogRow>(
      "SELECT * FROM audit_logs WHERE id = ?",
      [id]
    );
    return row ? mapRowToAuditLog(row) : null;
  }

  async log(input: CreateAuditLogInput): Promise<void> {
    try {
      await DatabaseAdapter.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          input.userId,
          input.action,
          input.entityType,
          input.entityId ?? null,
          input.oldValue ? JSON.stringify(input.oldValue) : null,
          input.newValue ? JSON.stringify(input.newValue) : null,
          input.metadata ? JSON.stringify(input.metadata) : null,
        ]
      );
    } catch (error) {
      // Don't throw - audit logging should not break the main flow
      logger.error("Failed to create audit log", { input, error });
    }
  }

  // Convenience methods for common actions
  async logLogin(userId: number): Promise<void> {
    await this.log({
      userId,
      action: "LOGIN",
      entityType: "user",
      entityId: String(userId),
    });
  }

  async logLogout(userId: number): Promise<void> {
    await this.log({
      userId,
      action: "LOGOUT",
      entityType: "user",
      entityId: String(userId),
    });
  }

  async logSaleCreated(
    userId: number,
    saleId: number,
    total: number
  ): Promise<void> {
    await this.log({
      userId,
      action: "SALE_CREATED",
      entityType: "transaction",
      entityId: String(saleId),
      newValue: { saleId, total },
    });
  }

  async logSaleVoided(
    userId: number,
    saleId: number,
    reason?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: "SALE_VOIDED",
      entityType: "transaction",
      entityId: String(saleId),
      metadata: { reason },
    });
  }

  async logSettingsChanged(
    userId: number,
    changes: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      userId,
      action: "SETTINGS_CHANGED",
      entityType: "settings",
      newValue: changes,
    });
  }

  async getRecentActivity(limit: number = 50): Promise<AuditLog[]> {
    return this.findAll({ limit });
  }

  async getUserActivity(
    userId: number,
    limit: number = 50
  ): Promise<AuditLog[]> {
    return this.findAll({ userId, limit });
  }

  async cleanup(daysToKeep: number = 90): Promise<number> {
    const result = await DatabaseAdapter.execute(
      `DELETE FROM audit_logs WHERE created_at < datetime('now', '-' || ? || ' days')`,
      [daysToKeep]
    );

    if (result.rowsAffected > 0) {
      logger.info("Audit logs cleaned up", {
        deletedCount: result.rowsAffected,
        daysToKeep,
      });
    }

    return result.rowsAffected;
  }
}

export const auditService = new AuditService();
