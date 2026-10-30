/**
 * VerSucursalesModal — modal "Ver sucursales" de Alertas de Stock (specs/2026-10-alertas-stock.md §3):
 * datos del ítem (o de la variante) arriba y una fila por sucursal con existencia, stock bajo y alerta.
 * Es el lugar para definir valores distintos por sucursal: cada fila se guarda por separado.
 */
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useItems } from '../../../store/itemsStore';
import { getVarianteLabel } from '../../../types/item';
import { SUCURSALES } from '../../../data/itemsCatalogs';
import { formatExistencia } from '../../../utils/format';
import { resumirAlerta } from '../../../utils/alertasStock';
import { useCatalog } from '../../../vertical';
import { ItemThumb } from '../ItemThumb';
import { AlertaCheck, StockBajoInput } from './AlertaControles';

const FONT = "'Montserrat', sans-serif";

interface Props {
  itemId: string;
  variantId?: string;
  onClose: () => void;
}

export function VerSucursalesModal({ itemId, variantId, onClose }: Props) {
  const { getItem, setAlertaStock } = useItems();
  const { catDefs } = useCatalog();
  const item = getItem(itemId);
  const variante = variantId ? item?.variantes?.find(v => v.id === variantId) : undefined;

  useEffect(() => {
    // Escape dentro de un input solo descarta su borrador; fuera de él cierra el modal.
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement && e.target.type === 'text')) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!item || (variantId && !variante)) return null;

  const sucursales = variante ? variante.sucursales : item.sucursales;
  const titulo = variante ? `${item.nombre} - ${getVarianteLabel(variante)}` : item.nombre;
  const codigo = variante ? variante.codigo : item.codigo;
  const categoria = catDefs.find(c => c.id === item.categoriaId)?.name ?? '—';
  const total = resumirAlerta(sucursales).existencia;

  const nombreSucursal = (id: string) => SUCURSALES.find(s => s.id === id)?.label ?? id;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-label="Ver sucursales"
        style={{ backgroundColor: 'var(--black-0)', borderRadius: 20, width: 'min(640px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', padding: 24, position: 'relative' }}
      >
        <button
          type="button" onClick={onClose} aria-label="Cerrar"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <X size={20} color="var(--black-60)" />
        </button>

        <h3 style={{ margin: '0 0 16px', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: 'var(--black-100)' }}>Ver sucursales</h3>

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
            <p style={{ margin: '2px 0 0', fontFamily: FONT, fontSize: 16, fontWeight: 700, color: 'var(--black-100)' }}>{formatExistencia(total)}</p>
          </div>
        </div>

        {sucursales.length === 0 ? (
          <p style={{ fontFamily: FONT, fontSize: 13, color: 'var(--black-60)', margin: '16px 0 0' }}>Este ítem no está disponible en ninguna sucursal.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                {['Sucursal', 'Existencia', 'Stock bajo', 'Alerta'].map(h => (
                  <th key={h} style={{ padding: '10px 12px 10px 0', textAlign: 'left', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--black-100)', borderBottom: '2px solid var(--black-10)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sucursales.map(s => {
                const r = resumirAlerta([s]);
                const nombre = nombreSucursal(s.sucursalId);
                const tdStyle: React.CSSProperties = { padding: '10px 12px 10px 0', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: 'var(--black-100)', borderBottom: '1px solid var(--black-10)', verticalAlign: 'middle' };
                return (
                  <tr key={s.sucursalId}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{nombre}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: r.disparada ? 'var(--coral-100)' : undefined }}>{formatExistencia(s.existencia)}</td>
                    <td style={tdStyle}>
                      <StockBajoInput
                        valor={r.stockBajo}
                        ariaLabel={`Stock bajo en ${nombre}`}
                        onGuardar={v => {
                          setAlertaStock(itemId, { sucursalIds: [s.sucursalId], variantId, stockBajo: v });
                          toast.success(`Stock bajo ${v === null ? 'borrado' : 'guardado'} — ${nombre}`);
                        }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <AlertaCheck
                        valor={r.alerta}
                        disabled={!r.alertable}
                        ariaLabel={`Alerta en ${nombre}`}
                        title={!r.alertable ? 'Define el stock bajo para activar la alerta' : undefined}
                        onChange={v => {
                          setAlertaStock(itemId, { sucursalIds: [s.sucursalId], variantId, alerta: v });
                          toast.success(`Alerta ${v ? 'activada' : 'inactivada'} — ${nombre}`);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <p style={{ margin: '16px 0 0', fontFamily: FONT, fontSize: 12, color: 'var(--black-40)' }}>Aquí cada sucursal se edita por separado.</p>
      </div>
    </div>
  );
}
