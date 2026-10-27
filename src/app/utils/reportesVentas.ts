/**
 * reportesVentas.ts — cálculo de los reportes de ventas de Retail (specs/2026-10-reportes-retail.md §5.1 y §5.2):
 * Comprobantes, Comprobantes Mensuales, Comprobantes por Vendedor y Facturas de Venta.
 * Funciones puras sobre `ventasStore`; las ventas anuladas aparecen en las tablas pero no suman en los totales.
 */
import type { EstadoDian, EstadoVenta, TipoDocVenta, Venta } from '../types/venta';
import { dianLabel, estadoLabel, isoDia } from './ventas';

const ESTADO_UI: Record<string, EstadoVenta> = { Pagada: 'pagada', 'No pagada': 'no-pagada', Anulada: 'cancelada' };
const DIAN_UI: Record<string, EstadoDian> = { Aceptada: 'aceptada', Pendiente: 'pendiente' };

/** Retail no maneja ventas abiertas (solo existen en Mesas de Restaurantes). */
const esDocumento = (v: Venta, tipo: TipoDocVenta) => v.tipoDoc === tipo && v.estado !== 'abierta';
const cuenta = (v: Venta) => v.estado !== 'cancelada';
const activo = (x: string) => x !== 'Todos';

// ─── Comprobantes y Facturas de Venta ────────────────────────────────────────

export interface FiltrosReporteVentas {
  estado: string; estadoDian: string; cliente: string; vendedor: string; usuario: string; sucursal: string; codigo: string; desde: string; hasta: string;
}

export interface FilaVentaReporte {
  id: string; fecha: number; codigo: string; cliente: string; subtotal: number; descuento: number; total: number;
  /** "Pagada" · "No pagada" · "Anulada". */
  estado: string;
  /** Solo facturas. */
  estadoDian: string;
}

export function filasVentas(ventas: Venta[], tipo: TipoDocVenta, f: FiltrosReporteVentas): FilaVentaReporte[] {
  const q = f.codigo.trim().toLowerCase();
  return ventas
    .filter(v =>
      esDocumento(v, tipo) &&
      (!f.desde || isoDia(v.emitidaEn) >= f.desde) && (!f.hasta || isoDia(v.emitidaEn) <= f.hasta) &&
      (!activo(f.estado) || v.estado === ESTADO_UI[f.estado]) &&
      (tipo !== 'factura' || !activo(f.estadoDian) || v.dian === DIAN_UI[f.estadoDian]) &&
      (!activo(f.cliente) || v.cliente === f.cliente) &&
      (!activo(f.vendedor) || v.vendedor === f.vendedor) &&
      (!activo(f.usuario) || v.emitidoPor === f.usuario) &&
      (!activo(f.sucursal) || v.sucursal === f.sucursal) &&
      (!q || v.numero.toLowerCase().includes(q)))
    .sort((a, b) => a.emitidaEn - b.emitidaEn)
    .map(v => ({
      id: v.id, fecha: v.emitidaEn, codigo: v.numero, cliente: v.cliente, subtotal: v.subtotal, descuento: v.discount, total: v.total,
      estado: estadoLabel(v.estado, 'retail').label, estadoDian: dianLabel(v.dian, 'retail')?.label ?? '—',
    }));
}

export interface ResumenVentas { subtotal: number; descuento: number; total: number }

export function resumenVentas(filas: FilaVentaReporte[]): ResumenVentas {
  return filas.filter(f => f.estado !== 'Anulada').reduce<ResumenVentas>(
    (r, f) => ({ subtotal: r.subtotal + f.subtotal, descuento: r.descuento + f.descuento, total: r.total + f.total }),
    { subtotal: 0, descuento: 0, total: 0 },
  );
}

// ─── Comprobantes mensuales ──────────────────────────────────────────────────

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export interface FiltrosReporteMensual { anio: string; estado: string; cliente: string; vendedor: string; usuario: string; sucursal: string }

export interface FilaMes { mes: string; subtotal: number; descuento: number; total: number; saldo: number }

/** Años con comprobantes (más el de referencia), del más reciente al más antiguo. */
export function aniosConComprobantes(ventas: Venta[], referencia: number): string[] {
  const anios = new Set(ventas.filter(v => v.tipoDoc === 'comprobante').map(v => new Date(v.emitidaEn).getFullYear()));
  anios.add(referencia);
  return [...anios].sort((a, b) => b - a).map(String);
}

export function filasMensuales(ventas: Venta[], f: FiltrosReporteMensual): FilaMes[] {
  const filas: FilaMes[] = MESES.map(mes => ({ mes, subtotal: 0, descuento: 0, total: 0, saldo: 0 }));
  ventas
    .filter(v =>
      esDocumento(v, 'comprobante') && cuenta(v) && String(new Date(v.emitidaEn).getFullYear()) === f.anio &&
      (!activo(f.estado) || v.estado === ESTADO_UI[f.estado]) &&
      (!activo(f.cliente) || v.cliente === f.cliente) && (!activo(f.vendedor) || v.vendedor === f.vendedor) &&
      (!activo(f.usuario) || v.emitidoPor === f.usuario) && (!activo(f.sucursal) || v.sucursal === f.sucursal))
    .forEach(v => {
      const fila = filas[new Date(v.emitidaEn).getMonth()];
      fila.subtotal += v.subtotal; fila.descuento += v.discount; fila.total += v.total; fila.saldo += v.saldo;
    });
  return filas;
}

// ─── Comprobantes por vendedor ───────────────────────────────────────────────

export interface FilaVendedor { nombre: string; comprobantes: number; subtotal: number; total: number }

/**
 * Una fila por vendedor del catálogo de Ajustes (también los de 0 comprobantes) más los vendedores que
 * aparecen en las ventas pero no están en el catálogo (las ventas sembradas traen sus propios nombres).
 */
export function filasPorVendedor(ventas: Venta[], vendedoresAjustes: string[], desde: string, hasta: string): FilaVendedor[] {
  const filas = new Map<string, FilaVendedor>(vendedoresAjustes.map(n => [n, { nombre: n, comprobantes: 0, subtotal: 0, total: 0 }]));
  ventas
    .filter(v => esDocumento(v, 'comprobante') && cuenta(v) && (!desde || isoDia(v.emitidaEn) >= desde) && (!hasta || isoDia(v.emitidaEn) <= hasta))
    .forEach(v => {
      const fila = filas.get(v.vendedor) ?? { nombre: v.vendedor, comprobantes: 0, subtotal: 0, total: 0 };
      fila.comprobantes += 1; fila.subtotal += v.subtotal; fila.total += v.total;
      filas.set(v.vendedor, fila);
    });
  return [...filas.values()];
}
