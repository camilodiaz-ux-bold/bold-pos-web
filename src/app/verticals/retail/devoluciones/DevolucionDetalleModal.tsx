/**
 * DevolucionDetalleModal — detalle de una devolución (specs/2026-11-devoluciones.md §5).
 * Muestra toda la información y la lista completa de ítems devueltos; da acceso al documento de origen,
 * al turno y, en Factura, a la nota crédito.
 */
import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAjustes } from '../../../store/ajustesStore';
import { useCatalog } from '../../../vertical';
import type { Devolucion } from '../../../types/devolucion';
import { TIPO_DEVOLUCION_LABEL } from '../../../types/devolucion';
import { formatCOP } from '../../../utils/format';
import { fmtFechaHora } from '../../../utils/ventas';
import { rutaDocumento, totalDevolucion } from '../../../utils/devoluciones';

const FONT = "'Montserrat', sans-serif";

const linkBtn: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT,
  fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', textDecoration: 'underline',
};

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
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
  const { catDefs } = useCatalog();
  const d = filas[0];
  const ruta = rutaDocumento(d);
  const motivo = ajustes.motivosDevolucion.find(m => m.id === d.motivoId)?.nombre ?? d.motivoId;
  const sucursal = ajustes.sucursales.find(s => s.id === d.sucursalId)?.nombre ?? d.sucursalId;
  const categoria = (id: string) => catDefs.find(c => c.id === id)?.name ?? '—';

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <Dato label="Tipo de devolución">{TIPO_DEVOLUCION_LABEL[d.tipo]}</Dato>
          <Dato label="Fecha">{fmtFechaHora(d.fecha)}</Dato>
          <Dato label="Sucursal">{sucursal}</Dato>
          <Dato label="Responsable">{d.responsable}</Dato>
          <Dato label="Turno">
            Turno {d.turno}{' '}
            <button style={linkBtn} onClick={() => navigate('/turnos')}>Ir al turno</button>
          </Dato>
          <Dato label="Método de pago">{d.metodoPago}</Dato>
          <Dato label="Motivo">{motivo}</Dato>
          <Dato label="Ingreso al inventario">{d.ingresaInventario ? 'Sí' : 'No'}</Dato>
          {d.tipo !== 'sinDocumento' && (
            <>
              <Dato label="Documento">
                {d.numeroDocumento}{' '}
                {ruta && <button style={linkBtn} onClick={() => navigate(ruta)}>Ir al documento</button>}
              </Dato>
              <Dato label="Fecha de venta">{d.fechaVenta ? fmtFechaHora(d.fechaVenta) : '—'}</Dato>
              <Dato label="Valor de venta">{d.valorVenta != null ? formatCOP(d.valorVenta) : '—'}</Dato>
            </>
          )}
          {d.tipo === 'factura' && d.notaCredito && (
            <Dato label="Nota crédito">
              {d.notaCredito}{' '}
              <button style={linkBtn} onClick={() => navigate(`/notas-credito/${d.numero}`)}>Ver nota crédito</button>
            </Dato>
          )}
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
              <th style={th}>Producto</th>
              <th style={th}>Categoría</th>
              <th style={{ ...th, textAlign: 'right' }}>Cantidad</th>
              <th style={{ ...th, textAlign: 'right', paddingRight: 0 }}>Valor devolución</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid var(--black-10)' }}>
                <td style={td}>{f.nombre}</td>
                <td style={td}>{categoria(f.categoriaId)}</td>
                <td style={{ ...td, textAlign: 'right' }}>{f.cantidad}</td>
                <td style={{ ...td, textAlign: 'right', paddingRight: 0 }}>{formatCOP(f.valorDevolucion)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ ...td, fontWeight: 700 }} colSpan={3}>Total</td>
              <td style={{ ...td, fontWeight: 700, textAlign: 'right', paddingRight: 0 }}>{formatCOP(totalDevolucion(filas))}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
