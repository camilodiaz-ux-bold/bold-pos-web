import React from 'react';
import { Navigate, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Printer, Send } from 'lucide-react';
import { useVertical } from '../vertical';
import { useVentas } from '../store/ventasStore';
import { VentaBadge } from '../components/ventas/VentaBadge';
import { font, sectionCard, sectionTitle } from '../components/ventas/ventasStyles';
import { dianLabel, estadoLabel, fmtCOP, fmtFechaHora, saleFromVenta, tipoDocLabel } from '../utils/ventas';
import { buildInvoiceData } from '../utils/invoice';
import { printInvoice } from '../utils/printInvoice';
import { comboBreakdown } from '../utils/comboBridge';
import type { Venta } from '../types/venta';

// ─── Shared styles ────────────────────────────────────────────────────────────

const tdHead: React.CSSProperties = {
  padding: '10px 16px 10px 0',
  textAlign: 'left',
  ...font(12, 700, 'var(--black-100)', 18),
  borderBottom: '2px solid var(--black-10)',
  whiteSpace: 'nowrap',
};

const tdCell: React.CSSProperties = {
  padding: '12px 16px 12px 0',
  ...font(13, 500, 'var(--black-100)', 18),
};

const DIVIDER = '1px solid var(--black-10)';

const outlineBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  height: 40, padding: '0 20px', borderRadius: 32,
  border: '1.5px solid var(--blue-100)', backgroundColor: 'var(--black-0)',
  cursor: 'pointer', ...font(14, 600, 'var(--blue-100)'),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, children, last, title }: { label: string; children: React.ReactNode; last?: boolean; title?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: 10, paddingBottom: 10,
      borderBottom: last ? 'none' : DIVIDER,
      gap: 12,
    }}>
      <span style={{ ...font(14, 400, 'var(--black-60)'), flexShrink: 0 }}>
        {label}
      </span>
      <span title={title} style={{ ...font(14, 600, 'var(--black-100)'), textAlign: 'right', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={font(13, 500, 'var(--black-60)', 20)}>{label}</span>
      <span style={{ ...font(13, 600, 'var(--black-100)', 20), textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function fmtDuracion(v: Venta): string {
  if (v.abiertaEn === undefined || v.estado === 'abierta') return '---';
  const min = Math.max(0, Math.round((v.emitidaEn - v.abiertaEn) / 60000));
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return `${h}h ${String(m).padStart(2, '0')}min`;
}

/** Pagos agrupados por persona (pago dividido). */
function pagosPorPersona(v: Venta): { persona: string; detalle: string }[] {
  const grupos = new Map<string, string[]>();
  v.pagos.forEach(p => {
    const k = p.persona ?? '';
    grupos.set(k, [...(grupos.get(k) ?? []), `${p.method} ${fmtCOP(p.amount)}`]);
  });
  return Array.from(grupos, ([persona, partes]) => ({ persona, detalle: partes.join(' + ') }));
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PedidoDetallePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { has, vertical } = useVertical();
  const { getVenta } = useVentas();
  const v = getVenta(id);

  // Ventas es exclusivo de Restaurantes: Retail usa Comprobantes / Facturas de Venta.
  if (!has('ventas')) return <Navigate to="/comprobantes" replace />;

  if (!v) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
      }}>
        <p style={{ ...font(16, 600, 'var(--black-100)', 24), margin: 0 }}>Venta no encontrada</p>
        <button onClick={() => navigate('/ventas')} style={outlineBtn}>
          <ArrowLeft size={14} color="var(--blue-100)" />
          Volver
        </button>
      </div>
    );
  }

  const est = estadoLabel(v.estado, vertical);
  const dn = dianLabel(v.dian, vertical);
  const isAbierto = v.estado === 'abierta';
  const showDian = v.tipoDoc === 'factura' && !!dn;
  const sinPagos = v.pagos.length === 0;
  const porPersona = v.pagos.some(p => p.persona);
  const metodos = Array.from(new Set(v.pagos.map(p => p.method)));
  const efectivoConCambio = v.pagos.length === 1 && v.pagos[0].method === 'Efectivo' && v.cambio > 0;

  const totales = [
    { label: 'Subtotal', value: fmtCOP(v.subtotal) },
    { label: 'Descuento', value: fmtCOP(v.discount) },
    { label: `IVA ${Math.round(v.taxRate * 100)}%`, value: fmtCOP(v.tax) },
    ...(v.tip > 0 ? [{ label: 'Propina', value: fmtCOP(v.tip) }] : []),
  ];

  return (
    <div style={{
      flex: 1,
      backgroundColor: 'transparent',
      overflowY: 'auto',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--blue-20)',
              backgroundColor: 'var(--black-0)',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
          </button>

          <p style={{ ...font(20, 700, 'var(--black-100)', 28), margin: 0 }}>
            Orden No. {v.numero}
          </p>

          <VentaBadge {...est} />
        </div>

        {isAbierto ? (
          <button style={outlineBtn}>
            <Send size={14} color="var(--blue-100)" />
            Reenviar comanda
          </button>
        ) : (
          <button style={outlineBtn} onClick={() => printInvoice(buildInvoiceData(saleFromVenta(v)))}>
            <Printer size={14} color="var(--blue-100)" />
            Imprimir Factura Electronica
          </button>
        )}
      </div>

      {/* ── Section 1: Información general ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Información general</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <div style={{ paddingRight: 32, borderRight: DIVIDER }}>
            <InfoRow label="No. Documento">{v.numeroDocumento ?? '---'}</InfoRow>
            <InfoRow label="Tipo de documento">{tipoDocLabel(v)}</InfoRow>
            <InfoRow label="Resolución">{v.resolucion || '---'}</InfoRow>
            <InfoRow label="CUFE" title={v.cufe}>{v.cufe ?? '---'}</InfoRow>
            <InfoRow label="Mesa">{v.mesa ?? '---'}</InfoRow>
            <InfoRow label="Zona" last>{v.zona ?? '---'}</InfoRow>
          </div>
          <div style={{ paddingLeft: 32 }}>
            <InfoRow label="Sucursal">{v.sucursal}</InfoRow>
            <InfoRow label="Personas en mesa">{v.personas !== undefined ? `${v.personas} ${v.personas === 1 ? 'persona' : 'personas'}` : '---'}</InfoRow>
            <InfoRow label="Hora apertura">{v.abiertaEn !== undefined ? fmtFechaHora(v.abiertaEn) : '---'}</InfoRow>
            <InfoRow label="Hora cierre">{isAbierto ? '---' : fmtFechaHora(v.emitidaEn)}</InfoRow>
            <InfoRow label="Duración" last>{fmtDuracion(v)}</InfoRow>
          </div>
        </div>
      </div>

      {/* ── Section 1b: Participantes y pago ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Participantes y pago</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <div style={{ paddingRight: 32, borderRight: DIVIDER }}>
            <InfoRow label="Vendedor">{v.vendedor}</InfoRow>
            <InfoRow label="Cliente" last>{v.cliente}</InfoRow>
          </div>
          <div style={{ paddingLeft: 32 }}>
            <InfoRow label="Emitido Por">{v.emitidoPor}</InfoRow>
            <InfoRow label="Estado" last={!showDian}>
              <VentaBadge {...est} />
            </InfoRow>
            {showDian && dn && (
              <InfoRow label="Estado DIAN" last>
                <VentaBadge {...dn} />
              </InfoRow>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: Productos ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Productos</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Producto', 'Cantidad', 'Precio unit.', 'Descuento', 'Total'].map(h => (
                  <th key={h} style={tdHead}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {v.items.map((p, idx) => {
                const unit = p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
                const componentes = comboBreakdown(p);
                return (
                  <tr
                    key={`${p.id}-${idx}`}
                    style={{ borderBottom: idx === v.items.length - 1 ? 'none' : '1px solid var(--black-10)' }}
                  >
                    <td style={tdCell}>
                      <span style={{ display: 'block' }}>{p.name}</span>
                      {componentes.length > 0 && (
                        <span style={{ display: 'block', ...font(11, 400, 'var(--black-60)', 16) }}>
                          {componentes.map(c => `${c.qty}× ${c.name}`).join(' · ')}
                        </span>
                      )}
                      {p.note && (
                        <span style={{ ...font(11, 400, 'var(--black-60)', 16), fontStyle: 'italic' }}>
                          {p.note}
                        </span>
                      )}
                    </td>
                    <td style={tdCell}>{p.quantity}</td>
                    <td style={tdCell}>{fmtCOP(p.price)}</td>
                    <td style={tdCell}>{p.discount ? `${p.discount}%` : '---'}</td>
                    <td style={tdCell}>{fmtCOP(unit * p.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sections 3 + 4: Método de pago & Totales side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Section 3: Método de pago */}
        <div style={sectionCard}>
          <p style={sectionTitle}>Método de pago</p>

          {sinPagos ? (
            <span style={font(13, 500, 'var(--black-60)', 20)}>Pago no realizado</span>

          ) : porPersona ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pagosPorPersona(v).map((p, idx, arr) => (
                <div key={p.persona} style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                  paddingTop: 10, paddingBottom: 10,
                  borderBottom: idx === arr.length - 1 ? 'none' : DIVIDER,
                }}>
                  <div>
                    <span style={{ display: 'block', ...font(13, 600, 'var(--black-100)', 20) }}>{p.persona}</span>
                    <span style={{ display: 'block', ...font(12, 400, 'var(--black-60)', 18) }}>{p.detalle}</span>
                  </div>
                  <VentaBadge label="Pagada" variant="success" />
                </div>
              ))}
              <div style={{ borderTop: '1.5px solid var(--black-10)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={font(14, 700, 'var(--blue-100)', 22)}>Total</span>
                <span style={{ ...font(14, 700, 'var(--blue-100)', 22), textAlign: 'right' }}>{fmtCOP(v.total)}</span>
              </div>
            </div>

          ) : v.pagos.length > 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {v.pagos.map((p, i) => (
                <AmountRow key={`${p.method}-${i}`} label={p.method} value={fmtCOP(p.amount)} />
              ))}
            </div>

          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AmountRow label={metodos[0]} value={fmtCOP(v.total)} />
              {efectivoConCambio && (
                <>
                  <AmountRow label="Monto recibido" value={fmtCOP(v.total + v.cambio)} />
                  <AmountRow label="Cambio" value={fmtCOP(v.cambio)} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Section 4: Totales */}
        <div style={sectionCard}>
          <p style={sectionTitle}>Totales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {totales.map(row => (
              <AmountRow key={row.label} label={row.label} value={row.value} />
            ))}
            <div style={{ borderTop: '1.5px solid var(--black-10)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={font(14, 700, 'var(--blue-100)', 22)}>Total</span>
              <span style={{ ...font(14, 700, 'var(--blue-100)', 22), textAlign: 'right' }}>{fmtCOP(v.total)}</span>
            </div>
          </div>
        </div>

      </div>{/* end grid */}

    </div>
  );
}
