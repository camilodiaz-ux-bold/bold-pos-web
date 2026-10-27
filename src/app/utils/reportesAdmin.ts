/**
 * reportesAdmin.ts — cálculo de los reportes administrativos de Retail (specs/2026-10-reportes-retail.md §5.3):
 * Lista de Ítems, Inventarios, Lista de Contactos y Cuentas por Cobrar.
 * Funciones puras sobre itemsStore, contactosStore y ventasStore.
 */
import type { Contacto } from '../types/contacto';
import type { Item } from '../types/item';
import type { ProductVariants } from '../data/retail/productVariants';
import type { Venta } from '../types/venta';
import { SUCURSALES } from '../data/itemsCatalogs';
import { getExistenciaTotal } from '../types/item';
import { fmtDocumento } from './contactos';
import { isoDia } from './ventas';

const activo = (x: string) => x !== 'Todos';

// ─── Lista de Ítems e Inventarios ────────────────────────────────────────────

export type TipoItemReporte = 'Inventariable' | 'No inventariable' | 'Combo';

export interface FilaItem {
  key: string; codigo: string; nombre: string; variante: string; descripcion: string; referencia: string;
  tipo: TipoItemReporte; categoria: string;
  /** null = no maneja existencias. */
  cantidad: number | null; costo: number; precio: number;
}

export interface FiltrosReporteItemsAdmin { tipo: string; categoria: string; estado: string; sucursal: string; sinExistencias: boolean }

const tipoItem = (i: Item): TipoItemReporte => (i.esCombo ? 'Combo' : i.manejaExistencias ? 'Inventariable' : 'No inventariable');

/**
 * Una fila por ítem; en Retail, un ítem con variantes se abre en una fila por variante (con su código, costo,
 * precio y existencia). Con filtro de sucursal, los ítems sin variantes muestran solo la existencia de esa
 * sucursal; las variantes no guardan existencia por sucursal y conservan la suma.
 */
export function filasItems(
  items: Item[], categoriaDe: (id: string) => string, variantesDe: Record<number, ProductVariants>, f: FiltrosReporteItemsAdmin,
): FilaItem[] {
  const sucursalId = activo(f.sucursal) ? SUCURSALES.find(s => s.label === f.sucursal)?.id : undefined;
  const filas: FilaItem[] = [];
  items
    .filter(i => (!activo(f.estado) || i.activo === (f.estado === 'Activo')) && (!activo(f.tipo) || tipoItem(i) === f.tipo) &&
      (!activo(f.categoria) || categoriaDe(i.categoriaId) === f.categoria))
    .forEach(i => {
      const variantes = i.catalogProductId !== undefined ? variantesDe[i.catalogProductId]?.variantes : undefined;
      const base = {
        nombre: i.nombre, descripcion: i.descripcion, referencia: i.referencia, tipo: tipoItem(i), categoria: categoriaDe(i.categoriaId),
      };
      if (variantes?.length) {
        variantes.forEach(v => filas.push({ ...base, key: `${i.id}-${v.id}`, codigo: v.codigo, variante: v.label, cantidad: v.existencia, costo: v.costo, precio: v.price }));
        return;
      }
      let cantidad = getExistenciaTotal(i);
      if (sucursalId) {
        const en = i.sucursales.find(s => s.sucursalId === sucursalId);
        if (!en) return;
        cantidad = i.manejaExistencias ? en.existencia : null;
      }
      filas.push({ ...base, key: i.id, codigo: i.codigo, variante: '-', cantidad, costo: i.costo, precio: i.precioTotal });
    });
  return filas;
}

export interface FilaInventario extends FilaItem { costoInventario: number; ventaInventario: number }

/** Solo ítems con existencias. `sinExistencias` (marcado por defecto) incluye los que están en 0 o negativo. */
export function filasInventario(filas: FilaItem[], f: Pick<FiltrosReporteItemsAdmin, 'sinExistencias'>): FilaInventario[] {
  return filas
    .filter(r => r.cantidad !== null && r.tipo !== 'Combo' && (f.sinExistencias || r.cantidad > 0))
    .map(r => ({ ...r, costoInventario: r.costo * (r.cantidad ?? 0), ventaInventario: r.precio * (r.cantidad ?? 0) }));
}

// ─── Lista de Contactos ──────────────────────────────────────────────────────

export interface FiltrosReporteContactos { tipo: string; estado: string }

export interface FilaContacto {
  id: string; creacion: string; documento: string; nombre: string; tipo: string; correo: string; celular: string; direccion: string; estado: string;
}

/** Los contactos creados en el prototipo llevan la hora en su id (`ctc-<epoch>`); los sembrados no traen fecha. */
export function fechaCreacionContacto(c: Contacto): string {
  const n = Number(c.id.replace(/\D/g, ''));
  return n >= 1_000_000_000_000 ? isoDia(n).split('-').reverse().join('/') : '—';
}

export function filasContactos(contactos: Contacto[], f: FiltrosReporteContactos): FilaContacto[] {
  return contactos
    .filter(c =>
      (!activo(f.tipo) || (f.tipo === 'Cliente' ? c.esCliente : c.esProveedor)) &&
      (!activo(f.estado) || c.activo === (f.estado === 'Activo')))
    .map(c => ({
      id: c.id, creacion: fechaCreacionContacto(c), documento: c.numeroDocumento ? fmtDocumento(c.numeroDocumento) : '—', nombre: c.nombre,
      tipo: c.esCliente && c.esProveedor ? 'Cliente / Proveedor' : c.esCliente ? 'Cliente' : 'Proveedor',
      correo: c.correo || '—', celular: c.celular || '—', direccion: c.direccion || '—', estado: c.activo ? 'Activo' : 'Inactivo',
    }));
}

// ─── Cuentas por Cobrar ──────────────────────────────────────────────────────

export interface FiltrosReporteCxC { sucursal: string; cliente: string; detallado: boolean; desde: string; hasta: string }

export interface FilaCuentaPorCobrar {
  key: string; nombre: string; documento: string; emision: number | null; vencimiento: number | null;
  creditoTotal: number; saldoPendiente: number; saldoVencido: number;
}

/**
 * Documentos de venta con saldo (crédito o pago parcial) no anulados. Saldo vencido = el que ya pasó su fecha de
 * vencimiento respecto de `ahora`; pendiente = el que aún no vence. Detallado: una fila por documento; si no, por cliente.
 */
export function cuentasPorCobrar(ventas: Venta[], f: FiltrosReporteCxC, ahora: number): FilaCuentaPorCobrar[] {
  const docs = ventas.filter(v =>
    v.estado !== 'abierta' && v.estado !== 'cancelada' && (v.formaPago === 'Crédito' || v.saldo > 0) &&
    (!f.desde || isoDia(v.emitidaEn) >= f.desde) && (!f.hasta || isoDia(v.emitidaEn) <= f.hasta) &&
    (!activo(f.sucursal) || v.sucursal === f.sucursal) && (!activo(f.cliente) || v.cliente === f.cliente));
  const fila = (v: Venta) => ({
    creditoTotal: v.total, saldoPendiente: v.vencimiento >= ahora ? v.saldo : 0, saldoVencido: v.vencimiento < ahora ? v.saldo : 0,
  });
  if (f.detallado) {
    return docs.sort((a, b) => a.emitidaEn - b.emitidaEn)
      .map(v => ({ key: v.id, nombre: v.cliente, documento: v.numero, emision: v.emitidaEn, vencimiento: v.vencimiento, ...fila(v) }));
  }
  const porCliente = new Map<string, FilaCuentaPorCobrar>();
  docs.forEach(v => {
    const act = porCliente.get(v.cliente) ?? { key: v.cliente, nombre: v.cliente, documento: '', emision: null, vencimiento: null, creditoTotal: 0, saldoPendiente: 0, saldoVencido: 0 };
    const d = fila(v);
    act.creditoTotal += d.creditoTotal; act.saldoPendiente += d.saldoPendiente; act.saldoVencido += d.saldoVencido;
    porCliente.set(v.cliente, act);
  });
  return [...porCliente.values()].sort((a, b) => b.creditoTotal - a.creditoTotal);
}
