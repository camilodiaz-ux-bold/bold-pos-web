/**
 * itemsCatalogs.ts — Catálogos estáticos del módulo ITEMS (unidad, impuesto, sucursal).
 * Las categorías NO se duplican aquí: se toman de CAT_DEFS (productCatalog.ts),
 * que ya define las 9 categorías de restaurante con nombre y colores.
 */

import type { UnidadId, ImpuestoId, SucursalId } from '../types/item';

export interface UnidadDef {
  id: UnidadId;
  label: string;
}

export interface ImpuestoDef {
  id: ImpuestoId;
  label: string;
  rate: number;
}

export interface SucursalDef {
  id: SucursalId;
  label: string;
}

export const UNIDADES: UnidadDef[] = [
  { id: 'unidades', label: 'Unidades' },
  { id: 'kg', label: 'Kilogramos' },
  { id: 'g', label: 'Gramos' },
  { id: 'litros', label: 'Litros' },
  { id: 'ml', label: 'Mililitros' },
  { id: 'porciones', label: 'Porciones' },
  { id: 'botellas', label: 'Botellas' },
];

export const IMPUESTOS: ImpuestoDef[] = [
  { id: 'exento', label: 'Exento - 0.00%', rate: 0 },
  { id: 'iva-5', label: 'IVA - 5.00%', rate: 0.05 },
  { id: 'inc-8', label: 'INC - 8.00%', rate: 0.08 },
  { id: 'iva-19', label: 'IVA - 19.00%', rate: 0.19 },
];

export const SUCURSALES: SucursalDef[] = [
  { id: 'principal', label: 'Sucursal Principal' },
  { id: 'secundaria', label: 'Sucursal Secundaria' },
];

export function getUnidad(id: string): UnidadDef | undefined {
  return UNIDADES.find(u => u.id === id);
}

export function getImpuesto(id: string): ImpuestoDef | undefined {
  return IMPUESTOS.find(i => i.id === id);
}

export function getSucursal(id: string): SucursalDef | undefined {
  return SUCURSALES.find(s => s.id === id);
}
