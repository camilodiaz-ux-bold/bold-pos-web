/**
 * EjemploCorreoDevolucionModal — vista del correo "Detalle de tu devolución" (specs/2026-11-devoluciones-v2.md §7.4).
 * Solo visual: muestra cómo le llega al cliente (diseño Bold, asunto, cuerpo y el PDF adjunto con el ticket de la devolución).
 */
import React, { useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import svgPaths from '../../../../imports/svg-5yr7pr5zvq';
import type { Devolucion } from '../../../types/devolucion';
import { formatCOP } from '../../../utils/format';
import { imprimirDevolucion } from '../../../utils/imprimirDevolucion';
import { totalDevolucion } from '../../../utils/devoluciones';
import { DevolucionTicket } from './DevolucionTicket';

const FONT = "'Montserrat', sans-serif";
const fmtDia = (ms: number) => { const d = new Date(ms); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };

export function EjemploCorreoDevolucionModal({ filas, para, sucursal, motivo, onClose }: { filas: Devolucion[]; para: string[]; sucursal: string; motivo: string; onClose: () => void }) {
  const d = filas[0];
  const [verPdf, setVerPdf] = useState(false);
  const meta: [string, string][] = [['De', 'Bold POS'], ['Para', para.filter(Boolean).join(', ') || '--'], ['Asunto', 'Detalle de tu devolución']];

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Ejemplo del correo" className="bg-white rounded-[var(--radius-20)] w-full mx-4"
        style={{ maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', padding: 24, boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Ejemplo del correo</h3>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}><X size={20} /></button>
        </div>

        <div style={{ border: '1px solid var(--black-10)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--black-10)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {meta.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, fontFamily: FONT, fontSize: 13 }}>
                <span style={{ width: 52, color: 'var(--black-60)', fontWeight: 600 }}>{k}:</span>
                <span style={{ color: 'var(--black-100)', fontWeight: k === 'Asunto' ? 700 : 500, overflowWrap: 'anywhere' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Cuerpo con el diseño Bold */}
          <div style={{ backgroundColor: 'var(--blue-10)', padding: 24 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: '28px 28px 24px', maxWidth: 520, margin: '0 auto' }}>
              <svg width="96" height="34" viewBox="0 0 140.621 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bold">
                <path d={svgPaths.p210b6200} fill="var(--blue-100)" />
              </svg>
              <div style={{ fontFamily: FONT, fontSize: 14, lineHeight: '22px', color: 'var(--black-100)', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ margin: 0 }}>Hola,</p>
                <p style={{ margin: 0 }}>te compartimos el detalle de tu devolución realizada el {fmtDia(d.fecha)}.</p>
                <p style={{ margin: 0 }}>
                  <strong>Valor total:</strong> {formatCOP(totalDevolucion(filas))}<br />
                  <strong>Método de pago:</strong> {d.metodoPago}
                </p>
                <p style={{ margin: 0 }}>Encuentras los ítems devueltos en el PDF adjunto.</p>
                <p style={{ margin: 0 }}>Gracias por tu confianza.</p>
              </div>
            </div>
          </div>

          {/* PDF adjunto */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--black-10)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <FileText size={20} color="var(--coral-100)" />
              <button onClick={() => setVerPdf(v => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', textDecoration: 'underline' }}>
                Devolucion-{d.numero}.pdf
              </button>
              <button className="btn btn-secondary" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => imprimirDevolucion(filas, { sucursal, motivo })}>
                <Download size={14} /> Descargar PDF
              </button>
            </div>
            {verPdf && (
              <div style={{ marginTop: 12, padding: 16, backgroundColor: 'var(--blue-10)', borderRadius: 8, display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
                <div style={{ backgroundColor: '#fff', padding: '12px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                  <DevolucionTicket filas={filas} sucursal={sucursal} motivo={motivo} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
