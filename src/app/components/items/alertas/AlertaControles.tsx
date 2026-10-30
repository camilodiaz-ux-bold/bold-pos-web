/**
 * AlertaControles — piezas de la lista de Alertas de Stock (specs/2026-10-alertas-stock.md §1):
 * input de "Stock bajo" con chulito para guardar, check de "Alerta" (con estado mixto) y el switch de dos opciones del header.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

const FONT = "'Montserrat', sans-serif";

interface StockBajoInputProps {
  /** Valor guardado: número, 'sin' (sin definir) o 'varios' (las sucursales difieren). */
  valor: number | 'sin' | 'varios';
  /** `null` borra el umbral. */
  onGuardar: (v: number | null) => void;
  title?: string;
  ariaLabel: string;
}

export function StockBajoInput({ valor, onGuardar, title, ariaLabel }: StockBajoInputProps) {
  const guardado = typeof valor === 'number' ? String(valor) : '';
  const [draft, setDraft] = useState(guardado);
  // Si el valor guardado cambia desde fuera (otra fila, el modal), el borrador lo sigue.
  useEffect(() => setDraft(guardado), [guardado]);

  const limpio = draft.trim();
  const invalido = limpio !== '' && !/^\d+$/.test(limpio);
  const sucio = limpio !== guardado && !(valor === 'varios' && limpio === '');
  const guardar = () => {
    if (invalido || !sucio) return;
    onGuardar(limpio === '' ? null : parseInt(limpio, 10));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={title}>
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={draft}
        placeholder={valor === 'varios' ? 'Varios' : '—'}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') guardar();
          if (e.key === 'Escape') { setDraft(guardado); (e.target as HTMLInputElement).blur(); }
        }}
        onBlur={() => setDraft(guardado)}
        className="merlin-input-filled"
        style={{ width: 84, padding: '6px 10px', fontSize: 13, ...(invalido ? { borderColor: 'var(--coral-100)' } : {}) }}
      />
      {sucio && (
        <button
          type="button"
          aria-label="Guardar stock bajo"
          disabled={invalido}
          // mouseDown no debe quitar el foco del input: el blur descartaría el borrador antes del clic.
          onMouseDown={e => e.preventDefault()}
          onClick={guardar}
          style={{
            width: 26, height: 26, borderRadius: '50%', border: 'none', flexShrink: 0,
            backgroundColor: invalido ? 'var(--black-10)' : 'var(--coral-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: invalido ? 'not-allowed' : 'pointer',
          }}
        >
          <Check size={14} color="var(--black-0)" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

interface AlertaCheckProps {
  valor: boolean | 'mixto';
  disabled?: boolean;
  onChange: (next: boolean) => void;
  title?: string;
  ariaLabel: string;
}

export function AlertaCheck({ valor, disabled, onChange, title, ariaLabel }: AlertaCheckProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = valor === 'mixto'; }, [valor]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={ariaLabel}
      title={title}
      checked={valor === true}
      disabled={disabled}
      // Mixto → un clic activa en todas; activa → desactiva.
      onChange={() => onChange(valor !== true)}
      style={{ width: 16, height: 16, cursor: disabled ? 'not-allowed' : 'pointer', accentColor: 'var(--coral-100)' }}
    />
  );
}

interface SegmentedSwitchProps<T extends string> {
  ariaLabel: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}

/** Switch de dos opciones (píldora): la activa va rellena. */
export function SegmentedSwitch<T extends string>({ ariaLabel, value, onChange, options }: SegmentedSwitchProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} style={{ display: 'inline-flex', padding: 3, borderRadius: 999, backgroundColor: 'var(--black-10)' }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            style={{
              padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 600,
              backgroundColor: active ? 'var(--black-0)' : 'transparent',
              color: active ? 'var(--blue-100)' : 'var(--black-60)',
              boxShadow: active ? 'var(--shadow-4, 0 1px 3px rgba(0,0,0,0.12))' : 'none',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
