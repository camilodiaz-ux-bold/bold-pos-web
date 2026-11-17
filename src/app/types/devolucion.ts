/**
 * devolucion.ts — Modelo de Devoluciones (specs/2026-11-devoluciones.md §3).
 * Una fila por ítem devuelto; las filas de una misma devolución comparten `numero` (`Dev-234`).
 */

export type TipoDevolucion = 'factura' | 'comprobante' | 'sinDocumento';

export const TIPO_DEVOLUCION_LABEL: Record<TipoDevolucion, string> = {
  factura: 'Factura',
  comprobante: 'Comprobante',
  sinDocumento: 'Sin Documento',
};

/** Motivo de devolución (Ajustes → Inventarios). El fijo no se puede eliminar ni inactivar. */
export interface MotivoDevolucion {
  id: string;
  nombre: string;
  activo: boolean;
  fijo?: boolean;
}

export interface Devolucion {
  /** Id único de la fila. */
  id: string;
  /** 'Dev-234', compartido por las filas de una misma devolución. */
  numero: string;
  /** Epoch ms del registro. */
  fecha: number;
  /** Id de la sucursal de Ajustes (`suc-1`…). */
  sucursalId: string;
  /** Turno actual al registrar. */
  turno: number;
  responsable: string;
  tipo: TipoDevolucion;
  /** Id interno de la venta (ruta del ver). Vacío en Sin Documento. */
  ventaId?: string;
  /** 'SETT 2400411' o '3753'. Vacío en Sin Documento. */
  numeroDocumento?: string;
  /** Epoch ms de la venta. Vacío en Sin Documento. */
  fechaVenta?: number;
  /** Total de la venta. Vacío en Sin Documento. */
  valorVenta?: number;
  /** Id de línea del documento (`SaleItem.id`) o id de producto en Sin Documento. */
  itemId: string;
  nombre: string;
  categoriaId: string;
  cantidad: number;
  valorDevolucion: number;
  metodoPago: string;
  motivoId: string;
  justificacion: string;
  /** Si la devolución ingresó el ítem al inventario. */
  ingresaInventario: boolean;
  /** Número de la nota crédito (solo Factura). */
  notaCredito?: string;
  /** Dato de ejemplo (semilla), no registrado por el usuario. */
  ejemplo?: boolean;
}
