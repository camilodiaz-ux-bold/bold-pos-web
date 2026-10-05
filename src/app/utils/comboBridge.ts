/**
 * comboBridge.ts — el puente entre el módulo de gestión de ítems (Item,
 * itemsStore) y el catálogo que efectivamente venden Mostrador y Mesas
 * (CatalogProduct, productCatalog.ts). Deliberadamente acotado a ítems
 * marcados como combo — no es una unificación general de los dos catálogos
 * (ver specs/2026-09-combos.md §5.3).
 */
import type { Item, ItemComboComponente } from '../types/item';
import type { CatalogProduct } from '../data/productCatalog';
import { findCatalogProduct, findCatalogVariant } from '../data/verticalCatalog';

/** Snapshot de un componente ya resuelto a nombre — lo que se denormaliza en una línea de orden. */
export interface ComboComponentSnapshot {
  productId: number;
  variantId?: string;
  name: string;
  /** Por UNIDAD de combo — multiplicar por la cantidad de la línea al renderizar. */
  quantity: number;
}

/** CatalogProduct + el snapshot de componentes ya resuelto, listo para vender. */
export interface SellableCombo extends CatalogProduct {
  comboComponents: ComboComponentSnapshot[];
}

/**
 * Desglose de una línea de orden que es combo: cada componente con su cantidad
 * total (por unidad de combo × cantidad de la línea). Vacío si no es combo.
 */
export function comboBreakdown(
  item: { quantity: number; comboComponents?: ComboComponentSnapshot[] },
): { name: string; qty: number }[] {
  return (item.comboComponents ?? []).map(c => ({ name: c.name, qty: c.quantity * item.quantity }));
}

/** Nombre de un componente: "Camiseta Básica Algodón — Azul / S" si lleva variante. */
function componentName(c: ItemComboComponente): string {
  const p = findCatalogProduct(c.productId);
  if (!p) return 'Producto no encontrado';
  const v = c.variantId ? findCatalogVariant(c.productId, c.variantId) : undefined;
  return v ? `${p.name} — ${v.label}` : p.name;
}

/** "1× Ceviche de Corvina Real · 1× Salmón Escocés · 1× Limonada de Lavanda" */
export function autoDescribeComponents(item: Item): string {
  return (item.componentes ?? [])
    .map(c => `${c.cantidad}× ${componentName(c)}`)
    .join(' · ');
}

/** Resuelve los componentes de un combo a su snapshot de nombre (por unidad de combo). */
export function resolveComboComponents(item: Item): ComboComponentSnapshot[] {
  return (item.componentes ?? []).map(c => ({
    productId: c.productId,
    variantId: c.variantId,
    name: componentName(c),
    quantity: c.cantidad,
  }));
}

/**
 * Un Item combo → CatalogProduct vendible. catId = la categoría administrativa
 * del ítem (Item.categoriaId) — NO se fuerza a 'combos'. Un combo aparece en
 * Mostrador/Mesas bajo la misma categoría que el admin le asignó en /items;
 * "Combos" sigue existiendo como categoría de venta legítima si el admin
 * explícitamente eligió esa categoría para el combo (ver
 * specs/2026-09-combos-categoria-venta.md, supersede spec §5.5).
 */
export function comboItemToCatalogProduct(item: Item): SellableCombo {
  return {
    id: item.comboSaleId!,
    name: item.nombre,
    price: item.precioTotal,
    description: item.descripcion || autoDescribeComponents(item),
    catId: item.categoriaId,
    image: item.imagen,
    comboComponents: resolveComboComponents(item),
  };
}

/** Type guard: identifica un producto vendible que es un combo, sin importar su catId. */
export function isSellableCombo(p: CatalogProduct): p is SellableCombo {
  return Array.isArray((p as Partial<SellableCombo>).comboComponents);
}

/** Ítems combo activos y con comboSaleId asignado — los únicos vendibles. */
export function selectSellableCombos(items: Item[]): Item[] {
  return items.filter(i => i.esCombo && i.activo && i.comboSaleId !== undefined);
}

/** Lista lista para fusionar con ALL_CATALOG_PRODUCTS / CAT_PRODUCTS. */
export function sellableComboProducts(items: Item[]): SellableCombo[] {
  return selectSellableCombos(items).map(comboItemToCatalogProduct);
}
