import { invoke } from "@tauri-apps/api/core";
import { secureStorage } from "./secure-storage";

export interface SignedDte {
  document: object;
  signature: string;
  timestamp: string;
}

export async function signDteDocument(documentXml: string, privateKeyId: string): Promise<SignedDte> {
  const _isInitialized = await secureStorage.isInitialized();
  if (!_isInitialized) {
    throw new Error('Secure storage not initialized');
  }

  try {
    return await invoke<SignedDte>('sign_dte_document', {
      documentXml,
      privateKeyId,
    });
  } catch (error) {
    (globalThis as any).console?.error('Failed to sign DTE document:', error);
    throw error;
  }
}

export async function canSignDte(privateKeyId: string): Promise<boolean> {
  const _isInitialized = await secureStorage.isInitialized();
  if (!_isInitialized) {
    throw new Error('Secure storage not initialized');
  }

  try {
    return await invoke<boolean>('can_sign_dte', { privateKeyId });
  } catch (error) {
    (globalThis as any).console?.error('Failed to check DTE signing capability:', error);
    throw error;
  }
}
