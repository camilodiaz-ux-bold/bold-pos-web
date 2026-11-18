/**
 * devoluciones.ts — Lógica pura de Devoluciones (specs/2026-11-devoluciones.md).
 */
import type { AjustesState, UsuarioAjustes } from '../types/ajustes';
import type { Devolucion } from '../types/devolucion';
import { PERMISO_DEVOLUCIONES_ID } from '../data/permisosCatalogo';
import type { Venta } from '../types/venta';
import type { SaleItem } from './invoice';
import type { Item } from '../types/item';
import { getVariantes } from '../types/item';
import type { Contacto } from '../types/contacto';
import { DOCUMENTO_CLIENTES_EJEMPLO } from '../data/retail/ventasSeed';

/** Usuario de la sesión del prototipo: el principal (Admin). */
export function usuarioSesion(a: AjustesState): UsuarioAjustes {
  return a.usuarios.find(u => u.principal) ?? a.usuarios[0];
}

/** "Gestionar Devoluciones" según el rol del usuario de la sesión (specs §4 y D5). */
export function puedeGestionarDevoluciones(a: AjustesState): boolean {
  const rol = a.roles.find(r => r.id === usuarioSesion(a)?.rolId);
  return !!rol?.permisos.includes(PERMISO_DEVOLUCIONES_ID);
}

/** Sucursales a las que el usuario de la sesión tiene acceso. */
export function sucursalesDelUsuario(a: AjustesState) {
  const ids = usuarioSesion(a)?.inventarioSucursalIds ?? [];
  return a.sucursales.filter(s => ids.includes(s.id));
}

/** Total de una devolución (suma de sus filas). */
export const totalDevolucion = (filas: Devolucion[]): number => filas.reduce((s, f) => s + f.valorDevolucion, 0);

/** Ruta del ver del documento de origen, o null en Sin Documento. */
export function rutaDocumento(d: Pick<Devolucion, 'tipo' | 'ventaId'>): string | null {
  if (!d.ventaId) return null;
  return d.tipo === 'factura' ? `/facturas-venta/${d.ventaId}` : d.tipo === 'comprobante' ? `/comprobantes/${d.ventaId}` : null;
}

// ─── Registrar devolución (specs/2026-11-devoluciones.md §6) ─────────────────

/** Efectivo disponible en caja: valor fijo de prototipo (D10). */
export const EFECTIVO_CAJA_EJEMPLO = 200_000;

export const MSG_ANULADO = 'Este documento está anulado. No es posible registrar una devolución.';
export const MSG_NOTA_CREDITO_TOTAL = 'Este documento ya tiene una nota crédito total. No es posible registrar una devolución.';
export const MSG_CREDITO_NO_PAGADO = 'Esta venta es a crédito y aún no ha sido pagada. No es posible registrar una devolución.';
export const MSG_VARIOS_MEDIOS = 'Esta venta se pagó con varios medios de pago.';
export const MSG_DESCUENTO = 'Este documento tiene descuento.';
export const MSG_PROPINA = 'Este documento tiene propina.';

export interface ValidacionDocumento { bloqueos: string[]; avisos: string[] }

/** Bloqueos (no permiten continuar) y avisos (solo informan) de un documento de venta. */
export function validarDocumento(v: Venta): ValidacionDocumento {
  const bloqueos: string[] = [];
  const avisos: string[] = [];
  if (v.estado === 'cancelada') bloqueos.push(MSG_ANULADO);
  if (v.notaCreditoTotal) bloqueos.push(MSG_NOTA_CREDITO_TOTAL);
  if (v.estado === 'no-pagada' || (v.formaPago === 'Crédito' && v.saldo > 0)) bloqueos.push(MSG_CREDITO_NO_PAGADO);
  if (v.pagos.length > 1) avisos.push(MSG_VARIOS_MEDIOS);
  if (v.discount > 0 || v.items.some(i => (i.discount ?? 0) > 0)) avisos.push(MSG_DESCUENTO);
  if (v.tip > 0) avisos.push(MSG_PROPINA);
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
  items.find(i => i.catalogProductId !== undefined && String(i.catalogProductId) === linea.id);

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
