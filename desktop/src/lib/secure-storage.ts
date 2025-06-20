import { invoke } from "@tauri-apps/api/core";

export interface SecureStorageError {
  message: string;
}

export interface SecretMetadata {
  key: string;
  exists: boolean;
}

export class SecureStorageService {
  private static instance: SecureStorageService;
  private initialized = false;

  private constructor() { }

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Initialize secure storage with pre-hashed password from backend
   * @param passwordHash - Pre-hashed password bytes from backend
   */
  async initialize(passwordHash: number[]): Promise<void> {
    try {
      await invoke('initialize_secure_storage', { passwordHash });
      this.initialized = true;
    } catch (error) {
      this.initialized = false;
      throw new Error(`Failed to initialize secure storage: ${error}`);
    }
  }

  /**
   * Store a secret (private key, certificate, etc.)
   * @param key - Unique identifier for the secret
   * @param secretData - Secret data as bytes
   */
  async storeSecret(key: string, secretData: number[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Secure storage not initialized');
    }

    try {
      await invoke('store_secret', { key, secretData });
    } catch (error) {
      throw new Error(`Failed to store secret: ${error}`);
    }
  }

  /**
   * Check if a secret exists
   * @param key - Secret identifier
   */
  async hasSecret(key: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('Secure storage not initialized');
    }

    try {
      return await invoke('has_secret', { key });
    } catch (error) {
      throw new Error(`Failed to check secret: ${error}`);
    }
  }

  /**
   * Remove a secret
   * @param key - Secret identifier
   */
  async removeSecret(key: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Secure storage not initialized');
    }

    try {
      await invoke('remove_secret', { key });
    } catch (error) {
      throw new Error(`Failed to remove secret: ${error}`);
    }
  }

  /**
   * Get metadata for multiple secrets
   * @param keys - Array of secret identifiers
   */
  async getSecretsMetadata(keys: string[]): Promise<SecretMetadata[]> {
    if (!this.initialized) {
      throw new Error('Secure storage not initialized');
    }

    try {
      return await invoke('get_secret_metadata', { keys });
    } catch (error) {
      throw new Error(`Failed to get secrets metadata: ${error}`);
    }
  }

  /**
   * Check if storage is initialized
   */
  async isInitialized(): Promise<boolean> {
    try {
      const result = await invoke('is_secure_storage_initialized');
      this.initialized = result as boolean;
      return this.initialized;
    } catch {
      this.initialized = false;
      return false;
    }
  }

  /**
   * Clear storage and logout
   */
  async clear(): Promise<void> {
    try {
      await invoke('clear_secure_storage');
      this.initialized = false;
    } catch (error) {
      throw new Error(`Failed to clear secure storage: ${error}`);
    }
  }

  /**
   * Get current initialization status (local state)
   */
  get isReady(): boolean {
    return this.initialized;
  }

  // === HELPER METHODS FOR COMMON USE CASES ===

  async storeDtePrivateKey(keyId: string, privateKeyPem: string): Promise<void> {
    // Convert string to bytes using UTF-8 encoding
    const encoder = new (globalThis as any).TextEncoder();
    const encoded = encoder.encode(privateKeyPem);
    const keyData = Array.from(encoded) as number[];
    await this.storeSecret(`dte_private_key_${keyId}`, keyData);
  }

  async hasDtePrivateKey(keyId: string): Promise<boolean> {
    return await this.hasSecret(`dte_private_key_${keyId}`);
  }

  async removeDtePrivateKey(keyId: string): Promise<void> {
    await this.removeSecret(`dte_private_key_${keyId}`);
  }
}

// Export singleton instance
export const secureStorage = SecureStorageService.getInstance();
