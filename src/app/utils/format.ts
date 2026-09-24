/**
 * format.ts — Fuente única de formato de moneda para el módulo ITEMS.
 *
 * El resto del proyecto duplica formatCOP en 5 sitios con comportamientos
 * ligeramente distintos (Dashboard.tsx, MesasGridView.tsx, TurnosPage.tsx,
 * ReporteDetallePage.tsx, CheckoutDrawer.tsx). No se tocan esos duplicados
 * aquí — es un refactor aparte — pero todo el código nuevo de este módulo
 * usa estos helpers.
 */

/** '$112.000' — moneda colombiana con separador de miles y símbolo. */
export function formatCOP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CO');
}

/** '112000' → 112000. Acepta '$112.000', '112,000', '112000'. */
export function parseCOP(value: string): number {
  const cleaned = value.replace(/[^0-9-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Formatea una existencia (puede ser negativa) con separador de miles, sin símbolo. */
export function formatExistencia(value: number): string {
  return value.toLocaleString('es-CO');
}
