import { DatabaseAdapter, buildInsertQuery, buildUpdateQuery } from '../../../infrastructure/database';
import { logger } from '../../../infrastructure/logging';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../entities/Category';

interface CategoryRow {
  id: number;
  name: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CategoryService {
  async findAll(activeOnly: boolean = true): Promise<Category[]> {
    let sql = 'SELECT * FROM categories';
    if (activeOnly) {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY name ASC'; // Simple alphabetical order

    const rows = await DatabaseAdapter.query<CategoryRow>(sql);
    return rows.map(mapRowToCategory);
  }

  async findById(id: number): Promise<Category | null> {
    const row = await DatabaseAdapter.queryOne<CategoryRow>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return row ? mapRowToCategory(row) : null;
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const data = {
      name: input.name,
      description: input.description ?? null,
      is_active: 1,
    };

    const { sql, params } = buildInsertQuery('categories', data);
    const result = await DatabaseAdapter.execute(sql, params);

    logger.info('Category created', { categoryId: result.lastInsertId, name: input.name });

    const category = await this.findById(result.lastInsertId);
    return category!;
  }

  async update(id: number, input: UpdateCategoryInput): Promise<Category> {
    const data: Record<string, unknown> = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.isActive !== undefined) data.is_active = input.isActive ? 1 : 0;

    if (Object.keys(data).length === 0) {
      const category = await this.findById(id);
      return category!;
    }

    const { sql, params } = buildUpdateQuery('categories', data, 'id = ?', [id]);
    await DatabaseAdapter.execute(sql, params);

    logger.info('Category updated', { categoryId: id });

    const category = await this.findById(id);
    return category!;
  }

  async delete(id: number): Promise<void> {
    await DatabaseAdapter.execute('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
    logger.info('Category deactivated', { categoryId: id });
  }

  async getProductCount(categoryId: number): Promise<number> {
    const result = await DatabaseAdapter.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1',
      [categoryId]
    );
    return result?.count ?? 0;
  }
}

export const categoryService = new CategoryService();
