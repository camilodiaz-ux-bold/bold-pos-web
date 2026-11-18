/**
 * AbrirTurnoModal — se muestra al intentar registrar una devolución sin turno abierto (specs/2026-11-devoluciones.md §6, D4).
 * Réplica del panel "Abrir turno" del POS real: panel lateral derecho, una sola pregunta (efectivo con el que se abre
 * el turno en la sucursal) y los botones Cancelar / Abrir turno.
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

const FONT = "'Montserrat', sans-serif";

export function AbrirTurnoModal({ sucursal, onCancel, onOpen }: { sucursal: string; onCancel: () => void; onOpen: () => void }) {
  const [saldo, setSaldo] = useState('');
  const [error, setError] = useState('');

  const abrir = () => {
    if (saldo === '') { setError('Este campo es obligatorio.'); return; }
    toast.success('Turno abierto correctamente.');
    onOpen();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/40" onClick={onCancel}>
      <aside
        role="dialog" aria-modal="true" aria-label="Abrir turno" onClick={e => e.stopPropagation()}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(660px, 100vw)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
      >
        <div style={{ position: 'relative', padding: '28px 24px 0' }}>
          <button onClick={onCancel} aria-label="Cerrar" style={{ position: 'absolute', top: 24, left: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue-100)', display: 'flex' }}>
            <X size={18} />
          </button>
          <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: 'var(--blue-100)', margin: 0, textAlign: 'center' }}>Abrir turno</h3>
        </div>

        <div style={{ padding: '28px 20px', flex: 1 }}>
          <label htmlFor="abrir-turno-efectivo" style={{ display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--blue-100)', marginBottom: 8 }}>
            ¿Con cuánto efectivo en caja estas abriendo tu turno hoy en {sucursal}? <span style={{ color: 'var(--coral-100)' }}>*</span>
          </label>
          <input
            id="abrir-turno-efectivo" className="merlin-input-filled" inputMode="numeric" autoFocus
            value={saldo === '' ? '' : Number(saldo).toLocaleString('en-US')}
            onChange={e => { setSaldo(e.target.value.replace(/\D/g, '')); setError(''); }}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          {error && <p style={{ fontFamily: FONT, fontSize: 12, color: 'var(--coral-100)', margin: '6px 0 0' }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 16, padding: '20px 24px 28px' }}>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: 'var(--coral-100)' }}>Cancelar</button>
          <button className="btn btn-primary" onClick={abrir} style={{ minWidth: 216, borderRadius: 100 }}>Abrir turno</button>
        </div>
      </aside>
    </div>
  );
}
