/**
 * DescargarPlantillaModal — modal "Descargar plantilla" de la Actualización masiva de Alertas de Stock
 * (specs/2026-10-alertas-stock-ajustes.md §6.3): elige todas las sucursales o una, y todos los ítems o solo los que hoy
 * tienen alerta activa. Descargar genera un .xlsx real.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useItems } from '../../../store/itemsStore';
import { SUCURSALES } from '../../../data/itemsCatalogs';
import { descargarPlantillaAlertas, filasPlantilla } from '../../../utils/generateAlertasStockXlsx';

const FONT = "'Montserrat', sans-serif";

interface Props {
  onClose: () => void;
}

function Radio({ name, checked, onChange, label, children }: {
  name: string; checked: boolean; onChange: () => void; label: string; children?: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: 'var(--black-100)' }}>
        <input type="radio" name={name} checked={checked} onChange={onChange} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--coral-100)' }} />
        {label}
      </label>
      {children}
    </div>
  );
}

export function DescargarPlantillaModal({ onClose }: Props) {
  const { items } = useItems();
  const [alcance, setAlcance] = useState<'todas' | 'una'>('todas');
  const [sucursalId, setSucursalId] = useState<string>(SUCURSALES[0]?.id ?? '');
  const [contenido, setContenido] = useState<'todo' | 'alertas'>('todo');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sucursalElegida = alcance === 'una' ? sucursalId : undefined;
  const filas = useMemo(
    () => filasPlantilla(items, { sucursalId: sucursalElegida, soloAlertaActiva: contenido === 'alertas' }),
    [items, sucursalElegida, contenido],
  );

  const descargar = () => {
    if (filas.length === 0) return;
    descargarPlantillaAlertas(filas, sucursalElegida);
    toast.success('Plantilla descargada');
    onClose();
  };

  const groupTitle: React.CSSProperties = { margin: '0 0 10px', fontFamily: FONT, fontSize: 14, fontWeight: 700, color: 'var(--black-100)' };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-label="Descargar plantilla"
        style={{ backgroundColor: 'var(--black-0)', borderRadius: 20, width: 'min(480px, calc(100vw - 32px))', padding: 24, position: 'relative' }}
      >
        <button
          type="button" onClick={onClose} aria-label="Cerrar"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <X size={20} color="var(--black-60)" />
        </button>

        <h3 style={{ margin: '0 0 20px', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: 'var(--black-100)' }}>Descargar plantilla</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <p style={groupTitle}>Sucursales</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Radio name="alcance" checked={alcance === 'todas'} onChange={() => setAlcance('todas')} label="Todas las sucursales" />
              <Radio name="alcance" checked={alcance === 'una'} onChange={() => setAlcance('una')} label="Una sucursal">
                {alcance === 'una' && (
                  <select
                    aria-label="Sucursal"
                    value={sucursalId}
                    onChange={e => setSucursalId(e.target.value)}
                    className="merlin-input-filled"
                    style={{ marginTop: 8, marginLeft: 24, width: 'calc(100% - 24px)' }}
                  >
                    {SUCURSALES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                )}
              </Radio>
            </div>
          </div>

          <div>
            <p style={groupTitle}>Contenido</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Radio name="contenido" checked={contenido === 'todo'} onChange={() => setContenido('todo')} label="Todos los ítems" />
              <Radio name="contenido" checked={contenido === 'alertas'} onChange={() => setContenido('alertas')} label="Solo los que hoy tienen alerta de stock activa" />
            </div>
          </div>

          {filas.length === 0 && (
            <p role="note" style={{ margin: 0, padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--coral-10)', fontFamily: FONT, fontSize: 12, color: 'var(--black-100)' }}>
              No hay ítems para descargar con esta selección.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button type="button" className="btn btn-cancel" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" disabled={filas.length === 0} onClick={descargar}>Descargar</button>
        </div>
      </div>
    </div>
  );
}
