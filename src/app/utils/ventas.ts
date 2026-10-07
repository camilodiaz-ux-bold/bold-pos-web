import type { CompletedSale } from './invoice';
import type { Venta, VentaPago, EstadoVenta, EstadoDian } from '../types/venta';
import type { Vertical } from '../vertical';

/** Datos de la venta que no están en CompletedSale (los da quien cobra). */
export interface VentaContexto {
  zona?: string;
  mesa?: string;
  personas?: number;
  abiertaEn?: number;
}

/** Datos fijos de la sesión del prototipo por vertical (sucursal, turno abierto, usuario). */
export const SESION_VENTAS: Record<Vertical, { sucursal: string; turno: number; emitidoPor: string }> = {
  restaurantes: { sucursal: 'Principal',          turno: 529, emitidoPor: 'Juan Pérez' },
  retail:       { sucursal: 'Hub Ciudad del Río', turno: 529, emitidoPor: 'Wendell Nazar' },
};

/** CUFE mock determinista (96 hex) a partir del número y la fecha. */
export function mockCufe(seed: string): string {
  let h = 0x811c9dc5;
  let out = '';
  for (let round = 0; out.length < 96; round++) {
    for (const ch of `${seed}:${round}`) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
    out += h.toString(16).padStart(8, '0');
  }
  return out.slice(0, 96);
}

export function ventaFromSale(sale: CompletedSale, vertical: Vertical, recibo: string, ctx: VentaContexto = {}): Venta {
  const sesion = SESION_VENTAS[vertical];
  const esFactura = sale.tipoDoc === 'factura';
  const pagos: VentaPago[] = sale.payEntries.map(p => ({ method: p.method, amount: p.amount }));
  return {
    id: `v-${sale.paidAt}-${Math.random().toString(36).slice(2, 7)}`,
    numero: sale.orderRef || sale.invoiceNumber,
    tipoDoc: sale.tipoDoc,
    numeroDocumento: sale.orderRef ? sale.invoiceNumber : undefined,
    emitidaEn: sale.paidAt,
    abiertaEn: ctx.abiertaEn,
    vencimiento: sale.paidAt,
    zona: ctx.zona,
    mesa: ctx.mesa,
    personas: ctx.personas,
    cliente: sale.cliente,
    vendedor: sale.vendedor,
    emitidoPor: sesion.emitidoPor,
    sucursal: sesion.sucursal,
    turno: sesion.turno,
    resolucion: esFactura ? sale.resolucion : '---',
    items: sale.items,
    subtotal: sale.subtotal,
    taxRate: sale.taxRate,
    tax: sale.tax,
    tip: sale.tip,
    discount: sale.discount,
    total: sale.total,
    pagos,
    cambio: sale.cambio,
    saldo: 0,
    formaPago: 'Contado',
    estado: 'pagada',
    dian: esFactura ? 'aceptada' : undefined,
    cufe: esFactura ? mockCufe(`${sale.invoiceNumber}|${sale.paidAt}`) : undefined,
    recibo,
    note: sale.note,
  };
}

/** Reconstruye una CompletedSale para reimprimir el ticket desde el detalle. */
export function saleFromVenta(v: Venta): CompletedSale {
  return {
    title: v.mesa ? `Mesa ${v.mesa}` : v.numero,
    orderRef: v.numero.startsWith('ORD') ? v.numero : '',
    invoiceNumber: v.numeroDocumento ?? v.numero,
    tipoDoc: v.tipoDoc,
    items: v.items,
    subtotal: v.subtotal, taxRate: v.taxRate, tax: v.tax,
    tip: v.tip, tipLabel: 'Propina', discount: v.discount, total: v.total,
    payEntries: v.pagos.map(p => ({ method: p.method, amount: p.amount })),
    cambio: v.cambio,
    cliente: v.cliente,
    vendedor: v.vendedor,
    vendedorLabel: v.numero.startsWith('ORD') ? 'Mesero' : 'Vendedor',
    resolucion: v.resolucion,
    note: v.note,
    paidAt: v.emitidaEn,
  };
}

// ── Etiquetas ─────────────────────────────────────────────────────────────────
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

/** Restaurantes conserva sus textos (Pagado/Abierto/Cancelado). Retail usa los del POS real (Pagada/No pagada). */
export function estadoLabel(estado: EstadoVenta, vertical: Vertical): { label: string; variant: BadgeVariant } {
  const rest = vertical === 'restaurantes';
  switch (estado) {
    case 'pagada':    return { label: rest ? 'Pagado' : 'Pagada', variant: 'success' };
    case 'no-pagada': return { label: 'No pagada', variant: 'warning' };
    case 'abierta':   return { label: 'Abierto', variant: 'warning' };
    case 'cancelada': return { label: rest ? 'Cancelado' : 'Anulada', variant: 'error' };
  }
}

export function dianLabel(dian: EstadoDian | undefined, vertical: Vertical): { label: string; variant: BadgeVariant } | null {
  if (!dian) return null;
  if (dian === 'pendiente') return { label: 'Pendiente', variant: 'warning' };
  return { label: vertical === 'restaurantes' ? 'Enviada' : 'Aceptada', variant: 'success' };
}

export function tipoDocLabel(v: Venta): string {
  return v.tipoDoc === 'factura' ? 'Factura electrónica' : 'Comprobante';
}

export function metodoPagoLabel(v: Venta): string {
  const metodos = Array.from(new Set(v.pagos.map(p => p.method)));
  return metodos.length > 1 ? 'Pago mixto' : (metodos[0] ?? '---');
}

// ── Formato ───────────────────────────────────────────────────────────────────
export const fmtCOP = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

/** '06/10/2026 16:01' */
export function fmtFechaHora(ms: number): string {
  const d = new Date(ms);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 'yyyy-mm-dd' local, para comparar con <input type="date">. */
export function isoDia(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Filtros ───────────────────────────────────────────────────────────────────
/** '' o 'Todos' = sin filtro. */
export interface FiltrosVenta {
  numero?: string;
  desde?: string;      // yyyy-mm-dd
  hasta?: string;      // yyyy-mm-dd
  estado?: EstadoVenta | '';
  dian?: EstadoDian | '';
  tipoDoc?: 'comprobante' | 'factura' | '';
  vendedor?: string;
  cliente?: string;
  zona?: string;
  mesa?: string;
  metodoPago?: string;
  notas?: string;
}

const activo = (v?: string) => !!v && v !== 'Todos';

export function filterVentas(ventas: Venta[], f: FiltrosVenta): Venta[] {
  const q = f.numero?.trim().toLowerCase();
  const notas = f.notas?.trim().toLowerCase();
  return ventas.filter(v =>
    (!q || v.numero.toLowerCase().includes(q) || (v.numeroDocumento ?? '').toLowerCase().includes(q)) &&
    (!f.desde || isoDia(v.emitidaEn) >= f.desde) &&
    (!f.hasta || isoDia(v.emitidaEn) <= f.hasta) &&
    (!f.estado || v.estado === f.estado) &&
    (!f.dian || v.dian === f.dian) &&
    (!f.tipoDoc || v.tipoDoc === f.tipoDoc) &&
    (!activo(f.vendedor) || v.vendedor === f.vendedor) &&
    (!activo(f.cliente) || v.cliente === f.cliente) &&
    (!activo(f.zona) || v.zona === f.zona) &&
    (!activo(f.mesa) || v.mesa === f.mesa) &&
    (!activo(f.metodoPago) || v.pagos.some(p => p.method === f.metodoPago)) &&
    (!notas || v.note.toLowerCase().includes(notas)),
  );
}

/** Valores únicos de un campo, para armar las opciones de un filtro. */
export function opciones(ventas: Venta[], get: (v: Venta) => string | undefined): string[] {
  return Array.from(new Set(ventas.map(get).filter((x): x is string => !!x))).sort();
}
