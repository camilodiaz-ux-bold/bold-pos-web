/** Factura de compra — specs/2026-10-facturas-compra.md §4. Subtotal, impuestos, total y estado se derivan (utils/facturasCompra.ts). */

export type FormaPagoCompra = 'Contado' | 'Crédito';
export type ImpuestoCompra = 'Exento' | 'IVA 19,00%' | 'IVA 5,00%' | 'Excluido';
export type EstadoPagoCompra = 'Pagado' | 'No pagado' | 'Vencido' | 'Anulada';

export interface ItemFacturaCompra {
  nombre: string;
  codigo: string;
  cantidad: number;
  precio: number;
  impuesto: ImpuestoCompra;
  inventariable: boolean;
}

export interface PagoFacturaCompra {
  /** ISO con hora: '2026-07-10T15:45'. */
  fecha: string;
  metodo: string;
  turno: string | null;
  observacion: string;
  reportadoPor: string;
}

export interface AnulacionFacturaCompra {
  por: string;
  fecha: string;
  observacion: string;
}

export interface FacturaCompra {
  id: string;
  numero: string;
  proveedorId: string;
  numeroProveedor: string;
  sucursal: string;
  /** ISO 'YYYY-MM-DD'. */
  fechaEmision: string;
  /** ISO con hora. */
  fechaRegistro: string;
  formaPago: FormaPagoCompra;
  /** Solo Contado. */
  metodoPago: string | null;
  turno: string | null;
  afectaInventario: boolean;
  /** Solo Crédito. ISO 'YYYY-MM-DD'. */
  fechaVencimiento: string | null;
  items: ItemFacturaCompra[];
  /** Monto de retenciones (Subtotal × % global al crear). */
  retenciones: number;
  observaciones: string;
  ds: { numero: string } | null;
  pago: PagoFacturaCompra | null;
  anulacion: AnulacionFacturaCompra | null;
}

export type FacturaCompraDraft = Omit<FacturaCompra, 'id' | 'numero' | 'fechaRegistro' | 'ds' | 'pago' | 'anulacion'>;
