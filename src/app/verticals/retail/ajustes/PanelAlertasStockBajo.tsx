/**
 * PanelAlertasStockBajo — Ajustes → Inventarios → "Alertas stock bajo" (specs/2026-10-alertas-stock-correo-config.md §2):
 * a quién y con qué frecuencia se envía el correo de alertas de stock bajo. Solo visual: no se envía ningún correo.
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useAjustes } from '../../../store/ajustesStore';
import type { FrecuenciaAlertasStock } from '../../../types/ajustes';
import { FONT, FooterDerecho, SidePanel, inputErr } from './PanelUi';

const MAX_ADICIONALES = 3;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FRECUENCIAS: Array<{ value: FrecuenciaAlertasStock; titulo: string }> = [
  { value: 'no-enviar', titulo: 'No enviar' },
  { value: 'primero-de-mes', titulo: 'Enviar el primero de cada mes' },
  { value: 'lunes', titulo: 'Enviar cada lunes' },
  { value: 'lunes-a-viernes', titulo: 'Enviar de lunes a viernes' },
];

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'var(--blue-100)', marginBottom: 6 };
const errorStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' };

export function AlertasStockBajoPanel({ onClose }: { onClose: () => void }) {
  const { ajustes, updateAjustes } = useAjustes();
  const correoNegocio = ajustes.perfil.correo;
  const [correos, setCorreos] = useState<string[]>(ajustes.alertasStockBajo.correosAdicionales);
  const [frecuencia, setFrecuencia] = useState<FrecuenciaAlertasStock>(ajustes.alertasStockBajo.frecuencia);

  const norm = (c: string) => c.trim().toLowerCase();
  const errorDe = (i: number): string | undefined => {
    const c = correos[i].trim();
    if (c === '') return undefined; // los vacíos se ignoran al guardar
    if (!EMAIL.test(c)) return 'Ingresa un correo válido';
    if (norm(c) === norm(correoNegocio) || correos.some((o, j) => j !== i && norm(o) === norm(c))) return 'Este correo ya está en la lista';
    return undefined;
  };
  const hayErrores = correos.some((_, i) => errorDe(i) !== undefined);
  const guardado = ajustes.alertasStockBajo;
  const limpios = correos.map(c => c.trim()).filter(Boolean);
  const cambio = frecuencia !== guardado.frecuencia || JSON.stringify(limpios) !== JSON.stringify(guardado.correosAdicionales);

  const guardar = () => {
    if (hayErrores) return;
    updateAjustes(prev => ({ ...prev, alertasStockBajo: { correosAdicionales: limpios, frecuencia } }));
    toast.success('Alertas de stock bajo guardadas');
    onClose();
  };

  return (
    <SidePanel
      variant="right" title="Alertas stock bajo" onClose={onClose}
      footer={<FooterDerecho onCancel={onClose} onSave={guardar} saveLabel="Guardar" canSave={!hayErrores && cambio} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: '20px', color: 'var(--black-100)' }}>
            Recibe por correo un resumen de los ítems que llegaron a su stock bajo, para que puedas reabastecerlos a tiempo.
            Elige a quién se envía y cada cuánto.
          </p>
        </div>

        <div>
          <span style={labelStyle}>Se enviará a</span>
          <div style={{ padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--blue-10)', fontSize: 13, color: 'var(--black-100)' }}>{correoNegocio}</div>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--black-60)' }}>Correo del negocio. Puedes cambiarlo en el perfil.</p>
        </div>

        <div>
          <span style={labelStyle}>Correos adicionales (hasta {MAX_ADICIONALES})</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {correos.map((c, i) => {
              const err = errorDe(i);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="email" value={c} placeholder="correo@ejemplo.com" aria-label={`Correo adicional ${i + 1}`}
                      onChange={e => setCorreos(prev => prev.map((x, j) => (j === i ? e.target.value : x)))}
                      className="merlin-input-filled" style={inputErr(err)}
                    />
                    <button
                      type="button" aria-label={`Quitar correo adicional ${i + 1}`}
                      onClick={() => setCorreos(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexShrink: 0 }}
                    >
                      <Trash2 size={16} color="var(--black-60)" />
                    </button>
                  </div>
                  {err && <p style={errorStyle}>{err}</p>}
                </div>
              );
            })}
          </div>
          <button
            type="button" disabled={correos.length >= MAX_ADICIONALES}
            onClick={() => setCorreos(prev => [...prev, ''])}
            style={{
              marginTop: correos.length ? 12 : 0, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0,
              cursor: correos.length >= MAX_ADICIONALES ? 'not-allowed' : 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 700,
              color: correos.length >= MAX_ADICIONALES ? 'var(--black-40)' : 'var(--blue-100)',
            }}
          >
            <Plus size={14} /> Agregar correo
          </button>
        </div>

        <div>
          <span style={labelStyle}>Frecuencia de envío</span>
          <div role="radiogroup" aria-label="Frecuencia de envío" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FRECUENCIAS.map(f => {
              const on = frecuencia === f.value;
              return (
                <button
                  key={f.value} type="button" role="radio" aria-checked={on} onClick={() => setFrecuencia(f.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
                    border: `1.5px solid ${on ? 'var(--coral-100)' : 'var(--blue-40)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {on && <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--coral-100)' }} />}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: 'var(--black-100)' }}>{f.titulo}</span>
                </button>
              );
            })}
          </div>
          {frecuencia === 'no-enviar' && (
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--black-60)' }}>No recibirás correos de alertas de stock bajo.</p>
          )}
        </div>
      </div>
    </SidePanel>
  );
}
