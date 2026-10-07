/**
 * ventasPorItems.ts — agregación del reporte "Ventas por ítems"
 * (specs/2026-10-reporte-ventas-items.md). Función pura, sin hooks.
 */
import type { Venta } from '../types/venta';
import type { SaleItem } from './invoice';
import type { Item } from '../types/item';
import type { CatalogProduct, CatDef } from '../data/productCatalog';

export interface VentasItemsFila {
  key: string;
  codigo: string;          // '-' si no se resuelve
  producto: string;
  tipo: 'Ítem' | 'Combo';
  categoria: string;       // '-' si no se resuelve
  cantidad: number;
  subtotal: number;
  total: number;           // subtotal + IVA, sin propina
}

/** P1: comprobantes y facturas ya emitidas (pagadas o a crédito). */
export function ventaIncluida(v: Venta): boolean {
  return (v.tipoDoc === 'comprobante' || v.tipoDoc === 'factura')
    && (v.estado === 'pagada' || v.estado === 'no-pagada');
}

/** Clave de agrupación de una línea (§5.3). */
export function lineKey(si: SaleItem): string {
  if (si.productId !== undefined) return String(si.productId);
  if (/^\d+$/.test(si.id) && Number(si.id) > 0) return si.id;
  return `name:${si.name}`;
}

/** Subtotal de línea: misma fórmula del checkout. */
export function subtotalLinea(si: SaleItem): number {
  return Math.round(si.price * (1 - (si.discount ?? 0) / 100)) * si.quantity;
}

/** '$ 486,000' — decimales solo si el valor no es entero. */
export function fmtReporte(n: number): string {
  const entero = Number.isInteger(n);
  return `$ ${n.toLocaleString('en-US', entero ? {} : { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface Acc extends VentasItemsFila {
  esCombo: boolean;
  ultimaEn: number;
  ultimoNombre: string;
  productId?: number;
}

export function agregarVentasPorItems(
  ventas: Venta[],
  ctx: { allProducts: CatalogProduct[]; catDefs: CatDef[]; items: Item[] },
): VentasItemsFila[] {
  const acc = new Map<string, Acc>();

  for (const v of ventas) {
    for (const si of v.items) {
      const key = lineKey(si);
      let a = acc.get(key);
      if (!a) {
        a = {
          key, codigo: '-', producto: si.name, tipo: 'Ítem', categoria: '-',
          cantidad: 0, subtotal: 0, total: 0,
          esCombo: false, ultimaEn: -Infinity, ultimoNombre: si.name,
          productId: si.productId ?? (/^\d+$/.test(si.id) && Number(si.id) > 0 ? Number(si.id) : undefined),
        };
        acc.set(key, a);
      }
      const sub = subtotalLinea(si);
      a.cantidad += si.quantity;
      a.subtotal += sub;
      a.total += Math.round(sub * (1 + v.taxRate));
      if (si.isCombo || (si.comboComponents?.length ?? 0) > 0) a.esCombo = true;
      if (v.emitidaEn >= a.ultimaEn) { a.ultimaEn = v.emitidaEn; a.ultimoNombre = si.name; }
    }
  }

  const catNombre = (id?: string) => ctx.catDefs.find(c => c.id === id)?.name ?? '-';

  return Array.from(acc.values()).map(a => {
    const comboItem = a.productId !== undefined ? ctx.items.find(i => i.comboSaleId === a.productId) : undefined;
    if (comboItem) a.esCombo = true;

    let codigo = '-', producto = a.ultimoNombre, categoria = '-';
    if (comboItem) {
      codigo = comboItem.codigo;
      producto = comboItem.nombre;
      categoria = catNombre(comboItem.categoriaId);
    } else if (a.productId !== undefined) {
      const prod = ctx.allProducts.find(p => p.id === a.productId);
      const item = ctx.items.find(i => i.id === `seed-${a.productId}` || i.catalogProductId === a.productId);
      if (item) codigo = item.codigo;
      if (prod) { producto = prod.name; categoria = catNombre(prod.catId); }
    }

    return {
      key: a.key, codigo, producto, tipo: a.esCombo ? 'Combo' : 'Ítem', categoria,
      cantidad: a.cantidad, subtotal: a.subtotal, total: a.total,
    } as VentasItemsFila;
  });
}
