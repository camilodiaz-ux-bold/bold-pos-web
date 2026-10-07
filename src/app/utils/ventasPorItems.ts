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

export interface AccLinea extends VentasItemsFila {
  esCombo: boolean;
  ultimaEn: number;
  ultimoNombre: string;
  productId?: number;
}

export interface VentasItemsCtx {
  allProducts: CatalogProduct[];
  catDefs: CatDef[];
  items: Item[];
}

/** Acumula las líneas de las ventas por clave de agrupación (§5.3), sin resolver código/nombre/categoría. */
export function acumularLineas(ventas: Venta[]): AccLinea[] {
  const acc = new Map<string, AccLinea>();

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

  return Array.from(acc.values());
}

/** Resuelve código, nombre, categoría y tipo de una fila acumulada, junto con el Item del que salen (si existe). */
export function resolverFila(
  a: AccLinea,
  ctx: VentasItemsCtx,
): { codigo: string; nombre: string; categoria: string; tipo: 'Ítem' | 'Combo'; item?: Item } {
  const catNombre = (id?: string) => ctx.catDefs.find(c => c.id === id)?.name ?? '-';
  const comboItem = a.productId !== undefined ? ctx.items.find(i => i.comboSaleId === a.productId) : undefined;
  const esCombo = a.esCombo || !!comboItem;

  let codigo = '-', nombre = a.ultimoNombre, categoria = '-';
  let item: Item | undefined = comboItem;
  if (comboItem) {
    codigo = comboItem.codigo;
    nombre = comboItem.nombre;
    categoria = catNombre(comboItem.categoriaId);
  } else if (a.productId !== undefined) {
    const prod = ctx.allProducts.find(p => p.id === a.productId);
    item = ctx.items.find(i => i.id === `seed-${a.productId}` || i.catalogProductId === a.productId);
    if (item) codigo = item.codigo;
    if (prod) { nombre = prod.name; categoria = catNombre(prod.catId); }
  }

  return { codigo, nombre, categoria, tipo: esCombo ? 'Combo' : 'Ítem', item };
}

export function agregarVentasPorItems(ventas: Venta[], ctx: VentasItemsCtx): VentasItemsFila[] {
  return acumularLineas(ventas).map(a => {
    const r = resolverFila(a, ctx);
    return {
      key: a.key, codigo: r.codigo, producto: r.nombre, tipo: r.tipo, categoria: r.categoria,
      cantidad: a.cantidad, subtotal: a.subtotal, total: a.total,
    };
  });
}
