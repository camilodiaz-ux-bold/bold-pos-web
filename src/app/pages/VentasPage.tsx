import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

type StatusVariant = 'success' | 'warning' | 'error';
type DianVariant = 'success' | 'warning' | 'neutral';

interface BadgeProps {
  label: string;
  variant: StatusVariant | DianVariant;
}

const ESTADO_STYLES: Record<StatusVariant, React.CSSProperties> = {
  success: { backgroundColor: 'var(--feedback-success-10)', color: 'var(--feedback-success-150)', border: '1px solid var(--feedback-success-100)' },
  warning: { backgroundColor: 'var(--feedback-warning-10)', color: 'var(--feedback-warning-200)', border: '1px solid var(--feedback-warning-100)' },
  error:   { backgroundColor: 'var(--feedback-error-10)',   color: 'var(--feedback-error-100)',   border: '1px solid var(--feedback-error-100)'   },
};

const DIAN_STYLES: Record<DianVariant, React.CSSProperties> = {
  success: { backgroundColor: 'var(--feedback-success-10)', color: 'var(--feedback-success-150)', border: '1px solid var(--feedback-success-100)' },
  warning: { backgroundColor: 'var(--feedback-warning-10)', color: 'var(--feedback-warning-200)', border: '1px solid var(--feedback-warning-100)' },
  neutral: {},
};

function StatusBadge({ label, variant }: { label: string; variant: StatusVariant }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 24, paddingLeft: 10, paddingRight: 10,
      borderRadius: 12, fontFamily: "'Montserrat', sans-serif",
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      ...ESTADO_STYLES[variant],
    }}>
      {label}
    </span>
  );
}

function DianBadge({ label, variant }: { label: string; variant: DianVariant }) {
  if (variant === 'neutral') {
    return (
      <span style={{
        fontFamily: "'Montserrat', sans-serif", fontSize: 13,
        fontWeight: 500, color: 'var(--black-60)',
      }}>
        {label}
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 24, paddingLeft: 10, paddingRight: 10,
      borderRadius: 12, fontFamily: "'Montserrat', sans-serif",
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      ...DIAN_STYLES[variant],
    }}>
      {label}
    </span>
  );
}

const rows = [
  { pedido: 'P-001', horaInicio: '25/03/2026 13:42', horaCierre: '25/03/2026 14:42', zona: 'Zona 1', mesa: 'Mesa 3',  usuario: 'Carlos Pérez',  total: '$85,000',  tipoDoc: 'Comprobante',         estado: { label: 'Pagado',    variant: 'success' as StatusVariant }, dian: { label: '---',      variant: 'neutral' as DianVariant } },
  { pedido: 'P-002', horaInicio: '25/03/2026 14:10', horaCierre: '25/03/2026 15:10', zona: 'Zona 1', mesa: 'Mesa 7',  usuario: 'Laura Gómez',   total: '$120,500', tipoDoc: 'Factura electrónica', estado: { label: 'Pagado',    variant: 'success' as StatusVariant }, dian: { label: 'Enviada',  variant: 'success' as DianVariant } },
  { pedido: 'P-003', horaInicio: '25/03/2026 14:55', horaCierre: '25/03/2026 15:55', zona: 'Zona 1', mesa: 'Mesa 1',  usuario: 'Miguel Torres', total: '$47,000',  tipoDoc: 'Factura electrónica', estado: { label: 'Abierto',   variant: 'warning' as StatusVariant }, dian: { label: 'Enviada',  variant: 'success' as DianVariant } },
  { pedido: 'P-004', horaInicio: '25/03/2026 15:30', horaCierre: '25/03/2026 16:30', zona: 'Zona 1', mesa: 'Mesa 5',  usuario: 'Ana Ruiz',      total: '$210,000', tipoDoc: 'Comprobante',         estado: { label: 'Pagado',    variant: 'success' as StatusVariant }, dian: { label: '---',      variant: 'neutral' as DianVariant } },
  { pedido: 'P-005', horaInicio: '25/03/2026 16:05', horaCierre: '25/03/2026 17:05', zona: 'Zona 2', mesa: 'Mesa 2',  usuario: 'Carlos Pérez',  total: '$65,500',  tipoDoc: 'Comprobante',         estado: { label: 'Cancelado', variant: 'error'   as StatusVariant }, dian: { label: '---',      variant: 'neutral' as DianVariant } },
  { pedido: 'P-006', horaInicio: '25/03/2026 16:48', horaCierre: '25/03/2026 17:48', zona: 'Zona 2', mesa: 'Mesa 9',  usuario: 'Laura Gómez',   total: '$95,000',  tipoDoc: 'Factura electrónica', estado: { label: 'Pagado',    variant: 'success' as StatusVariant }, dian: { label: 'Pendiente', variant: 'warning' as DianVariant } },
  { pedido: 'P-007', horaInicio: '25/03/2026 17:20', horaCierre: '25/03/2026 18:20', zona: 'Zona 2', mesa: 'Mesa 4',  usuario: 'Miguel Torres', total: '$158,000', tipoDoc: 'Comprobante',         estado: { label: 'Abierto',   variant: 'warning' as StatusVariant }, dian: { label: '---',      variant: 'neutral' as DianVariant } },
  { pedido: 'P-008', horaInicio: '25/03/2026 18:00', horaCierre: '25/03/2026 19:00', zona: 'Zona 2', mesa: 'Mesa 6',  usuario: 'Ana Ruiz',      total: '$73,500',  tipoDoc: 'Comprobante',         estado: { label: 'Pagado',    variant: 'success' as StatusVariant }, dian: { label: '---',      variant: 'neutral' as DianVariant } },
];

const columns = [
  { key: 'pedido',     label: 'No. Pedido',          width: '100px' },
  { key: 'horaInicio', label: 'Hora Inicio',         width: '160px' },
  { key: 'horaCierre', label: 'Hora Cierre',         width: '160px' },
  { key: 'zona',       label: 'Zona',                width: '80px'  },
  { key: 'mesa',       label: 'Mesa',                width: '80px'  },
  { key: 'usuario',    label: 'Usuario',             width: '140px' },
  { key: 'total',      label: 'Total',               width: '100px' },
  { key: 'tipoDoc',    label: 'Tipo de documento',   width: '170px' },
  { key: 'estado',     label: 'Estado',              width: '110px' },
  { key: 'dian',       label: 'Estado DIAN',         width: '110px' },
];

export function VentasPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      flex: 1,
      backgroundColor: 'var(--blue-10)',
      overflowY: 'auto',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>

      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--blue-20)',
            backgroundColor: '#fff',
            cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>

        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: 20,
          lineHeight: '28px',
          color: 'var(--black-100)',
          margin: 0,
        }}>
          Ventas
        </p>
      </div>

      {/* ── Tabla ── */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: '20px 20px 0 20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={{
                      width: col.width,
                      padding: '12px 16px 12px 0',
                      textAlign: 'left',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      lineHeight: '18px',
                      color: 'var(--black-100)',
                      borderBottom: '2px solid var(--black-10)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.pedido}
                  onClick={() => navigate(`/ventas/${row.pedido}`)}
                  style={{ borderBottom: idx === rows.length - 1 ? 'none' : '1px solid var(--black-10)', cursor: 'pointer' }}
                  className="hover:bg-[var(--blue-10)] transition-colors"
                >
                  <td style={tdStyle}>{row.pedido}</td>
                  <td style={tdStyle}>{row.horaInicio}</td>
                  <td style={tdStyle}>{row.horaCierre}</td>
                  <td style={tdStyle}>{row.zona}</td>
                  <td style={tdStyle}>{row.mesa}</td>
                  <td style={tdStyle}>{row.usuario}</td>
                  <td style={tdStyle}>{row.total}</td>
                  <td style={tdStyle}>{row.tipoDoc}</td>
                  <td style={tdStyle}><StatusBadge label={row.estado.label} variant={row.estado.variant} /></td>
                  <td style={tdStyle}><DianBadge label={row.dian.label} variant={row.dian.variant} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px 14px 0',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--black-100)',
  lineHeight: '18px',
};
