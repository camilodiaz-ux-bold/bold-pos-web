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
}

export type ContactoDraft = Omit<Contacto, 'id'>;

