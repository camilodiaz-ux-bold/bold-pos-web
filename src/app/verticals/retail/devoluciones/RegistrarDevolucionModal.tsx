/**
 * RegistrarDevolucionModal — "Registrar Devolución" (specs/2026-11-devoluciones-v2.md §1, fase 1). Solo el paso de
 * tipo y documento: "Siguiente" redirige a la vista que hace la devolución (nota crédito electrónica en Factura y
 * Sin Documento; vista "Devolución" en Comprobante). Cerrar pide confirmación.
 */
import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAjustes } from '../../../store/ajustesStore';
import { useVentas } from '../../../store/ventasStore';
import { useContactos } from '../../../store/contactosStore';
import { ConfirmDeleteModal } from '../../../components/items/ConfirmDeleteModal';
import type { TipoDevolucion } from '../../../types/devolucion';
import { TIPO_DEVOLUCION_LABEL } from '../../../types/devolucion';
import type { Venta } from '../../../types/venta';
import { formatCOP } from '../../../utils/format';
import { fmtFechaHora } from '../../../utils/ventas';
import { coincideBusquedaDocumento, documentoDeCliente, mismaSucursal, usuarioSesion } from '../../../utils/devoluciones';

const FONT = "'Montserrat', sans-serif";
/** Máximo de documentos que muestra la búsqueda. */
const MAX_RESULTADOS = 20;

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--black-100)', marginBottom: 6 };

/** Ruta de la vista que hace la devolución según el tipo (specs/2026-11-devoluciones-v2.md §4). */
export function rutaRegistrar(tipo: TipoDevolucion, venta: Venta | null): string {
  if (tipo === 'factura' && venta) return `/facturas-venta/${venta.id}/devolucion`;
  if (tipo === 'comprobante' && venta) return `/comprobantes/${venta.id}/devolucion`;
  return '/notas-credito/nueva?origen=sin-documento';
}

export function RegistrarDevolucionModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const { ventas } = useVentas();
  const { contactos } = useContactos();

  const usuario = usuarioSesion(ajustes);
  const sucursalSesion = ajustes.sucursales.find(s => s.id === usuario.sucursalId);

  const [saliendo, setSaliendo] = useState(false);
  const [tipo, setTipo] = useState<TipoDevolucion>('factura');
  const [busqueda, setBusqueda] = useState('');
  /** Texto con el que se ejecutó la última búsqueda (se aplica al pulsar "Buscar" o Enter; no se filtra mientras se escribe). */
  const [consulta, setConsulta] = useState('');
  const [venta, setVenta] = useState<Venta | null>(null);

  const conDocumento = tipo !== 'sinDocumento';

  // Solo documentos de la sucursal de la sesión, fecha descendente, máximo 20.
  const candidatos = useMemo(() => {
    if (!conDocumento || !consulta) return [];
    return ventas
      .filter(v => v.tipoDoc === tipo && coincideBusquedaDocumento(v, consulta, contactos) && !!sucursalSesion && mismaSucursal(sucursalSesion.nombre, v.sucursal))
      .sort((a, b) => b.emitidaEn - a.emitidaEn)
      .slice(0, MAX_RESULTADOS);
  }, [ventas, tipo, consulta, conDocumento, sucursalSesion, contactos]);

  const buscar = () => { setConsulta(busqueda.trim()); setVenta(null); };
  const puedeSiguiente = conDocumento ? !!venta : true;
  const siguiente = () => { if (puedeSiguiente) navigate(rutaRegistrar(tipo, venta)); };

  return (
    <>
      <div className="fixed inset-0 z-[290] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div
          role="dialog" aria-modal="true" aria-label="Registrar Devolución" className="bg-white rounded-[var(--radius-20)] w-full mx-4"
          style={{ maxWidth: 720, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px 12px' }}>
            <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Registrar Devolución</h3>
            <button onClick={() => setSaliendo(true)} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '8px 32px 16px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
            <label style={labelStyle}>Tipo de devolución</label>
            <div role="radiogroup" aria-label="Tipo de devolución" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(Object.keys(TIPO_DEVOLUCION_LABEL) as TipoDevolucion[]).map(t => (
                <button
                  key={t} role="radio" aria-checked={tipo === t}
                  onClick={() => { setTipo(t); setBusqueda(''); setConsulta(''); setVenta(null); }}
                  style={{
                    padding: '10px 18px', borderRadius: 100, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${tipo === t ? 'var(--blue-100)' : 'var(--black-10)'}`,
                    backgroundColor: tipo === t ? 'var(--blue-10)' : '#fff', color: tipo === t ? 'var(--blue-100)' : 'var(--black-60)',
                  }}
                >
                  {TIPO_DEVOLUCION_LABEL[t]}
                </button>
              ))}
            </div>

            {conDocumento && (
              <div style={{ marginTop: 20 }}>
                <label style={labelStyle}>Número de {tipo === 'factura' ? 'la factura' : 'el comprobante'} o identificación del cliente</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="filter-pill" style={{ height: 44, flex: 1 }}>
                    <Search size={16} color="var(--blue-50)" />
                    <input
                      value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') buscar(); }}
                      placeholder="Escribe el número o la identificación del cliente"
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, fontSize: 13, fontWeight: 500 }}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={buscar} disabled={!busqueda.trim()} style={{ height: 44 }}>Buscar</button>
                </div>
                {consulta && candidatos.length === 0 && (
                  <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--black-60)', margin: '4px 0 0' }}>No hay resultados para los filtros o la búsqueda.</p>
                )}
                {candidatos.length > 0 && (
                  <ul role="listbox" aria-label="Documentos" style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, border: '1px solid var(--black-10)', borderRadius: 12, overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
                    {candidatos.map(v => (
                      <li key={v.id}>
                        <button
                          role="option" aria-selected={venta?.id === v.id} onClick={() => setVenta(v)}
                          style={{
                            width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13,
                            backgroundColor: venta?.id === v.id ? 'var(--blue-10)' : '#fff', borderBottom: '1px solid var(--black-10)',
                          }}
                        >
                          <strong>{v.numero}</strong> · {v.cliente}{documentoDeCliente(v, contactos) && !/NIT/i.test(v.cliente) && ` (${documentoDeCliente(v, contactos)})`} · {fmtFechaHora(v.emitidaEn)} · {formatCOP(v.total)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '12px 32px 24px', borderTop: '1px solid var(--black-10)' }}>
            <button className="btn btn-cancel" onClick={() => setSaliendo(true)}>Cancelar</button>
            <button className="btn btn-primary" onClick={siguiente} disabled={!puedeSiguiente}>Siguiente</button>
          </div>
        </div>
      </div>

      {saliendo && (
        <ConfirmDeleteModal
          title="¿Salir de la devolución?" message="Si sales, se perderá la información ingresada."
          confirmLabel="Salir" cancelLabel="Continuar" onCancel={() => setSaliendo(false)} onConfirm={onClose}
        />
      )}
    </>
  );
}
