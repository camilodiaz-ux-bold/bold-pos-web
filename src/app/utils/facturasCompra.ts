import type { EstadoPagoCompra, FacturaCompra, ImpuestoCompra, ItemFacturaCompra } from '../types/facturaCompra';
import type { BadgeVariant } from './ventas';
import { IMPUESTOS_COMPRA } from '../data/facturasCompraSeed';

/** "Hoy" del prototipo (specs/2026-10-facturas-compra.md §4): con el reloj real todas las facturas aparecerían vencidas. */
export const FECHA_PROTOTIPO = '2026-07-14';

// ─── Dinero y fechas ─────────────────────────────────────────────────────────

/** "$ 1.450.000" */
export const fmtMonto = (n: number): string => `$ ${Math.round(n).toLocaleString('es-CO')}`;

/** '2026-07-14' | '2026-07-14T09:24' → '14/07/2026' */
export const fmtFecha = (iso: string): string => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

/** '2026-07-14T09:24' → '14/07/2026 - 09:24 a.m.' */
export const fmtFechaHoraCompra = (iso: string): string => {
  const hora = iso.slice(11, 16);
  if (!hora) return fmtFecha(iso);
  const [h, min] = hora.split(':').map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${fmtFecha(iso)} - ${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`;
};

/** '2026-07-15' → '15/7' */
export const fmtDiaMes = (iso: string): string => {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d}/${m}`;
};

const toUTC = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Días de `a` a `b` (positivo si `b` es posterior). */
export const diffDias = (a: string, b: string): number => Math.round((toUTC(b) - toUTC(a)) / 86400000);

export const addDias = (iso: string, dias: number): string => new Date(toUTC(iso) + dias * 86400000).toISOString().slice(0, 10);

/** Fecha de referencia + hora actual del navegador, para registros nuevos ("2026-07-14T15:45"). */
export const ahoraPrototipo = (): string => {
  const n = new Date();
  return `${FECHA_PROTOTIPO}T${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
};

// ─── Cálculos ────────────────────────────────────────────────────────────────

export const tasaImpuesto = (i: ImpuestoCompra): number => IMPUESTOS_COMPRA.find(x => x.value === i)?.rate ?? 0;

export const totalLinea = (it: Pick<ItemFacturaCompra, 'cantidad' | 'precio'>): number => it.cantidad * it.precio;

export interface Totales { subtotal: number; impuestos: number; retenciones: number; total: number; totalSinImpuestos: number }

export function calcularTotales(items: ItemFacturaCompra[], retenciones: number): Totales {
  const subtotal = items.reduce((s, it) => s + totalLinea(it), 0);
  const impuestos = Math.round(items.reduce((s, it) => s + totalLinea(it) * tasaImpuesto(it.impuesto), 0));
  return { subtotal, impuestos, retenciones, total: subtotal + impuestos - retenciones, totalSinImpuestos: subtotal };
}

/** Valor que muestran listado, resumen y dashboard según el switch "Usar impuestos y retenciones". */
export const valorFactura = (f: Pick<FacturaCompra, 'items' | 'retenciones'>, usarImpuestos: boolean): number => {
  const t = calcularTotales(f.items, f.retenciones);
  return usarImpuestos ? t.total : t.totalSinImpuestos;
};

// ─── Estado ──────────────────────────────────────────────────────────────────

export function estadoFactura(f: FacturaCompra): EstadoPagoCompra {
  if (f.anulacion) return 'Anulada';
  if (f.formaPago === 'Contado' || f.pago) return 'Pagado';
  return f.fechaVencimiento && f.fechaVencimiento < FECHA_PROTOTIPO ? 'Vencido' : 'No pagado';
}

export const BADGE_ESTADO: Record<EstadoPagoCompra, BadgeVariant> = {
  Pagado: 'success', 'No pagado': 'warning', Vencido: 'error', Anulada: 'info',
};

/** Pendiente de pago: crédito sin pagar y no anulado (Vencido o No pagado). */
export const esPendiente = (f: FacturaCompra): boolean => {
  const e = estadoFactura(f);
  return e === 'Vencido' || e === 'No pagado';
};

/** Orden de "Prioridad de pago". */
const PRIORIDAD: Record<EstadoPagoCompra, number> = { Vencido: 0, 'No pagado': 1, Pagado: 2, Anulada: 3 };

const seq = (f: FacturaCompra) => parseInt(f.numero.replace(/\D/g, ''), 10) || 0;

export type OrdenFacturas = 'creacion' | 'prioridad';

export function ordenarFacturas(lista: FacturaCompra[], modo: OrdenFacturas): FacturaCompra[] {
  return [...lista].sort((a, b) => {
    if (modo === 'prioridad') {
      const pa = PRIORIDAD[estadoFactura(a)];
      const pb = PRIORIDAD[estadoFactura(b)];
      if (pa !== pb) return pa - pb;
      const va = a.fechaVencimiento ?? '9999-12-31';
      const vb = b.fechaVencimiento ?? '9999-12-31';
      if (va !== vb) return va < vb ? -1 : 1;
    }
    return seq(b) - seq(a);
  });
}

export function siguienteNumero(lista: FacturaCompra[]): string {
  const max = lista.reduce((m, f) => Math.max(m, seq(f)), 0);
  return `FC-${String(max + 1).padStart(3, '0')}`;
}

// ─── Filtros ─────────────────────────────────────────────────────────────────

export interface FiltrosFactura {
  numero: string; proveedorId: string; formaPago: string; estado: string; sucursal: string; desde: string; hasta: string;
}

export const FILTROS_FACTURA_VACIOS: FiltrosFactura = {
  numero: '', proveedorId: '', formaPago: 'Todas', estado: 'Todos', sucursal: 'Todas', desde: '', hasta: '',
};

export function filterFacturas(lista: FacturaCompra[], f: FiltrosFactura): FacturaCompra[] {
  return lista.filter(x =>
    (!f.numero.trim() || x.numero.toLowerCase().includes(f.numero.trim().toLowerCase())) &&
    (!f.proveedorId || x.proveedorId === f.proveedorId) &&
    (f.formaPago === 'Todas' || x.formaPago === f.formaPago) &&
    (f.estado === 'Todos' || estadoFactura(x) === f.estado) &&
    (f.sucursal === 'Todas' || x.sucursal === f.sucursal) &&
    (!f.desde || x.fechaEmision >= f.desde) &&
    (!f.hasta || x.fechaEmision <= f.hasta),
  );
}

// ─── Cuentas por pagar (proveedores y dashboard) ─────────────────────────────

/** Compras no anuladas de los últimos 6 meses del proveedor. */
export const comprasUltimos6Meses = (facturas: FacturaCompra[], proveedorId: string): number =>
  facturas.filter(f => f.proveedorId === proveedorId && !f.anulacion && diffDias(f.fechaEmision, FECHA_PROTOTIPO) <= 183).length;

export const cuentasPorPagar = (facturas: FacturaCompra[], proveedorId: string): number =>
  facturas.filter(f => f.proveedorId === proveedorId && esPendiente(f)).length;

export interface SemanaPagos { desde: string; hasta: string; etiqueta: string; facturas: number; monto: number }

/** 4 semanas que empiezan el día siguiente a la fecha de referencia; cuenta las pendientes que vencen en cada una. */
export function semanasPorPagar(facturas: FacturaCompra[], usarImpuestos: boolean, cantidad = 4): SemanaPagos[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const desde = addDias(FECHA_PROTOTIPO, 1 + i * 7);
    const hasta = addDias(desde, 6);
    const enSemana = facturas.filter(f => esPendiente(f) && f.fechaVencimiento && f.fechaVencimiento >= desde && f.fechaVencimiento <= hasta);
    return {
      desde, hasta, etiqueta: `${fmtDiaMes(desde)} - ${fmtDiaMes(hasta)}`,
      facturas: enSemana.length, monto: enSemana.reduce((s, f) => s + valorFactura(f, usarImpuestos), 0),
    };
  });
}
