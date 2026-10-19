/**
 * Combobox — input filtrable con menú (Proveedor y Ítem del formulario de factura, filtro de
 * Proveedor del listado). Filtra por substring sin distinguir mayúsculas; ↑/↓ navegan, Enter
 * selecciona, Escape cierra. `pinned` es una opción fija arriba ("+ Crear proveedor").
 */
import React, { useEffect, useRef, useState } from 'react';

export interface ComboOption { id: string; label: string }

interface Props {
  options: ComboOption[];
  /** Id seleccionado ('' = ninguno). */
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  invalid?: boolean;
  pinned?: { label: string; onClick: () => void };
  /** Estilo del input: relleno gris (formularios) o con borde (filtros). */
  variant?: 'filled' | 'filter';
  style?: React.CSSProperties;
}

export function Combobox({ options, value, onChange, placeholder, invalid, pinned, variant = 'filled', style }: Props) {
  const selected = options.find(o => o.id === value);
  const [text, setText] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Si la selección cambia desde fuera (p. ej. se crea un ítem desde el drawer), sincroniza el texto.
  useEffect(() => { if (selected) setText(selected.label); }, [selected?.label]);

  const q = text.trim().toLowerCase();
  const matches = options.filter(o => !selected || text !== selected.label ? o.label.toLowerCase().includes(q) : true);

  const pick = (o: ComboOption) => { onChange(o.id); setText(o.label); setOpen(false); setActive(-1); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && open && matches[active]) { e.preventDefault(); pick(matches[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  const inputStyle: React.CSSProperties = variant === 'filter' ? {
    border: '1.5px solid var(--blue-30)', borderRadius: 8, padding: '8px 12px', fontSize: 14,
    fontFamily: "'Montserrat', sans-serif", color: 'var(--black-100)', backgroundColor: 'var(--black-0)', outline: 'none', width: '100%',
  } : invalid ? { borderColor: 'var(--coral-100)' } : {};

  return (
    <div ref={wrapRef} style={{ position: 'relative', ...style }}>
      <input
        type="text"
        autoComplete="off"
        className={variant === 'filled' ? 'merlin-input-filled' : undefined}
        style={inputStyle}
        placeholder={placeholder}
        value={text}
        onFocus={e => { e.currentTarget.select(); setOpen(true); }}
        onChange={e => { setText(e.target.value); setOpen(true); setActive(-1); if (value) onChange(''); }}
        onBlur={() => {
          setOpen(false);
          // Sin selección válida, el texto suelto se descarta: no hay "proveedor a medias".
          if (!options.some(o => o.id === value)) setText('');
        }}
        onKeyDown={onKey}
      />
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 120, maxHeight: 240, overflowY: 'auto',
            backgroundColor: 'var(--black-0)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', padding: '4px 0',
            fontFamily: "'Montserrat', sans-serif", fontSize: 14,
          }}
        >
          {pinned && (
            <>
              <div
                onMouseDown={e => { e.preventDefault(); setOpen(false); pinned.onClick(); }}
                style={{ padding: '10px 14px', cursor: 'pointer', fontWeight: 700, color: 'var(--blue-100)' }}
                className="hover:bg-[var(--blue-10)]"
              >
                {pinned.label}
              </div>
              <div style={{ height: 1, backgroundColor: 'var(--black-10)', margin: '2px 0' }} />
            </>
          )}
          {matches.length === 0 && (
            <div style={{ padding: '10px 14px', color: 'var(--black-60)' }}>No se encontraron resultados</div>
          )}
          {matches.map((o, i) => (
            <div
              key={o.id}
              onMouseDown={e => { e.preventDefault(); pick(o); }}
              style={{ padding: '10px 14px', cursor: 'pointer', backgroundColor: i === active ? 'var(--blue-10)' : 'transparent', color: 'var(--black-100)' }}
              className="hover:bg-[var(--blue-10)]"
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
