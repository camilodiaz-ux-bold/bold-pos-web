/**
 * Selector de vertical — herramienta del PROTOTIPO, no del producto.
 * Se muestra solo en Inicio. Borde punteado + etiqueta para que no se confunda
 * con UI real de Bold POS.
 */
import React from 'react';
import { toast } from 'sonner';
import { useVertical } from './verticalStore';
import { VERTICALS, VERTICAL_LABEL } from './modules';

export function PrototypeVerticalSwitcher() {
  const { vertical, setVertical } = useVertical();

  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '6px 6px 6px 12px',
        border: '1.5px dashed var(--blue-20)', borderRadius: 12,
        backgroundColor: 'transparent', fontFamily: 'Montserrat, sans-serif',
      }}
      title="Control del prototipo: no forma parte del producto"
    >
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--black-60)' }}>
        Prototipo · Vertical
      </span>
      <div role="radiogroup" aria-label="Vertical del prototipo" style={{ display: 'inline-flex', gap: 4 }}>
        {VERTICALS.map(v => {
          const selected = v === vertical;
          return (
            <button
              key={v}
              role="radio"
              aria-checked={selected}
              onClick={() => {
                if (selected) return;
                setVertical(v);
                toast.success(`Vertical: ${VERTICAL_LABEL[v]}`);
              }}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                backgroundColor: selected ? 'var(--blue-100)' : 'transparent',
                color: selected ? '#fff' : 'var(--black-60)',
                transition: 'background-color 0.15s ease',
              }}
            >
              {VERTICAL_LABEL[v]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
