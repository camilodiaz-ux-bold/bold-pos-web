/**
 * FilterPill — pills de filtro redondeados (radius 100, h48) del POS real.
 * No reutiliza FilterDropdown (ReporteDetallePage.tsx, h36/radius 8): esa
 * forma está en uso en Reportes/Ventas Async y no conviene tocarla.
 * Usa la clase .filter-pill de pos.css.
 */
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface FilterPillSelectProps {
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}

export function FilterPillSelect({ icon, placeholder, value, onChange, options }: FilterPillSelectProps) {
  return (
    <div className="filter-pill">
      {icon}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1,
          appearance: 'none',
          WebkitAppearance: 'none',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: value === '' ? 'var(--black-40)' : 'var(--black-100)',
          cursor: 'pointer',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} color="var(--blue-50)" style={{ flexShrink: 0, pointerEvents: 'none' }} />
    </div>
  );
}

interface FilterPillInputProps {
  icon?: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

export function FilterPillInput({ icon, placeholder, value, onChange }: FilterPillInputProps) {
  return (
    <div className="filter-pill">
      {icon}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--black-100)',
        }}
      />
    </div>
  );
}
