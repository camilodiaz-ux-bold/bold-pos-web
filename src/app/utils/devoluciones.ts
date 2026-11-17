/**
 * devoluciones.ts — Lógica pura de Devoluciones (specs/2026-11-devoluciones.md).
 */
import type { AjustesState, UsuarioAjustes } from '../types/ajustes';
import type { Devolucion } from '../types/devolucion';
import { PERMISO_DEVOLUCIONES_ID } from '../data/permisosCatalogo';

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
