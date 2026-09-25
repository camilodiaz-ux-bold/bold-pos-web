/**
 * item.ts — Modelo de dominio del módulo ITEMS → Lista de ítems.
 *
 * Un Item representa un producto vendible en el catálogo del comercio
 * (equivalente a "Item" en el POS real: pos.stg.bold.co/#/restaurant/inventory/item).
 *
 * Nota: este módulo es independiente del catálogo que consumen Mostrador y Mesas
 * (src/app/data/productCatalog.ts). El seed inicial se construye a partir de ahí,
 * pero a partir de ese momento cada uno vive en su propio store — crear/editar un
 * Item aquí no afecta lo que se vende en Mostrador/Mesas.
 */

export type UnidadId = 'unidades' | 'kg' | 'g' | 'litros' | 'ml' | 'porciones' | 'botellas';
export type ImpuestoId = 'exento' | 'iva-5' | 'inc-8' | 'iva-19';
export type SucursalId = 'principal' | 'secundaria';

export interface ItemSucursal {
  sucursalId: SucursalId;
  /** Puede ser negativa (el POS real permite existencias negativas, ej. -7). */
  existencia: number;
}

export interface Item {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  referencia: string;
  /** → CAT_DEFS[].id de productCatalog.ts, o una categoría creada por el usuario. */
  categoriaId: string;
  unidadId: UnidadId;
  impuestoId: ImpuestoId;
  /** Precio sin impuesto. */
  precioBase: number;
  /** Precio con impuesto — es el que se muestra en la tabla del listado. */
  precioTotal: number;
  costo: number;
  /** El toggle "Ítem con existencias (Unidades)" del formulario. */
  manejaExistencias: boolean;
  /** Solo las sucursales marcadas por el usuario. */
  sucursales: ItemSucursal[];
  activo: boolean;
  imagen?: string;
  creadoEn: number;
  actualizadoEn: number;
}

export type ItemDraft = Omit<Item, 'id' | 'creadoEn' | 'actualizadoEn'>;

/** Etiqueta derivada de la columna "Tipo" — no es un campo persistido. */
export function getTipoLabel(item: Pick<Item, 'manejaExistencias'>): 'Inventariable' | 'No inventariable' {
  return item.manejaExistencias ? 'Inventariable' : 'No inventariable';
}

/** Suma de existencias entre sucursales — null si el ítem no maneja existencias. */
export function getExistenciaTotal(item: Pick<Item, 'manejaExistencias' | 'sucursales'>): number | null {
  if (!item.manejaExistencias) return null;
  return item.sucursales.reduce((acc, s) => acc + s.existencia, 0);
}
