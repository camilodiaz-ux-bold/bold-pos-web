/**
 * SelectorCasoDevolucion — HERRAMIENTA DEL PROTOTIPO (no es una funcionalidad del sistema): select fijo en la barra de
 * herramientas del prototipo para pasar de un caso de uso de la nota crédito / devolución a otro sin recorrer el menú
 * (Factura parcial o total, Sin referencia, Comprobante parcial o total). Elige un documento de ejemplo que sirva para el caso.
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import type { TipoDevolucion } from '../../../types/devolucion';
import type { Venta } from '../../../types/venta';
import { estadoDocumentoDevolucion, mismaSucursal, usuarioSesion } from '../../../utils/devoluciones';
import {
  VENTA_EJEMPLO_ANULADA, VENTA_EJEMPLO_CONFLICTO, VENTA_EJEMPLO_CREDITO, VENTA_EJEMPLO_DESCUENTO, VENTA_EJEMPLO_NOTA_CREDITO_TOTAL,
  VENTA_EJEMPLO_SIN_INVENTARIO, VENTA_EJEMPLO_YA_DEVUELTO,
} from '../../../data/retail/ventasSeed';
import { useVentasConDevoluciones } from '../../../utils/ventasConDevoluciones';

const FONT = "'Montserrat', sans-serif";

export type CasoPrincipal = 'factura-parcial' | 'factura-total' | 'sin-referencia' | 'comprobante-parcial' | 'comprobante-total';
/** `ejemplo:{id de la venta}`: un documento de ejemplo con un aviso o bloqueo concreto. */
export type CasoDevolucion = CasoPrincipal | `ejemplo:${string}`;

const CASOS: { value: CasoPrincipal; label: string }[] = [
  { value: 'factura-parcial', label: 'Nota crédito con referencia (Factura) · Parcial' },
  { value: 'factura-total', label: 'Nota crédito con referencia (Factura) · Total' },
  { value: 'sin-referencia', label: 'Nota crédito sin referencia (Sin Documento)' },
  { value: 'comprobante-parcial', label: 'Devolución de Comprobante · Parcial' },
  { value: 'comprobante-total', label: 'Devolución de Comprobante · Total' },
];

/** Documentos de ejemplo con un aviso o bloqueo (los mismos que recorren los textos de la vista). */
const EJEMPLOS: { ventaId: string; tipo: 'factura' | 'comprobante'; label: string }[] = [
  { ventaId: VENTA_EJEMPLO_NOTA_CREDITO_TOTAL, tipo: 'factura', label: 'Factura con nota crédito total (bloquea)' },
  { ventaId: VENTA_EJEMPLO_ANULADA, tipo: 'comprobante', label: 'Comprobante anulado (bloquea)' },
  { ventaId: VENTA_EJEMPLO_YA_DEVUELTO, tipo: 'factura', label: 'Factura con un ítem ya devuelto' },
  { ventaId: VENTA_EJEMPLO_CREDITO, tipo: 'comprobante', label: 'Comprobante a crédito no pagado (avisa)' },
  { ventaId: VENTA_EJEMPLO_DESCUENTO, tipo: 'factura', label: 'Factura con descuento (avisa)' },
  { ventaId: VENTA_EJEMPLO_SIN_INVENTARIO, tipo: 'factura', label: 'Factura con un ítem sin inventario' },
  { ventaId: VENTA_EJEMPLO_CONFLICTO, tipo: 'comprobante', label: 'Comprobante con conflicto de concurrencia' },
];

export function SelectorCasoDevolucion({ actual, ventaId }: { actual: CasoPrincipal | ''; ventaId?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { ajustes } = useAjustes();
  const { ventas } = useVentasConDevoluciones();
  const { devoluciones, pendientes } = useDevoluciones();
  const sesion = ajustes.sucursales.find(s => s.id === usuarioSesion(ajustes).sucursalId);

  /** Documento de la sucursal de la sesión que sirve para el caso (Total pide uno sin devoluciones previas). */
  const sirve = (v: Venta, total: boolean): boolean => {
    const e = estadoDocumentoDevolucion(v, devoluciones, pendientes);
    return v.estado === 'pagada' && !e.anulado && !e.notaTotal && !e.pendiente && !e.todosDevueltos && !(total && e.huboDevolucion);
  };
  const documentoPara = (tipo: Extract<TipoDevolucion, 'factura' | 'comprobante'>, total: boolean): Venta | undefined => {
    const delTipo = ventas.filter(v => v.tipoDoc === tipo && (!sesion || mismaSucursal(sesion.nombre, v.sucursal)));
    const actualDoc = delTipo.find(v => v.id === ventaId);
    return (actualDoc && sirve(actualDoc, total) ? actualDoc : undefined) ?? delTipo.find(v => sirve(v, total)) ?? delTipo[0];
  };

  const ir = (caso: CasoDevolucion) => {
    if (caso === 'sin-referencia') { navigate('/notas-credito/nueva?origen=sin-documento', { state: { caso } }); return; }
    if (caso.startsWith('ejemplo:')) {
      const ej = EJEMPLOS.find(e => e.ventaId === caso.slice('ejemplo:'.length));
      if (ej) navigate(`${ej.tipo === 'factura' ? '/facturas-venta' : '/comprobantes'}/${ej.ventaId}/devolucion`, { state: { caso } });
      return;
    }
    const tipo = caso.startsWith('factura') ? 'factura' : 'comprobante';
    const total = caso.endsWith('total');
    const v = documentoPara(tipo, total);
    if (!v) return;
    navigate(`${tipo === 'factura' ? '/facturas-venta' : '/comprobantes'}/${v.id}/devolucion${total ? '?alcance=total' : ''}`, { state: { caso } });
  };

  // El caso elegido viaja en el estado de la ruta; si se entra directo, se deduce de la pantalla (o del documento de ejemplo).
  const elegido = (location.state as { caso?: CasoDevolucion } | null)?.caso;
  const deEjemplo = ventaId && actual.endsWith('parcial') ? EJEMPLOS.find(e => e.ventaId === ventaId) : undefined;
  const valor: CasoDevolucion | '' = elegido && (elegido === actual || (elegido.startsWith('ejemplo:') && actual.endsWith('parcial')))
    ? elegido
    : deEjemplo ? `ejemplo:${deEjemplo.ventaId}` : actual;

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)' }}>
      Caso de uso
      <select
        aria-label="Caso de uso del prototipo" value={valor} onChange={e => { if (e.target.value) ir(e.target.value as CasoDevolucion); }}
        style={{ height: 30, borderRadius: 8, border: '1.5px solid var(--black-10)', padding: '0 8px', fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-100)', backgroundColor: '#fff', cursor: 'pointer', maxWidth: 320 }}
      >
        {valor === '' && <option value="">Elige un caso…</option>}
        <optgroup label="Casos de uso">
          {CASOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </optgroup>
        <optgroup label="Documentos con avisos o bloqueos">
          {EJEMPLOS.map(e => <option key={e.ventaId} value={`ejemplo:${e.ventaId}`}>{e.label}</option>)}
        </optgroup>
      </select>
    </label>
  );
}
