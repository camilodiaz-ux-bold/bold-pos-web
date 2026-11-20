/**
 * EnviarCorreoDevolucionModal — "Enviar detalle de la devolución" (specs/2026-11-devoluciones-v2.md §7.3).
 * Correo del cliente precargado (editable o removible), "Agregar correo" hasta 3 y Enviar / Cancelar. El envío es simulado.
 */
import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const FONT = "'Montserrat', sans-serif";
const MAX_CORREOS = 3;
const MSG_CORREO_INVALIDO = 'Ingresa un correo válido.';
const esCorreo = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

export function EnviarCorreoDevolucionModal({ correoCliente, onVerEjemplo, onClose }: { correoCliente: string; onVerEjemplo: (para: string[]) => void; onClose: () => void }) {
  const [correos, setCorreos] = useState<string[]>([correoCliente]);
  const [intento, setIntento] = useState(false);

  const cambiar = (i: number, v: string) => setCorreos(p => p.map((c, j) => (j === i ? v : c)));
  const quitar = (i: number) => setCorreos(p => p.filter((_, j) => j !== i));
  const enviar = () => {
    setIntento(true);
    if (correos.length === 0 || correos.some(c => !esCorreo(c))) return;
    toast.success('Correo enviado correctamente.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Enviar detalle de la devolución" className="bg-white rounded-[var(--radius-20)] w-full mx-4"
        style={{ maxWidth: 480, padding: 32, boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Enviar detalle de la devolución</h3>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {correos.map((c, i) => (
            <div key={i}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="email" aria-label={`Correo ${i + 1}`} value={c} onChange={e => cambiar(i, e.target.value)} placeholder="correo@ejemplo.com"
                  style={{ flex: 1, height: 40, boxSizing: 'border-box', padding: '0 12px', borderRadius: 8, fontFamily: FONT, fontSize: 13, outline: 'none',
                    border: `1.5px solid ${intento && !esCorreo(c) ? 'var(--coral-100)' : 'var(--black-10)'}` }} />
                <button onClick={() => quitar(i)} aria-label={`Quitar correo ${i + 1}`} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--black-60)' }}><Trash2 size={18} /></button>
              </div>
              {intento && !esCorreo(c) && <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' }}>{MSG_CORREO_INVALIDO}</p>}
            </div>
          ))}
        </div>

        {correos.length < MAX_CORREOS && (
          <button onClick={() => setCorreos(p => [...p, ''])} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', padding: 0 }}>
            <Plus size={16} /> Agregar correo
          </button>
        )}

        <button onClick={() => onVerEjemplo(correos.filter(esCorreo))} style={{ display: 'block', marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', textDecoration: 'underline', padding: 0 }}>
          Ver ejemplo del correo
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button className="btn btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={enviar} disabled={correos.length === 0}>Enviar</button>
        </div>
      </div>
    </div>
  );
}
