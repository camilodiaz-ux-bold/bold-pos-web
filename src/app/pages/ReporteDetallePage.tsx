/**
 * ReporteDetallePage — /reportes/restaurantes/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Página de detalle para los reportes de la categoría Restaurantes.
 * Estilos alineados con el diseño Figma POS-WEB-2.0 (nodo 12636-51140).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, RefreshCw, X, ChevronDown, Search } from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface Column {
  key: string;
  label: string;
  width?: string;
}

interface RowData {
  [key: string]: string | { label: string; variant: StatusVariant };
}

interface ReportConfig {
  title: string;
  columns: Column[];
  rows: RowData[];
  statusOptions: string[];
  meseroOptions: string[];
}

// ─── Estilos de badges ────────────────────────────────────────────────────────

const BADGE_STYLES: Record<StatusVariant, React.CSSProperties> = {
  success: { backgroundColor: 'var(--feedback-success-10)', color: 'var(--feedback-success-150)', border: '1px solid var(--feedback-success-100)' },
  warning: { backgroundColor: 'var(--feedback-warning-10)', color: 'var(--feedback-warning-200)', border: '1px solid var(--feedback-warning-100)' },
  error:   { backgroundColor: 'var(--feedback-error-10)',   color: 'var(--feedback-error-100)',   border: '1px solid var(--feedback-error-100)'   },
  info:    { backgroundColor: 'var(--feedback-informative-10)', color: 'var(--feedback-informative-150)', border: '1px solid var(--feedback-informative-100)' },
  neutral: { backgroundColor: 'var(--black-10)', color: 'var(--black-60)', border: '1px solid var(--blue-20)' },
};

// ─── Datos mock por reporte ───────────────────────────────────────────────────

const MESEROS = ['Carlos Pérez', 'Laura Gómez', 'Miguel Torres', 'Ana Ruiz'];

const CONFIGS: Record<string, ReportConfig> = {
  'rest-ventas': {
    title: 'Ventas',
    statusOptions: ['Todos', 'Pagada', 'Pendiente', 'Cancelada'],
    meseroOptions: ['Todos', ...MESEROS],
    columns: [
      { key: 'comprobante', label: 'No. Comprobante', width: '140px' },
      { key: 'mesa',        label: 'Mesa',            width: '80px'  },
      { key: 'mesero',      label: 'Mesero',          width: '160px' },
      { key: 'formaPago',   label: 'Forma de pago',   width: '130px' },
      { key: 'fecha',       label: 'Fecha',           width: '160px' },
      { key: 'total',       label: 'Valor total',     width: '120px' },
      { key: 'estado',      label: 'Estado',          width: '110px' },
    ],
    rows: [
      { comprobante: 'V-001234', mesa: 'Mesa 3',  mesero: 'Carlos Pérez',  formaPago: 'Efectivo',   fecha: '25/03/2026 – 13:42', total: '$85,000',  estado: { label: 'Pagada',    variant: 'success' } },
      { comprobante: 'V-001235', mesa: 'Mesa 7',  mesero: 'Laura Gómez',   formaPago: 'Tarjeta',    fecha: '25/03/2026 – 14:10', total: '$120,500', estado: { label: 'Pagada',    variant: 'success' } },
      { comprobante: 'V-001236', mesa: 'Mesa 1',  mesero: 'Miguel Torres', formaPago: 'Tarjeta',    fecha: '25/03/2026 – 14:55', total: '$47,000',  estado: { label: 'Pendiente', variant: 'warning' } },
      { comprobante: 'V-001237', mesa: 'Mesa 5',  mesero: 'Ana Ruiz',      formaPago: 'Efectivo',   fecha: '25/03/2026 – 15:30', total: '$210,000', estado: { label: 'Pagada',    variant: 'success' } },
      { comprobante: 'V-001238', mesa: 'Mesa 2',  mesero: 'Carlos Pérez',  formaPago: 'Nequi',      fecha: '25/03/2026 – 16:05', total: '$65,500',  estado: { label: 'Cancelada', variant: 'error'   } },
      { comprobante: 'V-001239', mesa: 'Mesa 9',  mesero: 'Laura Gómez',   formaPago: 'Tarjeta',    fecha: '25/03/2026 – 16:48', total: '$95,000',  estado: { label: 'Pagada',    variant: 'success' } },
      { comprobante: 'V-001240', mesa: 'Mesa 4',  mesero: 'Miguel Torres', formaPago: 'Efectivo',   fecha: '25/03/2026 – 17:20', total: '$158,000', estado: { label: 'Pendiente', variant: 'warning' } },
      { comprobante: 'V-001241', mesa: 'Mesa 6',  mesero: 'Ana Ruiz',      formaPago: 'Daviplata',  fecha: '25/03/2026 – 18:00', total: '$73,500',  estado: { label: 'Pagada',    variant: 'success' } },
    ],
  },

  'rest-ocupacion': {
    title: 'Ocupación y Tiempos',
    statusOptions: ['Todos', 'Completada', 'Activa'],
    meseroOptions: ['Todos', ...MESEROS],
    columns: [
      { key: 'mesa',      label: 'Mesa',      width: '90px'  },
      { key: 'apertura',  label: 'Apertura',  width: '160px' },
      { key: 'cierre',    label: 'Cierre',    width: '160px' },
      { key: 'duracion',  label: 'Duración',  width: '100px' },
      { key: 'cubiertos', label: 'Cubiertos', width: '100px' },
      { key: 'mesero',    label: 'Mesero',    width: '160px' },
      { key: 'estado',    label: 'Estado',    width: '110px' },
    ],
    rows: [
      { mesa: 'Mesa 1',  apertura: '25/03/2026 – 12:00', cierre: '25/03/2026 – 13:45', duracion: '1h 45m', cubiertos: '4', mesero: 'Carlos Pérez',  estado: { label: 'Completada', variant: 'success' } },
      { mesa: 'Mesa 2',  apertura: '25/03/2026 – 12:30', cierre: '25/03/2026 – 14:10', duracion: '1h 40m', cubiertos: '2', mesero: 'Laura Gómez',   estado: { label: 'Completada', variant: 'success' } },
      { mesa: 'Mesa 3',  apertura: '25/03/2026 – 13:00', cierre: '—',                  duracion: '1h 12m', cubiertos: '6', mesero: 'Miguel Torres', estado: { label: 'Activa',     variant: 'info'    } },
      { mesa: 'Mesa 5',  apertura: '25/03/2026 – 13:15', cierre: '25/03/2026 – 15:00', duracion: '1h 45m', cubiertos: '3', mesero: 'Ana Ruiz',      estado: { label: 'Completada', variant: 'success' } },
      { mesa: 'Mesa 7',  apertura: '25/03/2026 – 14:00', cierre: '—',                  duracion: '0h 52m', cubiertos: '5', mesero: 'Carlos Pérez',  estado: { label: 'Activa',     variant: 'info'    } },
      { mesa: 'Mesa 9',  apertura: '25/03/2026 – 14:30', cierre: '25/03/2026 – 16:00', duracion: '1h 30m', cubiertos: '2', mesero: 'Laura Gómez',   estado: { label: 'Completada', variant: 'success' } },
      { mesa: 'Mesa 4',  apertura: '25/03/2026 – 15:00', cierre: '25/03/2026 – 17:20', duracion: '2h 20m', cubiertos: '8', mesero: 'Ana Ruiz',      estado: { label: 'Completada', variant: 'success' } },
    ],
  },

  'rest-propinas': {
    title: 'Propinas y Recaudo',
    statusOptions: ['Todos', 'Recaudada', 'Pendiente'],
    meseroOptions: ['Todos', ...MESEROS],
    columns: [
      { key: 'comprobante', label: 'No. Comprobante', width: '140px' },
      { key: 'mesero',      label: 'Mesero',          width: '160px' },
      { key: 'formaPago',   label: 'Forma de pago',   width: '130px' },
      { key: 'fecha',       label: 'Fecha',           width: '160px' },
      { key: 'propina',     label: 'Propina',         width: '110px' },
      { key: 'total',       label: 'Total venta',     width: '120px' },
      { key: 'estado',      label: 'Estado',          width: '110px' },
    ],
    rows: [
      { comprobante: 'V-001234', mesero: 'Carlos Pérez',  formaPago: 'Efectivo',  fecha: '25/03/2026 – 13:42', propina: '$8,500',  total: '$85,000',  estado: { label: 'Recaudada', variant: 'success' } },
      { comprobante: 'V-001235', mesero: 'Laura Gómez',   formaPago: 'Tarjeta',   fecha: '25/03/2026 – 14:10', propina: '$12,000', total: '$120,500', estado: { label: 'Recaudada', variant: 'success' } },
      { comprobante: 'V-001236', mesero: 'Miguel Torres', formaPago: 'Tarjeta',   fecha: '25/03/2026 – 14:55', propina: '$0',      total: '$47,000',  estado: { label: 'Pendiente', variant: 'warning' } },
      { comprobante: 'V-001237', mesero: 'Ana Ruiz',      formaPago: 'Efectivo',  fecha: '25/03/2026 – 15:30', propina: '$21,000', total: '$210,000', estado: { label: 'Recaudada', variant: 'success' } },
      { comprobante: 'V-001239', mesero: 'Laura Gómez',   formaPago: 'Tarjeta',   fecha: '25/03/2026 – 16:48', propina: '$9,500',  total: '$95,000',  estado: { label: 'Recaudada', variant: 'success' } },
      { comprobante: 'V-001240', mesero: 'Miguel Torres', formaPago: 'Efectivo',  fecha: '25/03/2026 – 17:20', propina: '$0',      total: '$158,000', estado: { label: 'Pendiente', variant: 'warning' } },
      { comprobante: 'V-001241', mesero: 'Ana Ruiz',      formaPago: 'Daviplata', fecha: '25/03/2026 – 18:00', propina: '$7,000',  total: '$73,500',  estado: { label: 'Recaudada', variant: 'success' } },
    ],
  },

  'rest-propinas-turno': {
    title: 'Propinas en Turnos',
    statusOptions: ['Todos', 'Cerrado', 'Abierto'],
    meseroOptions: ['Todos', ...MESEROS],
    columns: [
      { key: 'turno',    label: 'Turno',        width: '80px'  },
      { key: 'apertura', label: 'Apertura',     width: '160px' },
      { key: 'cierre',   label: 'Cierre',       width: '160px' },
      { key: 'mesero',   label: 'Mesero',       width: '160px' },
      { key: 'mesas',    label: 'No. Mesas',    width: '100px' },
      { key: 'propinas', label: 'Total propinas', width: '130px' },
      { key: 'total',    label: 'Total venta',  width: '120px' },
      { key: 'estado',   label: 'Estado',       width: '100px' },
    ],
    rows: [
      { turno: 'T-001', apertura: '25/03/2026 – 08:00', cierre: '25/03/2026 – 16:00', mesero: 'Carlos Pérez',  mesas: '12', propinas: '$45,500',  total: '$620,000', estado: { label: 'Cerrado', variant: 'neutral' } },
      { turno: 'T-002', apertura: '25/03/2026 – 08:00', cierre: '25/03/2026 – 16:00', mesero: 'Laura Gómez',   mesas: '10', propinas: '$38,000',  total: '$510,000', estado: { label: 'Cerrado', variant: 'neutral' } },
      { turno: 'T-003', apertura: '25/03/2026 – 16:00', cierre: '—',                  mesero: 'Miguel Torres', mesas: '7',  propinas: '$21,000',  total: '$305,000', estado: { label: 'Abierto', variant: 'success' } },
      { turno: 'T-004', apertura: '25/03/2026 – 16:00', cierre: '—',                  mesero: 'Ana Ruiz',      mesas: '5',  propinas: '$16,500',  total: '$158,500', estado: { label: 'Abierto', variant: 'success' } },
      { turno: 'T-005', apertura: '24/03/2026 – 08:00', cierre: '24/03/2026 – 16:00', mesero: 'Carlos Pérez',  mesas: '14', propinas: '$52,000',  total: '$780,000', estado: { label: 'Cerrado', variant: 'neutral' } },
      { turno: 'T-006', apertura: '24/03/2026 – 08:00', cierre: '24/03/2026 – 16:00', mesero: 'Laura Gómez',   mesas: '11', propinas: '$41,500',  total: '$595,000', estado: { label: 'Cerrado', variant: 'neutral' } },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isBadge(val: unknown): val is { label: string; variant: StatusVariant } {
  return typeof val === 'object' && val !== null && 'label' in val && 'variant' in val;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FilterDropdown({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          height: 36,
          paddingLeft: 12,
          paddingRight: 32,
          border: '1px solid var(--blue-20)',
          borderRadius: 8,
          backgroundColor: '#fff',
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: value === options[0] ? 'var(--black-40)' : 'var(--black-100)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o === options[0] ? label : o}</option>)}
      </select>
      <ChevronDown
        size={14}
        color="var(--blue-50)"
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      />
    </div>
  );
}

function StatusBadge({ label, variant }: { label: string; variant: StatusVariant }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 12,
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...BADGE_STYLES[variant],
    }}>
      {label}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ReporteDetallePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const config = CONFIGS[id];

  // Filtros locales (solo UI — los datos mock no se filtran)
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [estado,     setEstado]     = useState('Todos');
  const [mesero,     setMesero]     = useState('Todos');

  const handleLimpiarFiltro = () => {
    setFechaDesde('');
    setFechaHasta('');
    setEstado('Todos');
    setMesero('Todos');
  };

  if (!config) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--blue-10)' }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--black-60)' }}>Reporte no encontrado.</p>
      </div>
    );
  }

  const totalRows = config.rows.length;

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

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/reportes')}
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
          {config.title}
        </p>
      </div>

      {/* ── Panel de filtros + tabla ────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: '20px 20px 0 20px',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Fila de filtros */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          paddingBottom: 16,
          borderBottom: '1px solid var(--black-10)',
        }}>

          {/* Desde */}
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              placeholder="Desde"
              style={{
                height: 36,
                paddingLeft: 12,
                paddingRight: 12,
                border: '1px solid var(--blue-20)',
                borderRadius: 8,
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: fechaDesde ? 'var(--black-100)' : 'var(--black-40)',
                outline: 'none',
                cursor: 'pointer',
                minWidth: 130,
              }}
            />
          </div>

          {/* Hasta */}
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              style={{
                height: 36,
                paddingLeft: 12,
                paddingRight: 12,
                border: '1px solid var(--blue-20)',
                borderRadius: 8,
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: fechaHasta ? 'var(--black-100)' : 'var(--black-40)',
                outline: 'none',
                cursor: 'pointer',
                minWidth: 130,
              }}
            />
          </div>

          <FilterDropdown
            label="Estado"
            options={config.statusOptions}
            value={estado}
            onChange={setEstado}
          />

          <FilterDropdown
            label="Mesero"
            options={config.meseroOptions}
            value={mesero}
            onChange={setMesero}
          />
        </div>

        {/* Barra de resultados + acciones */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          paddingBottom: 12,
          borderBottom: '1px solid var(--black-10)',
        }}>
          <span style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--black-60)',
          }}>
            Mostrando {totalRows} de {totalRows}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 13, fontWeight: 600,
                color: 'var(--blue-100)',
                padding: 0,
              }}
              className="hover:opacity-70 transition-opacity"
            >
              <RefreshCw size={14} strokeWidth={2} />
              Refrescar
            </button>

            <button
              onClick={handleLimpiarFiltro}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 13, fontWeight: 600,
                color: 'var(--black-60)',
                padding: 0,
              }}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={14} strokeWidth={2} />
              Limpiar filtro
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {config.columns.map(col => (
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
              {config.rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{ borderBottom: rowIdx === config.rows.length - 1 ? 'none' : '1px solid var(--black-10)' }}
                  className="hover:bg-[var(--blue-10)] transition-colors"
                >
                  {config.columns.map(col => {
                    const val = row[col.key];
                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: '14px 16px 14px 0',
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--black-100)',
                          lineHeight: '18px',
                        }}
                      >
                        {isBadge(val)
                          ? <StatusBadge label={val.label} variant={val.variant} />
                          : val as string
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
