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

export class DTESigningService {
  private static instance: DTESigningService;

  private constructor() {}

  static getInstance(): DTESigningService {
    if (!DTESigningService.instance) {
      DTESigningService.instance = new DTESigningService();
    }
    return DTESigningService.instance;
  }

  /**
   * Load a certificate for DTE signing
   * @param path - Path to the certificate file (.p12 or .pfx)
   * @param password - Certificate password
   */
  async loadCertificate(path: string, password: string): Promise<boolean> {
    try {
      return await invoke<boolean>("load_certificate", { path, password });
    } catch (error) {
      throw new Error(`Failed to load certificate: ${error}`);
    }
  }

  /**
   * Check if a certificate is loaded for signing
   */
  async isCertificateLoaded(): Promise<boolean> {
    try {
      return await invoke<boolean>("is_certificate_loaded");
    } catch {
      return false;
    }
  }

  /**
   * Sign a DTE document using the loaded certificate
   * @param dteType - Type of DTE (e.g., 'FCF', 'CCF')
   * @param jsonData - DTE document data as JSON string
   */
  async signDocument(
    dteType: string,
    jsonData: string
  ): Promise<SigningResult> {
    try {
      return await invoke<SigningResult>("sign_dte", {
        payload: { dte_type: dteType, json_data: jsonData },
      });
    } catch (error) {
      throw new Error(`Failed to sign DTE document: ${error}`);
    }
  }

  /**
   * Check if service is ready for signing (certificate loaded)
   */
  async isReady(): Promise<boolean> {
    return this.isCertificateLoaded();
  }
}

// Export singleton instance
export const dteSigningService = DTESigningService.getInstance();
