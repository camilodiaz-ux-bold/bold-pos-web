import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Printer, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { TipoDocVenta } from '../../../types/venta';
import { useVertical } from '../../../vertical';
import { useVentas } from '../../../store/ventasStore';
import { VentaBadge } from '../../../components/ventas/VentaBadge';
import { font, sectionCard, sectionTitle } from '../../../components/ventas/ventasStyles';
import { dianLabel, estadoLabel, fmtCOP, fmtFechaHora, metodoPagoLabel, saleFromVenta } from '../../../utils/ventas';
import { buildInvoiceData } from '../../../utils/invoice';
import { printInvoice } from '../../../utils/printInvoice';
import { comboBreakdown } from '../../../utils/comboBridge';
import { INVOICE_ISSUER } from '../../../data/invoiceIssuer';
import { DOC_CONFIG } from './documentosVenta';

// ─── Estilos locales (mismo patrón que PedidoDetallePage) ─────────────────────

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
  verticalAlign: 'top',
};

const DIVIDER = '1px solid var(--black-10)';

const outlineBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  height: 40, padding: '0 20px', borderRadius: 32,
  border: '1.5px solid var(--blue-100)', backgroundColor: 'var(--black-0)',
  cursor: 'pointer', ...font(14, 600, 'var(--blue-100)'),
};

function InfoRow({ label, children, last, title, wrap }: {
  label: string; children: React.ReactNode; last?: boolean; title?: string; wrap?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: wrap ? 'flex-start' : 'center', justifyContent: 'space-between',
      paddingTop: 10, paddingBottom: 10,
      borderBottom: last ? 'none' : DIVIDER,
      gap: 12,
    }}>
      <span style={{ ...font(14, 400, 'var(--black-60)'), flexShrink: 0 }}>{label}</span>
      <span title={title} style={{
        ...font(14, 600, 'var(--black-100)'), textAlign: 'right', minWidth: 0,
        ...(wrap
          ? { fontFamily: '"Courier New", Courier, monospace', fontSize: 12, wordBreak: 'break-all' as const }
          : { overflowWrap: 'anywhere' as const }),
      }}>
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

// ─── Página ───────────────────────────────────────────────────────────────────

export function DocumentoVentaDetallePage({ tipo }: { tipo: TipoDocVenta }) {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vertical } = useVertical();
  const { getVenta } = useVentas();
  const cfg = DOC_CONFIG[tipo];
  const esFactura = tipo === 'factura';
  const v = getVenta(id);

  if (!v || v.tipoDoc !== tipo) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
      }}>
        <p style={{ ...font(16, 600, 'var(--black-100)', 24), margin: 0 }}>Documento no encontrado</p>
        <button onClick={() => navigate(cfg.base)} style={outlineBtn}>
          <ArrowLeft size={14} color="var(--blue-100)" />
          Volver
        </button>
      </div>
    );
  }

  const est = estadoLabel(v.estado, vertical);
  const dn = esFactura ? dianLabel(v.dian, vertical) : null;
  const invoice = buildInvoiceData(saleFromVenta(v));
  const pagado = v.total - v.saldo;
  const totalItems = v.items.reduce((s, i) => s + i.quantity, 0);
  const ivaLabel = `IVA ${Math.round(v.taxRate * 100)}%`;

  const totales = [
    { label: 'Subtotal', value: fmtCOP(v.subtotal) },
    { label: 'Descuento', value: fmtCOP(v.discount) },
    ...(esFactura || v.tax > 0 ? [{ label: ivaLabel, value: fmtCOP(v.tax) }] : []),
  ];

  const reciboCols = ['Código', 'Estado', 'Total', ...(esFactura ? ['Saldo a favor'] : []), 'Método de pago', 'Fecha'];

  return (
    <div style={{
      flex: 1, backgroundColor: 'transparent', overflowY: 'auto',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(cfg.base)}
            aria-label="Volver"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--blue-20)', backgroundColor: 'var(--black-0)',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
          </button>
          <p style={{ ...font(20, 700, 'var(--black-100)', 28), margin: 0 }}>
            {cfg.singular} No. {v.numero}
          </p>
          <VentaBadge {...est} />
          {dn && <VentaBadge {...dn} />}
          {esFactura && <VentaBadge label={v.formaPago} variant="info" />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button style={outlineBtn} onClick={() => printInvoice(invoice)}>
            <Printer size={14} color="var(--blue-100)" />
            Imprimir
          </button>
          <button style={outlineBtn} onClick={() => toast.info(`Enviar ${cfg.singular.toLowerCase()}`)}>
            <Send size={14} color="var(--blue-100)" />
            Enviar
          </button>
          {esFactura && (
            <button style={outlineBtn} onClick={() => toast.info('Verificar en la DIAN')}>
              <ShieldCheck size={14} color="var(--blue-100)" />
              Verificar en la DIAN
            </button>
          )}
        </div>
      </div>

      {/* ── Información ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Información</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <div style={{ paddingRight: 32, borderRight: DIVIDER }}>
            <InfoRow label="Cliente">{v.cliente}</InfoRow>
            <InfoRow label="Sucursal">{v.sucursal}</InfoRow>
            <InfoRow label="Fecha de emisión">{fmtFechaHora(v.emitidaEn)}</InfoRow>
            <InfoRow label="Fecha de vencimiento">{fmtFechaHora(v.vencimiento)}</InfoRow>
            <InfoRow label="Método de pago" last>{metodoPagoLabel(v)}</InfoRow>
          </div>
          <div style={{ paddingLeft: 32 }}>
            <InfoRow label="Empresa">{INVOICE_ISSUER.razonSocial}</InfoRow>
            <InfoRow label="Emitido por">{v.emitidoPor}</InfoRow>
            <InfoRow label="Registrada en Turno No.">{v.turno}</InfoRow>
            <InfoRow label="Vendedor" last>{v.vendedor}</InfoRow>
          </div>
        </div>
        {esFactura && (
          <div style={{ borderTop: DIVIDER, marginTop: 4 }}>
            <InfoRow label="Resolución" title={v.resolucion}>{v.resolucion || '---'}</InfoRow>
            <InfoRow label="CUFE" title={v.cufe} wrap last>{v.cufe ?? '---'}</InfoRow>
          </div>
        )}
      </div>

      {/* ── Ítems ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Ítems</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Cantidad', 'Ítem', 'Precio unit.', 'Descuento', ...(esFactura ? ['Impuesto'] : []), 'Total'].map(h => (
                  <th key={h} style={tdHead}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {v.items.map((p, idx) => {
                const unit = p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
                const componentes = comboBreakdown(p);
                return (
                  <tr key={`${p.id}-${idx}`} style={{ borderBottom: idx === v.items.length - 1 ? 'none' : DIVIDER }}>
                    <td style={tdCell}>{p.quantity}</td>
                    <td style={tdCell}>
                      <span style={{ display: 'block' }}>
                        <span style={{ color: 'var(--blue-100)' }}>{invoice.lines[idx]?.code}</span>
                        {' - '}{p.name}
                      </span>
                      {componentes.length > 0 && (
                        <span style={{ display: 'block', ...font(11, 400, 'var(--black-60)', 16) }}>
                          {componentes.map(c => `${c.qty}× ${c.name}`).join(' · ')}
                        </span>
                      )}
                      {p.note && (
                        <span style={{ display: 'block', ...font(11, 400, 'var(--black-60)', 16), fontStyle: 'italic' }}>
                          {p.note}
                        </span>
                      )}
                    </td>
                    <td style={tdCell}>{fmtCOP(p.price)}</td>
                    <td style={tdCell}>{p.discount ? `${p.discount} %` : 'Ninguno'}</td>
                    {esFactura && <td style={tdCell}>{ivaLabel}</td>}
                    <td style={tdCell}>{fmtCOP(unit * p.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ ...font(13, 600, 'var(--black-100)', 18), margin: '12px 0 0' }}>Total ítems: {totalItems}</p>
      </div>

      {/* ── Notas y Totales ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={sectionCard}>
          <p style={sectionTitle}>Notas</p>
          {v.note
            ? <span style={{ ...font(13, 500, 'var(--black-100)', 20), whiteSpace: 'pre-wrap' }}>{v.note}</span>
            : <span style={font(13, 500, 'var(--black-60)', 20)}>Sin notas</span>}
        </div>

        <div style={sectionCard}>
          <p style={sectionTitle}>Totales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {totales.map(row => <AmountRow key={row.label} label={row.label} value={row.value} />)}
            <div style={{ borderTop: '1.5px solid var(--black-10)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={font(14, 700, 'var(--blue-100)', 22)}>Total</span>
              <span style={{ ...font(14, 700, 'var(--blue-100)', 22), textAlign: 'right' }}>{fmtCOP(v.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recibos ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Recibos</p>
        {v.pagos.length === 0 ? (
          <span style={font(13, 500, 'var(--black-60)', 20)}>Sin recibos registrados</span>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{reciboCols.map(h => <th key={h} style={tdHead}>{h}</th>)}</tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdCell}>{v.recibo}</td>
                  <td style={tdCell}><VentaBadge {...est} /></td>
                  <td style={tdCell}>{fmtCOP(pagado)}</td>
                  {esFactura && <td style={tdCell}>{fmtCOP(v.cambio)}</td>}
                  <td style={tdCell}>{metodoPagoLabel(v)}</td>
                  <td style={tdCell}>{fmtFechaHora(v.emitidaEn)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
