/**
 * ConfirmDeleteModal — modal de confirmación de borrado, siguiendo el
 * patrón ya usado en GestionarMesasView.tsx (bg-black/40 backdrop-blur-sm
 * + card rounded-[var(--radius-20)] p-8 + btn-cancel / btn-danger).
 */
import React from 'react';

interface ConfirmDeleteModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ title, message, confirmLabel = 'Eliminar', onCancel, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* El relleno y el ancho van en línea: las clases `p-8` / `max-w-xs` no se aplican en este contexto
          y el modal salía sin relleno (specs/2026-10-alertas-stock-disponibilidad.md §3). */}
      <div className="bg-white rounded-[var(--radius-20)] w-full mx-4" style={{ maxWidth: 400, padding: 32, boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--black-100)', margin: '0 0 8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--black-60)', margin: '0 0 24px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} className="btn btn-cancel" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={onConfirm} className="btn btn-danger" style={{ flex: 1, backgroundColor: 'var(--coral-10)' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
