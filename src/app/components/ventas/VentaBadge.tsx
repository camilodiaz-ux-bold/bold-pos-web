import React from 'react';
import type { BadgeVariant } from '../../utils/ventas';

const STYLES: Record<BadgeVariant, React.CSSProperties> = {
  success: { backgroundColor: 'var(--feedback-success-10)', color: 'var(--feedback-success-150)', border: '1px solid var(--feedback-success-100)' },
  warning: { backgroundColor: 'var(--feedback-warning-10)', color: 'var(--feedback-warning-200)', border: '1px solid var(--feedback-warning-100)' },
  error:   { backgroundColor: 'var(--feedback-error-10)',   color: 'var(--feedback-error-100)',   border: '1px solid var(--feedback-error-100)'   },
  info:    { backgroundColor: 'var(--blue-10)',             color: 'var(--blue-100)',             border: '1px solid var(--blue-20)'              },
};

/** Badge de estado de una venta (estado de pago, estado DIAN). */
export function VentaBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 24, paddingLeft: 10, paddingRight: 10,
      borderRadius: 100, fontFamily: "'Montserrat', sans-serif",
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      ...STYLES[variant],
    }}>
      {label}
    </span>
  );
}
