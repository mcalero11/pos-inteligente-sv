import { DatabaseAdapter } from '../../../infrastructure/database';
import { logger } from '../../../infrastructure/logging';
import type { Sale, CreateSaleInput, SaleStatus } from '../entities/Sale';
import type { SaleItem } from '../entities/SaleItem';
import type { PaymentMethod } from '../entities/PaymentMethod';

interface SaleRow {
  id: number;
  customer_id: number | null;
  user_id: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SaleItemRow {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
}

function mapRowToSale(row: SaleRow): Sale {
  return {
    id: row.id,
    customerId: row.customer_id ?? undefined,
    userId: row.user_id,
    subtotal: row.subtotal,
    taxAmount: row.tax_amount,
    discountAmount: row.discount_amount,
    total: row.total,
    paymentMethod: row.payment_method as PaymentMethod,
    status: row.status as SaleStatus,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToSaleItem(row: SaleItemRow): SaleItem {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    discountAmount: row.discount_amount,
    subtotal: row.subtotal,
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
    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params: unknown[] = [];

    if (options?.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }

    if (options?.userId) {
      sql += ' AND user_id = ?';
      params.push(options.userId);
    }

    if (options?.startDate) {
      sql += ' AND created_at >= ?';
      params.push(options.startDate);
    }

    if (options?.endDate) {
      sql += ' AND created_at <= ?';
      params.push(options.endDate);
    }

    sql += ' ORDER BY created_at DESC';

    if (options?.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    const rows = await DatabaseAdapter.query<SaleRow>(sql, params);
    return rows.map(mapRowToSale);
  }

  async findById(id: number): Promise<Sale | null> {
    const row = await DatabaseAdapter.queryOne<SaleRow>(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return row ? mapRowToSale(row) : null;
  }

  async findWithItems(id: number): Promise<(Sale & { items: SaleItem[] }) | null> {
    const sale = await this.findById(id);
    if (!sale) return null;

    const items = await this.getItems(id);
    return { ...sale, items };
  }

  async getItems(saleId: number): Promise<SaleItem[]> {
    const rows = await DatabaseAdapter.query<SaleItemRow>(
      'SELECT * FROM transaction_items WHERE transaction_id = ? ORDER BY id ASC',
      [saleId]
    );
    return rows.map(mapRowToSaleItem);
  }

  async create(input: CreateSaleInput): Promise<Sale> {
    return DatabaseAdapter.transaction(async () => {
      // Calculate totals
      let subtotal = 0;
      for (const item of input.items) {
        const itemSubtotal = item.unitPrice * item.quantity - (item.discountAmount || 0);
        subtotal += itemSubtotal;
      }

      const taxRate = 0.13; // TODO: Get from settings
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const total = Math.round((subtotal + taxAmount - (input.discountAmount || 0)) * 100) / 100;

      // Create transaction
      const result = await DatabaseAdapter.execute(
        `INSERT INTO transactions (customer_id, user_id, subtotal, tax_amount, discount_amount, total, payment_method, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
        [
          input.customerId ?? null,
          input.userId,
          subtotal,
          taxAmount,
          input.discountAmount || 0,
          total,
          input.paymentMethod,
          input.notes ?? null,
        ]
      );

      const saleId = result.lastInsertId;

      // Create transaction items and update stock
      for (const item of input.items) {
        const itemSubtotal = item.unitPrice * item.quantity - (item.discountAmount || 0);

        await DatabaseAdapter.execute(
          `INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, discount_amount, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            saleId,
            item.productId,
            item.productName,
            item.quantity,
            item.unitPrice,
            item.discountAmount || 0,
            itemSubtotal,
          ]
        );

        // TODO: Implement stock management when database schema is updated
        // Update product stock
        // await productService.updateStock(item.productId, -item.quantity);
      }

      logger.info('Sale created', { saleId, total, itemCount: input.items.length });

      const sale = await this.findById(saleId);
      return sale!;
    });
  }

  async voidSale(id: number, userId: number, reason?: string): Promise<Sale> {
    return DatabaseAdapter.transaction(async () => {
      const sale = await this.findWithItems(id);
      if (!sale) {
        throw new Error('Sale not found');
      }

      if (sale.status !== 'completed') {
        throw new Error('Only completed sales can be voided');
      }

      // Update sale status
      await DatabaseAdapter.execute(
        `UPDATE transactions SET status = 'voided', notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [reason ? `ANULADO: ${reason}` : 'ANULADO', id]
      );

      // Restore stock
      // TODO: Implement stock management when database schema is updated
      // for (const item of sale.items!) {
      //   await productService.updateStock(item.productId, item.quantity);
      // }

      logger.info('Sale voided', { saleId: id, voidedBy: userId, reason });

      const updated = await this.findById(id);
      return updated!;
    });
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
      sql += ' AND user_id = ?';
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
