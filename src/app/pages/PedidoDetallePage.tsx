import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Printer, Send } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type EstadoVariant = 'success' | 'warning' | 'error';
type DianVariant   = 'success' | 'warning' | 'neutral';

interface Pedido {
  id:          string;
  estado:      { label: string; variant: EstadoVariant };
  noDoc:       string;
  tipoDoc:     string;
  resolucion:  string;
  mesa:        string;
  zona:        string;
  sucursal:    string;
  personas:    string;
  horaApertura: string;
  horaCierre:  string;
  duracion:    string;
  vendedor:    string;
  cliente:     string;
  formaPago:   string;
  dian?:       { label: string; variant: DianVariant };
  efectivo?:   { recibido: string; cambio: string };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const RES = 'Resolution test SP - Resolution 1234509752467';

const PEDIDOS: Record<string, Pedido> = {
  'P-001': {
    id: 'P-001',
    estado:      { label: 'Pagado',    variant: 'success' },
    noDoc:       'V-001234',
    tipoDoc:     'Comprobante',
    resolucion:  RES,
    mesa:        'Mesa 3',
    zona:        'Zona 1',
    sucursal:    'Principal',
    personas:    '2 personas',
    horaApertura:'25/03/2026 13:42',
    horaCierre:  '25/03/2026 14:42',
    duracion:    '1h 00min',
    vendedor:    'Carlos Pérez',
    cliente:     'Consumidor final',
    formaPago:   'Efectivo',
    efectivo:    { recibido: '$600,000', cambio: '$3,096' },
  },
  'P-003': {
    id: 'P-003',
    estado:      { label: 'Abierto',   variant: 'warning' },
    noDoc:       'V-001236',
    tipoDoc:     'Factura electrónica',
    resolucion:  RES,
    mesa:        'Mesa 1',
    zona:        'Zona 1',
    sucursal:    'Principal',
    personas:    '4 personas',
    horaApertura:'25/03/2026 14:55',
    horaCierre:  '---',
    duracion:    '---',
    vendedor:    'Miguel Torres',
    cliente:     'Juan García NIT 900123456',
    formaPago:   'Tarjeta',
    dian:        { label: 'Enviada', variant: 'success' },
  },
  'P-005': {
    id: 'P-005',
    estado:      { label: 'Cancelado', variant: 'error' },
    noDoc:       'V-001238',
    tipoDoc:     'Comprobante',
    resolucion:  RES,
    mesa:        'Mesa 2',
    zona:        'Zona 2',
    sucursal:    'Principal',
    personas:    '3 personas',
    horaApertura:'25/03/2026 16:05',
    horaCierre:  '25/03/2026 17:05',
    duracion:    '1h 00min',
    vendedor:    'Carlos Pérez',
    cliente:     'Consumidor final',
    formaPago:   'Nequi',
  },
};

const FALLBACK = PEDIDOS['P-001'];

// ─── Products ─────────────────────────────────────────────────────────────────

const PRODUCTOS = [
  { nombre: 'Salmón Escocés', nota: '',            cantidad: 2, precioUnit: '$152,000', descuento: '---', total: '$304,000' },
  { nombre: 'Burrata Ahumada', nota: 'Sin lactosa', cantidad: 1, precioUnit: '$88,000',  descuento: '---', total: '$88,000'  },
  { nombre: 'Agua de Piedra',  nota: '',            cantidad: 2, precioUnit: '$32,000',  descuento: '---', total: '$64,000'  },
];

// ─── Design tokens (MERLIn) ───────────────────────────────────────────────────

const C = {
  blue100:  '#121E6C',
  blue20:   '#D2D4E1',
  blue10:   '#F1F2F6',
  black100: '#1E1E1E',
  black60:  '#606060',
  black10:  '#F3F3F3',
  white:    '#FFFFFF',
  bgPage:   '#F7F8FB',
  coral100: '#FF2947',
  successBg:   '#F4FDF9',
  successBorder:'#1B8959',
  successText: '#1B8959',
  warningBg:   '#FFF3D1',
  warningBorder:'#FFC217',
  warningText: '#5B3100',
  errorBg:     '#FBF3F5',
  errorBorder: '#910022',
  errorText:   '#910022',
};

const ESTADO_STYLES: Record<EstadoVariant, React.CSSProperties> = {
  success: { backgroundColor: C.successBg,  color: C.successText,  border: `1px solid ${C.successBorder}` },
  warning: { backgroundColor: C.warningBg,  color: C.warningText,  border: `1px solid ${C.warningBorder}` },
  error:   { backgroundColor: C.errorBg,    color: C.errorText,    border: `1px solid ${C.errorBorder}`   },
};

const DIAN_STYLES: Record<DianVariant, React.CSSProperties> = {
  success: { backgroundColor: C.successBg, color: C.successText, border: `1px solid ${C.successBorder}` },
  warning: { backgroundColor: C.warningBg, color: C.warningText, border: `1px solid ${C.warningBorder}` },
  neutral: {},
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const font = (size: number, weight: number, color: string, lineHeight?: number): React.CSSProperties => ({
  fontFamily: "'Montserrat', sans-serif",
  fontSize: size,
  fontWeight: weight,
  color,
  ...(lineHeight ? { lineHeight: `${lineHeight}px` } : {}),
});

const sectionCard: React.CSSProperties = {
  backgroundColor: C.white,
  borderRadius: 16,
  padding: '20px 24px',
};

const sectionTitle: React.CSSProperties = {
  ...font(13, 700, C.black100, 18),
  margin: '0 0 16px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const infoLabel: React.CSSProperties = { ...font(12, 600, C.blue100, 16), margin: '0 0 2px' };
const infoValue: React.CSSProperties = { ...font(13, 500, C.black100, 20), margin: 0 };

const tdHead: React.CSSProperties = {
  padding: '10px 16px 10px 0',
  textAlign: 'left',
  ...font(12, 700, C.black100, 18),
  borderBottom: `2px solid ${C.black10}`,
  whiteSpace: 'nowrap',
};

const tdCell: React.CSSProperties = {
  padding: '12px 16px 12px 0',
  ...font(13, 500, C.black100, 18),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function EstadoBadge({ label, variant }: { label: string; variant: EstadoVariant }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 24, paddingLeft: 10, paddingRight: 10,
      borderRadius: 100, ...font(12, 600, ''),
      whiteSpace: 'nowrap',
      ...ESTADO_STYLES[variant],
    }}>
      {label}
    </span>
  );
}

function DianBadge({ label, variant }: { label: string; variant: DianVariant }) {
  if (variant === 'neutral') {
    return <span style={font(13, 500, C.black60)}>{label}</span>;
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 24, paddingLeft: 10, paddingRight: 10,
      borderRadius: 100, ...font(12, 600, ''),
      whiteSpace: 'nowrap',
      ...DIAN_STYLES[variant],
    }}>
      {label}
    </span>
  );
}

function InfoRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: 10, paddingBottom: 10,
      borderBottom: last ? 'none' : '1px solid #F0F1F5',
      gap: 12,
    }}>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 400, color: '#606060', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 600, color: '#1E1E1E', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PedidoDetallePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pedido = PEDIDOS[id] ?? FALLBACK;
  const isAbierto   = pedido.estado.variant === 'warning';
  const isEfectivo  = pedido.formaPago === 'Efectivo';
  const showDian    = pedido.tipoDoc === 'Factura electrónica';

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
              border: `1px solid ${C.blue20}`,
              backgroundColor: C.white,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color={C.blue100} strokeWidth={1.8} />
          </button>

          <p style={{ ...font(20, 700, C.black100, 28), margin: 0 }}>
            Pedido No. {pedido.id}
          </p>

          <EstadoBadge label={pedido.estado.label} variant={pedido.estado.variant} />
        </div>

        {isAbierto ? (
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 40, padding: '0 20px', borderRadius: 32,
            border: `1.5px solid ${C.blue100}`, backgroundColor: C.white,
            cursor: 'pointer', ...font(14, 600, C.blue100),
          }}>
            <Send size={14} color={C.blue100} />
            Reenviar comanda
          </button>
        ) : (
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 40, padding: '0 20px', borderRadius: 32,
            border: `1.5px solid ${C.blue100}`, backgroundColor: C.white,
            cursor: 'pointer', ...font(14, 600, C.blue100),
          }}>
            <Printer size={14} color={C.blue100} />
            Imprimir recibo
          </button>
        )}
      </div>

      {/* ── Section 1: Información general ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Información general</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ paddingRight: 32, borderRight: '1px solid #F0F1F5' }}>
            <InfoRow label="No. Documento">{pedido.noDoc}</InfoRow>
            <InfoRow label="Tipo de documento">{pedido.tipoDoc}</InfoRow>
            <InfoRow label="Resolución">{pedido.resolucion}</InfoRow>
            <InfoRow label="Mesa">{pedido.mesa}</InfoRow>
            <InfoRow label="Zona" last>{pedido.zona}</InfoRow>
          </div>
          <div style={{ paddingLeft: 32 }}>
            <InfoRow label="Sucursal">{pedido.sucursal}</InfoRow>
            <InfoRow label="Personas en mesa">{pedido.personas}</InfoRow>
            <InfoRow label="Hora apertura">{pedido.horaApertura}</InfoRow>
            <InfoRow label="Hora cierre">{pedido.horaCierre}</InfoRow>
            <InfoRow label="Duración" last>{pedido.duracion}</InfoRow>
          </div>
        </div>
      </div>

      {/* ── Section 1b: Participantes y pago ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Participantes y pago</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ paddingRight: 32, borderRight: '1px solid #F0F1F5' }}>
            <InfoRow label="Vendedor">{pedido.vendedor}</InfoRow>
            <InfoRow label="Cliente" last>{pedido.cliente}</InfoRow>
          </div>
          <div style={{ paddingLeft: 32 }}>
            <InfoRow label="Forma de pago">{pedido.formaPago}</InfoRow>
            <InfoRow label="Estado" last={!showDian || !pedido.dian}>
              <EstadoBadge label={pedido.estado.label} variant={pedido.estado.variant} />
            </InfoRow>
            {showDian && pedido.dian && (
              <InfoRow label="Estado DIAN" last>
                <DianBadge label={pedido.dian.label} variant={pedido.dian.variant} />
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
              {PRODUCTOS.map((p, idx) => (
                <tr
                  key={p.nombre}
                  style={{ borderBottom: idx === PRODUCTOS.length - 1 ? 'none' : `1px solid ${C.black10}` }}
                >
                  <td style={tdCell}>
                    <span style={{ display: 'block' }}>{p.nombre}</span>
                    {p.nota && (
                      <span style={{ ...font(11, 400, C.black60, 16), fontStyle: 'italic' }}>
                        {p.nota}
                      </span>
                    )}
                  </td>
                  <td style={tdCell}>{p.cantidad}</td>
                  <td style={tdCell}>{p.precioUnit}</td>
                  <td style={tdCell}>{p.descuento}</td>
                  <td style={tdCell}>{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sections 3 + 4: Método de pago & Totales side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Section 3: Método de pago */}
        <div style={sectionCard}>
          <p style={sectionTitle}>Método de pago</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={font(13, 500, C.black60, 20)}>{pedido.formaPago}</span>
              <span style={{ ...font(13, 600, C.black100, 20), textAlign: 'right' }}>$596,904</span>
            </div>
            {isEfectivo && pedido.efectivo && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={font(13, 500, C.black60, 20)}>Monto recibido</span>
                  <span style={{ ...font(13, 600, C.black100, 20), textAlign: 'right' }}>{pedido.efectivo.recibido}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={font(13, 500, C.black60, 20)}>Cambio</span>
                  <span style={{ ...font(13, 600, C.black100, 20), textAlign: 'right' }}>{pedido.efectivo.cambio}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Totales */}
        <div style={sectionCard}>
          <p style={sectionTitle}>Totales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Subtotal',    value: '$456,000' },
              { label: 'Descuento',   value: '$0'       },
              { label: 'IVA 19%',     value: '$86,640'  },
              { label: 'Propina 10%', value: '$54,264'  },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={font(13, 500, C.black60, 20)}>{row.label}</span>
                <span style={{ ...font(13, 600, C.black100, 20), textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderTop: `1.5px solid ${C.black10}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={font(14, 700, C.blue100, 22)}>Total</span>
              <span style={{ ...font(14, 700, C.blue100, 22), textAlign: 'right' }}>$596,904</span>
            </div>
          </div>
        </div>

      </div>{/* end grid */}

    </div>
  );
}
