/**
 * alertasCorreoEjemplo.ts — datos de muestra del "Ejemplo de correo" de Alertas de Stock
 * (specs/2026-10-alertas-stock-correo.md). NO se calculan del inventario real: son valores fijos que cubren los cuatro casos.
 * Los nombres de los ítems salen del catálogo de la vertical activa para que el ejemplo se vea creíble.
 */

/** Ítems en alerta que dice el asunto ("Tienes 34 ítems…"); se muestran hasta 10 y el resto va en "N ítems más". */
export const CORREO_TOTAL_ALERTAS = 34;
export const CORREO_MAX_FILAS = 10;

export type CasoAlerta = 'negativa' | 'agotado' | 'debajo' | 'minimo';

export interface FilaCorreo {
  nombre: string;
  sucursal: string;
  existencia: number;
  stockBajo: number;
  caso: CasoAlerta;
  /** Unidades que faltan para completar el mínimo (0 si ya está en él): `stock bajo − existencia`. */
  faltan: number;
}

// Existencias y umbrales de muestra. Cubren los cuatro casos y se ordenan por criticidad (existencia − stock bajo).
const MUESTRA: Array<{ sucursal: string; existencia: number; stockBajo: number }> = [
  { sucursal: 'Sucursal Principal', existencia: -3, stockBajo: 5 },
  { sucursal: 'Sucursal Secundaria', existencia: 0, stockBajo: 5 },
  { sucursal: 'Sucursal Principal', existencia: 1, stockBajo: 6 },
  { sucursal: 'Sucursal Secundaria', existencia: 2, stockBajo: 6 },
  { sucursal: 'Sucursal Principal', existencia: 3, stockBajo: 8 },
  { sucursal: 'Sucursal Secundaria', existencia: 4, stockBajo: 8 },
  { sucursal: 'Sucursal Principal', existencia: 5, stockBajo: 5 },
  { sucursal: 'Sucursal Secundaria', existencia: 6, stockBajo: 10 },
  { sucursal: 'Sucursal Principal', existencia: 8, stockBajo: 12 },
  { sucursal: 'Sucursal Secundaria', existencia: 9, stockBajo: 10 },
];

function casoDe(existencia: number, stockBajo: number): CasoAlerta {
  if (existencia < 0) return 'negativa';
  if (existencia === 0) return 'agotado';
  return existencia < stockBajo ? 'debajo' : 'minimo';
}

/** Las filas del correo: nombres repartidos por el catálogo, de la más crítica a la menos. */
export function filasCorreoEjemplo(productos: Array<{ name: string }>): FilaCorreo[] {
  if (productos.length === 0) return [];
  const paso = Math.max(1, Math.floor(productos.length / CORREO_MAX_FILAS));
  return MUESTRA
    .map((m, i): FilaCorreo => ({
      nombre: productos[(i * paso) % productos.length].name,
      sucursal: m.sucursal,
      existencia: m.existencia,
      stockBajo: m.stockBajo,
      caso: casoDe(m.existencia, m.stockBajo),
      faltan: Math.max(0, m.stockBajo - m.existencia),
    }))
    .sort((a, b) => (a.existencia - a.stockBajo) - (b.existencia - b.stockBajo));
}

/**
 * Número que muestra el ícono de stock bajo del header (specs/2026-10-alertas-stock-header-fijo.md). Es un valor fijo de
 * prototipo, no el real: cambia aquí cualquier número de 1 a 99 (desde 100 el header muestra "99+").
 * Para volver al conteo real del inventario, usar `contarItemsEnStockBajo` (utils/alertasStock.ts).
 */
export const HEADER_STOCK_BAJO_EJEMPLO = 73;
