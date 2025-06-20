// Example usage of the logger service in your POS application
import { logger, posLogger, authLogger, dteLogger, storageLogger } from '../lib/logger';

// === BASIC LOGGING EXAMPLES ===

// Simple info logging
export async function logAppStart() {
  await logger.info('Application started');
}

// Logging with data
export async function logUserLogin(userId: string, role: string) {
  await authLogger.info('User logged in', { userId, role, timestamp: new Date().toISOString() });
}

// Error logging with stack trace
export async function logApiError(endpoint: string, error: Error) {
  await logger.error(`API call failed: ${endpoint}`, error);
}

// === POS SPECIFIC EXAMPLES ===

// Log product actions
export async function logProductScan(productId: string, barcode: string) {
  await posLogger.logUserAction('Product Scanned', { productId, barcode });
}

// Log transaction
export async function logTransaction(transactionId: string, total: number, items: number) {
  await posLogger.info('Transaction completed', {
    transactionId,
    total,
    itemCount: items,
    timestamp: new Date().toISOString()
  });
}

// === DTE SPECIFIC EXAMPLES ===

// Log DTE signing
export async function logDteSigning(documentId: string, success: boolean, duration: number) {
  if (success) {
    await dteLogger.info('DTE signed successfully', { documentId, duration });
  } else {
    await dteLogger.error('DTE signing failed', { documentId, duration });
  }
}

// === STORAGE SPECIFIC EXAMPLES ===

// Log secure storage operations
export async function logSecureStorageInit(success: boolean) {
  if (success) {
    await storageLogger.info('Secure storage initialized');
  } else {
    await storageLogger.error('Failed to initialize secure storage');
  }
}

// === PERFORMANCE LOGGING ===

// Helper function for timing operations
export async function withPerformanceLogging<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    await logger.logPerformance(operation, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    await logger.error(`${operation} failed after ${duration}ms`, error as Error);
    throw error;
  }
}

// === EXAMPLE USAGE IN COMPONENTS ===

// Helper function for async delay
const delay = (ms: number) => new Promise(resolve => globalThis.setTimeout(resolve, ms));

// Example: Logging in a service function
export async function exampleServiceFunction() {
  try {
    await logger.info('Starting service operation');

    // Simulate some work
    await delay(100);

    await logger.info('Service operation completed');
    return { success: true };
  } catch (error) {
    await logger.error('Service operation failed', error as Error);
    throw error;
  }
}

// Example: Using performance logging
export async function exampleWithPerformance() {
  return await withPerformanceLogging('Database Query', async () => {
    // Simulate database query
    await delay(200);
    return { data: 'result' };
  });
} 
