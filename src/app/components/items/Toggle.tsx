/**
 * Toggle — switch coral reutilizable.
 * No existía uno exportado en el proyecto (hay uno local no exportado y
 * con hex hardcodeado en GestionarMesasView.tsx). Este usa var(--token).
 */
import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

const DIMENSIONS = {
  sm: { width: 32, height: 18, knob: 14, pad: 2 },
  md: { width: 40, height: 22, knob: 18, pad: 2 },
};

export function Toggle({ checked, onChange, disabled, size = 'md', ariaLabel }: ToggleProps) {
  const d = DIMENSIONS[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        width: d.width,
        height: d.height,
        borderRadius: d.height,
        border: 'none',
        padding: 0,
        backgroundColor: checked ? 'var(--coral-100)' : 'var(--blue-20)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color 150ms ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: d.pad,
          left: checked ? d.width - d.knob - d.pad : d.pad,
          width: d.knob,
          height: d.knob,
          borderRadius: '50%',
          backgroundColor: '#fff',
          boxShadow: 'var(--shadow-2)',
          transition: 'left 150ms ease',
        }}
      />
    </button>
  );
}
