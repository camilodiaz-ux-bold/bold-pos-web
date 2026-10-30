/**
 * VerSucursalesModal — modal "Sucursales" de Alertas de Stock (specs/2026-10-alertas-stock.md §3 y
 * 2026-10-alertas-stock-ajustes.md §4): datos del ítem (o de la variante) arriba y una fila por sucursal del comercio con
 * Disponible, existencia, stock bajo y alerta. Es el lugar para definir valores distintos por sucursal: cada fila se
 * guarda por separado.
 */
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useItems } from '../../../store/itemsStore';
import { getVarianteLabel } from '../../../types/item';
import { SUCURSALES } from '../../../data/itemsCatalogs';
import { formatExistencia } from '../../../utils/format';
import { existenciaEnRojo, resumirAlerta } from '../../../utils/alertasStock';
import { useCatalog } from '../../../vertical';
import { ItemThumb } from '../ItemThumb';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';
import { AlertaCheck, StockBajoInput } from './AlertaControles';

const FONT = "'Montserrat', sans-serif";

interface Props {
  itemId: string;
  variantId?: string;
  onClose: () => void;
}

const th = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '10px 12px 10px 0', textAlign: 'left', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--black-100)',
  borderBottom: '2px solid var(--black-10)', ...extra,
});
const td = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '10px 12px 10px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)',
  borderBottom: '1px solid var(--black-10)', verticalAlign: 'middle', ...extra,
});
const num: React.CSSProperties = { textAlign: 'right', paddingRight: 24, fontVariantNumeric: 'tabular-nums' };

export function VerSucursalesModal({ itemId, variantId, onClose }: Props) {
  const { getItem, setAlertaStock, setSucursalHabilitada } = useItems();
  const { catDefs } = useCatalog();
  const [pendiente, setPendiente] = useState<{ id: string; nombre: string; existencia: number } | null>(null);
  const item = getItem(itemId);
  const variante = variantId ? item?.variantes?.find(v => v.id === variantId) : undefined;

  useEffect(() => {
    // Escape dentro de un input solo descarta su borrador; fuera de él cierra el modal.
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !pendiente && !(e.target instanceof HTMLInputElement && e.target.type === 'text')) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, pendiente]);

  if (!item || (variantId && !variante)) return null;

  const sucursales = variante ? variante.sucursales : item.sucursales;
  const titulo = variante ? `${item.nombre} - ${getVarianteLabel(variante)}` : item.nombre;
  const codigo = variante ? variante.codigo : item.codigo;
  const categoria = catDefs.find(c => c.id === item.categoriaId)?.name ?? '—';
  const total = resumirAlerta(sucursales).existencia;

  const habilitar = (id: string, nombre: string, habilitada: boolean) => {
    setSucursalHabilitada(itemId, { sucursalId: id, variantId, habilitada });
    toast.success(`${nombre} ${habilitada ? 'disponible' : 'no disponible'} — «${titulo}»`);
  };
  const pedirCambio = (id: string, nombre: string, habilitada: boolean) => {
    if (habilitada) { habilitar(id, nombre, true); return; }
    const existencia = sucursales.find(s => s.sucursalId === id)?.existencia ?? 0;
    // Quitar la disponibilidad pierde la existencia: con unidades de por medio se pide confirmación.
    if (existencia !== 0) setPendiente({ id, nombre, existencia });
    else habilitar(id, nombre, false);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-label="Sucursales"
        style={{ backgroundColor: 'var(--black-0)', borderRadius: 20, width: 'min(700px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', padding: 24, position: 'relative' }}
      >
        <button
          type="button" onClick={onClose} aria-label="Cerrar"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <X size={20} color="var(--black-60)" />
        </button>

        <h3 style={{ margin: '0 0 16px', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: 'var(--black-100)' }}>Sucursales</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--black-10)' }}>
          <ItemThumb src={item.imagen} alt={item.nombre} size={56} radius={10} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: 'var(--black-100)' }}>{titulo}</p>
            <p style={{ margin: '4px 0 0', fontFamily: FONT, fontSize: 12, color: 'var(--black-60)' }}>
              Código {codigo} · {categoria}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: 11, color: 'var(--black-60)' }}>Existencia total</p>
            <p style={{ margin: '2px 0 0', fontFamily: FONT, fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: existenciaEnRojo(total, false) ? 'var(--coral-100)' : 'var(--black-100)' }}>
              {formatExistencia(total)}
            </p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr>
              <th style={th()}>Sucursal</th>
              <th style={th({ textAlign: 'center' })}>Disponible</th>
              <th style={th({ ...num })}>Existencia</th>
              <th style={th()}>Stock bajo</th>
              <th style={th()}>Alerta</th>
            </tr>
          </thead>
          <tbody>
            {SUCURSALES.map(suc => {
              const s = sucursales.find(x => x.sucursalId === suc.id);
              const nombre = suc.label;
              const ultima = !!s && sucursales.length <= 1;
              const r = s ? resumirAlerta([s]) : undefined;
              return (
                <tr key={suc.id}>
                  <td style={td({ fontWeight: 700 })}>{nombre}</td>
                  <td style={td({ textAlign: 'center' })}>
                    <input
                      type="checkbox"
                      checked={!!s}
                      disabled={ultima}
                      aria-label={`Disponible en ${nombre}`}
                      title={ultima ? 'El ítem debe tener al menos una sucursal' : undefined}
                      onChange={() => pedirCambio(suc.id, nombre, !s)}
                      style={{ width: 16, height: 16, cursor: ultima ? 'not-allowed' : 'pointer', accentColor: 'var(--blue-100)' }}
                    />
                  </td>
                  <td style={td({ ...num, fontWeight: 700, color: s && existenciaEnRojo(s.existencia, !!r?.disparada) ? 'var(--coral-100)' : undefined })}>
                    {s ? formatExistencia(s.existencia) : '—'}
                  </td>
                  <td style={td()}>
                    {s && r ? (
                      <StockBajoInput
                        valor={r.stockBajo}
                        ariaLabel={`Stock bajo en ${nombre}`}
                        onGuardar={v => {
                          setAlertaStock(itemId, { sucursalIds: [suc.id], variantId, stockBajo: v });
                          toast.success(`Stock bajo ${v === null ? 'borrado' : 'guardado'} — ${nombre}`);
                        }}
                      />
                    ) : <span style={{ color: 'var(--black-40)' }}>—</span>}
                  </td>
                  <td style={td()}>
                    {s && r ? (
                      <AlertaCheck
                        valor={r.alerta}
                        ariaLabel={`Alerta en ${nombre}`}
                        onChange={v => {
                          setAlertaStock(itemId, { sucursalIds: [suc.id], variantId, alerta: v });
                          toast.success(`Alerta ${v ? 'activada' : 'inactivada'} — ${nombre}${v && s.stockBajo === undefined ? ' (stock bajo en 0)' : ''}`);
                        }}
                      />
                    ) : <span style={{ color: 'var(--black-40)' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p style={{ margin: '16px 0 0', fontFamily: FONT, fontSize: 12, color: 'var(--black-40)' }}>Aquí cada sucursal se edita por separado.</p>
      </div>

      {pendiente && (
        <ConfirmDeleteModal
          title={`¿Quitar la disponibilidad en ${pendiente.nombre}?`}
          message={`Se perderá su existencia (${formatExistencia(pendiente.existencia)} unidades).`}
          confirmLabel="Quitar"
          onCancel={() => setPendiente(null)}
          onConfirm={() => { habilitar(pendiente.id, pendiente.nombre, false); setPendiente(null); }}
        />
      )}
    </div>
  );
}
