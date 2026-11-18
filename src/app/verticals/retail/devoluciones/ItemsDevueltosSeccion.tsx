/**
 * ItemsDevueltosSeccion — tarjeta pastel "Ítems devueltos" (specs/2026-11-devoluciones.md §8). Se usa en el ver de la
 * nota crédito y en el ver de factura y de comprobante: lista los ítems devueltos (Ítem, Fecha, Valor devolución, Motivo)
 * y, al final de cada fila, "Ver devolución", que abre el modal de detalle de esa devolución. El documento no cambia de estado.
 */
import React, { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import type { Devolucion } from '../../../types/devolucion';
import { formatCOP } from '../../../utils/format';
import { fmtFechaHora } from '../../../utils/ventas';
import { DevolucionDetalleModal } from './DevolucionDetalleModal';

const FONT = "'Montserrat', sans-serif";
const th: React.CSSProperties = {
  padding: '8px 12px 8px 0', textAlign: 'left', fontFamily: FONT, fontWeight: 700, fontSize: 12, color: 'var(--black-100)',
  borderBottom: '1px solid rgba(255,41,71,0.25)', whiteSpace: 'nowrap',
};
const td: React.CSSProperties = { padding: '10px 12px 10px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', textAlign: 'left' };

export function ItemsDevueltosSeccion({ filas, descripcion }: { filas: Devolucion[]; descripcion: string }) {
  const { ajustes } = useAjustes();
  const { filasDe } = useDevoluciones();
  const [verNumero, setVerNumero] = useState<string | null>(null);
  if (filas.length === 0) return null;

  const ordenadas = [...filas].sort((a, b) => b.fecha - a.fecha);
  return (
    <>
      <section
        aria-label="Ítems devueltos"
        style={{ padding: '14px 18px 8px', borderRadius: 12, backgroundColor: 'var(--coral-10)', borderLeft: '4px solid var(--coral-100)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Undo2 size={16} color="var(--coral-100)" />
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: 'var(--black-100)' }}>Ítems devueltos</span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', margin: '0 0 8px' }}>{descripcion}</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                {['Ítem', 'Fecha', 'Valor devolución', 'Motivo'].map(h => <th key={h} style={th}>{h}</th>)}
                <th style={th} />
              </tr>
            </thead>
            <tbody>
              {ordenadas.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,41,71,0.12)' }}>
                  <td style={td}>{f.nombre}</td>
                  <td style={td}>{fmtFechaHora(f.fecha)}</td>
                  <td style={td}>{formatCOP(f.valorDevolucion)}</td>
                  <td style={td}>{ajustes.motivosDevolucion.find(m => m.id === f.motivoId)?.nombre ?? f.motivoId}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <button
                      onClick={() => setVerNumero(f.numero)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--coral-100)', textDecoration: 'underline' }}
                    >
                      Ver devolución
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {verNumero && <DevolucionDetalleModal filas={filasDe(verNumero)} onClose={() => setVerNumero(null)} />}
    </>
  );
}

/** Ítems devueltos de un documento de venta (factura o comprobante); no dibuja nada si no tiene devoluciones. */
export function ItemsDevueltosDeVenta({ ventaId }: { ventaId: string }) {
  const { devolucionesDeVenta } = useDevoluciones();
  return <ItemsDevueltosSeccion filas={devolucionesDeVenta(ventaId)} descripcion="Se generó una devolución a partir de este documento." />;
}
