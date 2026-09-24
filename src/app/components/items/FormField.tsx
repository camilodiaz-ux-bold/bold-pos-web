/**
 * FormField — label con asterisco requerido + input/select/textarea de
 * fondo gris sin borde (patrón visto en el formulario de crear ítem del
 * POS real, distinto de .pos-input y .merlin-input). Usa .merlin-input-filled
 * de pos.css.
 */
import React from 'react';

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export function FieldLabel({ children, required }: FieldLabelProps) {
  return (
    <label style={{
      display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--black-100)',
      fontFamily: "'Montserrat', sans-serif", marginBottom: 6,
    }}>
      {children}
      {required && <span style={{ color: 'var(--coral-100)', marginLeft: 2 }}>*</span>}
    </label>
  );
}

function FieldHelper({ helper, error }: { helper?: string; error?: string }) {
  if (error) return <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' }}>{error}</p>;
  if (helper) return <p style={{ fontSize: 12, color: 'var(--black-40)', margin: '4px 0 0' }}>{helper}</p>;
  return null;
}

interface TextFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  type?: 'text' | 'number';
  disabled?: boolean;
}

export function TextField({ label, required, value, onChange, placeholder, helper, error, type = 'text', disabled }: TextFieldProps) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className="merlin-input-filled"
        style={error ? { borderColor: 'var(--coral-100)' } : undefined}
      />
      <FieldHelper helper={helper} error={error} />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: TextAreaFieldProps) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={e => onChange(e.target.value)}
        className="merlin-input-filled"
      />
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  helper?: string;
  error?: string;
  clearable?: boolean;
  action?: { label: string; onClick: () => void };
}

export function SelectField({ label, required, value, onChange, options, placeholder = 'Selecciona una opción', helper, error, clearable, action }: SelectFieldProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FieldLabel required={required}>{label}</FieldLabel>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 6,
              fontSize: 13, fontWeight: 600, color: 'var(--blue-100)',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="merlin-input-filled"
          style={{
            appearance: 'none', WebkitAppearance: 'none',
            paddingRight: clearable ? 60 : 36,
            color: value === '' ? 'var(--black-40)' : 'var(--black-100)',
            ...(error ? { borderColor: 'var(--coral-100)' } : {}),
          }}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {clearable && value !== '' && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Limpiar"
            style={{
              position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-40)',
              fontSize: 14, lineHeight: 1, padding: 0,
            }}
          >
            ✕
          </button>
        )}
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: 'var(--black-40)', fontSize: 12,
        }}>
          ▾
        </span>
      </div>
      <FieldHelper helper={helper} error={error} />
    </div>
  );
}
