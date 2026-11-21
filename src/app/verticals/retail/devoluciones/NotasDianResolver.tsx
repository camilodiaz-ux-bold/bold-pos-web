/**
 * NotasDianResolver — simula la respuesta de la DIAN a las notas crédito pendientes (specs/2026-11-devoluciones-v2.md §3 y §9).
 * Vive en el layout (no en la vista) para que la respuesta llegue aunque el usuario navegue. Al aceptarse crea la devolución
 * y aplica los efectos (número del consecutivo, egreso, inventario, toast); al rechazarse no queda nada.
 */
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { useItems } from '../../../store/itemsStore';
import type { Devolucion } from '../../../types/devolucion';
import { SESION_VENTAS } from '../../../utils/ventas';
import { useVertical } from '../../../vertical';

export const MSG_DIAN_RECHAZADA = 'La DIAN rechazó la nota crédito. No se registró la devolución.';

/** Datos de una devolución lista para registrarse (sin número ni fecha: se asignan al crearse). */
export interface DevolucionAplicable {
  filas: Omit<Devolucion, 'numero' | 'fecha'>[];
  /** Existencia que se suma (solo si ingresa al inventario). */
  inventario: { itemId: string; cantidad: number; variantId?: string }[];
  sucursalId: string;
  sucursalItemsId: string;
}

/**
 * Crea la devolución y aplica sus efectos (specs/2026-11-devoluciones-v2.md §9): número del consecutivo de la sucursal (que
 * avanza), egreso, inventario y toast. Lo usan la DIAN simulada (Factura y Sin Documento) y la vista de Comprobante.
 */
export function useAplicarDevolucion() {
  const { vertical } = useVertical();
  const { ajustes, updateAjustes } = useAjustes();
  const { devoluciones, siguienteNumero, agregar } = useDevoluciones();
  const { ajustarExistencia } = useItems();

  return useCallback((d: DevolucionAplicable) => {
    // Si ya existe una devolución con ese número (p. ej. otra sucursal), se toma el siguiente libre.
    const ocupados = new Set(devoluciones.map(x => x.numero));
    let consecutivo = ajustes.numeracionNoElectronica[d.sucursalId]?.devolucion ?? Number(siguienteNumero());
    while (ocupados.has(String(consecutivo))) consecutivo += 1;
    const numero = String(consecutivo);
    if (ajustes.numeracionNoElectronica[d.sucursalId]) {
      updateAjustes(prev => ({
        ...prev,
        numeracionNoElectronica: { ...prev.numeracionNoElectronica, [d.sucursalId]: { ...prev.numeracionNoElectronica[d.sucursalId], devolucion: consecutivo + 1 } },
      }));
    }

    const ahora = Date.now();
    const total = d.filas.reduce((s, f) => s + f.valorDevolucion, 0);
    agregar(d.filas.map((f, j) => ({
      ...f, numero, fecha: ahora, estadoDian: 'aceptada' as const,
      // Egreso (sin vista, S13): turno abierto al crearse, valor total y método de pago.
      ...(j === 0 ? { egreso: { turno: SESION_VENTAS[vertical].turno, valor: total, metodoPago: f.metodoPago } } : {}),
    })));
    d.inventario.forEach(i => ajustarExistencia(i.itemId, d.sucursalItemsId, i.cantidad, i.variantId));

    const primera = d.filas[0];
    toast.success(primera.alcance === 'total'
      ? (primera.tipo === 'comprobante' ? 'Comprobante anulado correctamente.' : 'Factura anulada correctamente.')
      : 'Devolución registrada correctamente.');
  }, [ajustes, updateAjustes, devoluciones, siguienteNumero, agregar, ajustarExistencia, vertical]);
}

export function NotasDianResolver() {
  const { pendientes, quitarPendiente } = useDevoluciones();
  const aplicar = useAplicarDevolucion();

  useEffect(() => {
    if (pendientes.length === 0) return;
    // Se resuelve de a una por vez: al cambiar el estado el efecto vuelve a correr con el consecutivo ya actualizado.
    const nota = [...pendientes].sort((a, b) => a.resuelveEn - b.resuelveEn)[0];

    const resolver = () => {
      quitarPendiente(nota.id);
      if (nota.rechazar) { toast.error(MSG_DIAN_RECHAZADA); return; }
      aplicar({ filas: nota.filas, inventario: nota.inventario, sucursalId: nota.sucursalId, sucursalItemsId: nota.sucursalItemsId });
    };

    const t = setTimeout(resolver, Math.max(0, nota.resuelveEn - Date.now()));
    return () => clearTimeout(t);
  }, [pendientes, quitarPendiente, aplicar]);

  return null;
}
