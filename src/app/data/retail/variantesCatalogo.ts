/**
 * retail/variantesCatalogo.ts — Semilla del catálogo de tipos de variante y de las variantes de los
 * ítems Retail (specs/2026-10-variantes-modelo.md §1). Las variantes salen de RETAIL_PRODUCT_VARIANTS
 * (que queda solo como fuente de la semilla) y ya traen existencia por sucursal. Determinista.
 */
import { RETAIL_PRODUCT_VARIANTS } from './productVariants';
import type { ItemSucursal, ItemTipoVariante, ItemVariante, VarianteTipo } from '../../types/item';

export const SEED_VARIANTE_TIPOS: VarianteTipo[] = [
  { id: 'color', nombre: 'Color', opciones: ['Azul', 'Negro', 'Gris', 'Blanco', 'Crema', 'Beige'], activo: true },
  { id: 'talla', nombre: 'Talla', opciones: ['S', 'M', 'L'], activo: true },
  { id: 'talla-pantalon', nombre: 'Talla de pantalón', opciones: ['30', '32', '34'], activo: true },
  { id: 'talla-calzado', nombre: 'Talla de calzado', opciones: ['38', '40', '42'], activo: true },
];

/** Tipo del catálogo que corresponde a cada tipo de `RETAIL_PRODUCT_VARIANTS`, en el orden de `tipos`. */
const TIPO_IDS_POR_PRODUCTO: Record<number, string[]> = {
  211: ['color', 'talla'],
  221: ['talla-pantalon'],
  233: ['color', 'talla'],
  241: ['talla-calzado', 'color'],
  251: ['color'],
};

/** Reparte la existencia única de la semilla vieja entre las dos sucursales (60 % / resto), sin perder unidades. */
function repartirExistencia(total: number): ItemSucursal[] {
  const principal = Math.round(total * 0.6);
  return [
    { sucursalId: 'principal', existencia: principal },
    { sucursalId: 'secundaria', existencia: total - principal },
  ];
}

export interface SeedVariantes {
  tiposVariante: ItemTipoVariante[];
  variantes: ItemVariante[];
}

export function buildSeedVariantes(productId: number, impuestoRate: number): SeedVariantes | undefined {
  const pv = RETAIL_PRODUCT_VARIANTS[productId];
  const tipoIds = TIPO_IDS_POR_PRODUCTO[productId];
  if (!pv || !tipoIds) return undefined;

  const variantes = pv.variantes.map((v): ItemVariante => ({
    id: v.id,
    opciones: v.opciones,
    codigo: v.codigo,
    precioBase: Math.round(v.price / (1 + impuestoRate)),
    precioTotal: v.price,
    costo: v.costo,
    activo: true,
    sucursales: repartirExistencia(v.existencia),
  }));

  return {
    tiposVariante: tipoIds.map((tipoId, i) => ({ tipoId, opcionesActivas: pv.tipos[i].opciones })),
    variantes,
  };
}
