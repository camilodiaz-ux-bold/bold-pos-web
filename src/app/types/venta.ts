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
