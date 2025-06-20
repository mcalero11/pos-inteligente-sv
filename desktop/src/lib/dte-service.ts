import { invoke } from '@tauri-apps/api/core';
import { secureStorage } from './secure-storage';

export interface SignedDte {
  document: string;
  signature: string;
  timestamp: string;
}

export class DteService {
  private static instance: DteService;

  private constructor() { }

  static getInstance(): DteService {
    if (!DteService.instance) {
      DteService.instance = new DteService();
    }
    return DteService.instance;
  }

  /**
   * Initialize DTE service with user credentials
   * @param passwordHash - Pre-hashed password from backend
   */
  async initialize(passwordHash: number[]): Promise<void> {
    await secureStorage.initialize(passwordHash);
  }

  /**
   * Store a private key for DTE signing
   * @param keyId - Unique identifier for the key
   * @param privateKeyPem - Private key in PEM format
   */
  async storePrivateKey(keyId: string, privateKeyPem: string): Promise<void> {
    await secureStorage.storeDtePrivateKey(keyId, privateKeyPem);
  }

  /**
   * Check if a private key is available for signing
   * @param keyId - Key identifier
   */
  async canSign(keyId: string): Promise<boolean> {
    try {
      return await invoke('can_sign_dte', { privateKeyId: keyId });
    } catch (error) {
      throw new Error(`Failed to check signing capability: ${error}`);
    }
  }

  /**
   * Sign a DTE document
   * @param documentXml - DTE document in XML format
   * @param keyId - Private key identifier
   */
  async signDocument(documentXml: string, keyId: string): Promise<SignedDte> {
    try {
      return await invoke('sign_dte_document', {
        documentXml,
        privateKeyId: keyId
      });
    } catch (error) {
      throw new Error(`Failed to sign DTE document: ${error}`);
    }
  }

  /**
   * Get list of available private keys
   * @param keyIds - Array of key identifiers to check
   */
  async getAvailableKeys(keyIds: string[]): Promise<string[]> {
    const metadata = await secureStorage.getSecretsMetadata(
      keyIds.map(id => `dte_private_key_${id}`)
    );

    return metadata
      .filter(meta => meta.exists)
      .map(meta => meta.key.replace('dte_private_key_', ''));
  }

  /**
   * Remove a private key
   * @param keyId - Key identifier
   */
  async removePrivateKey(keyId: string): Promise<void> {
    await secureStorage.removeDtePrivateKey(keyId);
  }

  /**
   * Clear all stored keys and logout
   */
  async logout(): Promise<void> {
    await secureStorage.clear();
  }

  /**
   * Check if service is ready for use
   */
  get isReady(): boolean {
    return secureStorage.isReady;
  }
}

// Export singleton instance
export const dteService = DteService.getInstance(); 
