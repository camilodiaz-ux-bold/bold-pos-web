/**
 * gananciasPorItems.ts — agregación del reporte "Ganancias por ítems"
 * (specs/2026-10-reporte-ganancias-items.md). Función pura, sin hooks.
 */
import type { Venta } from '../types/venta';
import { acumularLineas, resolverFila, type VentasItemsCtx } from './ventasPorItems';

export interface GananciasItemsFila {
  key: string;
  codigo: string;          // '-' si no se resuelve
  nombre: string;
  tipo: 'Ítem' | 'Combo';
  categoria: string;       // '-' si no se resuelve
  cantidad: number;
  totalVentas: number;     // Σ subtotalLinea
  totalCostos: number;     // costoUnitario × cantidad
  totalGanancias: number;  // totalVentas − totalCostos
  gananciaPct: number;     // totalCostos > 0 ? totalGanancias / totalCostos * 100 : 100
}

export function agregarGananciasPorItems(ventas: Venta[], ctx: VentasItemsCtx): GananciasItemsFila[] {
  return acumularLineas(ventas).map(a => {
    const r = resolverFila(a, ctx);
    const totalCostos = (r.item?.costo ?? 0) * a.cantidad;
    const totalGanancias = a.subtotal - totalCostos;
    return {
      key: a.key, codigo: r.codigo, nombre: r.nombre, tipo: r.tipo, categoria: r.categoria,
      cantidad: a.cantidad, totalVentas: a.subtotal, totalCostos, totalGanancias,
      gananciaPct: totalCostos > 0 ? (totalGanancias / totalCostos) * 100 : 100,
    };
  });
}

/** '87.5 %' — hasta 2 decimales, sin ceros sobrantes. */
export function fmtPct(n: number): string {
  return `${Number(n.toFixed(2))} %`;
}
