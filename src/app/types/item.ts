/**
 * item.ts — Modelo de dominio del módulo ITEMS → Lista de ítems.
 *
 * Un Item representa un producto vendible en el catálogo del comercio
 * (equivalente a "Item" en el POS real: pos.stg.bold.co/#/restaurant/inventory/item).
 *
 * Nota: este módulo es independiente del catálogo que consumen Mostrador y Mesas
 * (src/app/data/productCatalog.ts). El seed inicial se construye a partir de ahí,
 * pero a partir de ese momento cada uno vive en su propio store — crear/editar un
 * Item aquí no afecta lo que se vende en Mostrador/Mesas, EXCEPTO para combos: ver
 * src/app/utils/comboBridge.ts, el puente acotado que hace vendibles los ítems con
 * esCombo === true (spec: specs/2026-09-combos.md).
 */

export type UnidadId = 'unidades' | 'kg' | 'g' | 'litros' | 'ml' | 'porciones' | 'botellas';
export type ImpuestoId = 'exento' | 'iva-5' | 'inc-8' | 'iva-19';
export type SucursalId = 'principal' | 'secundaria';

export interface ItemSucursal {
  sucursalId: SucursalId;
  /** Puede ser negativa (el POS real permite existencias negativas, ej. -7). */
  existencia: number;
}

/** Un producto del catálogo de venta (ALL_CATALOG_PRODUCTS) que compone un combo. */
export interface ItemComboComponente {
  /** id de un producto en ALL_CATALOG_PRODUCTS (src/app/data/productCatalog.ts). */
  productId: number;
  /** Entero ≥ 1, por unidad de combo. Sin unidades de medida (ver spec §3.1-#7). */
  cantidad: number;
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
  /** Marca este ítem como combo — ver comboBridge.ts. Default false. */
  esCombo: boolean;
  /** Presente cuando esCombo === true, mínimo 2 componentes distintos. */
  componentes?: ItemComboComponente[];
  /**
   * Id numérico de venta, solo para combos. Asignado por itemsStore (nunca por el
   * formulario), rango reservado ≥ 9000 — no colisiona con ALL_CATALOG_PRODUCTS
   * (101-184). Necesario porque TableItem/OrderItem.productId son number y
   * Item.id es string. Ver comboBridge.ts §5.4 del spec.
   */
  comboSaleId?: number;
  creadoEn: number;
  actualizadoEn: number;
}

// comboSaleId no lo decide quien llena el formulario — lo asigna itemsStore.createItem.
export type ItemDraft = Omit<Item, 'id' | 'creadoEn' | 'actualizadoEn' | 'comboSaleId'>;

/** Etiqueta derivada de la columna "Tipo" — no es un campo persistido. */
export function getTipoLabel(item: Pick<Item, 'manejaExistencias'>): 'Inventariable' | 'No inventariable' {
  return item.manejaExistencias ? 'Inventariable' : 'No inventariable';
}

/** Suma de existencias entre sucursales — null si el ítem no maneja existencias. */
export function getExistenciaTotal(item: Pick<Item, 'manejaExistencias' | 'sucursales'>): number | null {
  if (!item.manejaExistencias) return null;
  return item.sucursales.reduce((acc, s) => acc + s.existencia, 0);
}
