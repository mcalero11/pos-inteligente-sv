import { DatabaseAdapter, buildInsertQuery, buildUpdateQuery } from '../../../infrastructure/database';
import { logger } from '../../../infrastructure/logging';
import type { Product, CreateProductInput, UpdateProductInput } from '../entities/Product';

interface ProductRow {
  id: number;
  category_id: number | null;
  barcode: string | null;
  name: string;
  description: string | null;
  price: number;
  partner_price: number;
  vip_price: number;
  discount_percentage: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id ?? undefined,
    barcode: row.barcode ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    price: row.price,
    partnerPrice: row.partner_price,
    vipPrice: row.vip_price,
    discountPercentage: row.discount_percentage,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ProductService {
  async findAll(options?: { categoryId?: number; activeOnly?: boolean }): Promise<Product[]> {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: unknown[] = [];

    if (options?.categoryId !== undefined) {
      sql += ' AND category_id = ?';
      params.push(options.categoryId);
    }

    if (options?.activeOnly) {
      sql += ' AND is_active = 1';
    }

    sql += ' ORDER BY name ASC';

    const rows = await DatabaseAdapter.query<ProductRow>(sql, params);
    return rows.map(mapRowToProduct);
  }

  async findById(id: number): Promise<Product | null> {
    const row = await DatabaseAdapter.queryOne<ProductRow>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return row ? mapRowToProduct(row) : null;
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const row = await DatabaseAdapter.queryOne<ProductRow>(
      'SELECT * FROM products WHERE barcode = ? AND is_active = 1',
      [barcode]
    );
    return row ? mapRowToProduct(row) : null;
  }

  async search(query: string, limit: number = 20): Promise<Product[]> {
    const rows = await DatabaseAdapter.query<ProductRow>(
      `SELECT * FROM products
       WHERE is_active = 1 AND (name LIKE ? OR barcode LIKE ?)
       ORDER BY name ASC LIMIT ?`,
      [`%${query}%`, `%${query}%`, limit]
    );
    return rows.map(mapRowToProduct);
  }

  async create(input: CreateProductInput): Promise<Product> {
    const data = {
      category_id: input.categoryId ?? null,
      barcode: input.barcode ?? null,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      partner_price: input.partnerPrice ?? input.price,
      vip_price: input.vipPrice ?? input.price,
      discount_percentage: input.discountPercentage ?? 0,
      is_active: 1,
    };

    const { sql, params } = buildInsertQuery('products', data);
    const result = await DatabaseAdapter.execute(sql, params);

    logger.info('Product created', { productId: result.lastInsertId, name: input.name });

    const product = await this.findById(result.lastInsertId);
    return product!;
  }

  async update(id: number, input: UpdateProductInput): Promise<Product> {
    const data: Record<string, unknown> = {};

    if (input.categoryId !== undefined) data.category_id = input.categoryId;
    if (input.barcode !== undefined) data.barcode = input.barcode;
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = input.price;
    if (input.partnerPrice !== undefined) data.partner_price = input.partnerPrice;
    if (input.vipPrice !== undefined) data.vip_price = input.vipPrice;
    if (input.discountPercentage !== undefined) data.discount_percentage = input.discountPercentage;
    if (input.isActive !== undefined) data.is_active = input.isActive ? 1 : 0;

    if (Object.keys(data).length === 0) {
      const product = await this.findById(id);
      return product!;
    }

    const { sql, params } = buildUpdateQuery('products', data, 'id = ?', [id]);
    await DatabaseAdapter.execute(sql, params);

    logger.info('Product updated', { productId: id });

    const product = await this.findById(id);
    return product!;
  }

  async delete(id: number): Promise<void> {
    await DatabaseAdapter.execute('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    logger.info('Product deactivated', { productId: id });
  }

}

// Singleton export
export const productService = new ProductService();
