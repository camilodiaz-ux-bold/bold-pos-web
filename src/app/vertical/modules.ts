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

/** Módulos exclusivos de una vertical. Todo lo que no esté aquí es core. */
const EXCLUSIVE_MODULES = {
  // Solo Restaurantes
  mesas: ['restaurantes'],
  'reportes-restaurantes': ['restaurantes'],
  propinas: ['restaurantes'],
  // Solo Retail
  variantes: ['retail'],
} as const satisfies Record<string, readonly Vertical[]>;

export type ExclusiveModuleId = keyof typeof EXCLUSIVE_MODULES;

export function verticalHasModule(vertical: Vertical, moduleId: string): boolean {
  const allowed = (EXCLUSIVE_MODULES as Record<string, readonly Vertical[]>)[moduleId];
  return allowed ? allowed.includes(vertical) : true;
}
