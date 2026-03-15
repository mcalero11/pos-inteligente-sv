import { DatabaseAdapter, insertIdOf } from "../../../infrastructure/database";
import type { TransactionStatement } from "../../../infrastructure/database";
import { logger } from "../../../infrastructure/logging";
import type { Sale, CreateSaleInput, SaleStatus } from "../entities/Sale";
import type { SaleItem } from "../entities/SaleItem";

interface SaleRow {
  id: number;
  transaction_number: string;
  customer_id: number | null;
  user_id: number;
  session_id: number | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  status: string;
  notes: string | null;
  dte_id: number | null;
  original_transaction_id: number | null;
  return_type: string | null;
  backend_id: string | null;
  sync_status: string | null;
  last_synced_at: string | null;
  version: number | null;
  created_at: string;
  updated_at: string;
}

interface SaleItemRow {
  id: number;
  transaction_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  applied_price_tier: string | null;
  doctor_name: string | null;
  doctor_license: string | null;
  requires_prescription: number | null;
  created_at: string;
}

function mapRowToSale(row: SaleRow): Sale {
  return {
    id: row.id,
    transactionNumber: row.transaction_number,
    customerId: row.customer_id ?? undefined,
    userId: row.user_id,
    sessionId: row.session_id ?? undefined,
    subtotal: row.subtotal,
    taxAmount: row.tax_amount,
    discountAmount: row.discount_amount,
    total: row.total,
    status: row.status as SaleStatus,
    notes: row.notes ?? undefined,
    dteId: row.dte_id ?? undefined,
    originalTransactionId: row.original_transaction_id ?? undefined,
    returnType: row.return_type as "full" | "partial" | undefined,
    backendId: row.backend_id ?? undefined,
    syncStatus: row.sync_status as
      | "pending"
      | "synced"
      | "conflict"
      | undefined,
    lastSyncedAt: row.last_synced_at ?? undefined,
    version: row.version ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToSaleItem(row: SaleItemRow): SaleItem {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    productId: row.product_id,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    discountAmount: row.discount_amount,
    totalPrice: row.total_price,
    appliedPriceTier: row.applied_price_tier as
      | "retail"
      | "partner"
      | "vip"
      | undefined,
    doctorName: row.doctor_name ?? undefined,
    doctorLicense: row.doctor_license ?? undefined,
    requiresPrescription: row.requires_prescription === 1 || undefined,
    createdAt: row.created_at,
  };
}

export class SalesService {
  async findAll(options?: {
    status?: SaleStatus;
    userId?: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Sale[]> {
    let sql = "SELECT * FROM transactions WHERE 1=1";
    const params: unknown[] = [];

    if (options?.status) {
      sql += " AND status = ?";
      params.push(options.status);
    }

    if (options?.userId) {
      sql += " AND user_id = ?";
      params.push(options.userId);
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
    }

    const rows = await DatabaseAdapter.query<SaleRow>(sql, params);
    return rows.map(mapRowToSale);
  }

  async findById(id: number): Promise<Sale | null> {
    const row = await DatabaseAdapter.queryOne<SaleRow>(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );
    return row ? mapRowToSale(row) : null;
  }

  async findWithItems(
    id: number
  ): Promise<(Sale & { items: SaleItem[] }) | null> {
    const sale = await this.findById(id);
    if (!sale) return null;

    const items = await this.getItems(id);
    return { ...sale, items };
  }

  async getItems(saleId: number): Promise<SaleItem[]> {
    const rows = await DatabaseAdapter.query<SaleItemRow>(
      "SELECT * FROM transaction_items WHERE transaction_id = ? ORDER BY id ASC",
      [saleId]
    );
    return rows.map(mapRowToSaleItem);
  }

  async create(input: CreateSaleInput): Promise<Sale> {
    // Calculate totals
    let subtotal = 0;
    for (const item of input.items) {
      subtotal += item.unitPrice * item.quantity - (item.discountAmount || 0);
    }

    const taxRate = 0.13; // TODO: Get from settings
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total =
      Math.round((subtotal + taxAmount - (input.discountAmount || 0)) * 100) /
      100;

    // Generate transaction number (timestamp + random)
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const statements: TransactionStatement[] = [];

    // Statement 0: INSERT transaction (its lastInsertId = saleId)
    statements.push({
      sql: `INSERT INTO transactions (transaction_number, customer_id, user_id, session_id, subtotal, tax_amount, discount_amount, total, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
      params: [
        transactionNumber,
        input.customerId ?? null,
        input.userId,
        input.sessionId ?? null,
        subtotal,
        taxAmount,
        input.discountAmount || 0,
        total,
        input.notes ?? null,
      ],
    });

    // Statements 1..N: INSERT payments (reference statement 0's insert id)
    for (const payment of input.payments) {
      statements.push({
        sql: `INSERT INTO payments (transaction_id, payment_method, amount, reference_number, card_last_four, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
        params: [
          insertIdOf(0),
          payment.paymentMethod,
          payment.amount,
          payment.referenceNumber ?? null,
          payment.cardLastFour ?? null,
          payment.notes ?? null,
        ],
      });
    }

    // Statements N+1..M: INSERT transaction_items (reference statement 0's insert id)
    for (const item of input.items) {
      const itemTotal =
        item.unitPrice * item.quantity - (item.discountAmount || 0);

      statements.push({
        sql: `INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, discount_amount, total_price)
           VALUES (?, ?, ?, ?, ?, ?)`,
        params: [
          insertIdOf(0),
          item.productId,
          item.quantity,
          item.unitPrice,
          item.discountAmount || 0,
          itemTotal,
        ],
      });

      // TODO: Implement stock management
    }

    // Final statement: SELECT back the created sale
    statements.push({
      sql: "SELECT * FROM transactions WHERE transaction_number = ?",
      params: [transactionNumber],
      query: true,
    });

    const result = await DatabaseAdapter.transactionBatch(statements);

    // Extract the sale from the last statement's query result
    const lastResult = result.results[result.results.length - 1];
    if (lastResult.type !== "query" || lastResult.rows.length === 0) {
      throw new Error("Failed to retrieve created sale");
    }

    const row = lastResult.rows[0] as unknown as SaleRow;
    logger.info("Sale created", {
      saleId: row.id,
      total,
      itemCount: input.items.length,
    });
    return mapRowToSale(row);
  }

  async voidSale(id: number, userId: number, reason?: string): Promise<Sale> {
    // Validate before transaction (reads don't need atomicity)
    const sale = await this.findWithItems(id);
    if (!sale) {
      throw new Error("Sale not found");
    }

    if (sale.status !== "completed") {
      throw new Error("Only completed sales can be voided");
    }

    await DatabaseAdapter.transactionBatch([
      {
        sql: `UPDATE transactions SET status = 'voided', notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params: [reason ? `ANULADO: ${reason}` : "ANULADO", id],
      },
      // TODO: Implement stock restoration when stock management is added
    ]);

    logger.info("Sale voided", { saleId: id, voidedBy: userId, reason });

    const updated = await this.findById(id);
    return updated!;
  }

  async getTodaySummary(userId?: number): Promise<{
    salesCount: number;
    totalAmount: number;
    averageTicket: number;
  }> {
    let sql = `
      SELECT
        COUNT(*) as sales_count,
        COALESCE(SUM(total), 0) as total_amount
      FROM transactions
      WHERE status = 'completed'
        AND DATE(created_at) = DATE('now', 'localtime')
    `;
    const params: unknown[] = [];

    if (userId) {
      sql += " AND user_id = ?";
      params.push(userId);
    }

    const result = await DatabaseAdapter.queryOne<{
      sales_count: number;
      total_amount: number;
    }>(sql, params);

    const salesCount = result?.sales_count ?? 0;
    const totalAmount = result?.total_amount ?? 0;

    return {
      salesCount,
      totalAmount,
      averageTicket: salesCount > 0 ? totalAmount / salesCount : 0,
    };
  }
}

export const salesService = new SalesService();
