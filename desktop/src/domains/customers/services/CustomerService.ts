import { DatabaseAdapter, buildInsertQuery, buildUpdateQuery } from '../../../infrastructure/database';
import { logger } from '../../../infrastructure/logging';
import type { Customer, CreateCustomerInput, UpdateCustomerInput, CustomerType, DocumentType } from '../entities/Customer';

interface CustomerRow {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customer_type: string;
  document_type: string | null;
  document_number: string | null;
  nrc: string | null;
  is_active: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    customerType: row.customer_type as CustomerType,
    documentType: row.document_type as DocumentType | undefined,
    documentNumber: row.document_number ?? undefined,
    nrc: row.nrc ?? undefined,
    isActive: row.is_active === 1,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CustomerService {
  async findAll(activeOnly: boolean = true): Promise<Customer[]> {
    let sql = 'SELECT * FROM customers';
    if (activeOnly) {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY name ASC';

    const rows = await DatabaseAdapter.query<CustomerRow>(sql);
    return rows.map(mapRowToCustomer);
  }

  async findById(id: number): Promise<Customer | null> {
    const row = await DatabaseAdapter.queryOne<CustomerRow>(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    return row ? mapRowToCustomer(row) : null;
  }

  async findByDocument(documentType: DocumentType, documentNumber: string): Promise<Customer | null> {
    const row = await DatabaseAdapter.queryOne<CustomerRow>(
      'SELECT * FROM customers WHERE document_type = ? AND document_number = ? AND is_active = 1',
      [documentType, documentNumber]
    );
    return row ? mapRowToCustomer(row) : null;
  }

  async search(query: string, limit: number = 20): Promise<Customer[]> {
    const rows = await DatabaseAdapter.query<CustomerRow>(
      `SELECT * FROM customers
       WHERE is_active = 1 AND (name LIKE ? OR document_number LIKE ? OR phone LIKE ?)
       ORDER BY name ASC LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, limit]
    );
    return rows.map(mapRowToCustomer);
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const data = {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      customer_type: input.customerType,
      document_type: input.documentType ?? null,
      document_number: input.documentNumber ?? null,
      nrc: input.nrc ?? null,
      notes: input.notes ?? null,
      is_active: 1,
    };

    const { sql, params } = buildInsertQuery('customers', data);
    const result = await DatabaseAdapter.execute(sql, params);

    logger.info('Customer created', { customerId: result.lastInsertId, name: input.name });

    const customer = await this.findById(result.lastInsertId);
    return customer!;
  }

  async update(id: number, input: UpdateCustomerInput): Promise<Customer> {
    const data: Record<string, unknown> = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.address !== undefined) data.address = input.address;
    if (input.customerType !== undefined) data.customer_type = input.customerType;
    if (input.documentType !== undefined) data.document_type = input.documentType;
    if (input.documentNumber !== undefined) data.document_number = input.documentNumber;
    if (input.nrc !== undefined) data.nrc = input.nrc;
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.isActive !== undefined) data.is_active = input.isActive ? 1 : 0;

    if (Object.keys(data).length === 0) {
      const customer = await this.findById(id);
      return customer!;
    }

    const { sql, params } = buildUpdateQuery('customers', data, 'id = ?', [id]);
    await DatabaseAdapter.execute(sql, params);

    logger.info('Customer updated', { customerId: id });

    const customer = await this.findById(id);
    return customer!;
  }

  async delete(id: number): Promise<void> {
    await DatabaseAdapter.execute('UPDATE customers SET is_active = 0 WHERE id = ?', [id]);
    logger.info('Customer deactivated', { customerId: id });
  }

  async getCompanyCustomers(): Promise<Customer[]> {
    const rows = await DatabaseAdapter.query<CustomerRow>(
      "SELECT * FROM customers WHERE customer_type = 'company' AND is_active = 1 ORDER BY name ASC"
    );
    return rows.map(mapRowToCustomer);
  }
}

export const customerService = new CustomerService();
