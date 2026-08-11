import React from 'react';

export function TextField({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue-100)', marginBottom: 4 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 44, boxSizing: 'border-box', borderRadius: 12,
          border: '1.5px solid var(--blue-20)', background: 'var(--background-page)',
          fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 500,
          color: 'var(--black-100)', padding: '0 14px', outline: 'none',
          transition: 'border-color 150ms ease',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue-100)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--blue-20)')}
      />
    </div>
  );
}
