import type { Role } from "./Role";

export interface User {
  id: number;
  username: string;
  pinHash?: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  permissions: string; // JSON string of permissions object
  // Backend sync fields
  companyId?: string;
  backendUserId?: string;
  phoneNumber?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  fullName: string;
  role: Role;
  pin?: string;
}

export interface UpdateUserInput
  extends Partial<Omit<CreateUserInput, "username">> {
  isActive?: boolean;
}

export interface AuthenticatedUser {
  user: User;
  sessionId: string;
  expiresAt: string;
}

export function hasPermission(user: User, permission: string): boolean {
  const rolePermissions: Record<Role, string[]> = {
    admin: ["*"],
    supervisor: [
      "sales:create",
      "sales:view",
      "sales:void",
      "products:view",
      "products:edit",
      "customers:view",
      "customers:edit",
      "reports:view",
      "shifts:manage",
    ],
    cashier: ["sales:create", "sales:view", "products:view", "customers:view"],
  };

  const permissions = rolePermissions[user.role] || [];
  return permissions.includes("*") || permissions.includes(permission);
}

export function canVoidSale(user: User): boolean {
  return hasPermission(user, "sales:void");
}

export function canManageProducts(user: User): boolean {
  return hasPermission(user, "products:edit");
}

export function canManageUsers(user: User): boolean {
  return user.role === "admin";
}
