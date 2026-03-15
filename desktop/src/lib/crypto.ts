import { invoke } from "@tauri-apps/api/core";

export interface SigningResult {
  success: boolean;
  signed_data: string | null;
  codigo_generacion: string | null;
  numero_control: string | null;
  error: string | null;
}

export interface SignDteInput {
  dte_type: string;
  json_data: string;
}

/**
 * Sign a DTE document using the loaded certificate
 * @param dteType - Type of DTE document (e.g., 'FCF')
 * @param jsonData - DTE data as JSON string
 */
export async function signDte(
  dteType: string,
  jsonData: string
): Promise<SigningResult> {
  try {
    return await invoke<SigningResult>("sign_dte", {
      payload: { dte_type: dteType, json_data: jsonData },
    });
  } catch (error) {
    (globalThis as any).console?.error("Failed to sign DTE document:", error);
    throw error;
  }
}

/**
 * Load a certificate for DTE signing
 * @param path - Path to the certificate file
 * @param password - Certificate password
 */
export async function loadCertificate(
  path: string,
  password: string
): Promise<boolean> {
  try {
    return await invoke<boolean>("load_certificate", { path, password });
  } catch (error) {
    (globalThis as any).console?.error("Failed to load certificate:", error);
    throw error;
  }
}

/**
 * Check if a certificate is loaded for DTE signing
 */
export async function isCertificateLoaded(): Promise<boolean> {
  try {
    return await invoke<boolean>("is_certificate_loaded");
  } catch (error) {
    (globalThis as any).console?.error(
      "Failed to check certificate status:",
      error
    );
    return false;
  }
}
