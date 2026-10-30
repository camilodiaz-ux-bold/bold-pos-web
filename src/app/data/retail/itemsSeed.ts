/**
 * retail/itemsSeed.ts — Catálogo inicial de Items de la vertical Retail.
 * Mismo patrón que data/itemsSeed.ts (Restaurantes): siembra desde el catálogo POS
 * (RETAIL_ALL_PRODUCTS) más combos de ejemplo. Todo inventariable, sin INC, con
 * SKU en "Referencia". Determinista (sin Math.random).
 */
import { RETAIL_ALL_PRODUCTS } from './productCatalog';
import type { Item, ItemSucursal } from '../../types/item';
import { getImpuesto } from '../itemsCatalogs';
import { buildSeedVariantes } from './variantesCatalogo';

const SEED_COMBOS: Array<Omit<Item, 'creadoEn' | 'actualizadoEn'>> = [
  {
    id: 'seed-retail-combo-1',
    codigo: '900001',
    nombre: 'Combo Outfit Casual',
    descripcion: '',
    referencia: 'KIT-OUTFIT',
    categoriaId: 'combos',
    unidadId: 'unidades',
    impuestoId: 'iva-19',
    precioBase: 193193,
    precioTotal: 229900,
    costo: 100000,
    manejaExistencias: false,
    sucursales: [],
    activo: true,
    esCombo: true,
    comboSaleId: 9001,
    componentes: [
      { productId: 211, variantId: '211-azul-s', cantidad: 1 }, // Camiseta Básica Algodón (Azul / S) — $45.900
      { productId: 221, variantId: '221-32', cantidad: 1 }, // Jean Slim Azul Oscuro (32) — $159.900
      { productId: 251, cantidad: 1 }, // Gorra Visera Curva — $49.900
    ],
    // Suma individual: $255.700 → combo a $229.900 (ahorra $25.800)
  },
  {
    id: 'seed-retail-combo-2',
    codigo: '900002',
    nombre: 'Kit Cuidado Personal',
    descripcion: '',
    referencia: 'KIT-CUIDADO',
    categoriaId: 'cuidado',
    unidadId: 'unidades',
    impuestoId: 'iva-19',
    precioBase: 201597,
    precioTotal: 239900,
    costo: 110000,
    manejaExistencias: false,
    sucursales: [],
    activo: true,
    esCombo: true,
    comboSaleId: 9002,
    componentes: [
      { productId: 261, cantidad: 1 }, // Perfume Cítrico 50 ml — $179.900
      { productId: 262, cantidad: 1 }, // Crema Hidratante 200 ml — $39.900
      { productId: 263, cantidad: 1 }, // Protector Solar FPS 50 — $49.900
    ],
    // Suma individual: $269.700 → kit a $239.900 (ahorra $29.800)
  },
];

// Productos inactivos en el seed, para que el filtro "Estado" tenga qué filtrar.
const INACTIVE_IDS = new Set([216, 235]);

// Existencia negativa forzada, replicando el caso visto en el POS real.
const NEGATIVE_STOCK: Record<number, { sucursalId: 'principal' | 'secundaria'; existencia: number }> = {
  222: { sucursalId: 'principal', existencia: -4 },
  244: { sucursalId: 'secundaria', existencia: -2 },
};

// Alertas de Stock sembradas (specs/2026-10-alertas-stock.md): umbral y alerta activa en ambas sucursales,
// para poder ver el resaltado y el orden "Por alerta". Existencias: principal = id % 40, secundaria = id % 15.
const SEED_ALERTAS: Record<number, number> = {
  222: 5, // principal -4 → disparada
  244: 5, // principal 4, secundaria -2 → disparada en las dos
  212: 3, // secundaria 2 → disparada
  214: 2, // principal 14, secundaria 4 → alerta activa sin disparar
};
// Variante con alerta propia: Jean Slim 34 (15 uds → 9 principal / 6 secundaria), umbral 10 → disparada.
const SEED_ALERTAS_VARIANTE: Record<string, number> = { '221-34': 10 };

const conAlerta = (sucursales: ItemSucursal[], stockBajo: number | undefined): ItemSucursal[] =>
  stockBajo === undefined ? sucursales : sucursales.map(s => ({ ...s, stockBajo, alerta: true }));

function buildSucursales(productId: number): ItemSucursal[] {
  const forced = NEGATIVE_STOCK[productId];
  return conAlerta([
    { sucursalId: 'principal', existencia: forced?.sucursalId === 'principal' ? forced.existencia : productId % 40 },
    { sucursalId: 'secundaria', existencia: forced?.sucursalId === 'secundaria' ? forced.existencia : productId % 15 },
  ], SEED_ALERTAS[productId]);
}

export function buildRetailSeedItems(now: number = Date.now()): Item[] {
  const combos: Item[] = SEED_COMBOS.map((c, index) => ({
    ...c,
    creadoEn: now - (SEED_COMBOS.length - index) * 3_600_000,
    actualizadoEn: now - (SEED_COMBOS.length - index) * 3_600_000,
  }));

  const simples = RETAIL_ALL_PRODUCTS.map((p, index): Item => {
    const rate = getImpuesto('iva-19')?.rate ?? 0;
    const precioBase = Math.round(p.price / (1 + rate));
    // Productos con variantes: el ítem las trae con existencia por sucursal (specs/2026-10-variantes-modelo.md).
    const seedVariantes = buildSeedVariantes(p.id, rate);
    return {
      id: `seed-retail-${p.id}`,
      codigo: String(200001 + index),
      nombre: p.name,
      descripcion: '',
      referencia: `SKU-${p.id}`,
      categoriaId: p.catId,
      unidadId: 'unidades',
      impuestoId: 'iva-19',
      precioBase,
      precioTotal: p.price,
      costo: Math.round(precioBase * 0.45),
      manejaExistencias: true,
      // Con variantes, la existencia vive en cada variante (Item.sucursales queda vacío).
      sucursales: seedVariantes ? [] : buildSucursales(p.id),
      ...(seedVariantes && {
        tiposVariante: seedVariantes.tiposVariante,
        mismoPrecioVariantes: false,
        variantes: seedVariantes.variantes.map(v => ({ ...v, sucursales: conAlerta(v.sucursales, SEED_ALERTAS_VARIANTE[v.id]) })),
      }),
      activo: !INACTIVE_IDS.has(p.id),
      imagen: p.image,
      catalogProductId: p.id,
      esCombo: false,
      creadoEn: now - (RETAIL_ALL_PRODUCTS.length - index) * 3_600_000,
      actualizadoEn: now - (RETAIL_ALL_PRODUCTS.length - index) * 3_600_000,
    };
  });

  return [...combos, ...simples];
}
