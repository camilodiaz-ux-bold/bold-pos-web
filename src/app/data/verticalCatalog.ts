/**
 * verticalCatalog.ts — Catálogo (categorías, productos POS, favoritos, unidades,
 * impuestos y seed de Items) según la vertical. Restaurantes sigue viviendo en
 * productCatalog.ts / itemsSeed.ts / itemsCatalogs.ts; Retail en data/retail/.
 * Los componentes lo consumen con useCatalog() (vertical/useCatalog.ts).
 */
import type { Vertical } from '../vertical/modules';
import type { Item } from '../types/item';
import { CAT_DEFS, CAT_PRODUCTS, ALL_CATALOG_PRODUCTS, FAVORITE_IDS } from './productCatalog';
import type { CatDef, CatalogProduct } from './productCatalog';
import { UNIDADES, IMPUESTOS } from './itemsCatalogs';
import type { UnidadDef, ImpuestoDef } from './itemsCatalogs';
import { buildSeedItems } from './itemsSeed';
import { RETAIL_CAT_DEFS, RETAIL_CAT_PRODUCTS, RETAIL_ALL_PRODUCTS, RETAIL_FAVORITE_IDS } from './retail/productCatalog';
import { buildRetailSeedItems } from './retail/itemsSeed';

export interface VerticalCatalog {
  catDefs: CatDef[];
  catProducts: Record<string, CatalogProduct[]>;
  allProducts: CatalogProduct[];
  favoriteIds: Set<number>;
  unidades: UnidadDef[];
  impuestos: ImpuestoDef[];
  /** Clave de localStorage del store de Items — separada por vertical. */
  itemsStorageKey: string;
  buildSeedItems: (now?: number) => Item[];
}

const CATALOGS: Record<Vertical, VerticalCatalog> = {
  restaurantes: {
    catDefs: CAT_DEFS,
    catProducts: CAT_PRODUCTS,
    allProducts: ALL_CATALOG_PRODUCTS,
    favoriteIds: FAVORITE_IDS,
    unidades: UNIDADES,
    impuestos: IMPUESTOS,
    // Conserva la clave histórica para no perder los ítems ya guardados.
    itemsStorageKey: 'bold-pos:items:v2',
    buildSeedItems,
  },
  retail: {
    catDefs: RETAIL_CAT_DEFS,
    catProducts: RETAIL_CAT_PRODUCTS,
    allProducts: RETAIL_ALL_PRODUCTS,
    favoriteIds: RETAIL_FAVORITE_IDS,
    // Retail no vende por porciones/botellas ni usa INC.
    unidades: UNIDADES.filter(u => u.id !== 'porciones' && u.id !== 'botellas'),
    impuestos: IMPUESTOS.filter(i => i.id !== 'inc-8'),
    itemsStorageKey: 'bold-pos:items:retail:v1',
    buildSeedItems: buildRetailSeedItems,
  },
};

export function getVerticalCatalog(vertical: Vertical): VerticalCatalog {
  return CATALOGS[vertical];
}

/**
 * Busca un producto POS por id en los catálogos de todas las verticales.
 * Los ids no colisionan (Restaurantes 101-184, Retail 201+), así que las
 * utilidades sin acceso a hooks (comboBridge) no necesitan saber la vertical.
 */
export function findCatalogProduct(productId: number): CatalogProduct | undefined {
  return ALL_CATALOG_PRODUCTS.find(p => p.id === productId)
    ?? RETAIL_ALL_PRODUCTS.find(p => p.id === productId);
}
