/**
 * devolucion.ts — Modelo de Devoluciones (specs/2026-11-devoluciones.md §3).
 * Una fila por ítem devuelto; las filas de una misma devolución comparten `numero` (`234`, sin prefijo).
 */

export type TipoDevolucion = 'factura' | 'comprobante' | 'sinDocumento';

export const TIPO_DEVOLUCION_LABEL: Record<TipoDevolucion, string> = {
  factura: 'Factura',
  comprobante: 'Comprobante',
  sinDocumento: 'Sin Documento',
};

export type AlcanceDevolucion = 'parcial' | 'total';

export const ALCANCE_DEVOLUCION_LABEL: Record<AlcanceDevolucion, string> = { parcial: 'Parcial', total: 'Total' };

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
  /** '234' (solo el número, sin prefijo), compartido por las filas de una misma devolución. */
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
  /** Valor de venta de los ítems devueltos (lo pagado por esa cantidad, con impuesto). Vacío en Sin Documento. */
  valorVentaItem?: number;
  /** Cantidad vendida y valor de venta de la línea completa del documento (lo pagado). Vacíos en Sin Documento. */
  cantidadVendida?: number;
  valorVentaLinea?: number;
  /** Valor de devolución digitado (con impuesto incluido). */
  valorDevolucion: number;
  /** Impuesto del ítem (`iva-19`, `iva-5`, `inc-8`, `exento`) y su tasa (0.19). Sin definir = IVA 19 %. */
  impuestoId?: string;
  tasaImpuesto?: number;
  metodoPago: string;
  motivoId: string;
  justificacion: string;
  /** Si la devolución ingresó el ítem al inventario. */
  ingresaInventario: boolean;
  /** Número de la nota crédito (solo Factura). */
  notaCredito?: string;
  /** Estado ante la DIAN de la nota crédito (solo Factura). Sin definir = aceptada. */
  estadoDian?: 'aceptada' | 'pendiente' | 'rechazada';
  /** Alcance (specs/2026-11-devoluciones-v2.md §3). Sin definir en Sin Documento (no aplica). */
  alcance?: AlcanceDevolucion;
  /** Cliente del documento (o de la nota en Sin Documento). Sin definir = sin cliente. */
  clienteNombre?: string;
  clienteDocumento?: string;
  /** Motivo de la nota crédito (lista DIAN; solo Factura y Sin Documento). */
  motivoNotaDian?: string;
  /** Forma de pago de la nota crédito (solo Sin Documento; no es el método de pago de la devolución). */
  formaPagoNota?: 'Crédito' | 'Contado';
  /** Egreso que genera la devolución (specs/2026-11-devoluciones-v2.md §3, S13): solo en la primera fila; sin vista. */
  egreso?: { turno: number; valor: number; metodoPago: string };
  /** Dato de ejemplo (semilla), no registrado por el usuario. */
  ejemplo?: boolean;
}

/**
 * Nota crédito emitida que espera la aceptación de la DIAN (specs/2026-11-devoluciones-v2.md §3). La devolución no
 * existe hasta que se acepta: entonces `filas` se convierten en devoluciones (con número y fecha) y se aplican los efectos.
 */
export interface NotaPendiente {
  id: string;
  /** Vacío en Sin Documento. */
  ventaId?: string;
  /** Número de la nota crédito (`NCR 430`), reservado al emitir. */
  notaCredito: string;
  /** Sin definir en Sin Documento (no aplica). */
  alcance?: AlcanceDevolucion;
  sucursalId: string;
  creadaEn: number;
  /** Epoch ms en que la DIAN responde (simulado). */
  resuelveEn: number;
  /** Si la DIAN la rechaza (se decide al emitir con "Simular rechazo de la DIAN"). */
  rechazar: boolean;
  /** Filas de la devolución, sin `numero` ni `fecha` (se asignan al aceptarse). */
  filas: Omit<Devolucion, 'numero' | 'fecha'>[];
  /** Existencia que se suma a la aceptación (solo si ingresa al inventario). */
  inventario: { itemId: string; cantidad: number; variantId?: string }[];
  sucursalItemsId: string;
}
