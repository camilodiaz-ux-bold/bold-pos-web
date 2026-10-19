import type { FacturaCompraDemo, Proveedor } from '../types/proveedor';

export const PROVEEDORES_STORAGE_KEY = 'bold-pos:proveedores:v1';

export const TIPO_PERSONA_OPCIONES = [
  { value: 'natural', label: 'Persona natural' },
  { value: 'juridica', label: 'Persona jurídica' },
];

export const TIPO_DOCUMENTO_OPCIONES = [
  { value: 'nit', label: 'NIT' },
  { value: 'cc', label: 'Cédula de ciudadanía' },
  { value: 'ce', label: 'Cédula de extranjería' },
];

const toOpciones = (labels: string[]) => labels.map(l => ({ value: l, label: l }));

export const RESPONSABILIDAD_FISCAL_OPCIONES = toOpciones(['Régimen simple', 'Régimen común']);
export const REGIMEN_FISCAL_OPCIONES = toOpciones(['Responsable de IVA', 'No responsable de IVA']);
export const VENDEDOR_OPCIONES = toOpciones(['Andrés Lizarazo', 'Wendell Nazar']);
export const DESCUENTO_OPCIONES = toOpciones(['5%', '10%']);
export const PAIS_OPCIONES = toOpciones(['Colombia']);
export const CIUDAD_OPCIONES = toOpciones([
  'Bogotá D.C.', 'Medellín (Antioquia)', 'Cali (Valle del Cauca)', 'Barranquilla (Atlántico)', 'Cartagena (Bolívar)',
]);

type SeedBase = Pick<Proveedor, 'id' | 'nombre' | 'correo' | 'numeroDocumento' | 'tipoPersona' | 'tipoDocumento' | 'comprasUltimos6Meses' | 'cuentasPorPagar'>;

const base: Omit<Proveedor, keyof SeedBase> = {
  esCliente: false, esProveedor: true, activo: true,
  celular: '', telefono1: '', telefono2: '', observaciones: '',
  responsabilidadFiscal: '', regimenFiscal: '', vendedor: '', descuento: '',
  pais: 'Colombia', ciudad: '', direccion: '',
};

export function buildSeedProveedores(): Proveedor[] {
  const seed: SeedBase[] = [
    { id: 'prov-1', nombre: 'Gilma Florez Hernandez', correo: 'florezhernandezgilma@gmail.com', numeroDocumento: '39719859', tipoPersona: 'natural', tipoDocumento: 'cc', comprasUltimos6Meses: 8, cuentasPorPagar: 2 },
    { id: 'prov-2', nombre: '79304228 - LECHONERÍA EL ESPLENDOR TOLIMENSE', correo: 'elesplendortolimense@gmail.com', numeroDocumento: '79304228', tipoPersona: 'juridica', tipoDocumento: 'nit', comprasUltimos6Meses: 15, cuentasPorPagar: 4 },
    { id: 'prov-3', nombre: 'Arepas San Martin - ANDRÉS CAMILO MARTIN PALACIO', correo: 'arepassanmartin0516@gmail.com', numeroDocumento: '1077974723', tipoPersona: 'natural', tipoDocumento: 'cc', comprasUltimos6Meses: 3, cuentasPorPagar: 1 },
    { id: 'prov-4', nombre: 'M6GLU4NXLW - Magic Tour - 21788267', correo: 'guatapemagictour@gmail.com', numeroDocumento: '21788267', tipoPersona: 'natural', tipoDocumento: 'cc', comprasUltimos6Meses: 0, cuentasPorPagar: 0 },
    { id: 'prov-5', nombre: '1128479906 - Persianas Y Decoración Tommy', correo: 'andresfelo-23@hotmail.com', numeroDocumento: '1128479906', tipoPersona: 'natural', tipoDocumento: 'cc', comprasUltimos6Meses: 6, cuentasPorPagar: 2 },
    { id: 'prov-6', nombre: 'Fruto de vida SAS - Andres Mauricio Ponce Aguirre', correo: 'andresponce50@gmail.com', numeroDocumento: '80872049', tipoPersona: 'juridica', tipoDocumento: 'nit', comprasUltimos6Meses: 11, cuentasPorPagar: 3 },
  ];
  return seed.map(s => ({ ...base, ...s }));
}

/** Facturas de ejemplo del perfil de `prov-1` (copiadas del prototipo `saas-purchasing`). */
export const FACTURAS_COMPRA_DEMO: Record<string, FacturaCompraDemo[]> = {
  'prov-1': [
    { numero: 'FC-008', inventario: true, items: 12, total: 1450000, formaPago: 'Contado', vencimiento: null, estado: 'Pagado' },
    { numero: 'FC-007', inventario: true, items: 6, total: 780300, formaPago: 'Crédito', vencimiento: '20/06/2026', estado: 'Vencido' },
    { numero: 'FC-006', inventario: true, items: 15, total: 1120750, formaPago: 'Crédito', vencimiento: '05/08/2026', estado: 'Pagado' },
    { numero: 'FC-005', inventario: false, items: 4, total: 540000, formaPago: 'Crédito', vencimiento: '15/08/2026', estado: 'No pagado' },
    { numero: 'FC-004', inventario: false, items: 9, total: 980000, formaPago: 'Contado', vencimiento: null, estado: 'Anulada' },
    { numero: 'FC-003', inventario: true, items: 20, total: 2310000, formaPago: 'Contado', vencimiento: null, estado: 'Pagado' },
    { numero: 'FC-002', inventario: false, items: 3, total: 215000, formaPago: 'Contado', vencimiento: null, estado: 'Pagado' },
    { numero: 'FC-001', inventario: true, items: 8, total: 620000, formaPago: 'Contado', vencimiento: null, estado: 'Pagado' },
  ],
};
