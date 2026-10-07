import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useVertical } from '../vertical';
import { useVentas } from '../store/ventasStore';
import { VentaBadge } from '../components/ventas/VentaBadge';
import { filterInput, filterGroup, labelStyle, tdStyle, thStyle } from '../components/ventas/ventasStyles';
import {
  dianLabel, estadoLabel, filterVentas, fmtCOP, fmtFechaHora, opciones, tipoDocLabel,
  type FiltrosVenta,
} from '../utils/ventas';

const columns = [
  { key: 'pedido',     label: 'No. Orden',          width: '100px' },
  { key: 'horaInicio', label: 'Hora Inicio',        width: '160px' },
  { key: 'horaCierre', label: 'Hora Cierre',        width: '160px' },
  { key: 'zona',       label: 'Zona',               width: '80px'  },
  { key: 'mesa',       label: 'Mesa',               width: '80px'  },
  { key: 'usuario',    label: 'Usuario',            width: '140px' },
  { key: 'total',      label: 'Total',              width: '100px' },
  { key: 'tipoDoc',    label: 'Tipo de documento',  width: '170px' },
  { key: 'estado',     label: 'Estado',             width: '110px' },
  { key: 'dian',       label: 'Estado DIAN',        width: '110px' },
];

// Etiquetas de la UI → valores del modelo (filterVentas solo ignora '' en estos tres).
const ESTADO_UI: Record<string, FiltrosVenta['estado']> = { Pagado: 'pagada', Abierto: 'abierta', Cancelado: 'cancelada' };
const DIAN_UI: Record<string, FiltrosVenta['dian']> = { Enviada: 'aceptada', Pendiente: 'pendiente' };
const TIPO_UI: Record<string, FiltrosVenta['tipoDoc']> = { Comprobante: 'comprobante', 'Factura electrónica': 'factura' };

export function VentasPage() {
  const navigate = useNavigate();
  const { has, vertical } = useVertical();
  const { ventas } = useVentas();

  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState('');
  const [estado, setEstado] = useState('Todos');
  const [usuario, setUsuario] = useState('Todos');
  const [zona, setZona] = useState('Todos');
  const [mesa, setMesa] = useState('Todos');
  const [tipoDoc, setTipoDoc] = useState('Todos');
  const [dian, setDian] = useState('Todos');

  const rows = useMemo(() => filterVentas(ventas, {
    numero,
    desde: fecha,
    hasta: fecha,
    estado: ESTADO_UI[estado] ?? '',
    dian: DIAN_UI[dian] ?? '',
    tipoDoc: TIPO_UI[tipoDoc] ?? '',
    vendedor: usuario,
    zona,
    mesa,
  }), [ventas, numero, fecha, estado, dian, tipoDoc, usuario, zona, mesa]);

  const usuarios = useMemo(() => opciones(ventas, v => v.vendedor), [ventas]);
  const zonas = useMemo(() => opciones(ventas, v => v.zona), [ventas]);
  const mesas = useMemo(
    () => opciones(ventas, v => v.mesa).sort((a, b) => a.localeCompare(b, 'es', { numeric: true })),
    [ventas],
  );

  // Ventas es exclusivo de Restaurantes: Retail usa Comprobantes / Facturas de Venta.
  if (!has('ventas')) return <Navigate to="/comprobantes" replace />;

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
            backgroundColor: 'var(--black-0)',
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

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>

        <div style={filterGroup}>
          <label style={labelStyle}>Buscar</label>
          <input type="text" placeholder="Buscar por No. Orden" style={filterInput}
            value={numero} onChange={e => setNumero(e.target.value)} />
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Fecha</label>
          <input type="date" style={filterInput} value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Estado</label>
          <select style={filterInput} value={estado} onChange={e => setEstado(e.target.value)}>
            {['Todos', 'Pagado', 'Abierto', 'Cancelado'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Usuario</label>
          <select style={filterInput} value={usuario} onChange={e => setUsuario(e.target.value)}>
            {['Todos', ...usuarios].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Zona</label>
          <select style={filterInput} value={zona} onChange={e => setZona(e.target.value)}>
            {['Todos', ...zonas].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Mesa</label>
          <select style={filterInput} value={mesa} onChange={e => setMesa(e.target.value)}>
            {['Todos', ...mesas].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Tipo de documento</label>
          <select style={filterInput} value={tipoDoc} onChange={e => setTipoDoc(e.target.value)}>
            {['Todos', 'Comprobante', 'Factura electrónica'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Estado DIAN</label>
          <select style={filterInput} value={dian} onChange={e => setDian(e.target.value)}>
            {['Todos', 'Enviada', 'Pendiente'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

      </div>

      {/* ── Tabla ── */}
      <div style={{
        backgroundColor: 'var(--black-0)',
        borderRadius: 16,
        padding: '20px 20px 0 20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <p style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 500,
          color: 'var(--black-60)', margin: '0 0 4px',
        }}>
          Mostrando {rows.length} de {ventas.length}
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} style={{ ...thStyle, width: col.width }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: 'var(--black-60)', padding: '32px 0' }}>
                    No hay ventas con estos filtros
                  </td>
                </tr>
              )}
              {rows.map((v, idx) => {
                const est = estadoLabel(v.estado, vertical);
                const dn = dianLabel(v.dian, vertical);
                return (
                  <tr
                    key={v.id}
                    onClick={() => navigate(`/ventas/${v.id}`)}
                    style={{ borderBottom: idx === rows.length - 1 ? 'none' : '1px solid var(--black-10)', cursor: 'pointer' }}
                    className="hover:bg-[var(--blue-10)] transition-colors"
                  >
                    <td style={tdStyle}>{v.numero}</td>
                    <td style={tdStyle}>{fmtFechaHora(v.abiertaEn ?? v.emitidaEn)}</td>
                    <td style={tdStyle}>{v.estado === 'abierta' ? '---' : fmtFechaHora(v.emitidaEn)}</td>
                    <td style={tdStyle}>{v.zona ?? '---'}</td>
                    <td style={tdStyle}>{v.mesa ?? '---'}</td>
                    <td style={tdStyle}>{v.vendedor}</td>
                    <td style={tdStyle}>{fmtCOP(v.total)}</td>
                    <td style={tdStyle}>{tipoDocLabel(v)}</td>
                    <td style={tdStyle}><VentaBadge {...est} /></td>
                    <td style={tdStyle}>
                      {dn ? <VentaBadge {...dn} /> : (
                        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 500, color: 'var(--black-60)' }}>---</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
