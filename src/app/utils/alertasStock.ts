/**
 * alertasStock.ts — lógica pura de Alertas de Stock (specs/2026-10-alertas-stock.md §1-§2 y 2026-10-alertas-stock-ajustes.md).
 * La lista y el modal derivan todo de `ItemSucursal.stockBajo/alerta` (en el ítem o en cada variante).
 */
import type { Item, ItemSucursal, ItemVariante } from '../types/item';
import { getVariantes } from '../types/item';

/** Qué se muestra de una "unidad" (ítem simple o variante) según el filtro de sucursal. */
export interface ResumenAlerta {
  /** Sucursales en alcance (todas las de la unidad, o solo la del filtro). */
  alcance: ItemSucursal[];
  existencia: number;
  /** Número, 'sin' si ninguna lo tiene, o 'varios' si las sucursales difieren. */
  stockBajo: number | 'sin' | 'varios';
  /** true / false, o 'mixto' si hay de las dos. */
  alerta: boolean | 'mixto';
  /** Alguna sucursal con alerta activa y existencia ≤ stock bajo. */
  disparada: boolean;
  /** Cuántas sucursales en alcance tienen la alerta disparada. */
  disparadas: number;
  /** Alguna sucursal con la alerta activa. */
  activa: boolean;
}

export function resumirAlerta(sucursales: ItemSucursal[], sucursalId?: string): ResumenAlerta {
  const alcance = sucursalId ? sucursales.filter(s => s.sucursalId === sucursalId) : sucursales;
  const existencia = alcance.reduce((a, s) => a + s.existencia, 0);
  const umbrales = new Set(alcance.map(s => s.stockBajo));
  let stockBajo: ResumenAlerta['stockBajo'];
  if (umbrales.size > 1) stockBajo = 'varios';
  else {
    const [u] = [...umbrales];
    stockBajo = u === undefined ? 'sin' : u;
  }
  const activas = alcance.filter(s => s.alerta);
  const disparadas = alcance.filter(s => s.alerta && s.stockBajo !== undefined && s.existencia <= s.stockBajo).length;
  const alerta: ResumenAlerta['alerta'] = activas.length === 0 ? false : activas.length === alcance.length ? true : 'mixto';
  return {
    alcance,
    existencia,
    stockBajo,
    alerta,
    disparada: disparadas > 0,
    disparadas,
    activa: activas.length > 0,
  };
}

/** Ítems que entran a la lista: inventariables, no combos y activos. */
export function esAlertable(item: Item): boolean {
  return !item.esCombo && item.manejaExistencias && item.activo;
}

/** Variantes activas del ítem que aplican al filtro de sucursal (tienen esa sucursal). */
export function variantesAlertables(item: Item, sucursalId?: string): ItemVariante[] {
  return (getVariantes(item) ?? []).filter(v => v.activo && (!sucursalId || v.sucursales.some(s => s.sucursalId === sucursalId)));
}

/** Unidades con valores propios de un ítem: sus variantes alertables, o el ítem mismo si no tiene. */
export function unidadesDe(item: Item, sucursalId?: string): ItemSucursal[][] {
  if (getVariantes(item)) return variantesAlertables(item, sucursalId).map(v => v.sucursales);
  return [item.sucursales];
}

/** 0 = alguna unidad con alerta disparada, 1 = con alerta activa, 2 = sin alertas activas. */
export function prioridadAlerta(item: Item, sucursalId?: string): 0 | 1 | 2 {
  const res = unidadesDe(item, sucursalId).map(u => resumirAlerta(u, sucursalId));
  if (res.some(r => r.disparada)) return 0;
  if (res.some(r => r.activa)) return 1;
  return 2;
}

/** Sucursales (ids, sin repetir) en las que alguna unidad del ítem está habilitada — el N de "Todas (N)" de un padre con variantes. */
export function sucursalesDeVariantes(variantes: ItemVariante[]): string[] {
  return [...new Set(variantes.flatMap(v => v.sucursales.map(s => s.sucursalId)))];
}

/** Una existencia negativa va siempre en rojo (además del rojo por alerta disparada). */
export const existenciaEnRojo = (existencia: number, disparada: boolean): boolean => existencia < 0 || disparada;
