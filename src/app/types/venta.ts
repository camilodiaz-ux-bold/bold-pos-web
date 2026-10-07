/**
 * venta.ts — Modelo de una venta registrada (specs/2026-10-ventas-dinamicas.md).
 * Una sola forma para ambas verticales: Restaurantes la muestra en /ventas,
 * Retail en /comprobantes y /facturas-venta según `tipoDoc`.
 *
 * El store lee este modelo desde localStorage y lo actualiza cada vez que se cobra,
 * en ambas verticales.
 */
import type { SaleItem } from '../utils/invoice';

export type TipoDocVenta = 'comprobante' | 'factura';
export type EstadoVenta  = 'pagada' | 'no-pagada' | 'abierta' | 'cancelada';
export type EstadoDian   = 'aceptada' | 'pendiente';

export interface VentaPago {
  method: string;
  amount: number;
  /** Pago dividido por persona (Restaurantes). */
  persona?: string;
}

export interface Venta {
  /** Id interno único: lo usa la ruta del detalle. */
  id: string;
  /** Número visible: 'ORD0011' (Restaurantes) · '3763' (comprobante) · 'SETT 2400418' (factura Retail). */
  numero: string;
  tipoDoc: TipoDocVenta;
  /** Restaurantes: número de la factura electrónica asociada a la orden ('SETT 2400418'). */
  numeroDocumento?: string;
  /** Epoch ms de la emisión (= cobro). Define el orden del listado. */
  emitidaEn: number;
  /** Epoch ms de la apertura de la mesa/orden (Restaurantes). */
  abiertaEn?: number;
  /** Ventas de contado: igual a emitidaEn. */
  vencimiento: number;
  zona?: string;
  mesa?: string;
  personas?: number;
  cliente: string;
  vendedor: string;
  emitidoPor: string;
  sucursal: string;
  turno: number;
  resolucion: string;
  items: SaleItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  pagos: VentaPago[];
  cambio: number;
  /** Lo que falta por pagar (0 si está pagada). */
  saldo: number;
  formaPago: 'Contado' | 'Crédito';
  estado: EstadoVenta;
  /** Solo facturas. */
  dian?: EstadoDian;
  /** Solo facturas. */
  cufe?: string;
  /** Código del recibo de caja ('8428'). */
  recibo: string;
  note: string;
}
