/**
 * retail/itemsSeed.ts — Catálogo inicial de Items de la vertical Retail.
 * Mismo patrón que data/itemsSeed.ts (Restaurantes): siembra desde el catálogo POS
 * (RETAIL_ALL_PRODUCTS) más combos de ejemplo. Todo inventariable, sin INC, con
 * SKU en "Referencia". Determinista (sin Math.random).
 */
import { RETAIL_ALL_PRODUCTS } from './productCatalog';
import type { Item, ItemSucursal } from '../../types/item';
import { getImpuesto } from '../itemsCatalogs';

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
    costo: 0,
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
    costo: 0,
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

function buildSucursales(productId: number): ItemSucursal[] {
  const forced = NEGATIVE_STOCK[productId];
  return [
    { sucursalId: 'principal', existencia: forced?.sucursalId === 'principal' ? forced.existencia : productId % 40 },
    { sucursalId: 'secundaria', existencia: forced?.sucursalId === 'secundaria' ? forced.existencia : productId % 15 },
  ];
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
      sucursales: buildSucursales(p.id),
      activo: !INACTIVE_IDS.has(p.id),
      imagen: p.image,
      esCombo: false,
      creadoEn: now - (RETAIL_ALL_PRODUCTS.length - index) * 3_600_000,
      actualizadoEn: now - (RETAIL_ALL_PRODUCTS.length - index) * 3_600_000,
    };
  });

  return [...combos, ...simples];
}
