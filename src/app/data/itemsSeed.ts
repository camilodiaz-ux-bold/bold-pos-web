/**
 * itemsSeed.ts — Construye el catálogo inicial de Items sembrando desde
 * productCatalog.ts (ALL_CATALOG_PRODUCTS: 64 productos, 59 con imagen).
 *
 * El flujo es unidireccional y de una sola vez: esto solo alimenta el
 * localStorage de itemsStore la primera vez que se visita /items. A partir
 * de ahí, crear/editar/eliminar Items no afecta el catálogo que consumen
 * Mostrador ni Mesas (siguen leyendo CAT_PRODUCTS directamente).
 *
 * Todas las reglas son deterministas (sin Math.random) para que el seed
 * sea reproducible entre ejecuciones.
 */

import { ALL_CATALOG_PRODUCTS } from './productCatalog';
import type { Item, ImpuestoId, UnidadId, ItemSucursal } from '../types/item';
import { getImpuesto } from './itemsCatalogs';

// Categorías cuyos productos se manejan por existencias (embotellado/empacado).
const INVENTARIABLE_CATS = new Set(['bebidas', 'postres']);

// IDs de producto marcados inactivos en el seed, para que el filtro "Estado" tenga qué filtrar.
const INACTIVE_IDS = new Set([105, 133, 162]);

// IDs de producto con referencia explícita, para que la columna "Referencia" no quede siempre vacía.
const REFERENCIA_IDS = new Set([101, 121, 138, 151, 161]);

// Fuerza existencia negativa en un par de ítems, replicando el "-7" visto en el POS real.
const NEGATIVE_STOCK: Record<number, { sucursalId: 'principal' | 'secundaria'; existencia: number }> = {
  151: { sucursalId: 'principal', existencia: -7 },
  162: { sucursalId: 'secundaria', existencia: -3 },
};

function getImpuestoIdForCat(catId: string): ImpuestoId {
  return INVENTARIABLE_CATS.has(catId) ? 'iva-19' : 'inc-8';
}

function getUnidadIdForCat(catId: string): UnidadId {
  return catId === 'bebidas' ? 'botellas' : 'unidades';
}

function buildSucursales(productId: number, manejaExistencias: boolean): ItemSucursal[] {
  if (!manejaExistencias) return [];

  const forced = NEGATIVE_STOCK[productId];
  const principal = forced?.sucursalId === 'principal' ? forced.existencia : productId % 40;
  const secundaria = forced?.sucursalId === 'secundaria' ? forced.existencia : productId % 15;

  return [
    { sucursalId: 'principal', existencia: principal },
    { sucursalId: 'secundaria', existencia: secundaria },
  ];
}

export function buildSeedItems(now: number = Date.now()): Item[] {
  return ALL_CATALOG_PRODUCTS.map((p, index) => {
    const manejaExistencias = INVENTARIABLE_CATS.has(p.catId);
    const impuestoId = getImpuestoIdForCat(p.catId);
    const rate = getImpuesto(impuestoId)?.rate ?? 0;

    const precioTotal = p.price;
    const precioBase = Math.round(precioTotal / (1 + rate));
    const costo = Math.round(precioBase * 0.35);

    const item: Item = {
      id: `seed-${p.id}`,
      codigo: String(100001 + index),
      nombre: p.name,
      descripcion: p.description,
      referencia: REFERENCIA_IDS.has(p.id) ? `REF-${p.id}` : '',
      categoriaId: p.catId,
      unidadId: getUnidadIdForCat(p.catId),
      impuestoId,
      precioBase,
      precioTotal,
      costo,
      manejaExistencias,
      sucursales: buildSucursales(p.id, manejaExistencias),
      activo: !INACTIVE_IDS.has(p.id),
      imagen: p.image,
      creadoEn: now - (ALL_CATALOG_PRODUCTS.length - index) * 3_600_000,
      actualizadoEn: now - (ALL_CATALOG_PRODUCTS.length - index) * 3_600_000,
    };

    return item;
  });
}
