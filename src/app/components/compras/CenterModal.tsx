/**
 * CenterModal — modal centrado del módulo de compras (reportar pago, anular, convertir en DS,
 * confirmaciones). Mismo patrón visual que ConfirmDeleteModal: overlay oscuro + card blanca.
 */
import React from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  /** `wide` para modales con formulario (texto a la izquierda). */
  wide?: boolean;
  icon?: React.ReactNode;
  onClose: () => void;
  children?: React.ReactNode;
  /** Botones; `row` los pone lado a lado. */
  actions?: React.ReactNode;
  actionsRow?: boolean;
}

export function CenterModal({ title, subtitle, wide, icon, onClose, children, actions, actionsRow }: Props) {
  const align = wide && !icon ? 'left' : 'center';
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-label={title}
        className="bg-white rounded-[var(--radius-20)] w-full mx-4 relative"
        style={{ maxWidth: wide ? 480 : 400, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <X size={18} color="var(--black-60)" />
        </button>
        {icon && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{icon}</div>}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--black-100)', margin: '0 0 8px', textAlign: align, paddingRight: align === 'left' ? 24 : 0 }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: 14, color: 'var(--black-60)', margin: '0 0 16px', textAlign: align, lineHeight: '20px' }}>{subtitle}</p>
        )}
        {children}
        {actions && (
          <div style={{ display: 'flex', flexDirection: actionsRow ? 'row' : 'column', gap: 12, marginTop: 8 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/** Ícono circular de los modales (ámbar = advertencia, azul = informativo, verde = éxito). */
export function ModalIcon({ tone, children }: { tone: 'warning' | 'info' | 'success'; children: React.ReactNode }) {
  const palette = {
    warning: ['var(--feedback-warning-10)', 'var(--feedback-warning-150)'],
    info: ['var(--blue-10)', 'var(--blue-100)'],
    success: ['var(--feedback-success-10)', 'var(--feedback-success-150)'],
  }[tone];
  return (
    <span style={{
      width: 48, height: 48, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette[0], color: palette[1],
    }}>
      {children}
    </span>
  );
}
