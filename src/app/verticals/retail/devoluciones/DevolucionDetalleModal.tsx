/**
 * DevolucionDetalleModal — detalle de una devolución (specs/2026-11-devoluciones.md §5).
 * Muestra la información en un orden fijo y la lista completa de ítems devueltos. El documento de origen, el turno y la
 * nota crédito son hipervínculos (el número mismo es el enlace).
 */
import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAjustes } from '../../../store/ajustesStore';
import type { Devolucion } from '../../../types/devolucion';
import { TIPO_DEVOLUCION_LABEL } from '../../../types/devolucion';
import { formatCOP } from '../../../utils/format';
import { fmtFechaHora } from '../../../utils/ventas';
import { resumirImpuestos, rutaDocumento } from '../../../utils/devoluciones';

const FONT = "'Montserrat', sans-serif";
const VACIO = '--';

const linkBtn: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT,
  fontSize: 14, fontWeight: 600, color: 'var(--blue-100)', textDecoration: 'underline',
};

function Dato({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--black-60)' }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: 'var(--black-100)', overflowWrap: 'anywhere' }}>{children}</span>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: '10px 12px 10px 0', textAlign: 'left', fontFamily: FONT, fontWeight: 700, fontSize: 13,
  color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap',
};
const td: React.CSSProperties = { padding: '10px 12px 10px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)' };

export function DevolucionDetalleModal({ filas, onClose }: { filas: Devolucion[]; onClose: () => void }) {
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const d = filas[0];
  const ruta = rutaDocumento(d);
  const sinDocumento = d.tipo === 'sinDocumento';
  /** Solo la Factura discrimina impuestos. */
  const conImpuesto = d.tipo === 'factura';
  const motivo = ajustes.motivosDevolucion.find(m => m.id === d.motivoId)?.nombre ?? d.motivoId;
  const sucursal = ajustes.sucursales.find(s => s.id === d.sucursalId)?.nombre ?? d.sucursalId;

  const resumen = resumirImpuestos(filas.map(f => ({ impuestoId: f.impuestoId ?? 'iva-19', tasa: f.tasaImpuesto ?? 0.19, valor: f.valorDevolucion })));
  const totalImpuestos = resumen.impuestos.reduce((s, i) => s + i.monto, 0);
  const total = filas.reduce((s, f) => s + f.valorDevolucion, 0);
  const discriminar = conImpuesto && totalImpuestos > 0;

  // La etiqueta del dato depende del tipo: Factura, Comprobante o Documento (Sin Documento, con "--").
  const etiquetaDocumento = d.tipo === 'factura' ? 'Factura' : d.tipo === 'comprobante' ? 'Comprobante' : 'Documento';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={`Devolución ${d.numero}`}
        className="bg-white rounded-[var(--radius-20)] w-full mx-4"
        style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', padding: 32, boxSizing: 'border-box' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Devolución {d.numero}</h3>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Orden: tipo, documento, sucursal · fecha de venta, fecha de devolución, responsable · turno, medio de pago, inventario · motivo, nota crédito */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 16 }}>
          <Dato label="Tipo de devolución">{TIPO_DEVOLUCION_LABEL[d.tipo]}</Dato>
          <Dato label={etiquetaDocumento}>
            {sinDocumento || !d.numeroDocumento ? VACIO : ruta
              ? <button style={linkBtn} onClick={() => navigate(ruta)}>{d.numeroDocumento}</button>
              : d.numeroDocumento}
          </Dato>
          <Dato label="Sucursal">{sucursal}</Dato>

          <Dato label="Fecha de venta">{d.fechaVenta ? fmtFechaHora(d.fechaVenta) : VACIO}</Dato>
          <Dato label="Fecha de devolución">{fmtFechaHora(d.fecha)}</Dato>
          <Dato label="Responsable">{d.responsable}</Dato>

          <Dato label="Turno"><button style={linkBtn} onClick={() => navigate('/turnos')}>{d.turno}</button></Dato>
          <Dato label="Medio de pago">{d.metodoPago}</Dato>
          <Dato label="Ingreso al inventario">{d.ingresaInventario ? 'Sí' : 'No'}</Dato>

          <Dato label="Motivo">{motivo}</Dato>
          {d.tipo === 'factura' && d.notaCredito
            ? <Dato label="Nota crédito"><button style={linkBtn} onClick={() => navigate(`/notas-credito/${d.numero}`)}>{d.notaCredito}</button></Dato>
            : <span />}
          <span />
        </div>
        <div style={{ marginBottom: 20 }}>
          <Dato label="Justificación">{d.justificacion}</Dato>
        </div>

        <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--black-100)', margin: '0 0 4px' }}>
          Ítems devueltos ({filas.length})
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Ítem</th>
              <th style={{ ...th, textAlign: 'right' }}>Cantidad</th>
              <th style={{ ...th, textAlign: 'right' }}>Valor venta</th>
              <th style={{ ...th, textAlign: 'right', paddingRight: 0 }}>Valor devolución</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid var(--black-10)' }}>
                <td style={td}>{f.nombre}</td>
                <td style={{ ...td, textAlign: 'right' }}>{f.cantidad}</td>
                <td style={{ ...td, textAlign: 'right' }}>{f.valorVentaItem != null ? formatCOP(f.valorVentaItem) : VACIO}</td>
                <td style={{ ...td, textAlign: 'right', paddingRight: 0 }}>{formatCOP(f.valorDevolucion)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales: el total arriba; la discriminación (valor de los productos e impuestos) aparte, solo si hay impuestos. */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 14, fontFamily: FONT }}>
          <div style={{ display: 'flex', gap: 24, fontSize: 16, fontWeight: 700, color: 'var(--black-100)' }}>
            <span>Total</span><span>{formatCOP(total)}</span>
          </div>
          {discriminar && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--black-10)', fontSize: 13, color: 'var(--black-60)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}><span>Valor productos</span><span>{formatCOP(resumen.subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}><span>Impuestos</span><span>{formatCOP(totalImpuestos)}</span></div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
