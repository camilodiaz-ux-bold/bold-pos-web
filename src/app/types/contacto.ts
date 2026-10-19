/** Contacto (cliente y/o proveedor) — specs/2026-10-proveedores.md §4. */

export type TipoPersona = 'natural' | 'juridica';
export type TipoDocumento = 'nit' | 'cc' | 'ce';

export interface Contacto {
  id: string;
  nombre: string;
  esCliente: boolean;
  esProveedor: boolean;
  activo: boolean;
  correo: string;
  celular: string;
  telefono1: string;
  telefono2: string;
  observaciones: string;
  tipoPersona: TipoPersona | '';
  tipoDocumento: TipoDocumento | '';
  numeroDocumento: string;
  responsabilidadFiscal: string;
  regimenFiscal: string;
  vendedor: string;
  descuento: string;
  pais: string;
  ciudad: string;
  direccion: string;
  /** Datos del propio contacto hasta que existan las facturas de compra reales. */
  comprasUltimos6Meses: number;
  cuentasPorPagar: number;
}

export type ContactoDraft = Omit<Contacto, 'id' | 'comprasUltimos6Meses' | 'cuentasPorPagar'>;

/** Fila de ejemplo de la pestaña "Facturas de compra" del perfil (aún sin módulo real). */
export interface FacturaCompraDemo {
  numero: string;
  inventario: boolean;
  items: number;
  total: number;
  formaPago: 'Contado' | 'Crédito';
  vencimiento: string | null;
  estado: 'Pagado' | 'No pagado' | 'Vencido' | 'Anulada';
}
