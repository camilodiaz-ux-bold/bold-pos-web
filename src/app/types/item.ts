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
  /** Alertas de Stock (specs/2026-10-alertas-stock.md): umbral de "stock bajo" de esta sucursal. Sin definir = sin umbral. */
  stockBajo?: number;
  /** Alerta activa. Solo tiene sentido con `stockBajo` definido. Default false. */
  alerta?: boolean;
}

/**
 * Tipo de variante del catálogo "Variantes de inventario" (solo Retail) — ej. "Color": Azul / Negro.
 * specs/2026-10-variantes-modelo.md §1.
 */
export interface VarianteTipo {
  id: string;
  nombre: string;
  opciones: string[];
  activo: boolean;
}

/** Un tipo elegido por el ítem (Variante 1 / Variante 2) y las opciones que usa. */
export interface ItemTipoVariante {
  tipoId: string;
  opcionesActivas: string[];
}

/** Una variante del ítem: una opción por tipo, con precio, código, costo, estado y existencia por sucursal propios. */
export interface ItemVariante {
  /** Estable — los combos referencian `{ productId, variantId }` con este id. */
  id: string;
  /** Una opción por tipo, en el orden de `Item.tiposVariante` — ej. ['Azul', 'S']. */
  opciones: string[];
  codigo: string;
  /** Sin impuesto. */
  precioBase: number;
  /** Con el impuesto del ítem (`Item.impuestoId`, "Impuesto para todas las variantes"). */
  precioTotal: number;
  costo: number;
  activo: boolean;
  sucursales: ItemSucursal[];
}

/** Un producto del catálogo de venta (ALL_CATALOG_PRODUCTS) que compone un combo. */
export interface ItemComboComponente {
  /** id de un producto en ALL_CATALOG_PRODUCTS (src/app/data/productCatalog.ts). Ausente si el componente es un Item creado por el usuario (`itemId`). */
  productId?: number;
  /** Item creado por el usuario en /items (no sembrado desde el catálogo) usado como componente. */
  itemId?: string;
  /** Solo Retail: id de la variante elegida (ids estables, ver Item.variantes). Ausente = producto entero. */
  variantId?: string;
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
  /** Id del producto del catálogo POS del que se sembró (Retail) — enlaza con el producto del catálogo del que se sembró. */
  catalogProductId?: number;
  /** Solo Retail, nunca en combos: hasta 2 tipos de variante (Variante 1, Variante 2) con sus opciones activas. */
  tiposVariante?: ItemTipoVariante[];
  /** Toggle "Mismo precio en todas las variantes". */
  mismoPrecioVariantes?: boolean;
  /** Presente cuando el ítem tiene variantes; la existencia del padre se deriva de ellas (getExistenciaTotal). */
  variantes?: ItemVariante[];
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

/** Etiqueta derivada de la columna "Tipo de Item" — no es un campo persistido. */
export function getTipoLabel(item: Pick<Item, 'manejaExistencias' | 'esCombo'>): 'Inventariables' | 'No Inventariables' | 'Combos' {
  if (item.esCombo) return 'Combos';
  return item.manejaExistencias ? 'Inventariables' : 'No Inventariables';
}

/** "Azul / S" */
export function getVarianteLabel(v: Pick<ItemVariante, 'opciones'>): string {
  return v.opciones.join(' / ');
}

/** Variantes del ítem, o undefined si no tiene (la lista vacía cuenta como sin variantes). */
export function getVariantes(item: Pick<Item, 'variantes'>): ItemVariante[] | undefined {
  return item.variantes?.length ? item.variantes : undefined;
}

/** Existencia de una variante: la de una sucursal si se pide, o la suma de todas. */
export function getExistenciaVariante(v: Pick<ItemVariante, 'sucursales'>, sucursalId?: string): number {
  return v.sucursales.reduce((acc, s) => (!sucursalId || s.sucursalId === sucursalId ? acc + s.existencia : acc), 0);
}

/**
 * Suma de existencias entre sucursales — null si el ítem no maneja existencias.
 * Con variantes, es la suma de las variantes activas (la existencia del padre se deriva, no se guarda).
 */
export function getExistenciaTotal(item: Pick<Item, 'manejaExistencias' | 'sucursales' | 'variantes'>, sucursalId?: string): number | null {
  if (!item.manejaExistencias) return null;
  const variantes = getVariantes(item);
  if (variantes) return variantes.filter(v => v.activo).reduce((acc, v) => acc + getExistenciaVariante(v, sucursalId), 0);
  return item.sucursales.reduce((acc, s) => (!sucursalId || s.sucursalId === sucursalId ? acc + s.existencia : acc), 0);
}

/** ¿El ítem está disponible en la sucursal? Con variantes, si alguna de ellas lo está. */
export function itemEnSucursal(item: Pick<Item, 'sucursales' | 'variantes'>, sucursalId: string): boolean {
  const variantes = getVariantes(item);
  if (variantes) return variantes.some(v => v.sucursales.some(s => s.sucursalId === sucursalId));
  return item.sucursales.some(s => s.sucursalId === sucursalId);
}
