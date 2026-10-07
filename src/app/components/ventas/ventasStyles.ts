import type React from 'react';

/** Estilos compartidos de los listados y detalles de ventas (Merlin: solo variables CSS). */

export const font = (size: number, weight: number, color: string, lineHeight?: number): React.CSSProperties => ({
  fontFamily: "'Montserrat', sans-serif",
  fontSize: size,
  fontWeight: weight,
  color,
  ...(lineHeight ? { lineHeight: `${lineHeight}px` } : {}),
});

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--black-60)',
  fontFamily: "'Montserrat', sans-serif",
  textTransform: 'uppercase',
  marginBottom: 4,
  whiteSpace: 'nowrap',
};

export const filterGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

export const filterInput: React.CSSProperties = {
  border: '1.5px solid var(--blue-30)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 14,
  fontFamily: "'Montserrat', sans-serif",
  color: 'var(--black-100)',
  backgroundColor: 'var(--black-0)',
  outline: 'none',
  cursor: 'pointer',
};

export const thStyle: React.CSSProperties = {
  padding: '12px 16px 12px 0',
  textAlign: 'left',
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  lineHeight: '18px',
  color: 'var(--black-100)',
  borderBottom: '2px solid var(--black-10)',
  whiteSpace: 'nowrap',
};

export const tdStyle: React.CSSProperties = {
  padding: '14px 16px 14px 0',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--black-100)',
  lineHeight: '18px',
};

export const sectionCard: React.CSSProperties = {
  backgroundColor: 'var(--black-0)',
  borderRadius: 16,
  padding: '20px 24px',
};

export const sectionTitle: React.CSSProperties = {
  ...font(13, 700, 'var(--black-100)', 18),
  margin: '0 0 16px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};
