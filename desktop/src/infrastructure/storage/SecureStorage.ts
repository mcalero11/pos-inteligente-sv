import { invoke } from "@tauri-apps/api/core";
import { logger } from "../logging/Logger";

/**
 * SecureStorage - Facade for Tauri Stronghold secure storage
 *
 * Provides a simple key-value interface for storing sensitive data
 * like certificates, tokens, and credentials.
 */
class SecureStorageClass {
  private initialized = false;

  async initialize(password: string): Promise<void> {
    try {
      await invoke("initialize_secure_storage", { password });
      this.initialized = true;
      logger.info("Secure storage initialized");
    } catch (error) {
      logger.error("Failed to initialize secure storage", { error });
      throw error;
    }
  }

  async isInitialized(): Promise<boolean> {
    return this.initialized;
  }

  async get(key: string): Promise<string | null> {
    this.ensureInitialized();
    try {
      const value = await invoke<string | null>("secure_storage_get", { key });
      return value;
    } catch (error) {
      logger.error("Failed to get from secure storage", { key, error });
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    this.ensureInitialized();
    try {
      await invoke("secure_storage_set", { key, value });
      logger.debug("Value stored in secure storage", { key });
    } catch (error) {
      logger.error("Failed to set secure storage", { key, error });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    this.ensureInitialized();
    try {
      await invoke("secure_storage_delete", { key });
      logger.debug("Value deleted from secure storage", { key });
    } catch (error) {
      logger.error("Failed to delete from secure storage", { key, error });
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "Secure storage not initialized. Call initialize() first."
      );
    }
  }
}

export const SecureStorage = new SecureStorageClass();

// Storage keys constants
export const STORAGE_KEYS = {
  VAULT_PASSWORD: "vault_password",
  API_TOKEN: "api_token",
  DTE_CERTIFICATE: "dte_certificate",
  DTE_CERTIFICATE_PASSWORD: "dte_cert_password",
  OFFLINE_PIN_HASH: "offline_pin_hash",
} as const;
