export interface CompanyInfo {
  name: string;
  tradeName?: string;
  nit: string;
  nrc: string;
  economicActivity: string;
  economicActivityCode: string;
  address: string;
  department: string;
  municipality: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

export interface TerminalInfo {
  terminalId: string;
  terminalName: string;
  branchId?: string;
  branchName?: string;
  establishmentCode: string;
  pointOfSaleCode: string;
}

export const EMPTY_COMPANY_INFO: CompanyInfo = {
  name: '',
  nit: '',
  nrc: '',
  economicActivity: '',
  economicActivityCode: '',
  address: '',
  department: '',
  municipality: '',
};

export function isCompanyInfoComplete(info: CompanyInfo): boolean {
  return Boolean(
    info.name &&
      info.nit &&
      info.nrc &&
      info.economicActivity &&
      info.economicActivityCode &&
      info.address &&
      info.department &&
      info.municipality
  );
}

export function formatCompanyNIT(nit: string): string {
  // Format: 0000-000000-000-0
  const clean = nit.replace(/\D/g, '');
  if (clean.length !== 14) return nit;
  return `${clean.slice(0, 4)}-${clean.slice(4, 10)}-${clean.slice(10, 13)}-${clean.slice(13)}`;
}

export function formatCompanyNRC(nrc: string): string {
  // Format: 000000-0
  const clean = nrc.replace(/\D/g, '');
  if (clean.length !== 7) return nrc;
  return `${clean.slice(0, 6)}-${clean.slice(6)}`;
}
