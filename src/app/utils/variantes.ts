/**
 * variantes.ts — Utilidades del modelo de variantes de ítem (specs/2026-10-variantes-modelo.md).
 * Funciones puras: el formulario las usa para derivar la tabla de variantes de los tipos elegidos.
 */
import type { ItemSucursal, ItemTipoVariante, ItemVariante, VarianteTipo } from '../types/item';

/** Clave estable de una combinación de opciones — sirve para conservar lo editado al regenerar la tabla. */
export const claveOpciones = (opciones: string[]): string => opciones.join('\u0001');

/** Producto cartesiano de las opciones activas de cada tipo, en el orden de los tipos. */
export function combinaciones(tipos: ItemTipoVariante[]): string[][] {
  if (tipos.length === 0) return [];
  return tipos.reduce<string[][]>(
    (acc, t) => acc.flatMap(c => t.opcionesActivas.map(o => [...c, o])),
    [[]],
  );
}

/** Valores con los que nace una variante nueva. */
export interface DefaultsVariante {
  precioBase: number;
  precioTotal: number;
  costo: number;
  sucursales: ItemSucursal[];
}

/** Código numérico de 8 dígitos que no está en `usados`. */
export function generarCodigoVariante(usados: Set<string>): string {
  let code: string;
  do {
    code = String(Math.floor(10_000_000 + Math.random() * 90_000_000));
  } while (usados.has(code));
  return code;
}

/**
 * Regenera la lista de variantes a partir de los tipos y opciones activas: conserva (con sus datos) las que
 * ya existían con la misma combinación y crea las que faltan con `defaults`. `reiniciar` descarta las
 * existentes (al cambiar de tipo, las opciones dejan de significar lo mismo).
 */
export function sincronizarVariantes(
  previas: ItemVariante[],
  tipos: ItemTipoVariante[],
  defaults: DefaultsVariante,
  reiniciar = false,
): ItemVariante[] {
  const porClave = new Map(previas.map(v => [claveOpciones(v.opciones), v]));
  const usados = new Set(previas.map(v => v.codigo));
  return combinaciones(tipos).map(opciones => {
    const existente = reiniciar ? undefined : porClave.get(claveOpciones(opciones));
    if (existente) return existente;
    const codigo = generarCodigoVariante(usados);
    usados.add(codigo);
    return {
      id: crypto.randomUUID(),
      opciones,
      codigo,
      precioBase: defaults.precioBase,
      precioTotal: defaults.precioTotal,
      costo: defaults.costo,
      activo: true,
      sucursales: defaults.sucursales.map(s => ({ ...s })),
    };
  });
}

/** Opciones de un tipo en el orden del catálogo (las que no estén en el catálogo, al final). */
export function ordenarOpciones(tipo: VarianteTipo | undefined, opciones: string[]): string[] {
  if (!tipo) return opciones;
  const orden = new Map(tipo.opciones.map((o, i) => [o, i]));
  return [...opciones].sort((a, b) => (orden.get(a) ?? 999) - (orden.get(b) ?? 999));
}
