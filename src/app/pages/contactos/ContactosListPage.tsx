/**
 * ContactosListPage — lista de proveedores o clientes según `tipo` (specs/2026-10-proveedores.md §5 y 2026-10-clientes.md).
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useContactos } from '../../store/contactosStore';
import { useFacturasCompra } from '../../store/facturasCompraStore';
import { comprasUltimos6Meses, cuentasPorPagar } from '../../utils/facturasCompra';
import { Toggle } from '../../components/items/Toggle';
import { ConfirmDeleteModal } from '../../components/items/ConfirmDeleteModal';
import { VentaBadge } from '../../components/ventas/VentaBadge';
import { filterInput, filterGroup, labelStyle, tdStyle, thStyle } from '../../components/ventas/ventasStyles';
import { FILTROS_VACIOS, filterContactos, fmtDocumento, type FiltrosContacto } from '../../utils/contactos';
import type { Contacto } from '../../types/contacto';
import { CONTACTO_CONFIG, type TipoContacto } from './contactosConfig';

const center: React.CSSProperties = { textAlign: 'center', paddingRight: 16 };
const right: React.CSSProperties = { textAlign: 'right', paddingRight: 16 };

const linkButton: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
  cursor: 'pointer', padding: 0, fontFamily: "'Montserrat', sans-serif", fontSize: 12,
  fontWeight: 600, color: 'var(--blue-100)',
};

const columnas = (conCompras: boolean) => [
  { label: 'Nombre', width: '300px' },
  ...(conCompras ? [
    { label: 'Compras últimos 6 meses', width: '140px', center: true },
    { label: 'Cuentas por pagar', width: '130px', center: true },
  ] : []),
  { label: 'No. documento', width: '140px', right: true },
  { label: 'Correo electrónico', width: '240px' },
  { label: 'Estado', width: '100px' },
  { label: 'Activo', width: '80px' },
  { label: '', width: '48px' },
];

export function ContactosListPage({ tipo }: { tipo: TipoContacto }) {
  const navigate = useNavigate();
  const cfg = CONTACTO_CONFIG[tipo];
  const COLUMNS = columnas(cfg.conCompras);
  const { contactos, toggleActivo, deleteContacto, refresh } = useContactos();
  const { facturas } = useFacturasCompra();
  const [filtros, setFiltros] = useState<FiltrosContacto>(FILTROS_VACIOS);
  const [aEliminar, setAEliminar] = useState<Contacto | null>(null);

  const base = useMemo(() => contactos.filter(c => c[cfg.flag]), [contactos, cfg.flag]);
  const rows = useMemo(() => filterContactos(base, filtros), [base, filtros]);

  const set = <K extends keyof FiltrosContacto>(key: K) => (value: FiltrosContacto[K]) =>
    setFiltros(f => ({ ...f, [key]: value }));

  const text = (label: string, key: Exclude<keyof FiltrosContacto, 'estado'>, placeholder: string) => (
    <div style={filterGroup}>
      <label style={labelStyle}>{label}</label>
      <input type="text" placeholder={placeholder} style={filterInput}
        value={filtros[key]} onChange={e => set(key)(e.target.value)} />
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
          aria-label="Volver"
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
          onClick={() => toast.info(`Importar ${cfg.titulo.toLowerCase()}: próximamente`)}
          style={{
            height: 40, padding: '8px 16px', borderRadius: 12, cursor: 'pointer',
            border: '1.5px solid var(--blue-100)', backgroundColor: 'var(--black-0)', color: 'var(--blue-100)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
          }}
        >
          Importar
        </button>
        <button
          onClick={() => navigate(`${cfg.base}/nuevo`)}
          style={{
            height: 40, padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            backgroundColor: 'var(--blue-100)', color: 'var(--black-0)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
          }}
        >
          <Plus size={20} color="var(--black-0)" />
          {cfg.nuevo}
        </button>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        {text('Nombre', 'nombre', 'Buscar por nombre')}
        {text('Documento / NIT', 'documento', 'Buscar por documento')}
        {text('Correo electrónico', 'correo', 'Correo electrónico')}
        {text('Celular', 'celular', 'Celular')}
        {text('Teléfono', 'telefono', 'Teléfono')}
        <div style={filterGroup}>
          <label style={labelStyle}>Estado</label>
          <select style={filterInput} value={filtros.estado}
            onChange={e => set('estado')(e.target.value as FiltrosContacto['estado'])}>
            {['Todos', 'Activo', 'Inactivo'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div style={{
        backgroundColor: 'var(--black-0)', borderRadius: 16,
        padding: '20px 20px 0 20px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 4px' }}>
          <p style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 500,
            color: 'var(--black-60)', margin: 0,
          }}>
            Mostrando {rows.length} de {base.length}
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button style={linkButton} onClick={() => { refresh(); toast.success('Lista actualizada'); }}>
              <RefreshCw size={12} /> Refrescar
            </button>
            <button style={linkButton} onClick={() => setFiltros(FILTROS_VACIOS)}>
              <X size={12} /> Limpiar filtros
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: COLUMNS.reduce((sum, c) => sum + parseInt(c.width, 10), 0) }}>
            <thead>
              <tr>
                {COLUMNS.map((col, i) => (
                  <th key={i} style={{
                    ...thStyle, width: col.width, whiteSpace: 'normal',
                    ...(col.center ? center : {}), ...(col.right ? right : {}),
                  }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ ...tdStyle, textAlign: 'center', color: 'var(--black-60)', padding: '32px 0' }}>
                    No hay {cfg.titulo.toLowerCase()} con estos filtros
                  </td>
                </tr>
              )}
              {rows.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`${cfg.base}/${p.id}/editar`)}
                  style={{ borderBottom: idx === rows.length - 1 ? 'none' : '1px solid var(--black-10)', cursor: 'pointer' }}
                  className="hover:bg-[var(--blue-10)] transition-colors"
                >
                  <td style={{ ...tdStyle, fontWeight: 600, paddingRight: 16 }}>{p.nombre}</td>
                  {cfg.conCompras && (
                    <>
                      <td style={{ ...tdStyle, ...center }}>{comprasUltimos6Meses(facturas, p.id)}</td>
                      <td style={{ ...tdStyle, ...center }}>{cuentasPorPagar(facturas, p.id)}</td>
                    </>
                  )}
                  <td style={{ ...tdStyle, ...right }}>{fmtDocumento(p.numeroDocumento)}</td>
                  <td style={{ ...tdStyle, paddingRight: 16, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.correo}</td>
                  <td style={tdStyle}>
                    <VentaBadge label={p.activo ? 'Activo' : 'Inactivo'} variant={p.activo ? 'success' : 'warning'} />
                  </td>
                  <td style={tdStyle} onClick={e => e.stopPropagation()}>
                    <Toggle size="sm" checked={p.activo} onChange={() => toggleActivo(p.id)} ariaLabel={`Activar ${p.nombre}`} />
                  </td>
                  <td style={{ ...tdStyle, paddingRight: 0 }} onClick={e => e.stopPropagation()}>
                    <button
                      aria-label={`Eliminar ${p.nombre}`}
                      onClick={() => setAEliminar(p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
                    >
                      <Trash2 size={16} color="var(--black-60)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {aEliminar && (
        <ConfirmDeleteModal
          title={`Eliminar ${tipo}`}
          message={`¿Seguro que quieres eliminar a ${aEliminar.nombre}?${
            aEliminar.esCliente && aEliminar.esProveedor ? ` También se eliminará como ${tipo === 'cliente' ? 'proveedor' : 'cliente'}.` : ''
          } Esta acción no se puede deshacer.`}
          onCancel={() => setAEliminar(null)}
          onConfirm={() => {
            deleteContacto(aEliminar.id);
            toast.success(`${tipo === 'cliente' ? 'Cliente' : 'Proveedor'} eliminado`);
            setAEliminar(null);
          }}
        />
      )}
    </div>
  );
}
