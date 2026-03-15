import { DatabaseAdapter } from "../../../infrastructure/database";
import { logger } from "../../../infrastructure/logging";
import { signDTE as signDTECommand } from "../../../infrastructure/tauri";
import type {
  DTE,
  CreateDTEInput,
  DTEStatus,
  DTESigningResult,
} from "../entities/DTE";
import type { DTEType } from "../entities/DTETypes";

interface DTERow {
  id: number;
  transaction_id: number;
  dte_type: string;
  codigo_generacion: string;
  numero_control: string;
  sello_recibido: string | null;
  fecha_emision: string;
  json_data: string;
  signed_data: string | null;
  status: string;
  error_message: string | null;
  retry_count: number;
  last_retry_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToDTE(row: DTERow): DTE {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    dteType: row.dte_type as DTEType,
    codigoGeneracion: row.codigo_generacion,
    numeroControl: row.numero_control,
    selloRecibido: row.sello_recibido ?? undefined,
    fechaEmision: row.fecha_emision,
    jsonData: row.json_data,
    signedData: row.signed_data ?? undefined,
    status: row.status as DTEStatus,
    errorMessage: row.error_message ?? undefined,
    retryCount: row.retry_count,
    lastRetryAt: row.last_retry_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class DTEService {
  async findAll(options?: {
    status?: DTEStatus;
    dteType?: DTEType;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<DTE[]> {
    let sql = "SELECT * FROM dte WHERE 1=1";
    const params: unknown[] = [];

    if (options?.status) {
      sql += " AND status = ?";
      params.push(options.status);
    }

    if (options?.dteType) {
      sql += " AND dte_type = ?";
      params.push(options.dteType);
    }

    if (options?.startDate) {
      sql += " AND fecha_emision >= ?";
      params.push(options.startDate);
    }

    if (options?.endDate) {
      sql += " AND fecha_emision <= ?";
      params.push(options.endDate);
    }

    sql += " ORDER BY created_at DESC";

    if (options?.limit) {
      sql += " LIMIT ?";
      params.push(options.limit);
    }

    const rows = await DatabaseAdapter.query<DTERow>(sql, params);
    return rows.map(mapRowToDTE);
  }

  async findById(id: number): Promise<DTE | null> {
    const row = await DatabaseAdapter.queryOne<DTERow>(
      "SELECT * FROM dte WHERE id = ?",
      [id]
    );
    return row ? mapRowToDTE(row) : null;
  }

  async findByTransactionId(transactionId: number): Promise<DTE | null> {
    const row = await DatabaseAdapter.queryOne<DTERow>(
      "SELECT * FROM dte WHERE transaction_id = ?",
      [transactionId]
    );
    return row ? mapRowToDTE(row) : null;
  }

  async create(input: CreateDTEInput): Promise<DTE> {
    const codigoGeneracion = this.generateCodigo();
    const numeroControl = await this.generateNumeroControl(input.dteType);
    const fechaEmision = new Date().toISOString();

    const result = await DatabaseAdapter.execute(
      `INSERT INTO dte (transaction_id, dte_type, codigo_generacion, numero_control, fecha_emision, json_data, status, retry_count)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)`,
      [
        input.transactionId,
        input.dteType,
        codigoGeneracion,
        numeroControl,
        fechaEmision,
        input.jsonData,
      ]
    );

    logger.info("DTE created", {
      dteId: result.lastInsertId,
      type: input.dteType,
    });

    const dte = await this.findById(result.lastInsertId);
    return dte!;
  }

  async sign(id: number): Promise<DTESigningResult> {
    const dte = await this.findById(id);
    if (!dte) {
      return { success: false, errorMessage: "DTE not found" };
    }

    try {
      const result = await signDTECommand({
        dteType: dte.dteType,
        jsonData: dte.jsonData,
      });

      await this.updateStatus(id, "signed", {
        signedData: result.signedData,
      });

      logger.info("DTE signed successfully", { dteId: id });
      return { success: true, ...result };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.updateStatus(id, "error", { errorMessage });
      logger.error("DTE signing failed", { dteId: id, error });
      return { success: false, errorMessage };
    }
  }

  async updateStatus(
    id: number,
    status: DTEStatus,
    data?: {
      signedData?: string;
      selloRecibido?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    let sql = "UPDATE dte SET status = ?, updated_at = CURRENT_TIMESTAMP";
    const params: unknown[] = [status];

    if (data?.signedData) {
      sql += ", signed_data = ?";
      params.push(data.signedData);
    }

    if (data?.selloRecibido) {
      sql += ", sello_recibido = ?";
      params.push(data.selloRecibido);
    }

    if (data?.errorMessage) {
      sql +=
        ", error_message = ?, retry_count = retry_count + 1, last_retry_at = CURRENT_TIMESTAMP";
      params.push(data.errorMessage);
    }

    sql += " WHERE id = ?";
    params.push(id);

    await DatabaseAdapter.execute(sql, params);
  }

  async getPendingDTEs(): Promise<DTE[]> {
    return this.findAll({ status: "pending" });
  }

  async getFailedDTEs(maxRetries: number = 3): Promise<DTE[]> {
    const rows = await DatabaseAdapter.query<DTERow>(
      "SELECT * FROM dte WHERE status = ? AND retry_count < ? ORDER BY created_at ASC",
      ["error", maxRetries]
    );
    return rows.map(mapRowToDTE);
  }

  async retryFailed(
    maxRetries: number = 3
  ): Promise<{ success: number; failed: number }> {
    const failedDTEs = await this.getFailedDTEs(maxRetries);
    let success = 0;
    let failed = 0;

    for (const dte of failedDTEs) {
      const result = await this.sign(dte.id);
      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    logger.info("DTE retry completed", { success, failed });
    return { success, failed };
  }

  private generateCodigo(): string {
    // Generate UUID-like code for DTE
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16).toUpperCase();
    });
  }

  private async generateNumeroControl(dteType: DTEType): Promise<string> {
    // Get next sequence number for this DTE type
    const result = await DatabaseAdapter.queryOne<{ max_num: string | null }>(
      "SELECT MAX(numero_control) as max_num FROM dte WHERE dte_type = ?",
      [dteType]
    );

    let nextNum = 1;
    if (result?.max_num) {
      const match = result.max_num.match(/(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    // Format: DTE-FCF-00000001
    return `DTE-${dteType}-${String(nextNum).padStart(8, "0")}`;
  }
}

export const dteService = new DTEService();
