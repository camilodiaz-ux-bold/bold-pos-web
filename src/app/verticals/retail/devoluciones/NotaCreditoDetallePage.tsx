/**
 * NotaCreditoDetallePage — ver de la nota crédito que genera una devolución de Factura
 * (specs/2026-11-devoluciones.md §6, D1). Réplica del ver del POS real (Ingresos → Notas Crédito → detalle),
 * de solo lectura; se arma a partir de las filas de la devolución. Botones solo visuales.
 */
import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { useVentas } from '../../../store/ventasStore';
import { useItems } from '../../../store/itemsStore';
import { mockCufe, fmtCOP } from '../../../utils/ventas';
import { DevueltoTotalAviso } from './ItemsDevueltosSeccion';
import { desglosarImpuesto, impuestoPorTasa, resumirImpuestos } from '../../../utils/devoluciones';

const FONT = "'Montserrat', sans-serif";
const link: React.CSSProperties = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: 'var(--coral-100)' };
const pill: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 100, border: 'none', backgroundColor: 'var(--black-10)', cursor: 'pointer',
  fontFamily: FONT, fontSize: 10, fontWeight: 700, color: 'var(--black-100)', textTransform: 'uppercase',
};
const th: React.CSSProperties = { padding: '10px 8px', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'var(--black-100)', textAlign: 'center' };
const td: React.CSSProperties = { padding: '12px 8px', fontFamily: FONT, fontSize: 13, color: 'var(--black-100)', textAlign: 'center' };

export function NotaCreditoDetallePage() {
  const { numero = '' } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const { filasDe } = useDevoluciones();
  const { items } = useItems();
  const { getVenta } = useVentas();

  const filas = filasDe(numero).filter(f => f.notaCredito);
  if (filas.length === 0) return <Navigate to="/items/devoluciones" replace />;

  const d = filas[0];
  const venta = d.ventaId ? getVenta(d.ventaId) : undefined;
  const sucursal = ajustes.sucursales.find(s => s.id === d.sucursalId)?.nombre ?? d.sucursalId;
  const motivo = ajustes.motivosDevolucion.find(m => m.id === d.motivoId)?.nombre ?? '';
  const tasa = venta?.taxRate ?? 0.19;
  const estado = d.estadoDian ?? 'aceptada';
  const colorEstado = estado === 'aceptada' ? '#1b8959' : estado === 'rechazada' ? 'var(--coral-100)' : 'var(--blue-100)';
  const etiquetaEstado = estado === 'aceptada' ? 'Aceptada' : estado === 'rechazada' ? 'Rechazada' : 'Pendiente';
  const itemDe = (productId: string) => items.find(i => i.catalogProductId !== undefined && String(i.catalogProductId) === productId);
  // Cada línea usa el impuesto de su ítem; las devoluciones antiguas sin impuesto usan el del documento.
  const lineaImp = (f: typeof filas[number]) => ({ impuestoId: f.impuestoId ?? impuestoPorTasa(tasa), tasa: f.tasaImpuesto ?? tasa, valor: f.valorDevolucion });
  const resumen = resumirImpuestos(filas.map(lineaImp));
  const total = resumen.total;
  const fecha = new Date(d.fecha);
  const fechaIso = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontFamily: FONT, fontSize: 11, color: colorEstado }}>{etiquetaEstado}</span>
            <h1 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 500, color: 'var(--black-100)', margin: '2px 0 0' }}>Nota Crédito No. {d.notaCredito}</h1>
          </div>
          <button onClick={() => navigate(-1)} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-60)' }}><X size={20} /></button>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--black-10)', margin: '12px 0' }} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {/* Como en el POS real, los botones dependen del estado ante la DIAN. */}
          {estado === 'aceptada' && <button style={pill} onClick={() => toast.info('Imprimir — próximamente')}>Imprimir</button>}
          {estado === 'aceptada' && <button style={pill} onClick={() => toast.info('Enviar por correo — próximamente')}>Enviar por correo</button>}
          <button style={pill} onClick={() => navigate('/notas-credito/nueva')}>Nuevo</button>
          {estado !== 'rechazada' && <button style={pill} onClick={() => toast.info('Verifica en la DIAN — próximamente')}>Verifica en la DIAN</button>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontFamily: FONT, fontSize: 13, lineHeight: '20px', color: 'var(--black-100)' }}>
          <div>
            <div>Fecha de emisión: {fechaIso}</div>
            <div>Cliente: <span style={{ color: 'var(--coral-100)' }}>{venta?.cliente ?? d.clienteNombre ?? '—'}</span></div>
            <div>Sucursal: {sucursal}</div>
            <div>{d.tipo === 'sinDocumento' ? 'Nota crédito sin referencia' : 'Nota crédito con referencia'}</div>
            {/* Enlaces de referencia (spec v3 §7): el texto es solo el número. Sin Documento no tiene factura. */}
            {d.tipo === 'factura' && venta && (
              <div>Factura a la que hace referencia: <button style={link} onClick={() => navigate(`/facturas-venta/${venta.id}`)}>{d.numeroDocumento}</button></div>
            )}
            <div>Devolución a la que hace referencia: <button style={link} onClick={() => navigate(`/items/devoluciones/${d.numero}`)}>{d.numero}</button></div>
            <div>Motivo: {motivo}</div>
            <div style={{ wordBreak: 'break-all' }}>Cude: {estado === 'aceptada' ? mockCufe(d.notaCredito ?? '') : ''}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>{ajustes.perfil.nombre}</div>
            <div>Emitido por: {d.responsable}</div>
          </div>
        </div>

        {/* Sin la tarjeta rosada de ítems devueltos: ya está la lista de ítems. Solo el indicador de devolución total. */}
        {filas.some(f => f.alcance === 'total') && (
          <div style={{ marginTop: 18 }}>
            <DevueltoTotalAviso numero={d.numero} conEnlace={false} />
          </div>
        )}

        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--blue-10)', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={th}>Cantidad</th><th style={th}>Item</th><th style={th}>Precio Unit.</th>
                <th style={th}>Descuento</th><th style={th}>Impuestos</th><th style={th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(f => {
                const { base } = desglosarImpuesto(f.valorDevolucion, lineaImp(f).tasa);
                return (
                  <tr key={f.id} style={{ backgroundColor: '#fff', borderTop: '1px solid var(--black-10)' }}>
                    <td style={td}>{f.cantidad}</td>
                    <td style={td}>
                      <span style={{ color: 'var(--coral-100)' }}>{itemDe(f.itemId)?.codigo ?? f.itemId}</span> - {f.nombre}
                      <div style={{ fontSize: 10, color: 'var(--black-60)' }}>Referencia: {itemDe(f.itemId)?.referencia ?? ''}</div>
                    </td>
                    <td style={td}>{fmtCOP(base / f.cantidad)}</td>
                    <td style={td}>Ninguno</td>
                    <td style={td}>{fmtCOP(f.valorDevolucion - base)}</td>
                    <td style={td}>{fmtCOP(f.valorDevolucion)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 13, margin: '10px 0' }}>Total items: {filas.reduce((s, f) => s + f.cantidad, 0)}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <p style={{ fontFamily: FONT, fontSize: 15, margin: '0 0 6px' }}>Notas</p>
            <div style={{ backgroundColor: 'var(--blue-10)', borderRadius: 8, padding: 12, fontFamily: FONT, fontSize: 13 }}>{d.justificacion}</div>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 13, minWidth: 220 }}>
            {[['Subtotal', resumen.subtotal], ['Descuento', 0], ...resumen.impuestos.map(i => [i.etiqueta, i.monto])].map(([l, v]) => (
              <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, lineHeight: '22px' }}><strong>{l}</strong><span>{fmtCOP(v as number)}</span></div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, lineHeight: '22px' }}><strong>Total</strong><span>{fmtCOP(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
