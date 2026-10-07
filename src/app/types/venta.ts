/**
 * venta.ts — Modelo de una venta registrada (specs/2026-10-ventas-dinamicas.md).
 * Una sola forma para ambas verticales: Restaurantes la muestra en /ventas,
 * Retail en /comprobantes y /facturas-venta según `tipoDoc`.
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

// TODO(Tarea 11): eliminar los tipos viejos de abajo (los usan VentasPage, PedidoDetallePage y data/retail/ventasMocks).
/**
 * venta.ts — Tipos de las vistas Ventas (/ventas) y Detalle de orden (/ventas/:id).
 * Compartidos entre las páginas y los mocks por vertical (data/retail/ventasMocks.ts).
 */

export type EstadoVariant = 'success' | 'warning' | 'error';
export type DianVariant   = 'success' | 'warning' | 'neutral';

export interface PagoMixtoItem {
  metodo: string;
  monto:  string;
}

export interface PagoDivididoPersona {
  persona: string;
  metodo:  string;
  monto:   string;
}

/** Fila de la tabla /ventas. `zona` y `mesa` solo existen en Restaurantes. */
export interface VentaRow {
  pedido:     string;
  horaInicio: string;
  horaCierre: string;
  zona?:      string;
  mesa?:      string;
  usuario:    string;
  total:      string;
  tipoDoc:    string;
  estado:     { label: string; variant: EstadoVariant };
  dian:       { label: string; variant: DianVariant };
}

/** Detalle de una orden. `mesa`, `zona`, `personas` y `duracion` solo existen en Restaurantes. */
export interface Pedido {
  id:           string;
  estado:       { label: string; variant: EstadoVariant };
  noDoc:        string;
  tipoDoc:      string;
  resolucion:   string;
  mesa?:        string;
  zona?:        string;
  sucursal:     string;
  personas?:    string;
  horaApertura: string;
  horaCierre:   string;
  duracion?:    string;
  vendedor:     string;
  cliente:      string;
  formaPago:    string;
  dian?:        { label: string; variant: DianVariant };
  efectivo?:    { recibido: string; cambio: string };
  pagoCancelado?: boolean;
  pagoMixto?:     PagoMixtoItem[];
  pagoDividido?:  PagoDivididoPersona[];
  totalPago?:     string;
  usuario:        string;
  cufe:           string;
}

export interface PedidoProducto {
  nombre:     string;
  nota:       string;
  cantidad:   number;
  precioUnit: string;
  descuento:  string;
  total:      string;
}
