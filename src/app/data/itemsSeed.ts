/**
 * itemsSeed.ts — Construye el catálogo inicial de Items sembrando desde
 * productCatalog.ts (ALL_CATALOG_PRODUCTS: 64 productos, 59 con imagen),
 * más 3 combos de ejemplo (SEED_COMBOS) que no tienen equivalente en
 * ALL_CATALOG_PRODUCTS — son ítems compuestos, ver specs/2026-09-combos.md.
 *
 * El flujo es unidireccional y de una sola vez: esto solo alimenta el
 * localStorage de itemsStore la primera vez que se visita la app. A partir
 * de ahí, crear/editar/eliminar Items no afecta el catálogo que consumen
 * Mostrador ni Mesas (siguen leyendo CAT_PRODUCTS directamente) — EXCEPTO
 * para combos, que sí se vuelven vendibles ahí vía comboBridge.ts.
 *
 * Todas las reglas son deterministas (sin Math.random) para que el seed
 * sea reproducible entre ejecuciones.
 */

import { ALL_CATALOG_PRODUCTS } from './productCatalog';
import type { Item, ImpuestoId, UnidadId, ItemSucursal } from '../types/item';
import { getImpuesto } from './itemsCatalogs';

// Combos de ejemplo (specs/2026-09-combos.md §10) — productos reales de
// ALL_CATALOG_PRODUCTS agrupados a precio fijo. id/codigo/comboSaleId fijos
// para que sean deterministas y reconocibles en localStorage.
const SEED_COMBOS: Array<Omit<Item, 'creadoEn' | 'actualizadoEn'>> = [
  {
    id: 'seed-combo-1',
    codigo: '900001',
    nombre: 'Combo Ejecutivo Mediodía',
    descripcion: '',
    referencia: '',
    categoriaId: 'entradas-frias',
    unidadId: 'unidades',
    impuestoId: 'iva-19',
    precioBase: 210084,
    precioTotal: 250000,
    costo: 0,
    manejaExistencias: false,
    sucursales: [],
    activo: true,
    esCombo: true,
    comboSaleId: 9001,
    componentes: [
      { productId: 103, cantidad: 1 }, // Ceviche de Corvina Real — $96.000
      { productId: 143, cantidad: 1 }, // Salmón Escocés — $152.000
      { productId: 161, cantidad: 1 }, // Limonada de Lavanda — $36.000
    ],
    // Suma individual: $284.000 → combo a $250.000 (ahorra $34.000)
  },
  {
    id: 'seed-combo-2',
    codigo: '900002',
    nombre: 'Combo Sushi para Compartir',
    descripcion: '',
    referencia: '',
    categoriaId: 'sushi',
    unidadId: 'unidades',
    impuestoId: 'iva-19',
    precioBase: 159664,
    precioTotal: 190000,
    costo: 0,
    manejaExistencias: false,
    sucursales: [],
    activo: true,
    esCombo: true,
    comboSaleId: 9002,
    componentes: [
      { productId: 171, cantidad: 2 }, // Nigiri de Salmón x2 — $96.000
      { productId: 172, cantidad: 1 }, // Roll Philadelphia — $56.000
      { productId: 173, cantidad: 1 }, // Sashimi de Atún — $64.000
    ],
    // Suma individual: $216.000 → combo a $190.000 (ahorra $26.000)
  },
  {
    id: 'seed-combo-3',
    codigo: '900003',
    nombre: 'Combo Café y Postre',
    descripcion: '',
    referencia: '',
    categoriaId: 'postres',
    unidadId: 'unidades',
    impuestoId: 'iva-19',
    precioBase: 71429,
    precioTotal: 85000,
    costo: 0,
    manejaExistencias: false,
    sucursales: [],
    activo: true,
    esCombo: true,
    comboSaleId: 9003,
    componentes: [
      { productId: 158, cantidad: 1 }, // Tiramisú de Autor — $60.000
      { productId: 165, cantidad: 1 }, // Ginger Beer Artesanal — $36.000
    ],
    // Suma individual: $96.000 → combo a $85.000 (ahorra $11.000)
  },
];

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
  // Los combos van primero: con 67 ítems y paginación de 25, quedan visibles
  // en la primera página del listado sin tener que buscar.
  const combos: Item[] = SEED_COMBOS.map((c, index) => ({
    ...c,
    creadoEn: now - (SEED_COMBOS.length - index) * 3_600_000,
    actualizadoEn: now - (SEED_COMBOS.length - index) * 3_600_000,
  }));

  const simples = ALL_CATALOG_PRODUCTS.map((p, index) => {
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
      esCombo: false,
      creadoEn: now - (ALL_CATALOG_PRODUCTS.length - index) * 3_600_000,
      actualizadoEn: now - (ALL_CATALOG_PRODUCTS.length - index) * 3_600_000,
    };

    return item;
  });

  return [...combos, ...simples];
}
