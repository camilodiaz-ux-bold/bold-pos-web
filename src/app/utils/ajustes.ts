/** Utilidades de Ajustes (specs/2026-10-ajustes.md). */
import type { AjustesState, Sucursal } from '../types/ajustes';
import { SUCURSAL_ACTUAL } from '../data/facturasCompraSeed';

/** Sucursal en la que opera el prototipo; si se borrara su nombre, la primera de la lista. */
export function sucursalPrincipal(a: AjustesState): Sucursal {
  return a.sucursales.find(s => s.nombre === SUCURSAL_ACTUAL) ?? a.sucursales[0];
}

/** Nombres de los métodos de pago habilitados, para los selectores de pago. */
export const metodosHabilitados = (a: AjustesState): string[] =>
  a.metodosPago.filter(m => m.habilitado).map(m => m.nombre);

/** Decimal con coma o punto → número; NaN si no es válido. */
export const aNumero = (v: string): number => Number(v.replace(',', '.'));

export const fmtTasa = (n: number): string => `${String(n).replace('.', ',')}%`;

/** Dígito de verificación de un NIT colombiano (algoritmo módulo 11 de la DIAN). */
export function calcularDV(nit: string): string {
  const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  const digitos = nit.replace(/\D/g, '').split('').reverse();
  const suma = digitos.reduce((s, d, i) => s + Number(d) * (pesos[i] ?? 0), 0);
  const r = suma % 11;
  return String(r > 1 ? 11 - r : r);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
