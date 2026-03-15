export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "SALE_CREATED"
  | "SALE_VOIDED"
  | "SALE_REFUNDED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED"
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "SETTINGS_CHANGED"
  | "DTE_SENT"
  | "DTE_ERROR"
  | "SHIFT_OPENED"
  | "SHIFT_CLOSED"
  | "CASH_MOVEMENT"
  | "SYNC_COMPLETED"
  | "SYNC_ERROR";

export interface AuditLog {
  id: number;
  userId: number;
  userName?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateAuditLogInput {
  userId: number;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
}

export function formatAuditAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    LOGIN: "Inicio de sesión",
    LOGOUT: "Cierre de sesión",
    SALE_CREATED: "Venta creada",
    SALE_VOIDED: "Venta anulada",
    SALE_REFUNDED: "Venta reembolsada",
    PRODUCT_CREATED: "Producto creado",
    PRODUCT_UPDATED: "Producto actualizado",
    PRODUCT_DELETED: "Producto eliminado",
    CUSTOMER_CREATED: "Cliente creado",
    CUSTOMER_UPDATED: "Cliente actualizado",
    USER_CREATED: "Usuario creado",
    USER_UPDATED: "Usuario actualizado",
    SETTINGS_CHANGED: "Configuración modificada",
    DTE_SENT: "DTE enviado",
    DTE_ERROR: "Error en DTE",
    SHIFT_OPENED: "Turno iniciado",
    SHIFT_CLOSED: "Turno cerrado",
    CASH_MOVEMENT: "Movimiento de caja",
    SYNC_COMPLETED: "Sincronización completada",
    SYNC_ERROR: "Error de sincronización",
  };
  return labels[action] || action;
}

export function isSecurityAction(action: AuditAction): boolean {
  return [
    "LOGIN",
    "LOGOUT",
    "USER_CREATED",
    "USER_UPDATED",
    "SETTINGS_CHANGED",
  ].includes(action);
}

export function isFinancialAction(action: AuditAction): boolean {
  return [
    "SALE_CREATED",
    "SALE_VOIDED",
    "SALE_REFUNDED",
    "CASH_MOVEMENT",
    "DTE_SENT",
  ].includes(action);
}
