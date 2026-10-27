/**
 * FacturasCompraListPage — Egresos → Facturas de compra (specs/2026-10-facturas-compra.md §5).
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Circle, Info, Plus, RefreshCw, X } from 'lucide-react';
import { useContactos } from '../../store/contactosStore';
import { useFacturasCompra } from '../../store/facturasCompraStore';
import type { FacturaCompra } from '../../types/facturaCompra';
import { useAjustes } from '../../store/ajustesStore';
import {
  BADGE_ESTADO, FILTROS_FACTURA_VACIOS, estadoFactura, filterFacturas, fmtFecha, fmtMonto, ordenarFacturas, valorFactura,
  type FiltrosFactura, type OrdenFacturas,
} from '../../utils/facturasCompra';
import { fmtDocumento } from '../../utils/contactos';
import { VentaBadge } from '../../components/ventas/VentaBadge';
import { filterInput, filterGroup, labelStyle, tdStyle, thStyle } from '../../components/ventas/ventasStyles';
import { Combobox } from '../../components/compras/Combobox';
import { ReportarPagoModal } from '../../components/compras/FacturaCompraModals';
import { PrototypeComprasTools } from '../../components/compras/PrototypeComprasTools';

const FONT = "'Montserrat', sans-serif";
const center: React.CSSProperties = { textAlign: 'center', paddingRight: 16 };
const right: React.CSSProperties = { textAlign: 'right', paddingRight: 16 };

const linkButton: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
  cursor: 'pointer', padding: 0, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'var(--blue-100)',
};

const ORDENES: { id: OrdenFacturas; label: string }[] = [
  { id: 'creacion', label: 'Fecha de creación' },
  { id: 'prioridad', label: 'Prioridad de pago' },
];

export function FacturasCompraListPage() {
  const navigate = useNavigate();
  const { contactos } = useContactos();
  const { facturas, refresh, settings } = useFacturasCompra();
  const { ajustes } = useAjustes();
  const [filtros, setFiltros] = useState<FiltrosFactura>(FILTROS_FACTURA_VACIOS);
  const [orden, setOrden] = useState<OrdenFacturas>('creacion');
  const [aPagar, setAPagar] = useState<FacturaCompra | null>(null);
  const { usarDS, usarImpuestos } = settings;

  const nombreProveedor = (id: string) => contactos.find(c => c.id === id)?.nombre ?? '---';
  const proveedores = useMemo(
    () => contactos.filter(c => c.esProveedor).map(c => ({ id: c.id, label: `${c.nombre} - ${fmtDocumento(c.numeroDocumento)}` })),
    [contactos],
  );

  const rows = useMemo(() => ordenarFacturas(filterFacturas(facturas, filtros), orden), [facturas, filtros, orden]);

  const set = <K extends keyof FiltrosFactura>(key: K) => (value: FiltrosFactura[K]) => setFiltros(f => ({ ...f, [key]: value }));

  const select = (label: string, key: 'formaPago' | 'estado' | 'sucursal', todos: string, opts: string[]) => (
    <div style={filterGroup}>
      <label style={labelStyle}>{label}</label>
      <select style={filterInput} value={filtros[key]} onChange={e => set(key)(e.target.value)}>
        {[todos, ...opts].map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  const columns = [
    { label: 'No. factura', width: '110px' },
    { label: 'Proveedor', width: '240px' },
    { label: 'Inventario', width: '100px', center: true, tip: 'Los ítems de la factura fueron agregados al inventario' },
    { label: 'Ítems', width: '70px' },
    { label: 'Valor total', width: '130px', right: true },
    { label: 'Forma de pago', width: '120px' },
    { label: 'Fecha de vencimiento', width: '140px' },
    { label: 'Estado de pago', width: '130px' },
    ...(usarDS ? [{ label: 'DS', width: '70px', center: true, tip: 'Esta factura también fue creada como Documento Soporte' }] : []),
  ];

  const check = (on: boolean) => on
    ? <CheckCircle2 size={16} color="var(--feedback-success-150)" />
    : <Circle size={16} color="var(--black-40)" />;

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
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0, flex: 1 }}>
          Facturas de compra
        </p>
        <button
          onClick={() => navigate('/facturas-compra/nueva')}
          style={{
            height: 40, padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            backgroundColor: 'var(--blue-100)', color: 'var(--black-0)',
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 14, fontWeight: 700,
          }}
        >
          <Plus size={20} color="var(--black-0)" />
          Nueva factura de compra
        </button>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        <div style={filterGroup}>
          <label style={labelStyle}>Buscar</label>
          <input type="text" placeholder="Buscar No. de factura" style={filterInput}
            value={filtros.numero} onChange={e => set('numero')(e.target.value)} />
        </div>
        <div style={{ ...filterGroup, minWidth: 260 }}>
          <label style={labelStyle}>Proveedor</label>
          <Combobox variant="filter" options={proveedores} value={filtros.proveedorId} onChange={set('proveedorId')} placeholder="Proveedor" />
        </div>
        {select('Forma de pago', 'formaPago', 'Todas', ['Contado', 'Crédito'])}
        {select('Estado de pago', 'estado', 'Todos', ['Pagado', 'No pagado', 'Vencido', 'Anulada'])}
        {select('Sucursal', 'sucursal', 'Todas', ajustes.sucursales.map(s => s.nombre))}
        <div style={filterGroup}>
          <label style={labelStyle}>Desde</label>
          <input type="date" style={filterInput} value={filtros.desde} onChange={e => set('desde')(e.target.value)} />
        </div>
        <div style={filterGroup}>
          <label style={labelStyle}>Hasta</label>
          <input type="date" style={filterInput} value={filtros.hasta} onChange={e => set('hasta')(e.target.value)} />
        </div>
        <div style={filterGroup}>
          <label style={labelStyle}>Ordenar por</label>
          <div role="radiogroup" style={{ display: 'inline-flex', border: '1px solid var(--blue-100)', borderRadius: 20, overflow: 'hidden', height: 38 }}>
            {ORDENES.map(o => {
              const active = o.id === orden;
              return (
                <button
                  key={o.id} role="radio" aria-checked={active} onClick={() => setOrden(o.id)}
                  style={{
                    padding: '0 14px', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 600,
                    backgroundColor: active ? 'var(--blue-100)' : 'var(--black-0)', color: active ? 'var(--black-0)' : 'var(--black-100)',
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: '20px 20px 0 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 4px' }}>
          <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: 'var(--black-60)', margin: 0 }}>
            Mostrando {rows.length} de {facturas.length}
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button style={linkButton} onClick={() => { refresh(); toast.success('Lista actualizada'); }}>
              <RefreshCw size={12} /> Refrescar
            </button>
            <button style={linkButton} onClick={() => setFiltros(FILTROS_FACTURA_VACIOS)}>
              <X size={12} /> Limpiar filtros
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: columns.reduce((s, c) => s + parseInt(c.width, 10), 0) }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.label} style={{ ...thStyle, width: col.width, whiteSpace: 'normal', ...(col.center ? center : {}), ...(col.right ? right : {}) }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {col.tip && <span title={col.tip} style={{ display: 'inline-flex' }}><Info size={12} color="var(--black-60)" /></span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: 'var(--black-60)', padding: '32px 0' }}>
                    No hay facturas de compra con estos filtros
                  </td>
                </tr>
              )}
              {rows.map((f, idx) => {
                const estado = estadoFactura(f);
                const pagable = estado === 'No pagado' || estado === 'Vencido';
                return (
                  <tr
                    key={f.id}
                    onClick={() => navigate(`/facturas-compra/${f.id}`)}
                    style={{ borderBottom: idx === rows.length - 1 ? 'none' : '1px solid var(--black-10)', cursor: 'pointer' }}
                    className="hover:bg-[var(--blue-10)] transition-colors"
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--blue-100)' }}>{f.numero}</td>
                    <td style={{ ...tdStyle, paddingRight: 16 }}>{nombreProveedor(f.proveedorId)}</td>
                    <td style={{ ...tdStyle, ...center }}><span style={{ display: 'inline-flex' }}>{check(f.afectaInventario)}</span></td>
                    <td style={tdStyle}>{f.items.length}</td>
                    <td style={{ ...tdStyle, ...right }}>{fmtMonto(valorFactura(f, usarImpuestos))}</td>
                    <td style={tdStyle}>{f.formaPago}</td>
                    <td style={tdStyle}>{f.fechaVencimiento ? fmtFecha(f.fechaVencimiento) : '---'}</td>
                    <td style={tdStyle}>
                      {pagable ? (
                        <button
                          title="Reportar el pago"
                          onClick={e => { e.stopPropagation(); setAPagar(f); }}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                          <VentaBadge label={estado} variant={BADGE_ESTADO[estado]} />
                        </button>
                      ) : (
                        <VentaBadge label={estado} variant={BADGE_ESTADO[estado]} />
                      )}
                    </td>
                    {usarDS && <td style={{ ...tdStyle, ...center }}><span style={{ display: 'inline-flex' }}>{check(!!f.ds)}</span></td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PrototypeComprasTools show={['usarDS', 'stepMode']} />

      {aPagar && <ReportarPagoModal factura={aPagar} onClose={() => setAPagar(null)} />}
    </div>
  );
}
