import {
  DatabaseAdapter,
  buildInsertQuery,
  buildUpdateQuery,
} from "../../../infrastructure/database";
import { logger } from "../../../infrastructure/logging";
import { hashPin, verifyPin } from "../../../infrastructure/tauri";
import type { User, CreateUserInput, UpdateUserInput } from "../entities/User";
import type { Role } from "../entities/Role";

interface UserRow {
  id: number;
  username: string;
  pin_hash: string | null;
  full_name: string;
  role: string;
  is_active: number;
  permissions: string;
  company_id: string | null;
  backend_user_id: string | null;
  phone_number: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    pinHash: row.pin_hash ?? undefined,
    fullName: row.full_name,
    role: row.role as Role,
    isActive: row.is_active === 1,
    permissions: row.permissions,
    companyId: row.company_id ?? undefined,
    backendUserId: row.backend_user_id ?? undefined,
    phoneNumber: row.phone_number ?? undefined,
    email: row.email ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class UserService {
  async findAll(activeOnly: boolean = true): Promise<User[]> {
    let sql = "SELECT * FROM users";
    if (activeOnly) {
      sql += " WHERE is_active = 1";
    }
    sql += " ORDER BY full_name ASC";

    const rows = await DatabaseAdapter.query<UserRow>(sql);
    return rows.map(mapRowToUser);
  }

  async findById(id: number): Promise<User | null> {
    const row = await DatabaseAdapter.queryOne<UserRow>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return row ? mapRowToUser(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await DatabaseAdapter.queryOne<UserRow>(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return row ? mapRowToUser(row) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    let pinHash: string | null = null;
    if (input.pin) {
      pinHash = await hashPin(input.pin);
    }

    const data = {
      username: input.username,
      full_name: input.fullName,
      role: input.role,
      pin_hash: pinHash,
      is_active: 1,
    };

    const { sql, params } = buildInsertQuery("users", data);
    const result = await DatabaseAdapter.execute(sql, params);

    logger.info("User created", {
      userId: result.lastInsertId,
      username: input.username,
    });

    const user = await this.findById(result.lastInsertId);
    return user!;
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const data: Record<string, unknown> = {};

    if (input.fullName !== undefined) data.full_name = input.fullName;
    if (input.role !== undefined) data.role = input.role;
    if (input.isActive !== undefined) data.is_active = input.isActive ? 1 : 0;

    if (input.pin !== undefined) {
      data.pin_hash = input.pin ? await hashPin(input.pin) : null;
    }

    if (Object.keys(data).length === 0) {
      const user = await this.findById(id);
      return user!;
    }

    const { sql, params } = buildUpdateQuery("users", data, "id = ?", [id]);
    await DatabaseAdapter.execute(sql, params);

    logger.info("User updated", { userId: id });

    const user = await this.findById(id);
    return user!;
  }

  async delete(id: number): Promise<void> {
    await DatabaseAdapter.execute(
      "UPDATE users SET is_active = 0 WHERE id = ?",
      [id]
    );
    logger.info("User deactivated", { userId: id });
  }

  async authenticateByPin(userId: number, pin: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.isActive || !user.pinHash) {
      return false;
    }

    const isValid = await verifyPin(pin, user.pinHash);

    if (isValid) {
      logger.info("User authenticated", { userId });
    } else {
      logger.warn("Authentication failed", { userId });
    }

    return isValid;
  }

  async getCashiers(): Promise<User[]> {
    const rows = await DatabaseAdapter.query<UserRow>(
      "SELECT * FROM users WHERE role IN ('cashier', 'supervisor') AND is_active = 1 ORDER BY full_name ASC"
    );
    return rows.map(mapRowToUser);
  }

  async getAdmins(): Promise<User[]> {
    const rows = await DatabaseAdapter.query<UserRow>(
      "SELECT * FROM users WHERE role = 'admin' AND is_active = 1 ORDER BY full_name ASC"
    );
    return rows.map(mapRowToUser);
  }
}

export const userService = new UserService();
