/**
 * retail/ventasMocks.ts — Mocks de Ventas (/ventas) y Detalle de orden de la vertical Retail.
 * Sin mesa/zona/propina; productos del catálogo Retail (data/retail/productCatalog.ts).
 * Las filas de la tabla y los detalles se derivan de una sola lista para mantenerlos consistentes.
 */
import type { Pedido, PedidoProducto, VentaRow, EstadoVariant, DianVariant } from '../../types/venta';

const RES = 'Resolution test SP - Resolution 1234509752467';
const CODCUFE = 'eefa31ca5cdaf0422bab155a0c1b6e4341cd07236510741cd041cd0...';

const PAGADO:   { label: string; variant: EstadoVariant } = { label: 'Pagado',    variant: 'success' };
const CANCELADO:{ label: string; variant: EstadoVariant } = { label: 'Cancelado', variant: 'error'   };
const SIN_DIAN: { label: string; variant: DianVariant }   = { label: '---',       variant: 'neutral' };
const ENVIADA:  { label: string; variant: DianVariant }   = { label: 'Enviada',   variant: 'success' };
const PENDIENTE:{ label: string; variant: DianVariant }   = { label: 'Pendiente', variant: 'warning' };

interface Venta {
  id: string; noDoc: string; hora: string; vendedor: string; total: string;
  tipoDoc: 'Comprobante' | 'Factura electrónica'; cliente: string; formaPago: string;
  estado: { label: string; variant: EstadoVariant }; dian: { label: string; variant: DianVariant };
  extra?: Partial<Pedido>;
}

const VENTAS: Venta[] = [
  { id: 'V-001', noDoc: 'V-001234', hora: '25/03/2026 10:12', vendedor: 'Sofía Martínez',  total: '$301,600', tipoDoc: 'Comprobante',         cliente: 'Consumidor final',          formaPago: 'Efectivo', estado: PAGADO,    dian: SIN_DIAN, extra: { efectivo: { recibido: '$310,000', cambio: '$8,400' } } },
  { id: 'V-002', noDoc: 'V-001235', hora: '25/03/2026 10:48', vendedor: 'Andrés Ríos',     total: '$229,900', tipoDoc: 'Factura electrónica', cliente: 'Laura Gómez NIT 900123456', formaPago: 'Tarjeta',  estado: PAGADO,    dian: ENVIADA },
  { id: 'V-003', noDoc: 'V-001236', hora: '25/03/2026 11:30', vendedor: 'Valentina Cruz',  total: '$45,900',  tipoDoc: 'Comprobante',         cliente: 'Consumidor final',          formaPago: 'Nequi',    estado: PAGADO,    dian: SIN_DIAN },
  { id: 'V-004', noDoc: 'V-001237', hora: '25/03/2026 12:05', vendedor: 'Diego Salazar',   total: '$329,900', tipoDoc: 'Comprobante',         cliente: 'Consumidor final',          formaPago: 'Tarjeta',  estado: CANCELADO, dian: SIN_DIAN, extra: { pagoCancelado: true } },
  { id: 'V-005', noDoc: 'V-001238', hora: '25/03/2026 12:40', vendedor: 'Sofía Martínez',  total: '$498,800', tipoDoc: 'Factura electrónica', cliente: 'Comercial Andina SAS NIT 901555777', formaPago: 'Pago mixto', estado: PAGADO, dian: PENDIENTE,
    extra: { pagoMixto: [{ metodo: 'Efectivo', monto: '$200,000' }, { metodo: 'Tarjeta', monto: '$298,800' }] } },
  { id: 'V-006', noDoc: 'V-001239', hora: '25/03/2026 13:15', vendedor: 'Andrés Ríos',     total: '$109,900', tipoDoc: 'Comprobante',         cliente: 'Consumidor final',          formaPago: 'Efectivo', estado: PAGADO,    dian: SIN_DIAN, extra: { efectivo: { recibido: '$120,000', cambio: '$10,100' } } },
  { id: 'V-007', noDoc: 'V-001240', hora: '25/03/2026 14:02', vendedor: 'Valentina Cruz',  total: '$239,900', tipoDoc: 'Factura electrónica', cliente: 'Juan García NIT 900123456', formaPago: 'Tarjeta',  estado: PAGADO,    dian: ENVIADA },
  { id: 'V-008', noDoc: 'V-001241', hora: '25/03/2026 14:45', vendedor: 'Diego Salazar',   total: '$89,900',  tipoDoc: 'Comprobante',         cliente: 'Consumidor final',          formaPago: 'Nequi',    estado: PAGADO,    dian: SIN_DIAN },
  { id: 'V-009', noDoc: 'V-001242', hora: '25/03/2026 15:20', vendedor: 'Sofía Martínez',  total: '$179,900', tipoDoc: 'Comprobante',         cliente: 'Consumidor final',          formaPago: 'Tarjeta',  estado: CANCELADO, dian: SIN_DIAN, extra: { pagoCancelado: true } },
  { id: 'V-010', noDoc: 'V-001243', hora: '25/03/2026 16:10', vendedor: 'Andrés Ríos',     total: '$658,700', tipoDoc: 'Factura electrónica', cliente: 'Comercial Andina SAS NIT 901555777', formaPago: 'Tarjeta', estado: PAGADO, dian: ENVIADA },
];

export const RETAIL_VENTA_ROWS: VentaRow[] = VENTAS.map(v => ({
  pedido: v.id, horaInicio: v.hora, horaCierre: v.hora, usuario: v.vendedor,
  total: v.total, tipoDoc: v.tipoDoc, estado: v.estado, dian: v.dian,
}));

export const RETAIL_VENTA_USUARIOS = Array.from(new Set(VENTAS.map(v => v.vendedor)));

export const RETAIL_PEDIDOS: Record<string, Pedido> = Object.fromEntries(VENTAS.map(v => [v.id, {
  id: v.id,
  estado: v.estado,
  noDoc: v.noDoc,
  tipoDoc: v.tipoDoc,
  resolucion: v.tipoDoc === 'Factura electrónica' ? RES : '---',
  sucursal: 'Principal',
  horaApertura: v.hora,
  horaCierre: v.hora,
  vendedor: v.vendedor,
  cliente: v.cliente,
  formaPago: v.formaPago,
  dian: v.tipoDoc === 'Factura electrónica' ? v.dian : undefined,
  usuario: 'Juan Perez',
  cufe: v.tipoDoc === 'Factura electrónica' ? CODCUFE : '---',
  ...v.extra,
} satisfies Pedido]));

/** Productos y totales del detalle (mock único, como en Restaurantes). */
export const RETAIL_PEDIDO_PRODUCTOS: PedidoProducto[] = [
  { nombre: 'Camiseta Básica Algodón', nota: '', cantidad: 2, precioUnit: '$45,900',  descuento: '---', total: '$91,800'  },
  { nombre: 'Jean Slim Azul Oscuro',   nota: '', cantidad: 1, precioUnit: '$159,900', descuento: '---', total: '$159,900' },
  { nombre: 'Gorra Visera Curva',      nota: '', cantidad: 1, precioUnit: '$49,900',  descuento: '---', total: '$49,900'  },
];

export const RETAIL_PEDIDO_TOTALES = {
  rows: [
    { label: 'Subtotal',  value: '$253,445' },
    { label: 'Descuento', value: '$0'       },
    { label: 'IVA 19%',   value: '$48,155'  },
  ],
  total: '$301,600',
};
