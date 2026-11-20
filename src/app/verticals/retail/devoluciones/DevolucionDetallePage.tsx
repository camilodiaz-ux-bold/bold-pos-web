/**
 * DevolucionDetallePage — ver de una devolución (`/items/devoluciones/:numero`; specs/2026-11-devoluciones-v2.md §7).
 * Reemplaza al modal de detalle de v1; mismo diseño que el ver de factura/comprobante, con "Imprimir" y "Enviar por correo".
 */
import React, { useState } from 'react';
import { ArrowLeft, Mail, Printer } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useAjustes } from '../../../store/ajustesStore';
import { useContactos } from '../../../store/contactosStore';
import { useDevoluciones } from '../../../store/devolucionesStore';
import { VentaBadge } from '../../../components/ventas/VentaBadge';
import { font, sectionCard, sectionTitle } from '../../../components/ventas/ventasStyles';
import { ALCANCE_DEVOLUCION_LABEL, TIPO_DEVOLUCION_LABEL } from '../../../types/devolucion';
import { formatCOP } from '../../../utils/format';
import { fmtFechaHora } from '../../../utils/ventas';
import { imprimirDevolucion } from '../../../utils/imprimirDevolucion';
import { EjemploCorreoDevolucionModal } from './EjemploCorreoDevolucionModal';
import { clienteDeDevolucion, resumirImpuestos, rutaDocumento } from '../../../utils/devoluciones';
import { CORREO_CLIENTES_EJEMPLO } from '../../../data/retail/ventasSeed';
import { EnviarCorreoDevolucionModal } from './EnviarCorreoDevolucionModal';

const DIVIDER = '1px solid var(--black-10)';
const VACIO = '--';
const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const tdHead: React.CSSProperties = { padding: '10px 16px 10px 0', textAlign: 'left', ...font(12, 700, 'var(--black-100)', 18), borderBottom: '2px solid var(--black-10)', whiteSpace: 'nowrap' };
const tdCell: React.CSSProperties = { padding: '12px 16px 12px 0', ...font(13, 500, 'var(--black-100)', 18), verticalAlign: 'top' };
const outlineBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', borderRadius: 32,
  border: '1.5px solid var(--blue-100)', backgroundColor: 'var(--black-0)', cursor: 'pointer', ...font(14, 600, 'var(--blue-100)'),
};
const linkBtn: React.CSSProperties = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', ...font(14, 600, 'var(--blue-100)'), textDecoration: 'underline' };

function InfoRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : DIVIDER, gap: 12 }}>
      <span style={{ ...font(14, 400, 'var(--black-60)'), flexShrink: 0 }}>{label}</span>
      <span style={{ ...font(14, 600, 'var(--black-100)'), textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{children}</span>
    </div>
  );
}

export function DevolucionDetallePage() {
  const { numero = '' } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const { contactos } = useContactos();
  const { filasDe } = useDevoluciones();
  const [enviando, setEnviando] = useState(false);
  /** Destinatarios con los que se abrió "Ver ejemplo del correo" (null = cerrado). */
  const [ejemplo, setEjemplo] = useState<string[] | null>(null);

  const filas = filasDe(numero);
  const d = filas[0];

  if (!d) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <p style={{ ...font(16, 600, 'var(--black-100)', 24), margin: 0 }}>Devolución no encontrada</p>
        <button onClick={() => navigate('/items/devoluciones')} style={outlineBtn}><ArrowLeft size={14} color="var(--blue-100)" /> Volver</button>
      </div>
    );
  }

  const ruta = rutaDocumento(d);
  const sinDocumento = d.tipo === 'sinDocumento';
  const motivo = ajustes.motivosDevolucion.find(m => m.id === d.motivoId)?.nombre ?? d.motivoId;
  const sucursal = ajustes.sucursales.find(s => s.id === d.sucursalId)?.nombre ?? d.sucursalId;
  const etiquetaDocumento = d.tipo === 'factura' ? 'Factura' : d.tipo === 'comprobante' ? 'Comprobante' : 'Documento';
  /** La Factura discrimina impuestos; Sin Documento solo si la nota los trae (las de ejemplo no); el Comprobante nunca. */
  const conImpuesto = d.tipo === 'factura' || (d.tipo === 'sinDocumento' && !!d.impuestoId);
  const resumen = resumirImpuestos(filas.map(f => ({ impuestoId: f.impuestoId ?? 'iva-19', tasa: f.tasaImpuesto ?? 0.19, valor: f.valorDevolucion })));
  const totalImpuestos = resumen.impuestos.reduce((s, i) => s + i.monto, 0);
  const total = filas.reduce((s, f) => s + f.valorDevolucion, 0);
  const discriminar = conImpuesto && totalImpuestos > 0;
  // Correo del cliente: el del contacto con ese nombre o, en las ventas de ejemplo, uno de ejemplo.
  const correoCliente = contactos.find(c => c.correo && d.clienteNombre && sinTildes(c.nombre) === sinTildes(d.clienteNombre))?.correo
    ?? Object.entries(CORREO_CLIENTES_EJEMPLO).find(([n]) => d.clienteNombre && sinTildes(n).startsWith(sinTildes(d.clienteNombre)))?.[1] ?? '';

  return (
    <div style={{ flex: 1, backgroundColor: 'transparent', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/items/devoluciones')} aria-label="Volver"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, border: '1px solid var(--blue-20)', backgroundColor: 'var(--black-0)', cursor: 'pointer', flexShrink: 0 }}>
            <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
          </button>
          <p style={{ ...font(20, 700, 'var(--black-100)', 28), margin: 0 }}>Devolución No. {d.numero}</p>
          <VentaBadge label={TIPO_DEVOLUCION_LABEL[d.tipo]} variant="info" />
          {d.alcance && <VentaBadge label={ALCANCE_DEVOLUCION_LABEL[d.alcance]} variant={d.alcance === 'total' ? 'warning' : 'info'} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button style={outlineBtn} onClick={() => imprimirDevolucion(filas, { sucursal, motivo })}>
            <Printer size={14} color="var(--blue-100)" /> Imprimir
          </button>
          <button style={outlineBtn} onClick={() => setEnviando(true)}>
            <Mail size={14} color="var(--blue-100)" /> Enviar por correo
          </button>
        </div>
      </div>

      {/* ── Información ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Información</p>
        {/* Todos los datos a medio ancho, en dos columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <div style={{ paddingRight: 32, borderRight: DIVIDER }}>
            <InfoRow label="Tipo de devolución">{TIPO_DEVOLUCION_LABEL[d.tipo]}</InfoRow>
            <InfoRow label={etiquetaDocumento}>
              {sinDocumento || !d.numeroDocumento ? VACIO : ruta ? <button style={linkBtn} onClick={() => navigate(ruta)}>{d.numeroDocumento}</button> : d.numeroDocumento}
            </InfoRow>
            {d.tipo !== 'comprobante' && (
              <InfoRow label="Nota crédito">
                {d.notaCredito ? <button style={linkBtn} onClick={() => navigate(`/notas-credito/${d.numero}`)}>{d.notaCredito}</button> : VACIO}
              </InfoRow>
            )}
            <InfoRow label="Sucursal">{sucursal}</InfoRow>
            <InfoRow label="Fecha de venta">{d.fechaVenta ? fmtFechaHora(d.fechaVenta) : VACIO}</InfoRow>
            <InfoRow label="Cliente">{clienteDeDevolucion(d)}</InfoRow>
            <InfoRow label="Alcance" last>{d.alcance ? ALCANCE_DEVOLUCION_LABEL[d.alcance] : VACIO}</InfoRow>
          </div>
          <div style={{ paddingLeft: 32 }}>
            <InfoRow label="Fecha de devolución">{fmtFechaHora(d.fecha)}</InfoRow>
            <InfoRow label="Responsable">{d.responsable}</InfoRow>
            <InfoRow label="Turno"><button style={linkBtn} onClick={() => navigate('/turnos')}>{d.turno}</button></InfoRow>
            <InfoRow label="Método de pago">{d.metodoPago}</InfoRow>
            <InfoRow label="Ingreso al inventario">{d.ingresaInventario ? 'Sí' : 'No'}</InfoRow>
            <InfoRow label="Motivo" last>{motivo}</InfoRow>
          </div>
        </div>
      </div>

      {/* ── Ítems devueltos (lista completa, siempre) ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Ítems devueltos</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Ítem', 'Cantidad vendida', 'Valor de venta', 'Cantidad devuelta', 'Valor devolución'].map((h, i) => <th key={h} style={{ ...tdHead, ...(i > 0 ? { textAlign: 'right' } : {}) }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, idx) => (
                <tr key={f.id} style={{ borderBottom: idx === filas.length - 1 ? 'none' : DIVIDER }}>
                  <td style={tdCell}>{f.nombre}</td>
                  <td style={{ ...tdCell, textAlign: 'right' }}>{f.cantidadVendida ?? VACIO}</td>
                  <td style={{ ...tdCell, textAlign: 'right' }}>{f.valorVentaLinea != null ? formatCOP(f.valorVentaLinea) : VACIO}</td>
                  <td style={{ ...tdCell, textAlign: 'right' }}>{f.cantidad}</td>
                  <td style={{ ...tdCell, textAlign: 'right' }}>{formatCOP(f.valorDevolucion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...font(13, 600, 'var(--black-100)', 18), margin: '12px 0 0' }}>Total ítems: {filas.reduce((s, f) => s + f.cantidad, 0)}</p>
      </div>

      {/* ── Justificación y Totales ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={sectionCard}>
          <p style={sectionTitle}>Justificación</p>
          <span style={{ ...font(13, 500, 'var(--black-100)', 20), whiteSpace: 'pre-wrap' }}>{d.justificacion}</span>
        </div>
        <div style={sectionCard}>
          <p style={sectionTitle}>Totales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {discriminar && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={font(13, 500, 'var(--black-60)', 20)}>Valor productos</span><span style={font(13, 600, 'var(--black-100)', 20)}>{formatCOP(resumen.subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={font(13, 500, 'var(--black-60)', 20)}>Impuestos</span><span style={font(13, 600, 'var(--black-100)', 20)}>{formatCOP(totalImpuestos)}</span></div>
              </>
            )}
            <div style={{ borderTop: discriminar ? '1.5px solid var(--black-10)' : 'none', paddingTop: discriminar ? 8 : 0, display: 'flex', justifyContent: 'space-between' }}>
              <span style={font(14, 700, 'var(--blue-100)', 22)}>Total</span>
              <span style={{ ...font(14, 700, 'var(--blue-100)', 22), textAlign: 'right' }}>{formatCOP(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {enviando && <EnviarCorreoDevolucionModal correoCliente={correoCliente} onVerEjemplo={para => setEjemplo(para)} onClose={() => setEnviando(false)} />}
      {ejemplo && <EjemploCorreoDevolucionModal filas={filas} para={ejemplo} sucursal={sucursal} motivo={motivo} onClose={() => setEjemplo(null)} />}
    </div>
  );
}
