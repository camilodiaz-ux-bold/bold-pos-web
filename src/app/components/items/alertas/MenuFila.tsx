/**
 * MenuFila — menú de 3 puntos de una fila de Alertas de Stock (specs/2026-10-alertas-stock.md §1).
 * Una sola opción: "Ver sucursales". Se cierra con clic fuera o Escape.
 */
import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface Props {
  ariaLabel: string;
  onVerSucursales: () => void;
}

export function MenuFila({ ariaLabel, onVerSucursales }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', color: 'var(--blue-100)' }}
        className="hover:bg-[var(--blue-10)]"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', right: 0, top: '100%', zIndex: 50, minWidth: 160, padding: 4, borderRadius: 8,
            backgroundColor: 'var(--black-0)', boxShadow: 'var(--shadow-12)', border: '1px solid var(--black-10)',
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onVerSucursales(); }}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer',
              fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--black-100)',
            }}
            className="hover:bg-[var(--blue-10)]"
          >
            Ver sucursales
          </button>
        </div>
      )}
    </div>
  );
}
