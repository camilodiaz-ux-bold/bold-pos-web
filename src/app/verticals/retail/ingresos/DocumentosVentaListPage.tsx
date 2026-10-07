import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus } from 'lucide-react';
import type { TipoDocVenta, EstadoVenta, EstadoDian } from '../../../types/venta';
import { useVentas } from '../../../store/ventasStore';
import { VentaBadge } from '../../../components/ventas/VentaBadge';
import { filterInput, filterGroup, labelStyle, tdStyle, thStyle } from '../../../components/ventas/ventasStyles';
import { dianLabel, estadoLabel, filterVentas, fmtCOP, fmtFechaHora, opciones } from '../../../utils/ventas';
import { DOC_CONFIG } from './documentosVenta';

// Etiquetas de la UI → valores del modelo.
const ESTADO_UI: Record<string, EstadoVenta> = { Pagada: 'pagada', 'No pagada': 'no-pagada' };
const DIAN_UI: Record<string, EstadoDian> = { Aceptada: 'aceptada', Pendiente: 'pendiente' };

const right: React.CSSProperties = { textAlign: 'right', paddingRight: 16 };

export function DocumentosVentaListPage({ tipo }: { tipo: TipoDocVenta }) {
  const navigate = useNavigate();
  const { ventas } = useVentas();
  const cfg = DOC_CONFIG[tipo];
  const esFactura = tipo === 'factura';

  const [numero, setNumero] = useState('');
  const [cliente, setCliente] = useState('Todos');
  const [estado, setEstado] = useState('Todos');
  const [dian, setDian] = useState('Todos');
  const [formaPago, setFormaPago] = useState('Todos');
  const [vendedor, setVendedor] = useState('Todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [notas, setNotas] = useState('');

  const base = useMemo(() => ventas.filter(v => v.tipoDoc === tipo), [ventas, tipo]);

  const rows = useMemo(() => filterVentas(base, {
    numero, desde, hasta, notas, vendedor, cliente,
    estado: ESTADO_UI[estado] ?? '',
    dian: esFactura ? (DIAN_UI[dian] ?? '') : '',
    metodoPago: esFactura ? formaPago : 'Todos',
  }), [base, numero, desde, hasta, notas, vendedor, cliente, estado, dian, formaPago, esFactura]);

  const clientes = useMemo(() => opciones(base, v => v.cliente), [base]);
  const vendedores = useMemo(() => opciones(base, v => v.vendedor), [base]);
  const metodos = useMemo(() => Array.from(new Set(base.flatMap(v => v.pagos.map(p => p.method)))).sort(), [base]);

  const columns = [
    { label: 'No.', width: '130px' },
    { label: 'Cliente', width: esFactura ? '220px' : '260px' },
    { label: 'Fecha de emisión', width: '150px' },
    { label: 'Fecha de vencimiento', width: '170px' },
    ...(esFactura ? [{ label: 'Estado DIAN', width: '120px' }, { label: 'Forma de pago', width: '120px' }] : []),
    { label: 'Estado', width: '110px' },
    { label: 'Total', width: '110px', right: true },
    { label: 'Saldo', width: '110px', right: true },
  ];

  const select = (label: string, value: string, set: (v: string) => void, opts: string[]) => (
    <div style={filterGroup}>
      <label style={labelStyle}>{label}</label>
      <select style={filterInput} value={value} onChange={e => set(e.target.value)}>
        {['Todos', ...opts].map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{
      flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto',
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
    }}>

      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid var(--blue-20)', backgroundColor: 'var(--black-0)',
            cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{
          fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20,
          lineHeight: '28px', color: 'var(--black-100)', margin: 0, flex: 1,
        }}>
          {cfg.titulo}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            height: 40, padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            backgroundColor: 'var(--blue-100)', color: 'var(--black-0)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
          }}
        >
          <Plus size={20} color="var(--black-0)" />
          Nueva venta
        </button>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        <div style={filterGroup}>
          <label style={labelStyle}>Buscar</label>
          <input type="text" placeholder="Buscar por código" style={filterInput}
            value={numero} onChange={e => setNumero(e.target.value)} />
        </div>
        {select('Cliente', cliente, setCliente, clientes)}
        {select('Estado de pago', estado, setEstado, ['Pagada', 'No pagada'])}
        {esFactura && select('Estado DIAN', dian, setDian, ['Aceptada', 'Pendiente'])}
        {esFactura && select('Forma de pago', formaPago, setFormaPago, metodos)}
        {select('Vendedor', vendedor, setVendedor, vendedores)}
        <div style={filterGroup}>
          <label style={labelStyle}>Desde</label>
          <input type="date" style={filterInput} value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div style={filterGroup}>
          <label style={labelStyle}>Hasta</label>
          <input type="date" style={filterInput} value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <div style={filterGroup}>
          <label style={labelStyle}>Notas</label>
          <input type="text" placeholder="Buscar por notas" style={filterInput}
            value={notas} onChange={e => setNotas(e.target.value)} />
        </div>
      </div>

      {/* ── Tabla ── */}
      <div style={{
        backgroundColor: 'var(--black-0)', borderRadius: 16,
        padding: '20px 20px 0 20px', display: 'flex', flexDirection: 'column',
      }}>
        <p style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 500,
          color: 'var(--black-60)', margin: '0 0 4px',
        }}>
          Mostrando {rows.length} de {base.length}
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.label} style={{ ...thStyle, width: col.width, ...(col.right ? right : {}) }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: 'var(--black-60)', padding: '32px 0' }}>
                    No hay {cfg.titulo.toLowerCase()} con estos filtros
                  </td>
                </tr>
              )}
              {rows.map((v, idx) => {
                const est = estadoLabel(v.estado, 'retail');
                const dn = dianLabel(v.dian, 'retail');
                return (
                  <tr
                    key={v.id}
                    onClick={() => navigate(`${cfg.base}/${v.id}`)}
                    style={{ borderBottom: idx === rows.length - 1 ? 'none' : '1px solid var(--black-10)', cursor: 'pointer' }}
                    className="hover:bg-[var(--blue-10)] transition-colors"
                  >
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{v.numero}</td>
                    <td style={{ ...tdStyle, paddingRight: 16 }}>{v.cliente}</td>
                    <td style={tdStyle}>{fmtFechaHora(v.emitidaEn)}</td>
                    <td style={tdStyle}>{fmtFechaHora(v.vencimiento)}</td>
                    {esFactura && (
                      <>
                        <td style={tdStyle}>{dn ? <VentaBadge {...dn} /> : '---'}</td>
                        <td style={tdStyle}>{v.formaPago}</td>
                      </>
                    )}
                    <td style={tdStyle}><VentaBadge {...est} /></td>
                    <td style={{ ...tdStyle, ...right }}>{fmtCOP(v.total)}</td>
                    <td style={{ ...tdStyle, ...right, color: v.saldo > 0 ? 'var(--feedback-warning-200)' : 'var(--black-100)', fontWeight: v.saldo > 0 ? 700 : 500 }}>
                      {fmtCOP(v.saldo)}
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
