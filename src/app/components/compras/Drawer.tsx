/** Drawer — panel lateral derecho para formularios largos dentro del formulario de factura. */
import React from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  width: number;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function Drawer({ title, width, onClose, children, footer }: Props) {
  return (
    <div
      className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex justify-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <aside
        role="dialog"
        aria-label={title}
        style={{ width, maxWidth: '100%', height: '100%', backgroundColor: 'var(--black-0)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ position: 'relative', padding: '20px 24px 12px' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--black-100)', textAlign: 'center', fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <X size={20} color="var(--black-60)" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 24px' }}>{children}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 24px', borderTop: '1px solid var(--black-10)' }}>
          {footer}
        </div>
      </aside>
    </div>
  );
}
