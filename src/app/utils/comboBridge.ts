/**
 * comboBridge.ts — el puente entre el módulo de gestión de ítems (Item,
 * itemsStore) y el catálogo que efectivamente venden Mostrador y Mesas
 * (CatalogProduct, productCatalog.ts). Deliberadamente acotado a ítems
 * marcados como combo — no es una unificación general de los dos catálogos
 * (ver specs/2026-09-combos.md §5.3).
 */
import type { Item } from '../types/item';
import type { CatalogProduct } from '../data/productCatalog';
import { ALL_CATALOG_PRODUCTS } from '../data/productCatalog';

/** Snapshot de un componente ya resuelto a nombre — lo que se denormaliza en una línea de orden. */
export interface ComboComponentSnapshot {
  productId: number;
  name: string;
  /** Por UNIDAD de combo — multiplicar por la cantidad de la línea al renderizar. */
  quantity: number;
}

/** CatalogProduct + el snapshot de componentes ya resuelto, listo para vender. */
export interface SellableCombo extends CatalogProduct {
  comboComponents: ComboComponentSnapshot[];
}

/** "1× Ceviche de Corvina Real · 1× Salmón Escocés · 1× Limonada de Lavanda" */
export function autoDescribeComponents(item: Item): string {
  return (item.componentes ?? [])
    .map(c => {
      const p = ALL_CATALOG_PRODUCTS.find(x => x.id === c.productId);
      return `${c.cantidad}× ${p?.name ?? 'Producto no encontrado'}`;
    })
    .join(' · ');
}

/** Resuelve los componentes de un combo a su snapshot de nombre (por unidad de combo). */
export function resolveComboComponents(item: Item): ComboComponentSnapshot[] {
  return (item.componentes ?? []).map(c => {
    const p = ALL_CATALOG_PRODUCTS.find(x => x.id === c.productId);
    return { productId: c.productId, name: p?.name ?? 'Producto no encontrado', quantity: c.cantidad };
  });
}

/** Un Item combo → CatalogProduct vendible. catId se fuerza a 'combos' (spec §5.5). */
export function comboItemToCatalogProduct(item: Item): SellableCombo {
  return {
    id: item.comboSaleId!,
    name: item.nombre,
    price: item.precioTotal,
    description: item.descripcion || autoDescribeComponents(item),
    catId: 'combos',
    image: item.imagen,
    comboComponents: resolveComboComponents(item),
  };
}

/** Ítems combo activos y con comboSaleId asignado — los únicos vendibles. */
export function selectSellableCombos(items: Item[]): Item[] {
  return items.filter(i => i.esCombo && i.activo && i.comboSaleId !== undefined);
}

/** Lista lista para fusionar con ALL_CATALOG_PRODUCTS / CAT_PRODUCTS. */
export function sellableComboProducts(items: Item[]): SellableCombo[] {
  return selectSellableCombos(items).map(comboItemToCatalogProduct);
}
