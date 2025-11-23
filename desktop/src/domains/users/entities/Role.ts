export type Role = 'admin' | 'supervisor' | 'cashier';

export interface RoleDefinition {
  name: Role;
  displayName: string;
  description: string;
  level: number; // Higher = more permissions
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  admin: {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Acceso completo al sistema',
    level: 100,
  },
  supervisor: {
    name: 'supervisor',
    displayName: 'Supervisor',
    description: 'Gestión de ventas y reportes',
    level: 50,
  },
  cashier: {
    name: 'cashier',
    displayName: 'Cajero',
    description: 'Operaciones de venta básicas',
    level: 10,
  },
};

export function getRoleDisplayName(role: Role): string {
  return ROLE_DEFINITIONS[role]?.displayName || role;
}

export function isRoleHigherOrEqual(role: Role, requiredRole: Role): boolean {
  return ROLE_DEFINITIONS[role].level >= ROLE_DEFINITIONS[requiredRole].level;
}

export function getAvailableRoles(): RoleDefinition[] {
  return Object.values(ROLE_DEFINITIONS).sort((a, b) => b.level - a.level);
}
