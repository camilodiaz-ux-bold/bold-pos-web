/**
 * Datos mock del emisor de la factura electrónica — tomados de la factura de
 * referencia (Factura-POS-Restaurantes.pdf). En el producto real vienen de la
 * configuración del negocio; hoy no existe una fuente central.
 */
export const INVOICE_ISSUER = {
  razonSocial: 'BOLD.CO S.A.S',
  nit: '901.281.572-4',
  regimen: 'Responsable de IVA',
  contribuyente: 'Gran contribuyente',
  direccion: 'Carrera 40 #4b -22',
  telefono: '30500000012',
  correo: 'cristian.ciro@bold.co',
  sitioWeb: '',
  sucursal: 'Sucursal Principal',
  prefijo: 'SETT',
} as const;

/** Primer consecutivo que se emite (el del PDF de referencia). */
export const INVOICE_SEQ_START = 2400418;
