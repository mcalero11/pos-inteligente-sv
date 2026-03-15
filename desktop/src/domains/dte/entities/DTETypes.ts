// DTE Types for El Salvador Ministry of Finance (Ministerio de Hacienda)

export type DTEType =
  | "FCF" // Factura de Consumidor Final
  | "CCF" // Comprobante de Crédito Fiscal
  | "NC" // Nota de Crédito
  | "ND" // Nota de Débito
  | "NR" // Nota de Remisión
  | "FEX" // Factura de Exportación
  | "FSE" // Factura de Sujeto Excluido
  | "CR" // Comprobante de Retención
  | "CL" // Comprobante de Liquidación
  | "DNC"; // Documento de Nota de Contingencia

export interface DTETypeDefinition {
  code: DTEType;
  name: string;
  description: string;
  requiresNIT: boolean;
  requiresNRC: boolean;
}

export const DTE_TYPES: Record<DTEType, DTETypeDefinition> = {
  FCF: {
    code: "FCF",
    name: "Factura de Consumidor Final",
    description: "Para ventas a consumidores finales sin crédito fiscal",
    requiresNIT: false,
    requiresNRC: false,
  },
  CCF: {
    code: "CCF",
    name: "Comprobante de Crédito Fiscal",
    description: "Para ventas a contribuyentes con derecho a crédito fiscal",
    requiresNIT: true,
    requiresNRC: true,
  },
  NC: {
    code: "NC",
    name: "Nota de Crédito",
    description: "Para anular o modificar facturas emitidas",
    requiresNIT: false,
    requiresNRC: false,
  },
  ND: {
    code: "ND",
    name: "Nota de Débito",
    description: "Para cargos adicionales a facturas emitidas",
    requiresNIT: false,
    requiresNRC: false,
  },
  NR: {
    code: "NR",
    name: "Nota de Remisión",
    description: "Para traslado de mercaderías",
    requiresNIT: false,
    requiresNRC: false,
  },
  FEX: {
    code: "FEX",
    name: "Factura de Exportación",
    description: "Para ventas de exportación",
    requiresNIT: true,
    requiresNRC: false,
  },
  FSE: {
    code: "FSE",
    name: "Factura de Sujeto Excluido",
    description: "Para compras a sujetos excluidos del IVA",
    requiresNIT: false,
    requiresNRC: false,
  },
  CR: {
    code: "CR",
    name: "Comprobante de Retención",
    description: "Para retenciones de IVA",
    requiresNIT: true,
    requiresNRC: false,
  },
  CL: {
    code: "CL",
    name: "Comprobante de Liquidación",
    description: "Para liquidación de operaciones",
    requiresNIT: true,
    requiresNRC: false,
  },
  DNC: {
    code: "DNC",
    name: "Documento de Nota de Contingencia",
    description: "Para emisión en contingencia (sin conexión)",
    requiresNIT: false,
    requiresNRC: false,
  },
};

export function getDTETypeForCustomer(
  hasNIT: boolean,
  hasNRC: boolean
): DTEType {
  if (hasNIT && hasNRC) {
    return "CCF";
  }
  return "FCF";
}

export function getDTETypeInfo(type: DTEType): DTETypeDefinition {
  return DTE_TYPES[type];
}
