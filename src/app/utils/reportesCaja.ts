/**
 * reportesCaja.ts — cálculo de los reportes de Cotizaciones, Notas, Ingresos y Egresos y Cierres de Caja de Retail
 * (specs/2026-10-reportes-retail.md §5.1, §5.2 y §5.3). Funciones puras sobre `ventasStore` y las semillas
 * provisionales de `data/retail/reportesSeed.ts`. Las ventas/documentos anulados aparecen en las tablas pero no suman.
 */
import type { Venta } from '../types/venta';
import type { Cotizacion, Gasto, NotaElectronica, Recibo } from '../data/retail/reportesSeed';
import { isoDia } from './ventas';

const activo = (x: string) => x !== 'Todos';
const enRango = (ms: number, desde: string, hasta: string) => (!desde || isoDia(ms) >= desde) && (!hasta || isoDia(ms) <= hasta);
const quitaTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/** Las ventas sembradas escriben "Río" y Ajustes "Rio": se comparan sin tildes. */
export const mismaSucursal = (a: string, b: string) => quitaTildes(a) === quitaTildes(b);

// ─── Cotizaciones ────────────────────────────────────────────────────────────

export interface FiltrosCotizaciones { estado: string; cliente: string; vendedor: string; usuario: string; sucursal: string; codigo: string; desde: string; hasta: string }

export function filasCotizaciones(cots: Cotizacion[], f: FiltrosCotizaciones): Cotizacion[] {
  const q = f.codigo.trim().toLowerCase();
  return cots
    .filter(c =>
      enRango(c.fecha, f.desde, f.hasta) && (!activo(f.estado) || c.estado === f.estado) && (!activo(f.cliente) || c.cliente === f.cliente) &&
      (!activo(f.vendedor) || c.vendedor === f.vendedor) && (!activo(f.usuario) || c.usuario === f.usuario) &&
      (!activo(f.sucursal) || mismaSucursal(c.sucursal, f.sucursal)) && (!q || c.codigo.toLowerCase().includes(q)))
    .sort((a, b) => a.fecha - b.fecha);
}

export function resumenCotizaciones(filas: Cotizacion[]) {
  return filas.filter(c => c.estado !== 'Anulada').reduce(
    (r, c) => ({ descuento: r.descuento + c.descuento, subtotal: r.subtotal + c.subtotal, total: r.total + c.total }),
    { descuento: 0, subtotal: 0, total: 0 },
  );
}

// ─── Notas crédito y débito ──────────────────────────────────────────────────

export interface FiltrosNotas { estadoDian: string; cliente: string; vendedor: string; usuario: string; sucursal: string; codigo: string; desde: string; hasta: string }

export function filasNotas(notas: NotaElectronica[], tipo: 'credito' | 'debito', f: FiltrosNotas): NotaElectronica[] {
  const q = f.codigo.trim().toLowerCase();
  return notas
    .filter(n =>
      n.tipo === tipo && enRango(n.fecha, f.desde, f.hasta) && (!activo(f.estadoDian) || n.estadoDian === f.estadoDian) &&
      (!activo(f.cliente) || n.cliente === f.cliente) && (!activo(f.vendedor) || n.vendedor === f.vendedor) && (!activo(f.usuario) || n.usuario === f.usuario) &&
      (!activo(f.sucursal) || mismaSucursal(n.sucursal, f.sucursal)) && (!q || n.numero.toLowerCase().includes(q) || n.factura.toLowerCase().includes(q)))
    .sort((a, b) => a.fecha - b.fecha);
}

// ─── Ingresos y Egresos ──────────────────────────────────────────────────────

export interface FiltrosIngresosEgresos { cliente: string; metodo: string; estado: string; tipoPago: 'Todos' | 'Recibos' | 'Gastos'; usuario: string; desde: string; hasta: string }

export interface FilaIngresoEgreso {
  id: string; numero: string; fecha: number; contacto: string; descripcion: string; metodo: string; categoria: string;
  entrada: number; salida: number; totalAnulado: number; estado: 'Activo' | 'Anulado';
}

/** Recibos = entradas (ingresos); gastos = salidas (egresos). Un anulado muestra su valor en "Total Anulado". */
export function filasIngresosEgresos(recibos: Recibo[], gastos: Gasto[], f: FiltrosIngresosEgresos): FilaIngresoEgreso[] {
  const filas: FilaIngresoEgreso[] = [];
  if (f.tipoPago !== 'Gastos') {
    recibos.forEach(r => filas.push({
      id: r.id, numero: r.numero, fecha: r.fecha, contacto: r.cliente, descripcion: `Abono a ${r.documento}`, metodo: r.metodo, categoria: r.documento,
      entrada: r.anulado ? 0 : r.total, salida: 0, totalAnulado: r.anulado ? r.total : 0, estado: r.anulado ? 'Anulado' : 'Activo',
    }));
  }
  if (f.tipoPago !== 'Recibos') {
    gastos.forEach(g => filas.push({
      id: g.id, numero: g.numero, fecha: g.fecha, contacto: g.proveedor, descripcion: g.descripcion, metodo: g.metodo, categoria: g.categoria,
      entrada: 0, salida: g.anulado ? 0 : g.total, totalAnulado: g.anulado ? g.total : 0, estado: g.anulado ? 'Anulado' : 'Activo',
    }));
  }
  const usuarioDe = new Map<string, string>([...recibos.map(r => [r.id, r.usuario] as const), ...gastos.map(g => [g.id, g.usuario] as const)]);
  return filas
    .filter(x =>
      enRango(x.fecha, f.desde, f.hasta) && (!activo(f.cliente) || x.contacto === f.cliente) && (!activo(f.metodo) || x.metodo === f.metodo) &&
      (!activo(f.estado) || x.estado === f.estado) && (!activo(f.usuario) || usuarioDe.get(x.id) === f.usuario))
    .sort((a, b) => a.fecha - b.fecha);
}

export function resumenIngresosEgresos(filas: FilaIngresoEgreso[]) {
  const ingresos = filas.reduce((s, x) => s + x.entrada, 0);
  const egresos = filas.reduce((s, x) => s + x.salida, 0);
  return { ingresos, egresos, saldo: ingresos - egresos, anulados: filas.reduce((s, x) => s + x.totalAnulado, 0) };
}

// ─── Cierre de Caja ──────────────────────────────────────────────────────────

export interface FiltrosCierre { usuario: string; sucursal: string; detallado: boolean; desde: string; hasta: string }

export interface PagoCierre { metodo: string; monto: number }

export interface FilaVentaCierre {
  id: string; documento: string; fecha: number; cliente: string; pagos: PagoCierre[]; usuario: string; total: number; anulada: boolean;
  /** "2 × Camiseta Básica, 1 × Gorra" — solo se muestra en el reporte detallado. */
  detalle: string;
}

export interface RangoDocumentos { cantidad: number; inicial: string; final: string }
export type TotalesPorMetodo = [string, number][];

export interface CierreCajaReporte {
  ventas: FilaVentaCierre[];
  rangoComprobantes: RangoDocumentos;
  rangoFacturas: RangoDocumentos;
  totalVentas: number;
  porMetodoVentas: TotalesPorMetodo;
  recibos: Recibo[];
  totalRecibos: number;
  porMetodoRecibos: TotalesPorMetodo;
  totalGeneral: number;
  porMetodoGeneral: TotalesPorMetodo;
}

const sumarMetodos = (...grupos: TotalesPorMetodo[]): TotalesPorMetodo => {
  const m = new Map<string, number>();
  grupos.flat().forEach(([k, v]) => m.set(k, (m.get(k) ?? 0) + v));
  return [...m.entries()];
};

const rango = (docs: Venta[]): RangoDocumentos => {
  const ordenados = [...docs].sort((a, b) => a.emitidaEn - b.emitidaEn);
  return { cantidad: ordenados.length, inicial: ordenados[0]?.numero ?? '--', final: ordenados[ordenados.length - 1]?.numero ?? '--' };
};

const fechaIso = (ms: number) => {
  const d = new Date(ms);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
export const fmtFechaCierre = fechaIso;

export function cierreCaja(ventas: Venta[], recibos: Recibo[], f: FiltrosCierre): CierreCajaReporte {
  const docs = ventas.filter(v =>
    (v.tipoDoc === 'comprobante' || v.tipoDoc === 'factura') && v.estado !== 'abierta' && enRango(v.emitidaEn, f.desde, f.hasta) &&
    (!activo(f.usuario) || v.emitidoPor === f.usuario) && (!activo(f.sucursal) || mismaSucursal(v.sucursal, f.sucursal)));
  // Comprobantes primero, luego facturas, cada grupo por fecha (como el real).
  const ordenadas = [...docs.filter(v => v.tipoDoc === 'comprobante').sort((a, b) => a.emitidaEn - b.emitidaEn),
    ...docs.filter(v => v.tipoDoc === 'factura').sort((a, b) => a.emitidaEn - b.emitidaEn)];
  const vigentes = ordenadas.filter(v => v.estado !== 'cancelada');

  const filasVentas: FilaVentaCierre[] = ordenadas.map(v => ({
    id: v.id, documento: `${v.tipoDoc === 'factura' ? 'Factura de Venta' : 'Comprobante'} ${v.numero}`, fecha: v.emitidaEn, cliente: v.cliente,
    pagos: [...v.pagos.map(p => ({ metodo: p.method, monto: p.amount })), ...(v.saldo > 0 ? [{ metodo: 'Crédito', monto: v.saldo }] : [])],
    usuario: v.emitidoPor, total: v.estado === 'cancelada' ? 0 : v.total, anulada: v.estado === 'cancelada',
    detalle: v.items.map(i => `${i.quantity} × ${i.name}`).join(', '),
  }));

  const porMetodoVentas = sumarMetodos(...vigentes.map(v => [
    ...v.pagos.map(p => [p.method, p.amount] as [string, number]), ...(v.saldo > 0 ? [['Crédito', v.saldo] as [string, number]] : []),
  ]));

  const recs = recibos.filter(r =>
    !r.anulado && enRango(r.fecha, f.desde, f.hasta) && (!activo(f.usuario) || r.usuario === f.usuario) && (!activo(f.sucursal) || mismaSucursal(r.sucursal, f.sucursal)));
  const porMetodoRecibos = sumarMetodos(...recs.map(r => [[r.metodo, r.total] as [string, number]]));
  const totalVentas = vigentes.reduce((s, v) => s + v.total, 0);
  const totalRecibos = recs.reduce((s, r) => s + r.total, 0);

  return {
    ventas: filasVentas, rangoComprobantes: rango(docs.filter(v => v.tipoDoc === 'comprobante')), rangoFacturas: rango(docs.filter(v => v.tipoDoc === 'factura')),
    totalVentas, porMetodoVentas, recibos: recs, totalRecibos, porMetodoRecibos, totalGeneral: totalVentas + totalRecibos,
    porMetodoGeneral: sumarMetodos(porMetodoVentas, porMetodoRecibos),
  };
}

// ─── Cierre de Caja Gerencial ────────────────────────────────────────────────

export interface FiltrosGerencial { usuario: string; sucursal: string; desde: string; hasta: string }

export interface FilaGerencial { sucursal: string; ventas: number; costos: number; utilidad: number }

export interface CierreGerencialReporte {
  filas: FilaGerencial[];
  totales: FilaGerencial;
  rangosComprobantes: { sucursal: string; rango: RangoDocumentos }[];
  rangosFacturas: { sucursal: string; rango: RangoDocumentos }[];
}

/**
 * Una fila por sucursal (las de Ajustes más las que aparezcan en las ventas). Ventas = comprobantes + facturas con IVA;
 * utilidad bruta = ventas sin IVA − costos. `costoDe` calcula el costo de un grupo de ventas (misma regla que "Ganancias por ítems").
 */
export function cierreGerencial(ventas: Venta[], sucursalesAjustes: string[], f: FiltrosGerencial, costoDe: (v: Venta[]) => number): CierreGerencialReporte {
  const docs = ventas.filter(v =>
    (v.tipoDoc === 'comprobante' || v.tipoDoc === 'factura') && v.estado !== 'abierta' && enRango(v.emitidaEn, f.desde, f.hasta) && (!activo(f.usuario) || v.emitidoPor === f.usuario));
  const nombres = [...sucursalesAjustes];
  docs.forEach(v => { if (!nombres.some(n => mismaSucursal(n, v.sucursal))) nombres.push(v.sucursal); });
  const visibles = nombres.filter(n => !activo(f.sucursal) || mismaSucursal(n, f.sucursal));

  const filas: FilaGerencial[] = visibles.map(sucursal => {
    const vigentes = docs.filter(v => v.estado !== 'cancelada' && mismaSucursal(v.sucursal, sucursal));
    const ventasTotal = vigentes.reduce((s, v) => s + v.total, 0);
    const costos = costoDe(vigentes);
    return { sucursal, ventas: ventasTotal, costos, utilidad: vigentes.reduce((s, v) => s + v.subtotal, 0) - costos };
  });
  const totales: FilaGerencial = { sucursal: 'Totales', ventas: filas.reduce((s, x) => s + x.ventas, 0), costos: filas.reduce((s, x) => s + x.costos, 0), utilidad: filas.reduce((s, x) => s + x.utilidad, 0) };
  const rangos = (tipo: 'comprobante' | 'factura') => visibles.map(sucursal => ({ sucursal, rango: rango(docs.filter(v => v.tipoDoc === tipo && mismaSucursal(v.sucursal, sucursal))) }));
  return { filas, totales, rangosComprobantes: rangos('comprobante'), rangosFacturas: rangos('factura') };
}
