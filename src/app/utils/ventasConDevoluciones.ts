/**
 * ventasConDevoluciones — las ventas con el estado derivado de las devoluciones (specs/2026-11-devoluciones-v2.md §5.9):
 * un documento con una devolución de alcance Total queda "Anulada" en el ver, en las listas y al imprimir. Un solo modelo:
 * la venta guardada no cambia; el estado se calcula al leer.
 */
import { useMemo } from 'react';
import { useDevoluciones } from '../store/devolucionesStore';
import { useVentas } from '../store/ventasStore';
import type { Venta } from '../types/venta';

export function useVentasConDevoluciones(): { ventas: Venta[]; getVenta: (id: string) => Venta | undefined } {
  const { ventas } = useVentas();
  const { devoluciones } = useDevoluciones();
  return useMemo(() => {
    const anuladas = new Set(devoluciones.filter(d => d.alcance === 'total' && d.ventaId).map(d => d.ventaId));
    const derivadas = ventas.map(v => (anuladas.has(v.id) && v.estado !== 'cancelada' ? { ...v, estado: 'cancelada' as const } : v));
    return { ventas: derivadas, getVenta: (id: string) => derivadas.find(v => v.id === id) };
  }, [ventas, devoluciones]);
}
