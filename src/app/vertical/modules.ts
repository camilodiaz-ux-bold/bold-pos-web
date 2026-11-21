/**
 * Registro de módulos por vertical
 * ─────────────────────────────────────────────────────────────────────────────
 * Única fuente de verdad de qué módulo existe en cada vertical de Bold POS.
 * El menú, el guard de rutas y las vistas compartidas consultan `has(moduleId)`
 * (ver verticalStore.tsx) en vez de repartir `if (retail)` por el código.
 *
 * Un módulo sin entrada aquí se considera core (ambas verticales).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Vertical = 'retail' | 'restaurantes';

export const VERTICALS: Vertical[] = ['retail', 'restaurantes'];

export const VERTICAL_LABEL: Record<Vertical, string> = {
  retail: 'Retail',
  restaurantes: 'Restaurantes',
};

/**
 * Módulos exclusivos de una vertical. Todo lo que no esté aquí es core.
 * Devoluciones, Comprobantes y Facturas de venta son core desde specs/2026-11-devoluciones-v3.md (existen en Restaurantes).
 */
const EXCLUSIVE_MODULES = {
  // Solo Restaurantes
  mesas: ['restaurantes'],
  'reportes-restaurantes': ['restaurantes'],
  propinas: ['restaurantes'],
  ventas: ['restaurantes'],
  mostrador: ['restaurantes'],
  // Solo Retail
  variantes: ['retail'],
  'listas-precios': ['retail'],
  cotizaciones: ['retail'],
  ajustes: ['retail'],
  'reportes-retail': ['retail'],
} as const satisfies Record<string, readonly Vertical[]>;

export type ExclusiveModuleId = keyof typeof EXCLUSIVE_MODULES;

export function verticalHasModule(vertical: Vertical, moduleId: string): boolean {
  const allowed = (EXCLUSIVE_MODULES as Record<string, readonly Vertical[]>)[moduleId];
  return allowed ? allowed.includes(vertical) : true;
}

/**
 * Módulo al que pertenece una ruta (specs/2026-11-menu-lateral-y-selector-vertical.md §4), o null si es core.
 * Al cambiar de vertical decide si el usuario se queda en la pantalla o va al Inicio.
 * `/reportes/restaurantes/:id` devuelve null: su guard ya redirige los reportes exclusivos de Restaurantes.
 */
export function moduloDeRuta(pathname: string): string | null {
  const reglas: [string, string][] = [
    ['/ventas', 'ventas'],
    ['/comprobantes', 'comprobantes'],
    ['/facturas-venta', 'facturas-venta'],
    ['/ajustes', 'ajustes'],
    ['/items/variantes', 'variantes'],
    ['/items/devoluciones', 'devoluciones'],
    ['/notas-credito', 'devoluciones'],
    ['/reportes/retail/devoluciones', 'devoluciones'],
    ['/reportes/restaurantes/devoluciones', 'devoluciones'],
    ['/reportes/retail', 'reportes-retail'],
  ];
  return reglas.find(([prefijo]) => pathname === prefijo || pathname.startsWith(prefijo + '/'))?.[1] ?? null;
}
