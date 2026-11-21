/**
 * devoluciones.ts — Lógica pura de Devoluciones (specs/2026-11-devoluciones.md).
 */
import type { AjustesState, UsuarioAjustes } from '../types/ajustes';
import type { Devolucion, NotaPendiente } from '../types/devolucion';
import type { Venta } from '../types/venta';
import type { SaleItem } from './invoice';
import type { Item } from '../types/item';
import { getVariantes } from '../types/item';
import type { Contacto } from '../types/contacto';
import { IMPUESTOS, getImpuesto } from '../data/itemsCatalogs';
import { DOCUMENTO_CLIENTES_EJEMPLO } from '../data/retail/ventasSeed';

/** Usuario de la sesión del prototipo: el principal (Admin). */
export function usuarioSesion(a: AjustesState): UsuarioAjustes {
  return a.usuarios.find(u => u.principal) ?? a.usuarios[0];
}

/** Sucursales a las que el usuario de la sesión tiene acceso. */
export function sucursalesDelUsuario(a: AjustesState) {
  const ids = usuarioSesion(a)?.inventarioSucursalIds ?? [];
  return a.sucursales.filter(s => ids.includes(s.id));
}

/** Total de una devolución (suma de sus filas). */
export const totalDevolucion = (filas: Devolucion[]): number => filas.reduce((s, f) => s + f.valorDevolucion, 0);

/** Una devolución (filas con el mismo número) para la lista (specs/2026-11-devoluciones-v2.md §1). */
export interface DevolucionAgrupada { numero: string; filas: Devolucion[]; base: Devolucion; total: number }

/** Agrupa las filas por número de devolución, conservando el orden de entrada. */
export function agruparDevoluciones(filas: Devolucion[]): DevolucionAgrupada[] {
  const mapa = new Map<string, Devolucion[]>();
  filas.forEach(f => mapa.set(f.numero, [...(mapa.get(f.numero) ?? []), f]));
  return [...mapa.entries()].map(([numero, fs]) => ({ numero, filas: fs, base: fs[0], total: totalDevolucion(fs) }));
}

/** Texto de la columna Ítem: el nombre si la devolución tiene uno solo, "{n} ítems" si tiene varios. */
export const itemDeDevolucion = (g: Pick<DevolucionAgrupada, 'filas'>): string => (g.filas.length === 1 ? g.filas[0].nombre : `${g.filas.length} ítems`);

/** Cliente de una devolución como "Nombre · identificación" ("--" si no hay). */
export function clienteDeDevolucion(d: Pick<Devolucion, 'clienteNombre' | 'clienteDocumento'>): string {
  if (!d.clienteNombre) return '--';
  return d.clienteDocumento ? `${d.clienteNombre} · ${d.clienteDocumento}` : d.clienteNombre;
}

/** ¿La devolución coincide con la búsqueda por número, documento o identificación del cliente (parcial, sin puntos ni guiones)? */
export function coincideBusquedaDevolucion(d: Devolucion, consulta: string): boolean {
  const q = sinTildes(consulta.trim());
  if (!q) return true;
  if (sinTildes(d.numero).includes(q) || sinTildes(d.numeroDocumento ?? '').includes(q)) return true;
  const digitos = q.replace(/\D/g, '');
  return digitos.length > 0 && (d.clienteDocumento ?? '').replace(/\D/g, '').includes(digitos);
}

/** Ruta del ver del documento de origen, o null en Sin Documento. */
export function rutaDocumento(d: Pick<Devolucion, 'tipo' | 'ventaId'>): string | null {
  if (!d.ventaId) return null;
  return d.tipo === 'factura' ? `/facturas-venta/${d.ventaId}` : d.tipo === 'comprobante' ? `/comprobantes/${d.ventaId}` : null;
}

// ─── Registrar devolución (specs/2026-11-devoluciones.md §6) ─────────────────

export const MSG_ANULADO = 'Este documento está anulado. No es posible registrar una devolución.';
export const MSG_NOTA_CREDITO_TOTAL = 'Este documento ya tiene una nota crédito total. No es posible registrar una devolución.';
export const MSG_DIAN_PENDIENTE = 'Hay una devolución pendiente de aceptación de la DIAN.';
export const MSG_CREDITO_NO_PAGADO = 'Esta venta es a crédito y aún no se ha completado el pago. No es posible registrar una devolución.';
export const MSG_DESCUENTO = 'Este documento tiene descuento.';
export const MSG_TODOS_DEVUELTOS = 'Todos los ítems de este documento ya fueron devueltos.';

/** Motivos de la nota crédito (lista DIAN del POS real). */
export const MOTIVOS_NOTA_DIAN = [
  'Devolución parcial de los bienes y/o no aceptación parcial del servicio',
  'Anulación de factura electrónica',
  'Rebaja o descuento parcial o total',
  'Ajuste de precio',
  'Descuento comercial por pronto pago',
  'Descuento comercial por volumen de ventas',
] as const;
/** Motivo por defecto con alcance Parcial y motivo automático con alcance Total. */
export const MOTIVO_NOTA_PARCIAL = MOTIVOS_NOTA_DIAN[0];
export const MOTIVO_NOTA_TOTAL = MOTIVOS_NOTA_DIAN[1];

export interface EstadoDocumentoDevolucion {
  /** Anulado de origen o por una devolución total. */
  anulado: boolean;
  /** Nota crédito total (semilla o por una devolución total). */
  notaTotal: boolean;
  /** Hay una nota crédito esperando la aceptación de la DIAN. */
  pendiente: boolean;
  /** Ya tuvo alguna devolución (aunque haya sido parcial). */
  huboDevolucion: boolean;
  /** Ids de línea (`SaleItem.id`) ya devueltos. */
  itemsDevueltos: Set<string>;
  /** Todos los ítems del documento ya están devueltos. */
  todosDevueltos: boolean;
}

/** Estado de un documento frente a las devoluciones (todo se deriva: un solo modelo). */
export function estadoDocumentoDevolucion(v: Venta, filas: Devolucion[], pendientes: NotaPendiente[]): EstadoDocumentoDevolucion {
  const propias = filas.filter(f => f.ventaId === v.id);
  const total = propias.some(f => f.alcance === 'total');
  const itemsDevueltos = new Set(propias.map(f => f.itemId));
  return {
    anulado: v.estado === 'cancelada' || total,
    notaTotal: !!v.notaCreditoTotal || total,
    pendiente: pendientes.some(p => p.ventaId === v.id),
    huboDevolucion: propias.length > 0,
    itemsDevueltos,
    todosDevueltos: v.items.length > 0 && v.items.every(i => itemsDevueltos.has(i.id)),
  };
}

export interface ValidacionDocumento { bloqueos: string[]; avisos: string[] }

/** Bloqueos (no dejan confirmar) y avisos (solo informan) de un documento. La venta a crédito sin el pago completo bloquea (v3). */
export function validarDocumento(v: Venta, e: EstadoDocumentoDevolucion): ValidacionDocumento {
  const bloqueos: string[] = [];
  const avisos: string[] = [];
  if (e.anulado) bloqueos.push(MSG_ANULADO);
  else if (e.notaTotal) bloqueos.push(MSG_NOTA_CREDITO_TOTAL);
  if (e.pendiente) bloqueos.push(MSG_DIAN_PENDIENTE);
  if (e.todosDevueltos && bloqueos.length === 0) bloqueos.push(MSG_TODOS_DEVUELTOS);
  if (v.estado === 'no-pagada' || (v.formaPago === 'Crédito' && v.saldo > 0)) bloqueos.push(MSG_CREDITO_NO_PAGADO);
  if (v.discount > 0 || v.items.some(i => (i.discount ?? 0) > 0)) avisos.push(MSG_DESCUENTO);
  return { bloqueos, avisos };
}

/** Valor unitario final pagado por el cliente (con descuento de línea e impuesto). */
export const valorUnitarioPagado = (it: SaleItem, taxRate: number): number =>
  Math.round(it.price * (1 - (it.discount ?? 0) / 100) * (1 + taxRate));

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const mismaSucursal = (a: string, b: string) => sinTildes(a) === sinTildes(b);

/** Id de sucursal de los ítems (`principal`/`secundaria`) que corresponde a una sucursal de Ajustes. */
export const sucursalDeItems = (sucursalAjustesId: string): string => (sucursalAjustesId === 'suc-2' ? 'secundaria' : 'principal');

/** Ítem del catálogo propio que corresponde a una línea del documento (por el id del producto del catálogo). */
export const itemDeLinea = (items: Item[], linea: SaleItem): Item | undefined =>
  items.find(i => (i.catalogProductId !== undefined && String(i.catalogProductId) === linea.id) || i.id === `seed-${linea.id}`);

/** ¿El ítem maneja inventario en esa sucursal de ítems? Con variantes cuenta si alguna variante la tiene. */
export function manejaInventarioEn(item: Item | undefined, sucursalItemsId: string): boolean {
  if (!item || !item.manejaExistencias || item.esCombo) return false;
  const variantes = getVariantes(item);
  if (variantes) return variantes.some(v => v.activo && v.sucursales.some(s => s.sucursalId === sucursalItemsId));
  return item.sucursales.some(s => s.sucursalId === sucursalItemsId);
}

export const VALIDACION = {
  cantidad: 'La cantidad debe ser mayor a cero.',
  valor: 'El valor de devolución debe ser mayor a cero.',
  valorMayorVenta: 'El valor de devolución no puede ser mayor al valor de venta.',
  motivo: 'Selecciona un motivo.',
  metodo: 'Selecciona un método de pago.',
  justificacionVacia: 'Escribe una justificación.',
  justificacionLargo: 'La justificación debe tener entre 10 y 250 caracteres.',
};

/** Error de la justificación (null si es válida). */
export function errorJustificacion(texto: string): string | null {
  const t = texto.trim();
  if (!t) return VALIDACION.justificacionVacia;
  return t.length < 10 || t.length > 250 ? VALIDACION.justificacionLargo : null;
}

const soloDigitos = (s: string) => s.replace(/\D/g, '');

/** Identificación del cliente de una venta: contacto con ese nombre, cliente de ejemplo o NIT en el nombre. */
export function documentoDeCliente(v: Pick<Venta, 'cliente'>, contactos: Contacto[]): string {
  const nombre = sinTildes(v.cliente.trim());
  const contacto = contactos.find(c => c.numeroDocumento && sinTildes(c.nombre.trim()) === nombre);
  if (contacto) return contacto.numeroDocumento;
  if (DOCUMENTO_CLIENTES_EJEMPLO[v.cliente]) return DOCUMENTO_CLIENTES_EJEMPLO[v.cliente];
  const nit = v.cliente.match(/NIT:\s*([\d.\-]+)/i);
  return nit ? soloDigitos(nit[1]) : '';
}

/** ¿La venta coincide con la búsqueda por número de documento o por identificación del cliente (coincidencia parcial)? */
export function coincideBusquedaDocumento(v: Venta, consulta: string, contactos: Contacto[]): boolean {
  const q = sinTildes(consulta.trim());
  if (!q) return false;
  if (sinTildes(v.numero).includes(q)) return true;
  const digitos = soloDigitos(q);
  return digitos.length > 0 && soloDigitos(documentoDeCliente(v, contactos)).includes(digitos);
}

// ─── Impuestos (specs/2026-11-devoluciones.md §6) ─────────────────────────────

/** Id de impuesto del catálogo que corresponde a una tasa (0.19 → `iva-19`); `iva-19` si no hay coincidencia. */
export const impuestoPorTasa = (tasa: number): string => IMPUESTOS.find(i => Math.abs(i.rate - tasa) < 1e-6)?.id ?? 'iva-19';

/** Etiqueta de un impuesto en los totales: "IVA 19.00%", "INC 8.00%" o "IVA Excluido". */
export function etiquetaImpuesto(id: string): string {
  const imp = getImpuesto(id);
  if (!imp || imp.rate === 0) return 'IVA Excluido';
  return `${id.startsWith('inc') ? 'INC' : 'IVA'} ${(imp.rate * 100).toFixed(2)}%`;
}

/** El valor de devolución incluye el impuesto del ítem: se separa en base e impuesto. */
export function desglosarImpuesto(valor: number, tasa: number): { base: number; impuesto: number } {
  const base = Math.round(valor / (1 + tasa));
  return { base, impuesto: valor - base };
}

export interface LineaConImpuesto { impuestoId: string; tasa: number; valor: number }

/** Subtotal, impuestos agrupados por tipo y total de un conjunto de líneas. */
export function resumirImpuestos(lineas: LineaConImpuesto[]): { subtotal: number; total: number; impuestos: { id: string; etiqueta: string; monto: number }[] } {
  let subtotal = 0;
  let total = 0;
  const porId = new Map<string, number>();
  lineas.forEach(l => {
    const { base, impuesto } = desglosarImpuesto(l.valor, l.tasa);
    subtotal += base;
    total += l.valor;
    porId.set(l.impuestoId, (porId.get(l.impuestoId) ?? 0) + impuesto);
  });
  return { subtotal, total, impuestos: [...porId.entries()].map(([id, monto]) => ({ id, etiqueta: etiquetaImpuesto(id), monto })) };
}

// ─── Líneas del documento para la devolución (specs/2026-11-devoluciones-v2.md §3.A) ──────────────

/** Una línea del documento tal como se muestra en la vista de devolución. */
export interface LineaDevolucion {
  key: string;
  /** `SaleItem.id`: con él se detecta "Ya devuelto". */
  itemId: string;
  nombre: string;
  referencia: string;
  cantidadVendida: number;
  /** Precio de lista unitario y descuento de línea en % (informativos). */
  precio: number;
  descuento: number;
  impuestoId: string;
  tasa: number;
  /** Valor unitario pagado (descuentos prorrateados, con impuesto si el documento lo discrimina). */
  unitario: number;
  /** Valor de venta de la línea completa (lo pagado). Es el tope del valor a devolver. */
  valorVenta: number;
  /** ¿El ítem maneja inventario en la sucursal del documento? */
  maneja: boolean;
  /** Ítem del catálogo propio (para sumar existencia). */
  itemRefId?: string;
}

/**
 * Líneas de un documento. El valor de venta es lo pagado: precio con el descuento de línea, el descuento general
 * prorrateado (supuesto: `Venta.discount` es un monto sobre el subtotal) y, solo en Factura, el impuesto del ítem.
 */
export function lineasDeDocumento(v: Venta, items: Item[], sucursalItemsId: string, conImpuesto: boolean): LineaDevolucion[] {
  const factor = v.discount > 0 && v.subtotal > 0 ? Math.max(0, 1 - v.discount / v.subtotal) : 1;
  return v.items.map((it, idx) => {
    const propio = itemDeLinea(items, it);
    const imp = propio ? getImpuesto(propio.impuestoId) : undefined;
    const tasa = conImpuesto ? (imp?.rate ?? v.taxRate) : 0;
    const unitario = Math.round(valorUnitarioPagado(it, tasa) * factor);
    return {
      key: String(idx), itemId: it.id, nombre: it.name, referencia: propio?.referencia ?? '',
      cantidadVendida: it.quantity, precio: it.price, descuento: it.discount ?? 0,
      impuestoId: imp?.id ?? impuestoPorTasa(v.taxRate), tasa, unitario, valorVenta: unitario * it.quantity,
      maneja: manejaInventarioEn(propio, sucursalItemsId), ...(propio ? { itemRefId: propio.id } : {}),
    };
  });
}
