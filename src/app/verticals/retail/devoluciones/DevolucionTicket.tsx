/**
 * DevolucionTicket — detalle de una devolución en formato ticket 80 mm, el formato actual de Bold POS (mismo estilo que
 * `InvoiceTicket`). Es el PDF que se adjunta al correo "Detalle de tu devolución" y lo que imprime el botón "Imprimir"
 * (specs/2026-11-devoluciones-v2.md §7.4). Solo estilos inline: se renderiza también a HTML estático dentro de un iframe.
 */
import React from 'react';
import svgPaths from '../../../../imports/svg-5yr7pr5zvq';
import { INVOICE_ISSUER } from '../../../data/invoiceIssuer';
import type { Devolucion } from '../../../types/devolucion';
import { ALCANCE_DEVOLUCION_LABEL, TIPO_DEVOLUCION_LABEL } from '../../../types/devolucion';
import { formatCOP } from '../../../utils/format';
import { fmtFechaHora } from '../../../utils/ventas';
import { clienteDeDevolucion, totalDevolucion } from '../../../utils/devoluciones';

const INK = '#000';
const RULE = '1px solid #777';
const FONT = 'Arial, Helvetica, sans-serif';
const centered: React.CSSProperties = { textAlign: 'center', lineHeight: '14px' };
const headCell: React.CSSProperties = { background: '#EEE', fontWeight: 700, padding: '2px 3px' };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '38% 62%', gap: 4, padding: '1px 0' }}>
      <span>{label}</span>
      <span style={{ wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

export function DevolucionTicket({ filas, sucursal, motivo }: { filas: Devolucion[]; sucursal: string; motivo: string }) {
  const d = filas[0];
  const cols = '1fr 14mm 24mm';
  return (
    <div style={{ width: '72mm', margin: '0 auto', fontFamily: FONT, fontSize: 10.5, color: INK, lineHeight: '13px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <svg width="110" height="39" viewBox="0 0 140.621 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={svgPaths.p210b6200} fill={INK} />
        </svg>
      </div>
      <div style={{ ...centered, fontWeight: 700 }}>Detalle de Devolución</div>
      <div style={{ ...centered, fontWeight: 700 }}>No. {d.numero}</div>
      <div style={centered}>{INVOICE_ISSUER.razonSocial}</div>
      <div style={centered}>NIT: {INVOICE_ISSUER.nit}</div>
      <div style={centered}>Sucursal: {sucursal}</div>

      <div style={{ borderTop: RULE, margin: '6px 0' }} />

      <Field label="Fecha devolución:" value={fmtFechaHora(d.fecha)} />
      <Field label="Tipo:" value={TIPO_DEVOLUCION_LABEL[d.tipo]} />
      {d.alcance && <Field label="Alcance:" value={ALCANCE_DEVOLUCION_LABEL[d.alcance]} />}
      <Field label="Documento:" value={d.numeroDocumento ?? '--'} />
      <Field label="Cliente:" value={clienteDeDevolucion(d)} />
      <Field label="Método de pago:" value={d.metodoPago} />
      <Field label="Motivo:" value={motivo} />
      <Field label="Responsable:" value={d.responsable} />

      <div style={{ borderTop: RULE, margin: '6px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: cols }}>
        <div style={headCell}>Ítem</div>
        <div style={{ ...headCell, textAlign: 'right' }}>Cant.</div>
        <div style={{ ...headCell, textAlign: 'right' }}>Valor devolución</div>
      </div>
      {filas.map(f => (
        <div key={f.id} style={{ display: 'grid', gridTemplateColumns: cols, padding: '4px 3px 0' }}>
          <div style={{ wordBreak: 'break-word' }}>{f.nombre}</div>
          <div style={{ textAlign: 'right' }}>{f.cantidad}</div>
          <div style={{ textAlign: 'right' }}>{formatCOP(f.valorDevolucion)}</div>
        </div>
      ))}

      <div style={{ borderTop: RULE, margin: '8px 0 4px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontWeight: 700, fontSize: 12 }}>
        <span>Total:</span>
        <span style={{ textAlign: 'right' }}>{formatCOP(totalDevolucion(filas))}</span>
      </div>
    </div>
  );
}
